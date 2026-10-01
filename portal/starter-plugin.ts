import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import type { Plugin } from 'vite';

export interface StarterFile {
  path: string;
  content: string;
}

const REPLACEMENTS: Record<string, string> = {
  PROJECT_NAME: 'harbor-starter',
  PROJECT_PACKAGE: 'harbor-starter',
  PROJECT_DESCRIPTION: 'A Node.js API built with Harbor',
};

function applyReplacements(content: string): string {
  return Object.entries(REPLACEMENTS).reduce(
    (current, [key, value]) => current.replaceAll(`{{${key}}}`, value),
    content,
  );
}

export function readStarter(root: string): StarterFile[] {
  const files: StarterFile[] = [];

  const walk = (directory: string) => {
    for (const entry of readdirSync(directory)) {
      const fullPath = join(directory, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
        continue;
      }
      const relativePath = relative(root, fullPath).split('\\').join('/');
      const path = relativePath === 'env.example' ? '.env.example' : relativePath;
      files.push({
        path,
        content: applyReplacements(readFileSync(fullPath, 'utf8')),
      });
    }
  };

  walk(root);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

function crc32(buffer: Buffer): number {
  let crc = ~0;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

export function zipStarter(files: StarterFile[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.path);
    const data = Buffer.from(file.content);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const localRecord = Buffer.concat([local, name, data]);
    locals.push(localRecord);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(Buffer.concat([central, name]));
    offset += localRecord.length;
  }

  const centralDirectory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralDirectory, end]);
}

export function harborStarterPlugin(templateRoot: string): Plugin {
  const load = () => readStarter(templateRoot);

  const sendZip = (
    res: { setHeader: (name: string, value: string) => void; end: (body: Buffer) => void },
  ) => {
    const zip = zipStarter(load());
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="harbor-starter.zip"');
    res.end(zip);
  };

  const sendFiles = (
    res: { setHeader: (name: string, value: string) => void; end: (body: string) => void },
  ) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ files: load() }));
  };

  return {
    name: 'harbor-starter',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/starter.zip') {
          sendZip(res);
          return;
        }
        if (url === '/starter/files.json') {
          sendFiles(res);
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/starter.zip') {
          sendZip(res);
          return;
        }
        if (url === '/starter/files.json') {
          sendFiles(res);
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'starter.zip',
        source: zipStarter(load()),
      });
    },
  };
}
