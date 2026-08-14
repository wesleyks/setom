import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFile = promisify(execFileCallback);
const repositoryDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const typescriptCli = path.join(
  repositoryDirectory,
  'node_modules',
  'typescript',
  'lib',
  'tsc.js',
);

async function run(command, arguments_, options) {
  try {
    return await execFile(command, arguments_, options);
  } catch (error) {
    const output = [error.stdout, error.stderr].filter(Boolean).join('\n');
    throw new Error(`${command} ${arguments_.join(' ')} failed\n${output}`, {
      cause: error,
    });
  }
}

const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'setom-pack-'));
const npmCacheDirectory = path.join(temporaryDirectory, 'npm-cache');
const packDirectory = path.join(temporaryDirectory, 'pack');
const consumerDirectory = path.join(temporaryDirectory, 'consumer');
const npmEnvironment = { ...process.env, npm_config_cache: npmCacheDirectory };

try {
  await mkdir(packDirectory);
  await mkdir(consumerDirectory);

  const { stdout } = await run(
    process.execPath,
    [
      process.env.npm_execpath,
      'pack',
      '--json',
      '--pack-destination',
      packDirectory,
    ],
    { cwd: repositoryDirectory, env: npmEnvironment },
  );
  const [packedPackage] = JSON.parse(stdout);
  assert.equal(packedPackage.name, 'setom');
  const tarballPath = path.join(packDirectory, packedPackage.filename);

  await writeFile(
    path.join(consumerDirectory, 'package.json'),
    JSON.stringify({ private: true }),
  );
  await run(
    process.execPath,
    [
      process.env.npm_execpath,
      'install',
      '--ignore-scripts',
      '--no-package-lock',
      '--no-save',
      tarballPath,
    ],
    { cwd: consumerDirectory, env: npmEnvironment },
  );

  await run(
    process.execPath,
    [
      '-e',
      "const { toHTML } = require('setom'); if (toHTML('(a)') !== '<a></a>') process.exit(1);",
    ],
    { cwd: consumerDirectory },
  );

  await writeFile(
    path.join(consumerDirectory, 'index.ts'),
    "import { toHTML } from 'setom';\nconst html: string = toHTML('(a)');\nvoid html;\n",
  );
  await run(
    process.execPath,
    [
      typescriptCli,
      '--noEmit',
      '--strict',
      '--module',
      'Node16',
      '--moduleResolution',
      'Node16',
      '--target',
      'ES2022',
      'index.ts',
    ],
    { cwd: consumerDirectory },
  );
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
