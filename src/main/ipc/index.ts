import { registerSettingsHandlers } from './settings';
import { registerHabitsHandlers } from './habits';

export function registerAllHandlers(): void {
  registerSettingsHandlers();
  registerHabitsHandlers();
}
