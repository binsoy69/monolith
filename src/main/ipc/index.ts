import { registerSettingsHandlers } from './settings';
import { registerHabitsHandlers } from './habits';
import { registerPlannerHandlers } from './planner';
import { registerExpensesHandlers } from './expenses';
import { registerDashboardHandlers } from './dashboard';
import { registerTagsHandlers } from './tags';

export function registerAllHandlers(): void {
  registerSettingsHandlers();
  registerHabitsHandlers();
  registerPlannerHandlers();
  registerExpensesHandlers();
  registerDashboardHandlers();
  registerTagsHandlers();
}
