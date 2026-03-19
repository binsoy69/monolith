/// <reference types="vite/client" />

import type { API } from '../shared/ipc-types'

declare global {
  interface Window {
    api: API
  }
}
