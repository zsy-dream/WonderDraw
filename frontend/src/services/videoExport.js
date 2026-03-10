export async function exportCreationVideo({
  creation,
  filePrefix = '童话作品',
}) {
  if (!creation) throw new Error('No creation');

  const idPart = creation.id ? String(creation.id).slice(0, 8) : 'unknown';
  const ts = Date.now();

  const animationUrl = normalizeAnimationUrl(creation.animation);
  if (animationUrl && shouldDownloadAnimation(animationUrl)) {
    const ext = guessExtFromUrl(animationUrl) || 'webm';
    const filename = `${filePrefix}_${idPart}_${ts}.${ext}`;
    await downloadUrlAsFile(animationUrl, filename);
    return { type: 'animation', filename };
  }

  const imageSrc =
    normalizeFrameImage(creation.animation) ||
    creation.enhanced_image ||
    creation.original_image;
  if (!imageSrc) throw new Error('No image to export');

  const storyText =
    (typeof creation.story === 'string' && creation.story) ||
    (creation.story && creation.story.content) ||
    '';

  const filename = `${filePrefix}_${idPart}_${ts}.webm`;
  const blob = await renderImageToWebm({
    imageSrc,
    text: storyText,
    durationMs: 4500,
    fps: 30,
  });

  downloadBlob(blob, filename);
  return { type: 'render', filename };
}

function normalizeAnimationUrl(animation) {
  if (!animation) return null;

  if (typeof animation === 'string') {
    if (animation.startsWith('http') || animation.startsWith('data:') || animation.startsWith('blob:')) return animation;
    if (animation.startsWith('/')) return `${window.location.origin}${animation}`;
    return animation;
  }

  if (typeof animation === 'object') {
    if (typeof animation.url === 'string') return normalizeAnimationUrl(animation.url);
    if (typeof animation.videoUrl === 'string') return normalizeAnimationUrl(animation.videoUrl);
  }

  return null;
}

function normalizeFrameImage(animation) {
  if (!animation) return null;

  if (Array.isArray(animation)) {
    const first = animation[0];
    return typeof first === 'string' ? first : null;
  }

  if (typeof animation === 'object' && Array.isArray(animation.frames)) {
    const first = animation.frames[0];
    return typeof first === 'string' ? first : null;
  }

  return null;
}

function shouldDownloadAnimation(url) {
  try {
    if (url.startsWith('blob:') || url.startsWith('data:')) return true;
    const u = new URL(url, window.location.origin);
    return u.origin === window.location.origin;
  } catch (_) {
    return false;
  }
}

function guessExtFromUrl(url) {
  try {
    if (url.startsWith('data:')) {
      const mime = url.slice(5, url.indexOf(';'));
      if (mime.includes('mp4')) return 'mp4';
      if (mime.includes('webm')) return 'webm';
      if (mime.includes('ogg')) return 'ogg';
      return null;
    }

    const u = new URL(url, window.location.origin);
    const p = u.pathname.toLowerCase();
    if (p.endsWith('.mp4')) return 'mp4';
    if (p.endsWith('.webm')) return 'webm';
    if (p.endsWith('.ogg')) return 'ogg';
    return null;
  } catch (_) {
    return null;
  }
}

async function downloadUrlAsFile(url, filename) {
  if (typeof url !== 'string') throw new Error('Invalid url');

  if (url.startsWith('data:')) {
    const blob = dataUrlToBlob(url);
    downloadBlob(blob, filename);
    return;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const blob = await res.blob();
    downloadBlob(blob, filename);
  } catch (e) {
    // CORS / opaque responses / blocked fetch: fallback to direct link download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function dataUrlToBlob(dataUrl) {
  const [meta, data] = dataUrl.split(',');
  const mime = meta.match(/data:([^;]+)/)?.[1] || 'application/octet-stream';
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function renderImageToWebm({ imageSrc, text, durationMs, fps }) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const img = await loadImage(imageSrc);
  const targetW = 960;
  const targetH = 540;
  canvas.width = targetW;
  canvas.height = targetH;

  const stream = canvas.captureStream(fps);

  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  const mimeType = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t));
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const totalFrames = Math.max(1, Math.round((durationMs / 1000) * fps));

  return await new Promise((resolve, reject) => {
    recorder.onerror = () => reject(recorder.error || new Error('Record error'));

    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }));
    };

    recorder.start(200);

    let frame = 0;
    const start = performance.now();

    const tick = () => {
      const now = performance.now();
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);

      drawFrame({ ctx, canvas, img, progress, text });

      frame++;
      if (frame < totalFrames) {
        requestAnimationFrame(tick);
      } else {
        recorder.stop();
      }
    };

    requestAnimationFrame(tick);
  });
}

function drawFrame({ ctx, canvas, img, progress, text }) {
  const { width: w, height: h } = canvas;

  ctx.clearRect(0, 0, w, h);

  const zoom = 1 + progress * 0.06;
  const drawW = w * zoom;
  const drawH = h * zoom;
  const dx = (w - drawW) / 2;
  const dy = (h - drawH) / 2;

  ctx.drawImage(img, dx, dy, drawW, drawH);

  const alpha = Math.min(1, progress * 2);
  if (text) {
    ctx.save();
    ctx.globalAlpha = alpha;

    const padding = 22;
    const boxH = 120;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    roundRect(ctx, padding, h - boxH - padding, w - padding * 2, boxH, 18);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '20px system-ui, -apple-system, Segoe UI, Roboto, PingFang SC, Microsoft YaHei';
    ctx.textBaseline = 'top';

    const lines = wrapText(ctx, text, w - padding * 2 - 28);
    const maxLines = 4;
    const shown = lines.slice(0, maxLines);

    let ty = h - boxH - padding + 16;
    for (const line of shown) {
      ctx.fillText(line, padding + 14, ty);
      ty += 26;
    }

    ctx.restore();
  }
}

function wrapText(ctx, text, maxWidth) {
  const raw = String(text).replace(/\s+/g, ' ').trim();
  if (!raw) return [];

  const result = [];
  let line = '';

  for (const ch of raw) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth) {
      if (line) result.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) result.push(line);
  return result;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
