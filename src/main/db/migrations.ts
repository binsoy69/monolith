export interface Migration {
  version: number
  sql: string
}

export const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        days_of_week TEXT NOT NULL DEFAULT '1111111',
        archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS habit_completions (
        habit_id TEXT NOT NULL,
        date TEXT NOT NULL,
        value INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (habit_id, date),
        FOREIGN KEY (habit_id) REFERENCES habits(id)
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        notes TEXT,
        date TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        position INTEGER NOT NULL DEFAULT 0,
        priority INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
      CREATE TABLE IF NOT EXISTS daily_notes (
        date TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT
      );
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        amount INTEGER NOT NULL,
        date TEXT NOT NULL,
        category_id TEXT NOT NULL,
        wallet_id TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (wallet_id) REFERENCES wallets(id)
      );
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
    `
  },
  {
    version: 2,
    sql: `
      ALTER TABLE habits ADD COLUMN kind TEXT NOT NULL DEFAULT 'boolean';
      ALTER TABLE habits ADD COLUMN target_count INTEGER;
    `
  },
  {
    version: 3,
    sql: `
      ALTER TABLE tasks ADD COLUMN carried_from_date TEXT;
    `
  },
  {
    version: 4,
    sql: `
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id TEXT PRIMARY KEY,
        wallet_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (wallet_id) REFERENCES wallets(id)
      );
      CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id
        ON wallet_transactions(wallet_id);
    `
  },
  {
    version: 5,
    sql: `
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE COLLATE NOCASE,
        color TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS item_tags (
        tag_id TEXT NOT NULL,
        item_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (tag_id, item_type, item_id),
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_item_tags_item
        ON item_tags(item_type, item_id);
      CREATE INDEX IF NOT EXISTS idx_item_tags_tag
        ON item_tags(tag_id);
    `,
  }
]
