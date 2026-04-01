import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DemoContext = createContext(null);

const STORAGE_KEY = 'wonderdraw_demo_ui_state_v1';

const DEFAULT_STATE = {
  enabled: String(import.meta.env.VITE_DEMO_MODE || '').toLowerCase() === 'true',
  forced: {
    gallery: 'normal',
    detail: 'normal',
    progress: 'normal',
    teacher: 'normal'
  }
};

export function DemoProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;

      setState((prev) => ({
        ...prev,
        ...parsed,
        enabled: prev.enabled,
        forced: {
          ...prev.forced,
          ...(parsed.forced || {})
        }
      }));
    } catch (_) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const persist = {
        forced: state.forced
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
    } catch (_) {
      // ignore
    }
  }, [state.forced]);

  const actions = useMemo(() => {
    const setForced = (key, value) => {
      setState((prev) => ({
        ...prev,
        forced: {
          ...prev.forced,
          [key]: value
        }
      }));
    };

    const resetAll = () => {
      setState((prev) => ({
        ...prev,
        forced: { ...DEFAULT_STATE.forced }
      }));
    };

    return { setForced, resetAll };
  }, []);

  const value = useMemo(() => ({ state, ...actions }), [state, actions]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    return {
      state: DEFAULT_STATE,
      setForced: () => {},
      resetAll: () => {}
    };
  }
  return ctx;
}
