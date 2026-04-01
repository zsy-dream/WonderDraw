import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemo } from '../contexts/DemoContext';

const OPTIONS = [
  { id: 'normal', label: 'Normal' },
  { id: 'loading', label: 'Loading' },
  { id: 'empty', label: 'Empty' },
  { id: 'error', label: 'Error' }
];

function DemoControlPanel() {
  const { state, setForced, resetAll } = useDemo();
  const [open, setOpen] = useState(false);

  const enabled = Boolean(state?.enabled);

  const sections = useMemo(
    () => [
      { key: 'gallery', name: 'Gallery' },
      { key: 'detail', name: 'Detail' },
      { key: 'progress', name: 'Progress' },
      { key: 'teacher', name: 'Teacher' }
    ],
    []
  );

  if (!enabled) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="w-80 bg-white/95 backdrop-blur rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-800">Demo Panel</div>
                <div className="text-xs text-gray-500">强制页面状态（答辩演示用）</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xl px-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              {sections.map((s) => (
                <div key={s.key} className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">{s.name}</div>
                  <div className="grid grid-cols-4 gap-2">
                    {OPTIONS.map((opt) => {
                      const active = state?.forced?.[s.key] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setForced(s.key, opt.id)}
                          className={
                            `px-2 py-2 rounded-lg text-xs font-semibold border transition-colors ` +
                            (active
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300')
                          }
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={resetAll}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
                >
                  Reset
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                >
                  Reload
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="mt-3 w-14 h-14 rounded-2xl shadow-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center"
        aria-label="Toggle demo panel"
        title="Demo Panel"
      >
        <span className="text-xl">🎛️</span>
      </motion.button>
    </div>
  );
}

export default DemoControlPanel;
