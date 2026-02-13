import { describe, it, expect } from "vitest";
import * as cryptoUtils from "@/lib/utils/crypto";

describe("Crypto Utils", () => {
  describe("Encryption/Decryption", () => {
    it("should encrypt and decrypt correctly", () => {
      const password = "mySecretPassword";
      const plaintext = "Secret Data";

      const encrypted = cryptoUtils.encrypt(plaintext, password);
      expect(encrypted.ciphertext).not.toBe(plaintext);
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.tag).toBeDefined();

      const decrypted = cryptoUtils.decrypt(encrypted, password);
      expect(decrypted).toBe(plaintext);
    });

    it("should fail decryption with wrong password", () => {
      const password = "correctPassword";
      const plaintext = "Secret Data";
      const encrypted = cryptoUtils.encrypt(plaintext, password);

      expect(() => {
        cryptoUtils.decrypt(encrypted, "wrongPassword");
      }).toThrow();
    });
  });

  describe("Password Hashing", () => {
    it("should hash and verify password correctly", () => {
      const password = "userPassword123";
      const hash = cryptoUtils.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(cryptoUtils.verifyPassword(password, hash)).toBe(true);
    });

    it("should not verify wrong password", () => {
      const password = "userPassword123";
      const hash = cryptoUtils.hashPassword(password);

      expect(cryptoUtils.verifyPassword("wrongPassword", hash)).toBe(false);
    });

    it("should generate different hashes for same password (salt)", () => {
      const password = "samePassword";
      const hash1 = cryptoUtils.hashPassword(password);
      const hash2 = cryptoUtils.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });
});
