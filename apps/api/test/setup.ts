import { readdirSync, rmSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

const testDatabasePaths = [
  resolve(__dirname, '../test.db'),
  resolve(__dirname, '../prisma/test.db'),
];
const migrationsPath = resolve(__dirname, '../prisma/migrations');

async function applyInitialMigration(): Promise<void> {
  process.env.DATABASE_URL = 'file:./test.db';

  for (const databasePath of testDatabasePaths) {
    if (basename(databasePath) !== 'test.db') {
      throw new Error(`Refusing to reset non-test database: ${databasePath}`);
    }

    for (const suffix of ['', '-journal', '-shm', '-wal']) {
      rmSync(`${databasePath}${suffix}`, { force: true });
    }
  }

  const prisma = new PrismaClient();
  const migrationFiles = readdirSync(migrationsPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(migrationsPath, entry.name, 'migration.sql'))
    .sort();

  try {
    for (const migrationFile of migrationFiles) {
      const migration = readFileSync(migrationFile, 'utf8');
      const statements = migration
        .split(';')
        .map((statement) => statement.trim())
        .filter(Boolean);

      for (const statement of statements) {
        await prisma.$executeRawUnsafe(statement);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

export default async function setup(): Promise<void> {
  await applyInitialMigration();
}
