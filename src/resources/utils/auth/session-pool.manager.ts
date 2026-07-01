/**
 * @fileoverview Session pool manager for parallel test execution.
 * Manages a pool of authenticated sessions to avoid re-authentication overhead.
 * @module utils/auth/session-pool.manager
 */

import path from 'path';
import fs from 'fs/promises';

/**
 * Session Pool Manager
 * Manages a pool of authenticated sessions for parallel test execution
 * Prevents authentication bottlenecks by reusing sessions across tests
 * @class
 * @example
 * const pool = new SessionPoolManager();
 * await pool.initializePool(users, authFunction);
 * const session = await pool.acquireSession('admin');
 * // Use session...
 * pool.releaseSession(session.sessionKey);
 */
class SessionPoolManager {
  sessionPool: Map<string, { user: Record<string, unknown>; session: unknown; lastUsed: number }>;
  sessionInUse: Set<string>;
  storageStatePath: string;

  constructor() {
    this.sessionPool = new Map();
    this.sessionInUse = new Set();
    this.storageStatePath = '.auth';
  }

  /**
   * Initialize session pool with multiple authenticated users
   * @async
   * @param {Array<Object>} users - Array of user configurations
   * @param {Function} authFunction - Function to authenticate users (receives user object)
   * @returns {Promise<void>}
   * @example
   * await sessionPool.initializePool([
   *   { role: 'admin', email: 'admin@test.com' },
   *   { role: 'user', email: 'user@test.com' }
   * ], async (user) => await authenticate(user));
   */
  async initializePool(
    users: Array<Record<string, unknown>>,
    authFunction: (user: Record<string, unknown>) => Promise<unknown>
  ): Promise<void> {
    for (const user of users) {
      const sessionKey = `${user.role}_${user.email}`;

      try {
        const session = await authFunction(user);
        this.sessionPool.set(sessionKey, {
          user,
          session,
          lastUsed: Date.now(),
        });

        console.log(`Session initialized for: ${user.email}`);
      } catch (error) {
        console.error(
          `Failed to initialize session for ${user.email}:`,
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  /**
   * Acquire an available session from the pool
   * @async
   * @param {string} role - User role (admin, standard, etc.)
   * @returns {Promise<Object>} Session data with sessionKey, user, and session properties
   * @throws {Error} If no available session found for role
   * @example
   * const { sessionKey, user, session } = await pool.acquireSession('admin');
   */
  async acquireSession(role: string): Promise<{
    sessionKey: string;
    user: Record<string, unknown>;
    session: unknown;
    lastUsed: number;
  }> {
    // Find available session for role
    for (const [key, value] of this.sessionPool.entries()) {
      if (value.user.role === role && !this.sessionInUse.has(key)) {
        this.sessionInUse.add(key);
        value.lastUsed = Date.now();
        return {
          sessionKey: key,
          ...value,
        };
      }
    }

    throw new Error(`No available session for role: ${role}`);
  }

  /**
   * Release session back to pool for reuse
   * @param {string} sessionKey - Session key to release
   * @returns {void}
   * @example
   * pool.releaseSession('admin_admin@test.com');
   */
  releaseSession(sessionKey: string): void {
    this.sessionInUse.delete(sessionKey);
  }

  /**
   * Get pool statistics
   * @returns {Object} Pool statistics
   * @returns {number} .totalSessions - Total sessions in pool
   * @returns {number} .sessionsInUse - Currently used sessions
   * @returns {number} .availableSessions - Available sessions
   */
  getStats(): { totalSessions: number; sessionsInUse: number; availableSessions: number } {
    return {
      totalSessions: this.sessionPool.size,
      sessionsInUse: this.sessionInUse.size,
      availableSessions: this.sessionPool.size - this.sessionInUse.size,
    };
  }

  /**
   * Save all sessions to disk for persistence
   * @async
   * @returns {Promise<void>}
   */
  async saveAllSessions() {
    await fs.mkdir(this.storageStatePath, { recursive: true });

    for (const [key, value] of this.sessionPool.entries()) {
      const filePath = path.join(this.storageStatePath, `${key}.json`);
      await fs.writeFile(filePath, JSON.stringify(value.session, null, 2));
    }

    console.log(`Saved ${this.sessionPool.size} sessions to disk`);
  }

  /**
   * Load sessions from disk
   * @async
   * @returns {Promise<void>}
   */
  async loadAllSessions() {
    try {
      const files = await fs.readdir(this.storageStatePath);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.storageStatePath, file);
          const sessionData = JSON.parse(await fs.readFile(filePath, 'utf-8')) as Record<
            string,
            unknown
          >;
          const key = file.replace('.json', '');

          this.sessionPool.set(key, {
            user: {}, // We don't have user data from file, use empty object
            session: sessionData,
            lastUsed: Date.now(),
          });
        }
      }

      console.log(`Loaded ${this.sessionPool.size} sessions from disk`);
    } catch (error) {
      console.log('No saved sessions found');
    }
  }

  /**
   * Clear all sessions
   */
  async clearAll(): Promise<void> {
    this.sessionPool.clear();
    this.sessionInUse.clear();

    try {
      const files = await fs.readdir(this.storageStatePath);
      for (const file of files) {
        await fs.unlink(path.join(this.storageStatePath, file));
      }
    } catch (error) {
      // Ignore if directory doesn't exist
    }
  }
}

// Export singleton instance
const sessionPoolManager = new SessionPoolManager();

export { SessionPoolManager, sessionPoolManager };
