import { registerSettingsHandlers } from './settings';
import { registerHabitsHandlers } from './habits';
import { registerPlannerHandlers } from './planner';
import { registerExpensesHandlers } from './expenses';

export function registerAllHandlers(): void {
  registerSettingsHandlers();
  registerHabitsHandlers();
  registerPlannerHandlers();
  registerExpensesHandlers();
}
