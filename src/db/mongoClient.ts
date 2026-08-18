import 'dotenv/config';
import { MongoClient, Db } from 'mongodb';
import { mongoMock } from './mongoMock.js';

let client: MongoClient | null = null;
let isConnected = false;
let connectionError: string | null = null;

const mongoUri = process.env.MONGO_DB_URL || process.env.MONGODB_URL_KEY || '';

export async function getMongoDb(dbName = 'NetworkSecurity'): Promise<{ db: Db | null; isReal: boolean; error: string | null }> {
  if (!mongoUri) {
    return { db: null, isReal: false, error: 'No MONGO_DB_URL configured' };
  }

  if (isConnected && client) {
    return { db: client.db(dbName), isReal: true, error: null };
  }

  try {
    if (!client) {
      client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
    }
    await client.connect();
    isConnected = true;
    connectionError = null;
    console.log(`[MongoDB Atlas] Successfully connected to cluster for database: ${dbName}`);
    return { db: client.db(dbName), isReal: true, error: null };
  } catch (err: any) {
    isConnected = false;
    connectionError = err.message;
    console.warn(`[MongoDB Atlas] Connection failed (${err.message}), falling back to in-memory store.`);
    return { db: null, isReal: false, error: err.message };
  }
}

export async function fetchCollectionRecords(database = 'NetworkSecurity', collection = 'NetworkData', limit = 50) {
  const { db, isReal, error } = await getMongoDb(database);
  if (isReal && db) {
    try {
      const coll = db.collection(collection);
      const records = await coll.find({}).limit(limit).toArray();
      const count = await coll.countDocuments();
      return {
        database,
        collection,
        isAtlas: true,
        cluster: 'cluster0.ycxvelb.mongodb.net',
        totalCount: count,
        records: records.map(r => ({ ...r, _id: r._id.toString() })),
        error: null
      };
    } catch (e: any) {
      console.error('[MongoDB Atlas] Read error:', e);
    }
  }

  // Fallback to local memory mock
  return {
    database,
    collection,
    isAtlas: false,
    cluster: 'in-memory-fallback',
    totalCount: mongoMock.count(database, collection),
    records: mongoMock.find(database, collection, limit),
    error: error || connectionError
  };
}

export async function insertCollectionRecords(database = 'NetworkSecurity', collection = 'NetworkData', records: any[]) {
  const { db, isReal, error } = await getMongoDb(database);
  if (isReal && db) {
    try {
      const coll = db.collection(collection);
      const result = await coll.insertMany(records);
      const count = await coll.countDocuments();
      return {
        success: true,
        isAtlas: true,
        insertedCount: result.insertedCount,
        totalCount: count,
        error: null
      };
    } catch (e: any) {
      console.error('[MongoDB Atlas] Write error:', e);
    }
  }

  // In-memory fallback
  const insertedCount = mongoMock.insertMany(database, collection, records);
  return {
    success: true,
    isAtlas: false,
    insertedCount,
    totalCount: mongoMock.count(database, collection),
    error: error || connectionError
  };
}
