import type { UpdateStatus } from '../../shared/ipc-types'

interface UpdateBannerProps {
  status: UpdateStatus
  onInstall: () => void
}

function getBannerCopy(status: UpdateStatus): {
  title: string
  detail?: string
  showInstallAction: boolean
} {
  switch (status.state) {
    case 'checking':
      return { title: 'Checking for updates...', showInstallAction: false }
    case 'available':
      return {
        title: 'Update available. Downloading...',
        detail: `Version ${status.version}`,
        showInstallAction: false,
      }
    case 'downloading':
      return {
        title: 'Downloading update...',
        detail: `${Math.round(status.percent)}% complete`,
        showInstallAction: false,
      }
    case 'downloaded':
      return {
        title: 'Update ready. Restart to update.',
        detail: `Version ${status.version}`,
        showInstallAction: true,
      }
    case 'error':
      return {
        title: 'Update check failed',
        detail: status.message,
        showInstallAction: false,
      }
    default:
      return { title: '', showInstallAction: false }
  }
}

export function UpdateBanner({
  status,
  onInstall,
}: UpdateBannerProps): React.JSX.Element | null {
  if (status.state === 'idle' || status.state === 'not-available') {
    return null
  }

  const copy = getBannerCopy(status)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: 'var(--space-2) var(--space-4)',
        backgroundColor: 'var(--color-bg-overlay)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-small)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          {copy.title}
        </span>
        {copy.detail ? (
          <span
            style={{
              fontSize: 'var(--font-size-small)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {copy.detail}
          </span>
        ) : null}
      </div>

      {copy.showInstallAction ? (
        <button
          type="button"
          onClick={onInstall}
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-1) var(--space-3)',
            fontFamily: 'inherit',
            fontSize: 'var(--font-size-small)',
            cursor: 'pointer',
          }}
        >
          Restart to update
        </button>
      ) : null}
    </div>
  )
}
