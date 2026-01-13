#!/usr/bin/env node

import { resolve, join, dirname } from 'path';
import { existsSync, writeFileSync, mkdirSync, readFileSync, readdirSync, statSync, copyFileSync } from 'fs';
import { createLogger } from '../utils/logger';

const logger = createLogger('cli');

interface CliCommand {
  name: string;
  description: string;
  action: (args: string[]) => Promise<void> | void;
}

const commands: CliCommand[] = [
  {
    name: 'create',
    description: 'Create a new Harbor project with full boilerplate',
    action: createProject,
  },
  {
    name: 'init',
    description: 'Initialize Harbor config in existing project',
    action: initProject,
  },
  {
    name: 'generate',
    description: 'Generate server file from config',
    action: generateServer,
  },
  {
    name: 'docs',
    description: 'Generate API documentation',
    action: generateDocs,
  },
  {
    name: 'version',
    description: 'Show Harbor version',
    action: showVersion,
  },
  {
    name: 'help',
    description: 'Show help information',
    action: showHelp,
  },
];

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const commandName = args[0] ?? 'help';
  const commandArgs = args.slice(1);

  const command = commands.find((c) => c.name === commandName);

  if (!command) {
    console.error(`Unknown command: ${commandName}`);
    showHelp();
    process.exit(1);
  }

  try {
    await command.action(commandArgs);
  } catch (error) {
    logger.error('Command failed', error as Error);
    process.exit(1);
  }
}

/**
 * Copy directory recursively
 */
function copyDirectory(src: string, dest: string, replacements: Record<string, string> = {}): void {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stats = statSync(srcPath);

    if (stats.isDirectory()) {
      copyDirectory(srcPath, destPath, replacements);
    } else {
      // Read file content
      let content = readFileSync(srcPath, 'utf-8');

      // Apply replacements for template variables
      for (const [key, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }

      // Handle env.example -> .env.example rename
      const finalDestPath = entry === 'env.example' 
        ? join(dirname(destPath), '.env.example')
        : destPath;

      writeFileSync(finalDestPath, content, 'utf-8');
    }
  }
}

/**
 * Create a new project with full boilerplate
 */
async function createProject(args: string[]): Promise<void> {
  const projectName = args[0];

  if (!projectName) {
    console.error('Please provide a project name: harbor create <project-name>');
    process.exit(1);
  }

  const projectPath = resolve(process.cwd(), projectName);

  if (existsSync(projectPath)) {
    console.error(`Directory "${projectName}" already exists`);
    process.exit(1);
  }

  console.log(`\n🚢 Creating Harbor project: ${projectName}\n`);

  // Find templates directory
  // When installed from npm, templates are in the package root
  // When running locally, they're in the project root
  let templatesPath = resolve(__dirname, '../../templates/default');
  
  if (!existsSync(templatesPath)) {
    // Try relative to src for development
    templatesPath = resolve(__dirname, '../../../templates/default');
  }

  if (!existsSync(templatesPath)) {
    console.error('Templates not found. Please reinstall Harbor.');
    process.exit(1);
  }

  // Template replacements
  const replacements: Record<string, string> = {
    PROJECT_NAME: projectName,
    PROJECT_DESCRIPTION: `A Node.js backend built with Harbor`,
    CREATED_AT: new Date().toISOString(),
  };

  // Copy template files
  console.log('📁 Copying project files...');
  copyDirectory(templatesPath, projectPath, replacements);

  // Create harbor.config.json
  const harborConfig = {
    server: {
      port: 3000,
      host: 'localhost',
      cors: {
        enabled: true,
        origin: '*',
      },
    },
    database: {
      type: 'mongodb',
      uri: '',
      name: projectName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    },
    routes: {
      prefix: '/api',
      timeout: 30000,
    },
    errors: {
      404: { message: 'Not Found', json: true },
      500: { message: 'Internal Server Error', json: true, log: true },
    },
    logger: {
      enabled: true,
      level: 'info',
      format: 'text',
    },
  };

  writeFileSync(
    join(projectPath, 'harbor.config.json'),
    JSON.stringify(harborConfig, null, 2),
    'utf-8'
  );

  console.log('✅ Project created successfully!\n');
  console.log('📂 Project structure:\n');
  console.log(`   ${projectName}/`);
  console.log('   ├── server.ts           # Application entry point');
  console.log('   ├── routes/             # Route definitions');
  console.log('   ├── controllers/        # Request handlers');
  console.log('   ├── services/           # Business logic');
  console.log('   ├── models/             # Database models');
  console.log('   ├── types/              # TypeScript definitions');
  console.log('   ├── utils/              # Utility functions');
  console.log('   ├── constants/          # App constants & config');
  console.log('   ├── package.json');
  console.log('   ├── tsconfig.json');
  console.log('   ├── .eslintrc.json');
  console.log('   └── harbor.config.json');

  console.log('\n🚀 Next steps:\n');
  console.log(`   cd ${projectName}`);
  console.log('   npm install');
  console.log('   cp .env.example .env');
  console.log('   npm run dev\n');

  console.log('📚 Documentation: https://github.com/yaghobieh/Harbor\n');
}

function initProject(args: string[]): void {
  const cwd = process.cwd();
  const useTemplate = args.includes('--template') || args.includes('-t');
  const projectName = cwd.split('/').pop() || 'my-app';
  
  if (useTemplate) {
    console.log('\n🚢 Initializing with template...\n');
    
    // Find templates directory
    let templatesPath = resolve(__dirname, '../../templates/default');
    if (!existsSync(templatesPath)) {
      templatesPath = resolve(__dirname, '../../../templates/default');
    }

    if (!existsSync(templatesPath)) {
      console.error('Templates not found. Please reinstall Harbor.');
      process.exit(1);
    }

    // Template replacements
    const replacements: Record<string, string> = {
      PROJECT_NAME: projectName,
      PROJECT_DESCRIPTION: `A Node.js backend built with Harbor`,
    };

    // Copy template files
    console.log('📁 Copying project files...');
    copyDirectory(templatesPath, cwd, replacements);

    // Create harbor.config.json
    const harborConfig = {
      server: {
        port: 3000,
        host: 'localhost',
        cors: { enabled: true, origin: '*' },
      },
      database: {
        type: 'mongodb',
        uri: '',
        name: projectName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      },
      routes: { prefix: '/api', timeout: 30000 },
      errors: {
        404: { message: 'Not Found', json: true },
        500: { message: 'Internal Server Error', json: true, log: true },
      },
      logger: { enabled: true, level: 'info', format: 'text' },
    };

    writeFileSync(
      join(cwd, 'harbor.config.json'),
      JSON.stringify(harborConfig, null, 2),
      'utf-8'
    );

    console.log('✅ Project initialized with template!\n');
    console.log('🚀 Next steps:\n');
    console.log('   npm install');
    console.log('   cp .env.example .env');
    console.log('   npm run dev\n');
    return;
  }

  // Simple init without template
  const configPath = resolve(cwd, 'harbor.config.json');
  if (existsSync(configPath)) {
    console.log('harbor.config.json already exists');
    return;
  }

  const defaultConfig = {
    server: {
      port: 3000,
      host: 'localhost',
      cors: {
        enabled: true,
        origin: '*',
      },
      bodyParser: {
        json: true,
        urlencoded: true,
        limit: '10mb',
      },
    },
    routes: {
      prefix: '/api',
      timeout: 30000,
    },
    validation: {
      adapter: 'mongoose',
      strictMode: true,
      sanitize: true,
    },
    errors: {
      404: {
        message: 'Not Found',
        json: true,
      },
      500: {
        message: 'Internal Server Error',
        json: true,
        log: true,
      },
    },
    logger: {
      enabled: true,
      level: 'info',
      format: 'text',
      output: 'console',
    },
  };

  writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  console.log('Created harbor.config.json');

  const serverDir = resolve(cwd, 'src');
  if (!existsSync(serverDir)) {
    mkdirSync(serverDir, { recursive: true });
  }

  const serverPath = resolve(serverDir, 'server.ts');
  if (!existsSync(serverPath)) {
    const serverTemplate = `import { createServer, GET, POST } from 'harbor';

const server = createServer({
  port: 3000,
});

// Health check
server.get('/health', GET(async () => ({ 
  status: 'ok', 
  timestamp: new Date().toISOString() 
})));

// Start the server
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
`;

    writeFileSync(serverPath, serverTemplate, 'utf-8');
    console.log('Created src/server.ts');
  }

  console.log('\nHarbor project initialized!');
  console.log('Run: npm install harbor');
  console.log('Then: npm run dev');
  console.log('\nTip: Use --template flag for full boilerplate');
}

function generateServer(): void {
  console.log('Generating server from config...');
  console.log('This feature is coming soon!');
}

function generateDocs(): void {
  console.log('Generating API documentation...');
  console.log('This feature is coming soon!');
}

function showVersion(): void {
  console.log('Harbor v1.2.0');
}

function showHelp(): void {
  console.log('\n🚢 Harbor - The pipeline for Node.js backends\n');
  console.log('Usage: harbor <command> [options]\n');
  console.log('Commands:\n');

  for (const command of commands) {
    console.log(`  ${command.name.padEnd(12)} ${command.description}`);
  }

  console.log('\nOptions:\n');
  console.log('  --template, -t     Use full boilerplate template (for init command)');

  console.log('\nExamples:\n');
  console.log('  harbor create my-app     Create new project with boilerplate');
  console.log('  harbor init              Initialize config in existing project');
  console.log('  harbor init --template   Initialize with full boilerplate');
  console.log('  harbor docs              Generate API documentation');
  console.log('  harbor version           Show version');
  console.log('\nDocumentation: https://github.com/yaghobieh/Harbor');
}

main();
