import { useEffect, useRef } from 'react';

interface KeyboardShortcutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = {
  Navigation: [
    { keys: ['Alt', '1'], label: 'Dashboard' },
    { keys: ['Alt', '2'], label: 'Habits' },
    { keys: ['Alt', '3'], label: 'Planner' },
    { keys: ['Alt', '4'], label: 'Expenses' },
    { keys: ['Esc'], label: 'Close / Go to Dashboard' },
  ],
  'Module Actions': [
    { keys: ['N'], label: 'New item in active module' },
    { keys: ['←'], label: 'Previous day (Planner)' },
    { keys: ['→'], label: 'Next day (Planner)' },
    { keys: ['T'], label: 'Jump to today (Planner)' },
  ],
  'Quick-Add': [
    { keys: ['Ctrl', 'K'], label: 'Command palette' },
    { keys: ['?'], label: 'This overlay' },
    { keys: ['↑', '↓'], label: 'Navigate palette items' },
    { keys: ['Enter'], label: 'Confirm selected action' },
  ],
};

export function KeyboardShortcutOverlay({ isOpen, onClose }: KeyboardShortcutOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on click outside the modal
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Use setTimeout to avoid closing immediately from the ? keypress
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      animation: 'fadeIn var(--duration-normal) ease-out',
    }}>
      <div
        ref={overlayRef}
        style={{
          width: 480,
          backgroundColor: 'var(--color-bg-overlay)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          maxHeight: '80vh',
          overflowY: 'auto' as const,
        }}
      >
        {/* Title */}
        <h2 style={{
          fontSize: 'var(--font-size-display)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: 0,
          marginBottom: 'var(--space-6)',
        }}>
          Keyboard Shortcuts
        </h2>

        {/* Shortcut sections */}
        {Object.entries(SHORTCUTS).map(([section, shortcuts], sectionIndex) => (
          <div key={section} style={{
            marginTop: sectionIndex > 0 ? 'var(--space-6)' : 0,
            paddingTop: sectionIndex > 0 ? 'var(--space-6)' : 0,
            borderTop: sectionIndex > 0 ? '1px solid var(--color-border)' : 'none',
          }}>
            {/* Section heading */}
            <h3 style={{
              fontSize: 'var(--font-size-body)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: 0,
              marginBottom: 'var(--space-4)',
            }}>
              {section}
            </h3>

            {/* Shortcut rows */}
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 'var(--space-2)',
                  paddingBottom: 'var(--space-2)',
                }}
              >
                <span style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-body)',
                }}>
                  {shortcut.label}
                </span>
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                  {shortcut.keys.map((key) => (
                    <kbd
                      key={key}
                      style={{
                        fontSize: 'var(--font-size-small)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-accent-subtle)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 8px',
                        fontFamily: 'inherit',
                        lineHeight: 1,
                      }}
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
