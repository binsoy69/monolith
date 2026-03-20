import { registerSettingsHandlers } from './settings';
import { registerHabitsHandlers } from './habits';
import { registerPlannerHandlers } from './planner';

export function registerAllHandlers(): void {
  registerSettingsHandlers();
  registerHabitsHandlers();
  registerPlannerHandlers();
}
