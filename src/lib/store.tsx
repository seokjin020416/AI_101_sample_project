import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { STORAGE_KEY, parseStored } from './logic';
import type { AppData } from './types';

export type SaveState = 'saved' | 'saving' | 'error';

interface Toast {
  id: number;
  kind: 'success' | 'error' | 'info';
  title: string;
  body?: string;
}

interface StoreValue {
  data: AppData;
  /** Apply a pure update. Persisted to localStorage 1 second after the last change. */
  update: (fn: (d: AppData) => AppData) => void;
  saveState: SaveState;
  lastSavedAt: number | null;
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const SAVE_DELAY = 1000;

function loadInitial(): AppData {
  try {
    return parseStored(localStorage.getItem(STORAGE_KEY));
  } catch {
    return parseStored(null);
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadInitial);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dataRef = useRef(data);
  const timer = useRef<number | null>(null);
  const toastSeq = useRef(0);

  const dismissToast = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = ++toastSeq.current;
      setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismissToast(id), t.kind === 'error' ? 6000 : 3000);
    },
    [dismissToast],
  );

  const flush = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataRef.current));
      setSaveState('saved');
      setLastSavedAt(Date.now());
    } catch {
      // Input stays in memory/on screen; only persistence failed (PRD §4-3).
      setSaveState('error');
      toast({ kind: 'error', title: '저장에 실패했습니다. 브라우저 저장 공간을 확인해 주세요.' });
    }
  }, [toast]);

  const update = useCallback(
    (fn: (d: AppData) => AppData) => {
      setData((d) => {
        const next = fn(d);
        dataRef.current = next;
        return next;
      });
      setSaveState('saving');
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, SAVE_DELAY);
    },
    [flush],
  );

  // Don't lose the last second of typing when the tab is closed.
  useEffect(() => {
    const onUnload = () => {
      if (timer.current !== null) flush();
    };
    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('pagehide', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      window.removeEventListener('pagehide', onUnload);
    };
  }, [flush]);

  return (
    <StoreContext.Provider value={{ data, update, saveState, lastSavedAt, toasts, toast, dismissToast }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const v = useContext(StoreContext);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
