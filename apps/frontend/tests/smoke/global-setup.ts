import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const backendUrl = process.env.FRONTEND_SMOKE_API_URL ?? 'http://127.0.0.1:3000';

async function assertBackendHealth() {
  const response = await fetch(`${backendUrl}/health`);

  if (!response.ok) {
    throw new Error(`Backend health check failed with HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as { status?: string; database?: { status?: string } };

  if (payload.status !== 'ok' || payload.database?.status !== 'ok') {
    throw new Error(
      `Backend is not ready for smoke tests: ${JSON.stringify(payload)}. Start backend and PostgreSQL first.`,
    );
  }
}

async function seedSmokeData() {
  await execFileAsync('npm', ['run', 'prisma:seed:test'], {
    cwd: new URL('../../../..', import.meta.url),
    env: process.env,
  });
}

export default async function globalSetup() {
  await assertBackendHealth();
  await seedSmokeData();
}
