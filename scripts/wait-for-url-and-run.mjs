import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_INTERVAL_MS = 500;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function waitForUrl(
  url,
  {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    intervalMs = DEFAULT_INTERVAL_MS,
    request = fetch,
  } = {},
) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      return await request(url);
    } catch {
      await delay(intervalMs);
    }
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function parseArgs(argv) {
  const separatorIndex = argv.indexOf('--');
  if (separatorIndex < 1 || separatorIndex === argv.length - 1) {
    throw new Error('Usage: node scripts/wait-for-url-and-run.mjs <url> -- <command> [args...]');
  }

  return {
    url: argv[0],
    command: argv[separatorIndex + 1],
    args: argv.slice(separatorIndex + 2),
  };
}

async function main() {
  const { url, command, args } = parseArgs(process.argv.slice(2));
  const timeoutMs = Number(process.env['WAIT_FOR_URL_TIMEOUT_MS'] ?? DEFAULT_TIMEOUT_MS);

  console.log(`Waiting for ${url} before starting ${command}...`);
  await waitForUrl(url, { timeoutMs });
  console.log(`${url} is reachable. Starting ${command}.`);

  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exitCode = code ?? 1;
  });

  child.on('error', (err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
