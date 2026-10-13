import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/database/connection', () => ({
  connect: vi.fn(async (uri: string) => ({ uri })),
}));

import { connect } from '../src/database/connection';
import { connectToMongo } from '../src/database/connectToMongo';
import { buildMongoUri } from '../src/database/mongoUri';

describe('connectToMongo URI builder', () => {
  beforeEach(() => {
    vi.mocked(connect).mockClear();
  });

  it('builds a mongodb URI from the object form', () => {
    expect(buildMongoUri({
      user: 'app',
      password: 'p@ss/word',
      host: 'localhost',
      port: 27017,
      db: 'app',
      authSource: 'admin',
    })).toBe('mongodb://app:p%40ss%2Fword@localhost:27017/app?authSource=admin');
  });

  it('builds a mongodb+srv URI and omits the port', () => {
    expect(buildMongoUri({
      user: 'app',
      password: 'secret',
      host: 'cluster.example.net',
      port: 27017,
      db: 'app',
      authSource: 'admin',
      isSrv: true,
    })).toBe('mongodb+srv://app:secret@cluster.example.net/app?authSource=admin');
  });

  it('omits auth when no user is set', () => {
    expect(buildMongoUri({
      host: 'localhost',
      port: 27017,
      db: 'app',
    })).toBe('mongodb://localhost:27017/app');
  });

  it('calls connect() with the built URI', async () => {
    await connectToMongo({
      user: 'app',
      password: 'p@ss',
      host: 'localhost',
      port: 27017,
      db: 'app',
      authSource: 'admin',
    });

    expect(connect).toHaveBeenCalledWith(
      'mongodb://app:p%40ss@localhost:27017/app?authSource=admin',
    );
  });

  it('passes a URI string through to connect()', async () => {
    await connectToMongo('mongodb://localhost:27017/app');
    expect(connect).toHaveBeenCalledWith('mongodb://localhost:27017/app');
  });
});
