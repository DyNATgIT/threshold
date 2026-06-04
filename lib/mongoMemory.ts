import { MongoClient, type Document } from 'mongodb';
import type { CrisisSnapshot } from '@/types';

type TriggerKey = 'baseline' | 'wind-shift' | 'bridge-collapse';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'threshold';
const collectionName = process.env.MONGODB_MEMORY_COLLECTION || 'incident_memory';

declare global {
  // eslint-disable-next-line no-var
  var __thresholdMongoClient: MongoClient | undefined;
}

async function getClient() {
  if (!uri) return null;

  if (!global.__thresholdMongoClient) {
    global.__thresholdMongoClient = new MongoClient(uri);
  }

  await global.__thresholdMongoClient.connect();
  return global.__thresholdMongoClient;
}

function triggerTags(trigger: TriggerKey, snapshot: CrisisSnapshot) {
  const tags = new Set<string>([trigger, snapshot.sector.toLowerCase()]);

  if (trigger === 'wind-shift') {
    tags.add('wind');
    tags.add('plume');
    tags.add('contamination');
    tags.add('evacuation');
  }

  if (trigger === 'bridge-collapse') {
    tags.add('bridge');
    tags.add('route-failure');
    tags.add('rail');
    tags.add('convoy');
  }

  if (trigger === 'baseline') {
    tags.add('flood');
    tags.add('drainage');
    tags.add('ward-a');
  }

  return Array.from(tags);
}

export function isMongoMemoryEnabled() {
  return Boolean(uri);
}

export async function retrieveIncidentMemory(trigger: TriggerKey, snapshot: CrisisSnapshot) {
  const client = await getClient();
  if (!client) return [];

  const collection = client.db(dbName).collection(collectionName);
  const tags = triggerTags(trigger, snapshot);

  const memories = await collection
    .find({ tags: { $in: tags } })
    .sort({ createdAt: -1 })
    .limit(3)
    .project({ _id: 0, createdAt: 0 })
    .toArray();

  return memories;
}

export async function saveIncidentMemory(trigger: TriggerKey, snapshot: CrisisSnapshot) {
  const client = await getClient();
  if (!client) return null;

  const collection = client.db(dbName).collection(collectionName);
  const selectedBranch = snapshot.branches.find((branch) => branch.status === 'selected');

  const memory: Document = {
    trigger,
    tags: triggerTags(trigger, snapshot),
    sector: snapshot.sector,
    activeMutation: snapshot.activeMutation,
    threatIndex: snapshot.threatIndex,
    consensus: snapshot.consensus,
    selectedBranch: selectedBranch
      ? {
          label: selectedBranch.label,
          probability: selectedBranch.probability,
          resourceCost: selectedBranch.resourceCost,
          casualtyEstimate: selectedBranch.casualtyEstimate
        }
      : null,
    decision: snapshot.decision,
    debateSummary: snapshot.debate.map((message) => ({
      agent: message.agent,
      role: message.role,
      content: message.content
    })),
    createdAt: new Date()
  };

  await collection.insertOne(memory);
  return memory;
}
