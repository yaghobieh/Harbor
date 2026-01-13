// Harbor Database - Mongoose-compatible MongoDB ODM
// Replaces Mongoose with a lightweight, type-safe alternative

export { Schema } from './schema';
export { Model, model, Query, HarborDocument } from './model';
export { 
  connection, 
  connect, 
  disconnect, 
  HarborConnection,
} from './connection';

// Re-export types
export type {
  SchemaType,
  SchemaFieldDefinition,
  SchemaDefinition,
  SchemaOptions,
  QueryOptions,
  PopulateOptions,
  UpdateResult,
  DeleteResult,
  IndexDefinition,
  IndexOptions,
  AggregateOptions,
  ConnectionOptions,
  ConnectionState,
  Document,
  BulkWriteOperation,
  BulkWriteResult,
  HookType,
  QueryHookType,
} from './types';

// Import for Types helper (like mongoose.Types.ObjectId)
import { ObjectId } from 'mongodb';

export const Types = {
  ObjectId,
};

// Default export mimics Mongoose's API
import { connection, connect, disconnect } from './connection';
import { Schema } from './schema';
import { Model, model } from './model';

const harbor = {
  // Connection
  connection,
  connect,
  disconnect,
  
  // Schema & Model
  Schema,
  Model,
  model,
  
  // Types
  Types,
  
  // Convenience methods
  get models() {
    return Object.fromEntries(Model.models);
  },
  
  // Version
  version: '1.0.0',
};

export default harbor;

