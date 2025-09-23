#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const pgPassword = process.env.PGPASSWORD || 'veilmarket123';
const initFile = path.join(__dirname, '..', 'init.sql');

const result = spawnSync(
  'psql',
  ['-h', 'localhost', '-U', 'veilmarket', '-d', 'veilmarket', '-f', initFile],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      PGPASSWORD: pgPassword,
    },
  }
);

if (result.error) {
  console.error('Failed to run psql:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
