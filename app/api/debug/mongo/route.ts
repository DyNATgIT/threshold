import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'threshold';
const collectionName = process.env.MONGODB_MEMORY_COLLECTION || 'incident_memory';

declare global {
  // eslint-disable-next-line no-var
  var __thresholdDebugMongoClient: MongoClient | undefined;
}

async function getClient() {
  if (!uri) throw new Error('MONGODB_URI is missing.');
  if (!global.__thresholdDebugMongoClient) {
    global.__thresholdDebugMongoClient = new MongoClient(uri);
  }
  await global.__thresholdDebugMongoClient.connect();
  return global.__thresholdDebugMongoClient;
}

export async function GET() {
  try {
    const client = await getClient();
    await client.db('admin').command({ ping: 1 });
    const collection = client.db(dbName).collection(collectionName);
    const count = await collection.countDocuments();
    const latest = await collection
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    return NextResponse.json({
      ok: true,
      mongo: {
        connected: true,
        db: dbName,
        collection: collectionName,
        count,
        latest: latest[0] || null
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        mongo: {
          connected: false,
          db: dbName,
          collection: collectionName
        },
        error: error instanceof Error ? error.message : 'Unknown MongoDB error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const client = await getClient();
    const collection = client.db(dbName).collection(collectionName);
    const result = await collection.insertOne({
      trigger: 'debug-memory-test',
      tags: ['debug', 'threshold', 'mongodb'],
      sector: 'debug',
      activeMutation: 'debug insert',
      decision: {
        action: 'Confirm MongoDB memory write',
        confidence: 100,
        reasoning: 'Debug endpoint inserted this record.',
        status: 'HUMAN_REVIEW'
      },
      createdAt: new Date()
    });

    return NextResponse.json({
      ok: true,
      insertedId: result.insertedId.toString(),
      db: dbName,
      collection: collectionName
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown MongoDB insert error'
      },
      { status: 500 }
    );
  }
}
