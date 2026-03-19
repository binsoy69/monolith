export interface AppSettings {
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY'
  notificationTime: string // "HH:mm" format e.g. "09:00"
  windowBounds?: { width: number; height: number; x: number; y: number }
}

export interface SettingsAPI {
  get: () => Promise<AppSettings>
  set: (settings: Partial<AppSettings>) => Promise<void>
}

export interface API {
  settings: SettingsAPI
  // Stubs for Phase 2 — uncommented when module IPC handlers are built
  // habits: HabitsAPI;
  // planner: PlannerAPI;
  // expenses: ExpensesAPI;
}
