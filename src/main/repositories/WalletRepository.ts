import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import type { Wallet, WalletTransaction } from "../../shared/domain-types";

export class WalletRepository {
  private readonly hasWalletTransactionsTable: boolean;

  constructor(private readonly db: Database.Database) {
    this.hasWalletTransactionsTable = this.hasTable("wallet_transactions");
  }

  private hasTable(tableName: string): boolean {
    const row = this.db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
      )
      .get(tableName) as { 1: number } | undefined;
    return row !== undefined;
  }

  private recordWalletTransaction(data: {
    walletId: string;
    amount: number;
    type: "manual_set" | "manual_delta";
    description?: string;
    date: string;
    createdAt: string;
  }): void {
    if (!this.hasWalletTransactionsTable) {
      return;
    }

    this.db
      .prepare(
        "INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        randomUUID(),
        data.walletId,
        data.amount,
        data.type,
        data.description ?? null,
        data.date,
        data.createdAt,
      );
  }

  list(): Wallet[] {
    const rows = this.db
      .prepare("SELECT id, name, balance FROM wallets ORDER BY name ASC")
      .all() as Wallet[];
    return rows;
  }

  create(data: { name: string; balance: number }): Wallet {
    const id = randomUUID();
    this.db
      .prepare("INSERT INTO wallets (id, name, balance) VALUES (?, ?, ?)")
      .run(id, data.name, data.balance);
    return { id, name: data.name, balance: data.balance };
  }

  update(
    id: string,
    data: { name?: string; balance?: number; description?: string },
  ): void {
    const tx = this.db.transaction(() => {
      if (data.name !== undefined) {
        this.db
          .prepare("UPDATE wallets SET name = ? WHERE id = ?")
          .run(data.name, id);
      }
      if (data.balance !== undefined) {
        this.db
          .prepare("UPDATE wallets SET balance = ? WHERE id = ?")
          .run(data.balance, id);
        const now = new Date().toISOString();
        const today = now.slice(0, 10);
        this.recordWalletTransaction({
          walletId: id,
          amount: data.balance,
          type: "manual_set",
          description: data.description,
          date: today,
          createdAt: now,
        });
      }
    });
    tx();
  }

  adjustBalance(
    id: string,
    mode: "set" | "delta",
    amount: number,
    description?: string,
  ): void {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const type = mode === "set" ? "manual_set" : "manual_delta";

    const tx = this.db.transaction(() => {
      if (mode === "set") {
        this.db
          .prepare("UPDATE wallets SET balance = ? WHERE id = ?")
          .run(amount, id);
      } else {
        this.db
          .prepare("UPDATE wallets SET balance = balance + ? WHERE id = ?")
          .run(amount, id);
      }
      this.recordWalletTransaction({
        walletId: id,
        amount,
        type,
        description,
        date: today,
        createdAt: now,
      });
    });
    tx();
  }

  listTransactions(walletId: string): WalletTransaction[] {
    if (!this.hasWalletTransactionsTable) {
      return [];
    }

    const rows = this.db
      .prepare(
        `SELECT id, wallet_id as walletId, amount, type, description, date, created_at as createdAt
         FROM wallet_transactions
         WHERE wallet_id = ?
         ORDER BY created_at DESC`,
      )
      .all(walletId) as WalletTransaction[];
    return rows;
  }

  delete(id: string): boolean {
    const row = this.db
      .prepare("SELECT COUNT(*) as n FROM expenses WHERE wallet_id = ?")
      .get(id) as { n: number };
    if (row.n > 0) return false;
    this.db.prepare("DELETE FROM wallets WHERE id = ?").run(id);
    return true;
  }

  getTotalBalance(): number {
    const row = this.db
      .prepare("SELECT COALESCE(SUM(balance), 0) as total FROM wallets")
      .get() as { total: number };
    return row.total;
  }
}
