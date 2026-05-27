/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);

const toastStyles = {
  error: {
    icon: XCircle,
    className: "border-red-900/70 bg-red-950 text-red-100",
    iconClassName: "text-red-300",
  },
  info: {
    icon: Info,
    className: "border-blue-900/70 bg-blue-950 text-blue-100",
    iconClassName: "text-blue-300",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-900/70 bg-emerald-950 text-emerald-100",
    iconClassName: "text-emerald-300",
  },
  warning: {
    icon: TriangleAlert,
    className: "border-amber-900/70 bg-amber-950 text-amber-100",
    iconClassName: "text-amber-300",
  },
};

const createToastId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((toastId) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  }, []);

  const notify = useCallback(
    ({ message, title, type = "info", duration = 4500 }) => {
      const id = createToastId();
      const safeMessage = message || "Something went wrong. Please try again.";

      setToasts((currentToasts) => [
        ...currentToasts,
        {
          id,
          message: safeMessage,
          title,
          type,
        },
      ]);

      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }

      return id;
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      error: (message, options = {}) => notify({ ...options, message, type: "error" }),
      info: (message, options = {}) => notify({ ...options, message, type: "info" }),
      success: (message, options = {}) => notify({ ...options, message, type: "success" }),
      warning: (message, options = {}) => notify({ ...options, message, type: "warning" }),
      dismiss,
    }),
    [dismiss, notify]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex w-auto flex-col gap-3 sm:left-auto sm:right-5 sm:top-5 sm:w-[380px]">
        {toasts.map((toastItem) => {
          const style = toastStyles[toastItem.type] ?? toastStyles.info;
          const Icon = style.icon;

          return (
            <div
              key={toastItem.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-xl shadow-black/30 ${style.className}`}
              role="status"
            >
              <Icon size={19} className={`mt-0.5 shrink-0 ${style.iconClassName}`} />
              <div className="min-w-0 flex-1">
                {toastItem.title ? <p className="text-sm font-bold text-white">{toastItem.title}</p> : null}
                <p className="text-sm font-medium leading-5">{toastItem.message}</p>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toastItem.id)}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
