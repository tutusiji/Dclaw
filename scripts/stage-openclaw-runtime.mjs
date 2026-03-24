import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targetRoot = join(projectRoot, 'vendor', 'openclaw-runtime');
const targetPackageDir = join(targetRoot, 'openclaw');

function fail(message) {
  console.error(`[stage-openclaw-runtime] ${message}`);
  process.exit(1);
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function detectFromOpenclawBinary() {
  const result = spawnSync('/bin/bash', ['-lc', 'readlink -f "$(command -v openclaw)"'], {
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    return null;
  }

  const entryPath = result.stdout.trim();
  if (!entryPath) {
    return null;
  }

  return resolve(dirname(entryPath));
}

async function resolveSourceDir() {
  const fromEnv = process.env.OPENCLAW_RUNTIME_SOURCE?.trim();
  if (fromEnv) {
    return resolve(fromEnv);
  }

  const detected = detectFromOpenclawBinary();
  if (detected) {
    return detected;
  }

  return null;
}

async function main() {
  const sourceDir = await resolveSourceDir();
  if (!sourceDir) {
    fail('Unable to locate an installed OpenClaw runtime. Set OPENCLAW_RUNTIME_SOURCE to the package directory.');
  }

  const sourcePackage = join(sourceDir, 'package.json');
  if (!(await exists(sourcePackage))) {
    fail(`Source directory does not look like an OpenClaw package: ${sourceDir}`);
  }

  const packageJson = JSON.parse(await readFile(sourcePackage, 'utf8'));
  const includeEntries = ['package.json', 'LICENSE', 'openclaw.mjs', 'assets', 'dist', 'extensions', 'skills', 'node_modules'];

  await rm(targetPackageDir, { recursive: true, force: true });
  await mkdir(targetPackageDir, { recursive: true });

  for (const entry of includeEntries) {
    const from = join(sourceDir, entry);
    if (await exists(from)) {
      await cp(from, join(targetPackageDir, entry), {
        recursive: true,
        dereference: true,
        force: true
      });
    }
  }

  await writeFile(
    join(targetRoot, 'manifest.json'),
    JSON.stringify(
      {
        name: packageJson.name,
        version: packageJson.version,
        stagedAt: new Date().toISOString(),
        sourceDir
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(`[stage-openclaw-runtime] staged ${packageJson.name}@${packageJson.version} from ${sourceDir}`);
}

await main();
