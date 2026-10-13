export interface MongoConnectObject {
  user?: string;
  password?: string;
  host: string;
  port?: number;
  db: string;
  authSource?: string;
  isSrv?: boolean;
}

export type MongoConnectInput = string | MongoConnectObject;
