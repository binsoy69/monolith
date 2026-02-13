/**
 * Encryption utilities using Node.js built-in `crypto` module.
 * AES-256-GCM with PBKDF2 key derivation.
 */
import {
  randomBytes,
  pbkdf2Sync,
  createCipheriv,
  createDecipheriv,
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_DIGEST = "sha512";

export interface EncryptedData {
  ciphertext: string; // base64
  iv: string; // base64
  salt: string; // base64
  tag: string; // base64
}

/**
 * Derive an encryption key from a password and salt.
 */
export function deriveKey(password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    PBKDF2_DIGEST,
  );
}

/**
 * Encrypt plaintext with a password.
 */
export function encrypt(plaintext: string, password: string): EncryptedData {
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(password, salt);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let ciphertext = cipher.update(plaintext, "utf8", "base64");
  ciphertext += cipher.final("base64");
  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
    tag: tag.toString("base64"),
  };
}

/**
 * Decrypt ciphertext with a password.
 * Throws if the password is wrong or data is tampered.
 */
export function decrypt(encrypted: EncryptedData, password: string): string {
  const salt = Buffer.from(encrypted.salt, "base64");
  const iv = Buffer.from(encrypted.iv, "base64");
  const tag = Buffer.from(encrypted.tag, "base64");
  const key = deriveKey(password, salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let plaintext = decipher.update(encrypted.ciphertext, "base64", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
}

/**
 * Hash a password for storage (vault master password).
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const hash = pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    PBKDF2_DIGEST,
  );
  return `${salt.toString("base64")}:${hash.toString("base64")}`;
}

/**
 * Verify a password against a stored hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [saltB64, hashB64] = storedHash.split(":");
  if (!saltB64 || !hashB64) return false;
  const salt = Buffer.from(saltB64, "base64");
  const hash = pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    PBKDF2_DIGEST,
  );
  return hash.toString("base64") === hashB64;
}
