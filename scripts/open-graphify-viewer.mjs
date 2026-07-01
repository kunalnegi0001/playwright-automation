#!/usr/bin/env node
/**
 * @fileoverview Open the local Graphify viewer URL in the default browser.
 */

import { exec } from 'node:child_process';

const port = process.env.KB_GRAPH_PORT || '4177';
const url = `http://localhost:${port}`;

/**
 * Executes a shell command.
 * @param {string} command - Command to run.
 * @returns {Promise<void>}
 */
const run = command =>
  new Promise((resolve, reject) => {
    exec(command, error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

/**
 * Opens URL in default browser according to OS.
 * @returns {Promise<void>}
 */
const openInBrowser = async () => {
  if (process.platform === 'darwin') {
    await run(`open "${url}"`);
    return;
  }

  if (process.platform === 'win32') {
    await run(`start "" "${url}"`);
    return;
  }

  await run(`xdg-open "${url}"`);
};

openInBrowser()
  .then(() => {
    console.log(`Opened Graphify viewer: ${url}`);
  })
  .catch(error => {
    console.error(`Failed to open Graphify viewer: ${url}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
