import { useToastStore } from './toast-store'

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--space-4)',
        right: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          style={{
            backgroundColor: 'var(--color-bg-overlay)',
            border: '1px solid var(--color-border)',
            borderLeft: toast.type === 'error'
              ? '3px solid var(--color-destructive)'
              : '3px solid var(--color-accent)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-4)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-body)',
            maxWidth: '320px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            animation: 'fadeIn var(--duration-normal) ease-out',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
