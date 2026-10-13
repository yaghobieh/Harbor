import {
  MONGO_AUTH_PARAM,
  MONGO_DB_REQUIRED,
  MONGO_HOST_REQUIRED,
  MONGO_HOST_UNSAFE,
  MONGO_PASSWORD_NEEDS_USER,
  MONGO_PORT_INTEGER,
  MONGO_PROTOCOL,
  MONGO_QUERY,
  MONGO_SRV_PROTOCOL,
  MONGO_USER_HOST,
} from './const/generals';
import type { MongoConnectObject } from './mongo.types';

export type { MongoConnectInput, MongoConnectObject } from './mongo.types';

function hasBadPort(options: MongoConnectObject): boolean {
  if (options.port == null || options.isSrv) return false;
  return !Number.isInteger(options.port);
}

function hasPasswordWithoutUser(options: MongoConnectObject): boolean {
  return options.password != null && !options.user;
}

function rejectInvalid(options: MongoConnectObject): void {
  const problems: Array<[boolean, string]> = [
    [!options.host || MONGO_HOST_UNSAFE.test(options.host), MONGO_HOST_REQUIRED],
    [!options.db, MONGO_DB_REQUIRED],
    [hasBadPort(options), MONGO_PORT_INTEGER],
    [hasPasswordWithoutUser(options), MONGO_PASSWORD_NEEDS_USER],
  ];
  const hit = problems.find(([failed]) => failed);
  if (hit) throw new Error(hit[1]);
}

function authPrefix(options: MongoConnectObject): string {
  if (!options.user) return '';
  const user = encodeURIComponent(options.user);
  if (options.password == null) return `${user}${MONGO_USER_HOST}`;
  return `${user}:${encodeURIComponent(options.password)}${MONGO_USER_HOST}`;
}

function hostWithPort(options: MongoConnectObject): string {
  if (options.isSrv || options.port == null) return options.host;
  return `${options.host}:${options.port}`;
}

export function buildMongoUri(options: MongoConnectObject): string {
  rejectInvalid(options);
  const protocol = options.isSrv ? MONGO_SRV_PROTOCOL : MONGO_PROTOCOL;
  const params = new URLSearchParams();
  if (options.authSource) params.set(MONGO_AUTH_PARAM, options.authSource);
  const query = params.toString();
  const suffix = query ? `${MONGO_QUERY}${query}` : '';
  return `${protocol}://${authPrefix(options)}${hostWithPort(options)}/${encodeURIComponent(options.db)}${suffix}`;
}
