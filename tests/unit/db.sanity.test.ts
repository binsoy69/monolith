import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";

describe("DB Sanity", () => {
  it("should open in-memory db", () => {
    const db = new Database(":memory:");
    db.exec("CREATE TABLE test (id INTEGER PRIMARY KEY)");
    db.exec("INSERT INTO test (id) VALUES (1)");
    const row = db.prepare("SELECT * FROM test").get();
    expect(row).toEqual({ id: 1 });
  });
});
