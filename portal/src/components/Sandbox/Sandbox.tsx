import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  BearIcons,
  Button,
  CodeBlock,
  Flex,
  Typography,
} from '@forgedevstack/bear';
import { Navbar } from '../Navbar/Navbar';

interface StarterFile {
  path: string;
  content: string;
}

interface DemoUser {
  id: string;
  name: string;
  email: string;
}

const LOGO = `██╗  ██╗ █████╗ ██████╗ ██████╗  ██████╗ ██████╗
██║  ██║██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
███████║███████║██████╔╝██████╔╝██║   ██║██████╔╝
██╔══██║██╔══██║██╔══██╗██╔══██╗██║   ██║██╔══██╗
██║  ██║██║  ██║██║  ██║██████╔╝╚██████╔╝██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝`;

const PRESETS = [
  { id: 'health', label: 'Health', method: 'GET', path: '/api/health', body: '' },
  { id: 'list', label: 'List users', method: 'GET', path: '/api/users', body: '' },
  { id: 'create', label: 'Create user', method: 'POST', path: '/api/users', body: '{\n  "name": "Grace",\n  "email": "grace@harbor.dev"\n}' },
  { id: 'one', label: 'Get one', method: 'GET', path: '/api/users/1', body: '' },
  { id: 'remove', label: 'Delete', method: 'DELETE', path: '/api/users/1', body: '' },
];

const seedUsers = (): DemoUser[] => [{ id: '1', name: 'Ada', email: 'ada@harbor.dev' }];

function languageFor(path: string): string {
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.md')) return 'markdown';
  if (path.endsWith('.ts')) return 'typescript';
  return 'text';
}

export const Sandbox: FC = () => {
  const [files, setFiles] = useState<StarterFile[]>([]);
  const [activePath, setActivePath] = useState('src/routes/users.ts');
  const [loadError, setLoadError] = useState('');
  const [copied, setCopied] = useState(false);
  const [method, setMethod] = useState('GET');
  const [requestPath, setRequestPath] = useState('/api/users');
  const [body, setBody] = useState('');
  const [users, setUsers] = useState<DemoUser[]>(seedUsers);
  const [response, setResponse] = useState('{\n  "hint": "Pick a request and press Send"\n}');

  useEffect(() => {
    fetch('/starter/files.json')
      .then((result) => {
        if (!result.ok) throw new Error('Starter files are not available');
        return result.json() as Promise<{ files: StarterFile[] }>;
      })
      .then((payload) => {
        setFiles(payload.files);
        const preferred = payload.files.find((file) => file.path === 'src/routes/users.ts')
          ?? payload.files.find((file) => file.path === 'src/server.ts')
          ?? payload.files[0];
        if (preferred) setActivePath(preferred.path);
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : 'Could not load the starter');
      });
  }, []);

  const activeFile = files.find((file) => file.path === activePath) ?? files[0];

  const copyCommand = useCallback(async () => {
    await navigator.clipboard.writeText('npx @forgedevstack/harbor create my-api');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, []);

  const send = useCallback(() => {
    const path = requestPath.trim();
    const next = users.map((user) => ({ ...user }));

    if (method === 'GET' && path === '/api/health') {
      setResponse(JSON.stringify({ success: true, data: { status: 'ok', service: 'harbor-starter' } }, null, 2));
      return;
    }

    if (method === 'GET' && path === '/api/users') {
      setResponse(JSON.stringify({ success: true, data: { users: next } }, null, 2));
      return;
    }

    const one = path.match(/^\/api\/users\/([^/]+)$/);
    if (method === 'GET' && one) {
      const user = next.find((item) => item.id === one[1]);
      setResponse(user
        ? JSON.stringify({ success: true, data: { user } }, null, 2)
        : JSON.stringify({ success: false, error: { message: 'User not found' } }, null, 2));
      return;
    }

    if (method === 'POST' && path === '/api/users') {
      let parsed: { name?: string; email?: string };
      try {
        parsed = JSON.parse(body || '{}') as { name?: string; email?: string };
      } catch {
        setResponse(JSON.stringify({ success: false, error: { message: 'Body must be JSON' } }, null, 2));
        return;
      }
      if (!parsed.name || parsed.name.length < 2 || !parsed.email || !parsed.email.includes('@')) {
        setResponse(JSON.stringify({
          success: false,
          error: { message: 'name (min 2) and email are required' },
        }, null, 2));
        return;
      }
      const user = { id: String(next.length + 1), name: parsed.name, email: parsed.email };
      setUsers([...next, user]);
      setResponse(JSON.stringify({ success: true, data: { user } }, null, 2));
      return;
    }

    if (method === 'DELETE' && one) {
      const deleted = next.some((item) => item.id === one[1]);
      setUsers(next.filter((item) => item.id !== one[1]));
      setResponse(JSON.stringify({ success: true, data: { deleted, id: one[1] } }, null, 2));
      return;
    }

    setResponse(JSON.stringify({
      success: false,
      error: { message: `No route for ${method} ${path}` },
    }, null, 2));
  }, [body, method, requestPath, users]);

  const fileGroups = useMemo(() => {
    const groups = new Map<string, StarterFile[]>();
    files.forEach((file) => {
      const folder = file.path.includes('/') ? file.path.slice(0, file.path.lastIndexOf('/')) : '.';
      const list = groups.get(folder) ?? [];
      list.push(file);
      groups.set(folder, list);
    });
    return [...groups.entries()];
  }, [files]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6 items-start">
          <div>
            <Badge variant="secondary">Ready to run</Badge>
            <Typography variant="h1" className="text-3xl md:text-5xl font-bold mt-3 mb-3">
              Harbor starter
            </Typography>
            <Typography className="opacity-70 max-w-xl mb-6">
              A small API with health and user routes. The route method only calls the controller. The controller calls the service. Download it, or create the same project with the Harbor CLI.
            </Typography>
            <Flex gap={3} wrap="wrap" align="center">
              <Button
                variant="harbor"
                leftIcon={<BearIcons.ArrowDownIcon size="xs" />}
                onClick={() => { window.location.href = '/starter.zip'; }}
              >
                Download project
              </Button>
              <Button variant="outline" onClick={copyCommand} leftIcon={<BearIcons.TerminalIcon size="xs" />}>
                {copied ? 'Copied' : 'Copy create command'}
              </Button>
              <Link to="/docs/cli" className="text-sm font-semibold" style={{ color: 'var(--harbor-accent)' }}>
                CLI docs
              </Link>
            </Flex>
            <pre
              className="mt-6 overflow-x-auto text-[9px] sm:text-[11px] leading-tight font-bold"
              style={{
                backgroundImage: 'linear-gradient(90deg, #e879f9, #c026d3, #7c3aed)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {LOGO}
            </pre>
            <Typography variant="caption" className="font-mono opacity-60">
              npx @forgedevstack/harbor create my-api
            </Typography>
          </div>

          <section
            className="rounded-2xl p-4 sm:p-5"
            style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
          >
            <Flex justify="between" align="center" className="mb-3">
              <Typography className="font-semibold">Try the API</Typography>
              <Button variant="ghost" size="xs" onClick={() => { setUsers(seedUsers()); setResponse('{\n  "hint": "Users reset"\n}'); }}>
                Reset data
              </Button>
            </Flex>
            <div className="flex gap-2 overflow-x-auto pb-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  onClick={() => {
                    setMethod(preset.method);
                    setRequestPath(preset.path);
                    setBody(preset.body);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)_auto] gap-2">
              <select
                aria-label="Method"
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                {['GET', 'POST', 'DELETE'].map((item) => <option key={item}>{item}</option>)}
              </select>
              <input
                aria-label="Path"
                value={requestPath}
                onChange={(event) => setRequestPath(event.target.value)}
                className="rounded-lg px-3 py-2 text-sm font-mono min-w-0"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              />
              <Button variant="harbor" size="sm" onClick={send}>Send</Button>
            </div>
            {method === 'POST' && (
              <textarea
                aria-label="Request body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-lg px-3 py-2 text-sm font-mono"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              />
            )}
            <pre
              className="mt-3 overflow-x-auto rounded-xl p-3 text-xs sm:text-sm font-mono"
              style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            >
              {response}
            </pre>
          </section>
        </div>

        <section className="mt-8 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-4">
          <div
            className="rounded-2xl p-3 lg:max-h-[640px] lg:overflow-auto"
            style={{ border: '1px solid var(--border-color)' }}
          >
            <Typography variant="overline" className="opacity-50 px-2">Files</Typography>
            {loadError && <Typography className="px-2 py-3 text-sm">{loadError}</Typography>}
            <div className="flex lg:block gap-2 overflow-x-auto lg:overflow-visible py-2">
              {fileGroups.map(([folder, group]) => (
                <div key={folder} className="shrink-0 lg:shrink">
                  <Typography variant="caption" className="opacity-40 px-2 hidden lg:block">{folder}</Typography>
                  {group.map((file) => {
                    const selected = file.path === activeFile?.path;
                    return (
                      <button
                        key={file.path}
                        type="button"
                        onClick={() => setActivePath(file.path)}
                        className="block w-full text-left rounded-lg px-2 py-1.5 text-sm font-mono whitespace-nowrap"
                        style={{
                          color: 'var(--text-primary)',
                          backgroundColor: selected ? 'var(--bg-tertiary)' : 'transparent',
                        }}
                      >
                        {file.path.split('/').pop()}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
            <div className="px-4 py-3 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <Typography className="font-mono text-sm truncate">{activeFile?.path ?? 'starter'}</Typography>
              <a href="/starter.zip" download="harbor-starter.zip" className="text-sm font-semibold shrink-0" style={{ color: 'var(--harbor-accent)' }}>
                Download zip
              </a>
            </div>
            {activeFile && (
              <CodeBlock
                code={activeFile.content}
                language={languageFor(activeFile.path)}
                title={activeFile.path}
                copyable
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
