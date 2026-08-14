import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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
const packageVersion = JSON.parse(
  await readFile(path.join(repositoryDirectory, 'package.json'), 'utf8'),
).version;

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
const esmConsumerDirectory = path.join(consumerDirectory, 'esm');
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
  assert.equal(packedPackage.version, packageVersion);
  assert.deepEqual(
    packedPackage.files.map((file) => file.path).sort(),
    [
      'CHANGELOG.md',
      'LICENSE',
      'README.md',
      'dist/index.cjs',
      'dist/index.d.cts',
      'dist/index.d.mts',
      'dist/index.mjs',
      'package.json',
    ],
  );
  const tarballPath = path.join(packDirectory, packedPackage.filename);

  await writeFile(
    path.join(consumerDirectory, 'package.json'),
    JSON.stringify({ private: true, type: 'commonjs' }),
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
    path.join(consumerDirectory, 'index.cts'),
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
      'index.cts',
    ],
    { cwd: consumerDirectory },
  );

  await assert.rejects(
    () =>
      run(
        process.execPath,
        ['-e', "require('setom/dist/index.cjs')"],
        { cwd: consumerDirectory },
      ),
    /ERR_PACKAGE_PATH_NOT_EXPORTED/,
  );

  await mkdir(esmConsumerDirectory);
  await writeFile(
    path.join(esmConsumerDirectory, 'package.json'),
    JSON.stringify({ private: true, type: 'module' }),
  );
  await writeFile(
    path.join(esmConsumerDirectory, 'index.mjs'),
    "import { toHTML } from 'setom';\nif (toHTML('(a)') !== '<a></a>') process.exit(1);\n",
  );
  await run(process.execPath, ['index.mjs'], { cwd: esmConsumerDirectory });

  const typeSource =
    "import { toHTML } from 'setom';\nconst html: string = toHTML('(a)');\nvoid html;\n";
  await writeFile(path.join(esmConsumerDirectory, 'index.mts'), typeSource);
  await run(
    process.execPath,
    [
      typescriptCli,
      '--noEmit',
      '--strict',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--target',
      'ES2022',
      'index.mts',
    ],
    { cwd: esmConsumerDirectory },
  );

  await writeFile(path.join(esmConsumerDirectory, 'bundler.ts'), typeSource);
  await run(
    process.execPath,
    [
      typescriptCli,
      '--noEmit',
      '--strict',
      '--module',
      'ESNext',
      '--moduleResolution',
      'bundler',
      '--target',
      'ES2022',
      'bundler.ts',
    ],
    { cwd: esmConsumerDirectory },
  );
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
