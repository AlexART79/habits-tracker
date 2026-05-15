import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvFile } from './load-env';

describe('loadEnvFile', () => {
  const tempDir = join(process.cwd(), 'tmp-env-test');
  const envPath = join(tempDir, '.env');

  beforeEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    mkdirSync(tempDir, { recursive: true });
    delete process.env['GOOGLE_CLIENT_ID'];
    process.env['SESSION_SECRET'] = 'already-set';
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    delete process.env['GOOGLE_CLIENT_ID'];
    delete process.env['SESSION_SECRET'];
  });

  it('loads quoted values from a .env file without replacing existing environment variables', () => {
    writeFileSync(
      envPath,
      [
        'GOOGLE_CLIENT_ID="google-client-from-file"',
        'SESSION_SECRET="session-secret-from-file"',
        '# comments are ignored',
        '',
      ].join('\n'),
    );

    loadEnvFile(envPath);

    expect(process.env['GOOGLE_CLIENT_ID']).toBe('google-client-from-file');
    expect(process.env['SESSION_SECRET']).toBe('already-set');
  });
});
