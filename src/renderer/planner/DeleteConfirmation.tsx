interface DeleteConfirmationProps {
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmation({ onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div
      style={{
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        paddingLeft: 'var(--space-4)',
        paddingRight: 'var(--space-2)',
        backgroundColor: 'var(--color-bg-elevated)',
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text-primary)',
          flex: 1,
        }}
      >
        Delete this task?
      </span>

      <button
        onClick={onConfirm}
        style={{
          padding: '0 var(--space-2)',
          height: '24px',
          background: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-destructive)',
          fontSize: 'var(--font-size-body)',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Delete
      </button>

      <button
        onClick={onCancel}
        style={{
          padding: '0 var(--space-2)',
          height: '24px',
          background: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-body)',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Keep Task
      </button>
    </div>
  )
}
