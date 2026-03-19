const isMac = navigator.platform.toLowerCase().includes('mac');

const controlButtonStyle = (color: string): React.CSSProperties => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: color,
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  WebkitAppRegion: 'no-drag',
  flexShrink: 0,
} as React.CSSProperties);

export function WindowChrome() {
  return (
    <div
      style={{
        width: '100%',
        height: 'var(--drag-region-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        WebkitAppRegion: 'drag',
        flexShrink: 0,
      } as React.CSSProperties}
    >
      <span
        style={{
          fontSize: 'var(--font-size-body)',
          fontWeight: 400,
          color: 'var(--color-text-secondary)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        Monolith
      </span>

      {!isMac && (
        <div
          style={{
            position: 'absolute',
            right: 'var(--space-2)',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <button
            onClick={() => window.api.window.minimize()}
            title="Minimize"
            aria-label="Minimize window"
            style={controlButtonStyle('#f59e0b')}
          />
          <button
            onClick={() => window.api.window.maximize()}
            title="Maximize"
            aria-label="Maximize window"
            style={controlButtonStyle('#22c55e')}
          />
          <button
            onClick={() => window.api.window.close()}
            title="Close"
            aria-label="Close window"
            style={controlButtonStyle('#ef4444')}
          />
        </div>
      )}
    </div>
  );
}
