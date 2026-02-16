import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

// --- Helpers ---
const timestamp = (name: string) =>
  text(name)
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull();

const pk = integer("id").primaryKey({ autoIncrement: true });

// --- Settings ---
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// --- Habits ---
export const habitCategories = sqliteTable("habit_categories", {
  id: pk,
  name: text("name").notNull(),
  color: text("color").notNull(), // hex
  icon: text("icon"), // lucide icon name
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const habits = sqliteTable("habits", {
  id: pk,
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => habitCategories.id),
  frequency: text("frequency", {
    enum: ["daily", "weekly", "monthly", "every_n_days"],
  }).notNull(),
  frequencyValue: integer("frequency_value"), // e.g. 3 for "every 3 days"
  targetDays: text("target_days", { mode: "json" }), // e.g. ["Mon", "Wed"] for weekly
  reminderTime: text("reminder_time"), // HH:mm
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const habitLogs = sqliteTable(
  "habit_logs",
  {
    id: pk,
    habitId: integer("habit_id")
      .references(() => habits.id, { onDelete: "cascade" })
      .notNull(),
    logDate: text("log_date").notNull(), // YYYY-MM-DD
    completed: integer("completed", { mode: "boolean" }).default(true),
    note: text("note"),
    createdAt: timestamp("created_at"),
  },
  (table) => ({
    habitLogDateUnique: uniqueIndex("habit_logs_habit_id_log_date_unique").on(
      table.habitId,
      table.logDate,
    ),
  }),
);

export const habitTags = sqliteTable("habit_tags", {
  id: pk,
  habitId: integer("habit_id")
    .references(() => habits.id, { onDelete: "cascade" })
    .notNull(),
  tag: text("tag").notNull(),
});

// --- Journal ---
export const journalEntries = sqliteTable("journal_entries", {
  id: pk,
  title: text("title"),
  content: text("content"),
  contentEncrypted: integer("content_encrypted", { mode: "boolean" }).default(
    false,
  ),
  mood: text("mood"),
  isPrompt: integer("is_prompt", { mode: "boolean" }).default(false),
  promptText: text("prompt_text"),
  frontMatter: text("front_matter", { mode: "json" }),
  entryDate: text("entry_date").notNull(), // YYYY-MM-DD HH:mm:ss
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
  deletedAt: text("deleted_at"), // Soft delete
});

export const journalTags = sqliteTable("journal_tags", {
  id: pk,
  entryId: integer("entry_id")
    .references(() => journalEntries.id, { onDelete: "cascade" })
    .notNull(),
  tag: text("tag").notNull(),
});

export const journalImages = sqliteTable("journal_images", {
  id: pk,
  entryId: integer("entry_id")
    .references(() => journalEntries.id, { onDelete: "cascade" })
    .notNull(),
  filePath: text("file_path").notNull(),
  altText: text("alt_text"),
  createdAt: timestamp("created_at"),
});

// --- Finance ---
export const financeCategories = sqliteTable("finance_categories", {
  id: pk,
  name: text("name").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  color: text("color").notNull(),
  icon: text("icon"),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: timestamp("created_at"),
});

export const financeAccounts = sqliteTable("finance_accounts", {
  id: pk,
  name: text("name").notNull(),
  balance: integer("balance").notNull().default(0), // Cents or smallest unit
  currency: text("currency").default("PHP").notNull(),
  icon: text("icon"), // lucide icon name (e.g., "smartphone", "wallet")
  color: text("color"), // hex color (e.g., "#6366f1")
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const transactions = sqliteTable("transactions", {
  id: pk,
  type: text("type", { enum: ["income", "expense", "transfer"] }).notNull(),
  amount: integer("amount").notNull(), // Cents
  description: text("description"),
  categoryId: integer("category_id").references(() => financeCategories.id),
  accountId: integer("account_id")
    .references(() => financeAccounts.id)
    .notNull(),
  toAccountId: integer("to_account_id").references(() => financeAccounts.id), // For transfers
  isRecurring: integer("is_recurring", { mode: "boolean" }).default(false),
  recurrence: text("recurrence", { mode: "json" }),
  transactionDate: text("transaction_date").notNull(),
  tags: text("tags", { mode: "json" }), // JSON array of strings
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const budgets = sqliteTable("budgets", {
  id: pk,
  categoryId: integer("category_id")
    .references(() => financeCategories.id)
    .notNull(),
  amount: integer("amount").notNull(),
  period: text("period", { enum: ["monthly", "weekly"] }).default("monthly"),
  startDate: text("start_date").notNull(),
  createdAt: timestamp("created_at"),
});

export const savingsGoals = sqliteTable("savings_goals", {
  id: pk,
  name: text("name").notNull(),
  target: integer("target").notNull(),
  current: integer("current").default(0),
  deadline: text("deadline"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// --- Tasks ---
export const tasks = sqliteTable("tasks", {
  id: pk,
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  priority: integer("priority").default(0), // 0-3
  dueDate: text("due_date"),
  parentId: integer("parent_id").references((): AnySQLiteColumn => tasks.id, {
    onDelete: "cascade",
  }),
  sourceFile: text("source_file"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
  completedAt: text("completed_at"),
});

export const taskTags = sqliteTable("task_tags", {
  id: pk,
  taskId: integer("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  tag: text("tag").notNull(),
});
