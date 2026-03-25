#!/usr/bin/env node
/**
 * Wait for PostgreSQL on localhost:5433 to accept connections.
 * Used after `docker compose up -d` so migrations don't run before DB is ready.
 */
const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '5433', 10);
const maxAttempts = 30;
const intervalMs = 1000;

function tryConnect() {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(2000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, host);
  });
}

async function main() {
  console.log(`Waiting for Postgres at ${host}:${port}...`);
  for (let i = 0; i < maxAttempts; i++) {
    if (await tryConnect()) {
      console.log('Postgres is ready.');
      process.exit(0);
    }
    process.stderr.write('.');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  console.error('\nTimed out waiting for Postgres. Is the container running? Run: docker compose ps');
  process.exit(1);
}

main();
