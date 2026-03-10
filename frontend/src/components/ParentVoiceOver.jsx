import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { voiceoverAPI } from '../services/api';

/**
 * 真正的家长配音组件 - 使用 Web Audio API 录音
 */
function ParentVoiceOver({ creationId, onVoiceAdded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [playingId, setPlayingId] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [speakerName, setSpeakerName] = useState('我');
  const [speakerEmoji, setSpeakerEmoji] = useState('🎤');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio());
  const toastRef = useRef(null);
  const speechRef = useRef(null);
  const playingIdRef = useRef(null);

  const MAX_CLIPS = 10;

  const blobToDataUrl = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // 从后端加载录音，失败时回退到本地存储
  useEffect(() => {
    const loadVoiceovers = async () => {
      try {
        const response = await voiceoverAPI.getByCreation(creationId);
        if (response.success && Array.isArray(response.data)) {
          setRecordings(response.data);
          return;
        }
      } catch (_) {
        // fallback to local storage
      }

      const saved = localStorage.getItem(`voice_recordings_${creationId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setRecordings(parsed);
        } catch (_) {
          setRecordings([]);
        }
      }
    };

    loadVoiceovers();
  }, [creationId]);

  // 保存录音到本地存储
  useEffect(() => {
    localStorage.setItem(`voice_recordings_${creationId}`, JSON.stringify(recordings));
  }, [recordings, creationId]);

  useEffect(() => {
    playingIdRef.current = playingId;
  }, [playingId]);

  // 开始录音
  const startRecording = async () => {
    try {
      if (recordings.length >= MAX_CLIPS) {
        showToast(`⚠️ 每个作品最多保存${MAX_CLIPS}条配音`, 'info');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
        'audio/wav'
      ];
      const chosenMimeType = supportedMimeTypes.find((t) => MediaRecorder.isTypeSupported(t));
      const mediaRecorder = chosenMimeType
        ? new MediaRecorder(stream, { mimeType: chosenMimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const mimeType = mediaRecorder.mimeType || chosenMimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const audioDataUrl = await blobToDataUrl(audioBlob);

          const newRecording = {
            id: Date.now(),
            name: `${speakerName}配音 ${recordings.length + 1}`,
            url: audioDataUrl,
            mimeType,
            duration: formatTime(recordingTime),
            speaker: speakerName,
            emoji: speakerEmoji,
            timestamp: new Date().toLocaleString()
          };

          setRecordings(prev => [newRecording, ...prev].slice(0, MAX_CLIPS));
          setRecordingTime(0);

          // 停止所有音轨
          stream.getTracks().forEach(track => track.stop());

          try {
            await voiceoverAPI.save({
              creation_id: creationId,
              name: newRecording.name,
              speaker: newRecording.speaker,
              emoji: newRecording.emoji,
              duration: newRecording.duration,
              text: newRecording.text || '',
              is_demo: false
            });
          } catch (_) {
            // 本地保存仍然可用
          }

          if (onVoiceAdded) onVoiceAdded(newRecording);

          // 显示成功提示
          showToast('🎉 录音保存成功！', 'success');
        } catch (e) {
          console.error('保存录音失败:', e);
          showToast('❌ 录音保存失败，请重试', 'error');
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // 计时器
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('录音失败:', err);
      showToast('❌ 请允许麦克风权限', 'error');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // 播放录音
  const stopAnyPlaying = () => {
    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } catch (_) {
      // ignore
    }

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (_) {
      // ignore
    }
  };

  const playDemoVoice = (recording) => {
    if (!('speechSynthesis' in window)) {
      showToast('❌ 当前浏览器不支持语音合成', 'error');
      return;
    }

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices?.() || [];
      if (voices.length === 0) return null;

      const zh = voices.filter((v) => (v.lang || '').toLowerCase().startsWith('zh'));
      const pool = zh.length > 0 ? zh : voices;

      const prefer = (patterns) => {
        for (const p of patterns) {
          const found = pool.find((v) => (v.name || '').toLowerCase().includes(p));
          if (found) return found;
        }
        return null;
      };

      const speaker = String(recording.speaker || '').toLowerCase();
      if (speaker.includes('妈')) {
        return prefer(['xiaoxiao', 'xiaoyi', 'huihui', 'female']) || pool[0];
      }
      if (speaker.includes('爸')) {
        return prefer(['yunxi', 'yunyang', 'kangkang', 'male']) || pool[0];
      }
      if (speaker.includes('奶') || speaker.includes('grand')) {
        return prefer(['xiaorui', 'xiaohan', 'lanlan', 'female']) || pool[0];
      }
      return pool[0];
    };

    const speaker = String(recording.speaker || '');
    const paramsByRole = () => {
      if (speaker.includes('妈妈')) return { rate: 0.95, pitch: 1.25 };
      if (speaker.includes('爸爸')) return { rate: 1.0, pitch: 0.85 };
      if (speaker.includes('奶奶')) return { rate: 0.9, pitch: 1.05 };
      return { rate: 1.0, pitch: 1.0 };
    };

    const text = recording.text || `${recording.speaker}说：今天我们一起进入童话世界。`;
    const utter = new SpeechSynthesisUtterance(text);
    const roleParams = paramsByRole();
    utter.rate = roleParams.rate;
    utter.pitch = roleParams.pitch;
    utter.volume = 1;
    utter.onend = () => setPlayingId(null);

    let didStart = false;
    utter.onstart = () => {
      didStart = true;
    };

    utter.onerror = () => {
      setPlayingId(null);
      if (!didStart) showToast('❌ 示例配音播放失败', 'error');
    };

    const voice = pickVoice();
    if (voice) utter.voice = voice;

    speechRef.current = utter;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      setTimeout(() => {
        try {
          const stillTrying = !didStart && playingIdRef.current === recording.id;
          const isSpeaking = window.speechSynthesis.speaking || window.speechSynthesis.pending;
          if (stillTrying && !isSpeaking) {
            setPlayingId(null);
            showToast('❌ 示例配音播放失败', 'error');
          }
        } catch (_) {
          // ignore
        }
      }, 700);
    } catch (e) {
      setPlayingId(null);
      showToast('❌ 示例配音播放失败', 'error');
    }
  };

  const playRecording = async (recording) => {
    if (playingId === recording.id) {
      stopAnyPlaying();
      setPlayingId(null);
    } else {
      stopAnyPlaying();
      setPlayingId(recording.id);

      if (recording.isDemo) {
        playDemoVoice(recording);
        return;
      }

      try {
        audioRef.current.src = recording.url;
        audioRef.current.onended = () => setPlayingId(null);
        audioRef.current.onerror = () => {
          setPlayingId(null);
          showToast('❌ 音频加载失败', 'error');
        };
        await audioRef.current.play();
      } catch (e) {
        console.error('播放失败:', e);
        setPlayingId(null);
        showToast('❌ 播放失败（请点击后再试）', 'error');
      }
    }
  };

  // 删除录音
  const deleteRecording = (id) => {
    if (playingId === id) {
      stopAnyPlaying();
      setPlayingId(null);
    }
    setRecordings(prev => prev.filter(r => r.id !== id));
    showToast('🗑️ 录音已删除', 'info');
  };

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toast 提示
  const showToast = (message, type = 'info') => {
    if (toastRef.current) {
      toastRef.current.remove();
      toastRef.current = null;
    }

    const toast = document.createElement('div');
    const colors = {
      success: 'bg-green-700 border border-green-200',
      error: 'bg-red-700 border border-red-200',
      info: 'bg-slate-800 border border-slate-200'
    };
    toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${colors[type]} text-white px-6 py-3 rounded-full shadow-xl z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);
    toastRef.current = toast;
    setTimeout(() => {
      toast.remove();
      if (toastRef.current === toast) toastRef.current = null;
    }, 2500);
  };

  // 示例音频（模拟不同家庭成员）
  const demoVoices = [
    { id: 'mom', name: '妈妈温柔版', speaker: '妈妈', emoji: '👩', duration: '0:08', text: '宝贝，今天我们一起进入童话世界吧。' },
    { id: 'dad', name: '爸爸幽默版', speaker: '爸爸', emoji: '👨', duration: '0:06', text: '哈哈！小英雄，准备好开始冒险了吗？' },
    { id: 'grandma', name: '奶奶慈祥版', speaker: '奶奶', emoji: '👵', duration: '0:10', text: '乖孩子，奶奶给你讲一个温暖的故事。' }
  ];

  // 添加示例音频
  const addDemoVoice = (demo) => {
    const demoRecording = {
      id: `demo_${demo.id}_${Date.now()}`,
      name: demo.name,
      url: null,
      duration: demo.duration,
      speaker: demo.speaker,
      emoji: demo.emoji,
      timestamp: new Date().toLocaleString(),
      isDemo: true,
      text: demo.text
    };

    setRecordings(prev => [demoRecording, ...prev]);
    voiceoverAPI.save({
      creation_id: creationId,
      name: demoRecording.name,
      speaker: demoRecording.speaker,
      emoji: demoRecording.emoji,
      duration: demoRecording.duration,
      text: demoRecording.text,
      is_demo: true
    }).catch(() => {});
    showToast(`✨ 已添加${demo.speaker}的配音`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🎙️ 家长配音室
        </h3>
        <p className="text-sm text-gray-600">
          为孩子的作品录制专属旁白，创造独特的亲子记忆
        </p>
      </div>

      {/* 录音按钮 */}
      <div className="flex flex-col items-center gap-3">
        {/* 自定义角色 */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2">
          <input
            value={speakerName}
            onChange={(e) => setSpeakerName(e.target.value.slice(0, 10))}
            className="clay-button px-4 py-2 bg-white text-gray-700 w-full sm:w-40"
            placeholder="角色名（如：爸爸）"
          />
          <input
            value={speakerEmoji}
            onChange={(e) => setSpeakerEmoji(e.target.value.slice(0, 2))}
            className="clay-button px-4 py-2 bg-white text-gray-700 w-full sm:w-24 text-center"
            placeholder="图标"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? stopRecording : startRecording}
          className={`
            relative w-28 h-28 rounded-full flex flex-col items-center justify-center
            ${isRecording
              ? 'bg-red-500 animate-pulse'
              : 'bg-gradient-to-br from-pink-400 to-red-500'
            }
            text-white shadow-lg transition-all
          `}
        >
          <span className="text-3xl mb-1">
            {isRecording ? '⏹️' : '🎙️'}
          </span>
          <span className="text-xs font-medium">
            {isRecording ? '点击停止' : '点击录音'}
          </span>

          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-red-300"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>

        {/* 录音计时 */}
        {isRecording && (
          <div className="text-red-500 font-mono text-xl font-bold">
            {formatTime(recordingTime)}
          </div>
        )}
      </div>

      {/* 示例音频选择 */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-700">
          🎭 快速选择示例配音
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {demoVoices.map((voice) => (
            <motion.button
              key={voice.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addDemoVoice(voice)}
              className="clay-button p-3 text-center bg-white"
            >
              <span className="text-2xl mb-1 block">{voice.emoji}</span>
              <span className="text-xs font-medium text-gray-700 block">
                {voice.speaker}
              </span>
              <span className="text-xs text-gray-500">{voice.duration}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 录音列表 */}
      {recordings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h4 className="text-sm font-bold text-gray-700">
            🎵 已添加的配音 ({recordings.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recordings.map((recording, index) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg flex items-center gap-3 ${
                  recording.isDemo
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                <span className="text-2xl">{recording.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {recording.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {recording.speaker} • {recording.duration}
                    {recording.isDemo && ' (示例)'}
                  </p>
                </div>
                
                {/* 播放/删除按钮 */}
                <div className="flex gap-1">
                  <button
                    onClick={() => playRecording(recording)}
                    className={`p-2 rounded-lg transition-colors ${
                      playingId === recording.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-blue-500 hover:bg-blue-100'
                    }`}
                  >
                    {playingId === recording.id ? '⏸️' : '▶️'}
                  </button>
                  <button
                    onClick={() => deleteRecording(recording.id)}
                    className="p-2 bg-white text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 提示 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        <span className="mr-2">💡</span>
        录音会保存在您的设备本地，每个作品最多保存10条配音
      </div>
    </div>
  );
}

export default ParentVoiceOver;
