'use client';

/**
 * Minimal toast system. No external library.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.show({ type: 'success', message: 'Saved!' });
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastInput {
  type?: ToastType;
  message: string;
  /** Auto-dismiss after this many ms. Default: 4000. Set to 0 to disable. */
  duration?: number;
}

interface Toast extends Required<Pick<ToastInput, 'message'>> {
  id: number;
  type: ToastType;
}

interface ToastContextValue {
  show: (t: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Increment-only id generator. Stable across renders thanks to ref.
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      const toast: Toast = {
        id,
        type: input.type ?? 'info',
        message: input.message,
      };
      setToasts((all) => [...all, toast]);

      const duration = input.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end gap-2 p-4 sm:p-6">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  // Defer mounting opacity so CSS transitions can animate the appearance.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const colors: Record<ToastType, string> = {
    success: 'border-accent/40 bg-accent/10 text-accent',
    error: 'border-red-500/40 bg-red-500/10 text-red-300',
    info: 'border-zinc-700 bg-card text-zinc-200',
  };

  return (
    <div
      role="status"
      className={`pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 shadow-lg transition-all duration-200 ${
        colors[toast.type]
      } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5">
          {toast.type === 'success' && '✓'}
          {toast.type === 'error' && '⚠'}
          {toast.type === 'info' && 'ℹ'}
        </span>
        <p className="text-sm flex-1 break-words">{toast.message}</p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-xs opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
