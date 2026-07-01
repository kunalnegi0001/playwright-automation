/**
 * @fileoverview Encryption and cryptography utility functions.
 * Provides AES encryption/decryption, hashing, and secure key generation.
 * @module encryption/encryption.util
 */

import CryptoJS from 'crypto-js';
import { configManager } from '@config/config.manager';

/**
 * Encryption Utility
 * Handles encryption and decryption of sensitive data using AES and SHA-256
 * @class
 */
class EncryptionUtil {
  private secretKey: string;

  constructor() {
    this.secretKey = configManager.get('security.encryptionKey') || 'default-secret-key';
  }

  /**
   * Encrypt plaintext using AES encryption
   * @param {string} text - Plaintext to encrypt
   * @returns {string} Encrypted ciphertext (base64 encoded)
   * @example
   * const encrypted = encryptionUtil.encrypt('my-password');
   * console.log(encrypted); // 'U2FsdGVkX1...'
   */
  encrypt(text: string) {
    if (!text) {
      return '';
    }
    return CryptoJS.AES.encrypt(text, this.secretKey).toString();
  }

  /**
   * Decrypt ciphertext back to plaintext
   * @param {string} ciphertext - Base64 encoded encrypted text
   * @returns {string} Decrypted plaintext
   * @throws {Error} If decryption fails (wrong key or corrupted data)
   * @example
   * const plaintext = encryptionUtil.decrypt('U2FsdGVkX1...');
   * console.log(plaintext); // 'my-password'
   */
  decrypt(ciphertext: string) {
    if (!ciphertext) {
      return '';
    }
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Hash text using SHA-256 (one-way, irreversible)
   * @param {string} text - Text to hash
   * @returns {string} SHA-256 hash (64 character hex string)
   * @example
   * const hash = encryptionUtil.hash('password123');
   * console.log(hash); // 'ef92b778...'
   */
  hash(text: string) {
    return CryptoJS.SHA256(text).toString();
  }

  /**
   * Generate cryptographically secure random key
   * @param {number} [length=32] - Key length in bytes
   * @returns {string} Hex-encoded random key
   * @example
   * const key = encryptionUtil.generateKey(32);
   * console.log(key.length); // 64 (32 bytes = 64 hex chars)
   */
  generateKey(length = 32) {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  /**
   * Encrypt JavaScript object by stringifying and encrypting
   * @param {Object} obj - Object to encrypt
   * @returns {string} Encrypted object as ciphertext
   * @example
   * const encrypted = encryptionUtil.encryptObject({ user: 'john', pass: '123' });
   */
  encryptObject(obj: unknown) {
    const json = JSON.stringify(obj);
    return this.encrypt(json);
  }

  /**
   * Decrypt ciphertext back to JavaScript object
   * @param {string} ciphertext - Encrypted object
   * @returns {Object} Decrypted object
   * @throws {Error} If decryption or JSON parsing fails
   * @example
   * const obj = encryptionUtil.decryptObject(encrypted);
   * console.log(obj); // { user: 'john', pass: '123' }
   */
  decryptObject(ciphertext: string) {
    const decrypted = this.decrypt(ciphertext);
    return JSON.parse(decrypted) as unknown;
  }
}

const encryptionUtil = new EncryptionUtil();

export { EncryptionUtil, encryptionUtil };
