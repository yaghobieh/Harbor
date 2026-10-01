#!/usr/bin/env node

import { resolve, join, dirname } from 'path';
import { existsSync, writeFileSync, mkdirSync, readFileSync, readdirSync, statSync } from 'fs';
import { printWelcome, paint } from './logo';

interface CliCommand {
  name: string;
  description: string;
  action: (args: string[]) => Promise<void> | void;
}

const commands: CliCommand[] = [
  {
    name: 'create',
    description: 'Create a ready-to-run Harbor API',
    action: createProject,
  },
  {
    name: 'init',
    description: 'Add Harbor to the current folder (--template for the full starter)',
    action: initProject,
  },
  {
    name: 'version',
    description: 'Show Harbor version',
    action: showVersion,
  },
  {
    name: 'help',
    description: 'Show help',
    action: showHelp,
  },
];

function readVersion(): string {
  try {
    const pkgPath = join(__dirname, '../../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: string };
    return pkg.version ?? '1.6.5';
  } catch {
    return '1.6.5';
  }
}

function packageName(name: string): string {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'harbor-app';
}

function findTemplates(): string {
  const candidates = [
    resolve(__dirname, '../../templates/default'),
    resolve(__dirname, '../../../templates/default'),
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    console.error('Templates not found. Reinstall @forgedevstack/harbor.');
    process.exit(1);
  }
  return found;
}

function copyDirectory(src: string, dest: string, replacements: Record<string, string> = {}): void {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);

    if (statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath, replacements);
      continue;
    }

    let content = readFileSync(srcPath, 'utf-8');
    for (const [key, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }

    const finalDestPath = entry === 'env.example'
      ? join(dirname(destPath), '.env.example')
      : destPath;

    writeFileSync(finalDestPath, content, 'utf-8');
  }
}

function writeHarborConfig(projectPath: string): void {
  const harborConfig = {
    server: {
      port: 3000,
      host: 'localhost',
      cors: { enabled: true, origin: '*' },
    },
    routes: { prefix: '/api', timeout: 30000 },
    logger: { enabled: true, level: 'info', format: 'text' },
  };

  writeFileSync(join(projectPath, 'harbor.config.json'), JSON.stringify(harborConfig, null, 2), 'utf-8');
}

function printTree(projectName: string): void {
  console.log(paint('  Project'));
  console.log(`   ${projectName}/`);
  console.log('   ├── src/server.ts');
  console.log('   ├── src/routes/health.ts');
  console.log('   ├── src/routes/users.ts');
  console.log('   ├── src/controllers/user.controller.ts');
  console.log('   ├── src/services/user.service.ts');
  console.log('   ├── package.json');
  console.log('   ├── tsconfig.json');
  console.log('   ├── .env.example');
  console.log('   └── harbor.config.json');
}

function printNextSteps(directory: string): void {
  console.log();
  console.log(paint('  Next'));
  if (directory) {
    console.log(`   cd ${directory}`);
  }
  console.log('   npm install');
  console.log('   npm run dev');
  console.log();
  console.log('   http://localhost:3000/api/health');
  console.log('   http://localhost:3000/api/users');
  console.log();
}

async function createProject(args: string[]): Promise<void> {
  const projectName = args[0];
  printWelcome(readVersion());

  if (!projectName) {
    console.error('  Give the app a name:  harbor create my-api\n');
    process.exit(1);
  }

  const projectPath = resolve(process.cwd(), projectName);
  if (existsSync(projectPath)) {
    console.error(`  "${projectName}" already exists.\n`);
    process.exit(1);
  }

  const replacements = {
    PROJECT_NAME: projectName,
    PROJECT_PACKAGE: packageName(projectName),
    PROJECT_DESCRIPTION: 'A Node.js API built with Harbor',
  };

  copyDirectory(findTemplates(), projectPath, replacements);
  writeHarborConfig(projectPath);

  console.log(paint(`  Created ${projectName}`));
  console.log();
  printTree(projectName);
  printNextSteps(projectName);
}

function initProject(args: string[]): void {
  const cwd = process.cwd();
  const useTemplate = args.includes('--template') || args.includes('-t');
  const projectName = cwd.split('/').pop() || 'harbor-app';

  printWelcome(readVersion());

  if (useTemplate) {
    const replacements = {
      PROJECT_NAME: projectName,
      PROJECT_PACKAGE: packageName(projectName),
      PROJECT_DESCRIPTION: 'A Node.js API built with Harbor',
    };
    copyDirectory(findTemplates(), cwd, replacements);
    writeHarborConfig(cwd);
    console.log(paint('  Starter copied into this folder'));
    console.log();
    printTree(projectName);
    printNextSteps('');
    return;
  }

  const configPath = resolve(cwd, 'harbor.config.json');
  if (!existsSync(configPath)) {
    writeHarborConfig(cwd);
    console.log(paint('  Wrote harbor.config.json'));
  }

  const serverDir = resolve(cwd, 'src');
  if (!existsSync(serverDir)) {
    mkdirSync(serverDir, { recursive: true });
  }

  const serverPath = resolve(serverDir, 'server.ts');
  if (!existsSync(serverPath)) {
    writeFileSync(serverPath, `import { createServer, router, route } from '@forgedevstack/harbor';

class Health {
  @route.get('/')
  check() {
    return { status: 'ok' };
  }
}

const server = createServer({ port: 3000 });
server.use(router('/api/health', Health));
server.listen(3000, () => {
  console.log('http://localhost:3000/api/health');
});
`, 'utf-8');
    console.log(paint('  Wrote src/server.ts'));
  }

  console.log();
  console.log('   npm install @forgedevstack/harbor tsx');
  console.log('   npx tsx src/server.ts');
  console.log();
  console.log('   Full starter:  harbor init --template');
  console.log();
}

function showVersion(): void {
  printWelcome(readVersion());
}

function showHelp(): void {
  printWelcome(readVersion());
  console.log('  harbor <command>\n');
  for (const command of commands) {
    console.log(`  ${command.name.padEnd(10)} ${command.description}`);
  }
  console.log();
  console.log('  npx @forgedevstack/harbor create my-api');
  console.log('  npx @forgedevstack/harbor --create my-api');
  console.log('  harbor init');
  console.log('  harbor init --template');
  console.log();
  console.log('  https://www.npmjs.com/package/@forgedevstack/harbor');
  console.log();
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const createFlag = args.indexOf('--create');
  if (createFlag !== -1) {
    const name = args[createFlag + 1];
    await createProject(name && !name.startsWith('-') ? [name] : []);
    return;
  }

  const commandName = args[0] ?? 'help';
  const commandArgs = args.slice(1);
  const command = commands.find((item) => item.name === commandName);

  if (!command) {
    console.error(`\n  Unknown command: ${commandName}\n`);
    showHelp();
    process.exit(1);
  }

  await command.action(commandArgs);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n  ${message}\n`);
  process.exit(1);
});
