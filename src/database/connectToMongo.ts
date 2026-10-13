import { connect } from './connection';
import type { HarborConnection } from './connection';
import { buildMongoUri, MongoConnectInput } from './mongoUri';
import type { ConnectionOptions } from './types';

export async function connectToMongo(
  input: MongoConnectInput,
  options?: ConnectionOptions,
): Promise<HarborConnection> {
  const uri = typeof input === 'string' ? input : buildMongoUri(input);
  if (options) {
    return connect(uri, options);
  }
  return connect(uri);
}
