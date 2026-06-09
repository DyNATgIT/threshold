# MongoDB MCP Integration

THRESHOLD uses **MongoDB Atlas** as its runtime incident memory layer and includes a local **MongoDB MCP Server** setup for agent-tool access to that same memory.

This document explains how MongoDB fits into the project and how the MCP setup was configured without exposing secrets.

---

## Why MongoDB MCP matters

The Google Cloud Rapid Agent Hackathon requires meaningful partner integration. For THRESHOLD, MongoDB is the memory system.

THRESHOLD uses MongoDB in two ways:

1. **Runtime memory layer**
   - The deployed Vercel API routes write crisis runs to MongoDB Atlas.
   - Each run becomes an incident memory record.
   - Future triggers retrieve prior incident memory and pass it into Gemini context.

2. **MCP agent-tool interface**
   - MongoDB MCP Server was configured locally in VS Code.
   - MongoDB Agent Skills were installed.
   - An MCP-compatible agent can inspect and query the same `threshold.incident_memory` collection.

Together, this creates the partner memory layer:

```txt
MongoDB Atlas = persistent crisis memory
MongoDB MCP   = agent-accessible memory tool interface
Gemini        = reasoning engine
Firestore     = live command blackboard
```

---

## Runtime memory flow

When an operator triggers a crisis mutation:

```txt
Operator click
  ↓
Vercel API route
  ↓
MongoDB Atlas retrieves prior incident memory
  ↓
Gemini receives crisis context + precedent memory
  ↓
Gemini generates futures, council debate, and judge decision
  ↓
Firebase Admin writes result to Firestore
  ↓
Frontend updates live
  ↓
MongoDB stores the new crisis run as incident memory
```

---

## MongoDB collection

Database:

```txt
threshold
```

Collection:

```txt
incident_memory
```

Example document shape:

```json
{
  "trigger": "wind-shift",
  "tags": ["wind", "plume", "contamination", "evacuation"],
  "sector": "Ward C",
  "activeMutation": "Wind Shift // Contamination Drift",
  "threatIndex": 9.5,
  "consensus": 93,
  "selectedBranch": {
    "label": "Reroute to Ward C Shelters",
    "probability": 76,
    "resourceCost": "58 units",
    "casualtyEstimate": "< 74"
  },
  "decision": {
    "action": "Reroute Evacuation to Ward C",
    "confidence": 94,
    "reasoning": "Wind drift invalidated the old path.",
    "status": "AUTO_ARMED"
  },
  "debateSummary": [
    {
      "agent": "PRAGMATIST",
      "role": "Life Safety",
      "content": "Move evacuation corridor east immediately."
    }
  ],
  "createdAt": "2026-06-09T00:00:00.000Z"
}
```

---

## MCP setup used locally

MongoDB MCP Server was configured with:

```bash
npx mongodb-mcp-server@latest setup
```

Configuration target:

```txt
VS Code MCP config
C:\Users\Aayu\AppData\Roaming\Code\User\mcp.json
```

MongoDB Agent Skills installed:

```txt
mongodb-atlas-stream-processing
mongodb-connection
mongodb-mcp-setup
mongodb-natural-language-querying
mongodb-query-optimizer
mongodb-schema-design
mongodb-search-and-ai
```

The local MCP configuration is **not committed** because it contains secrets.

A safe placeholder configuration is included here:

```txt
mcp/mongodb-mcp.example.json
```

---

## Example MCP agent queries

After restarting VS Code, an MCP-enabled agent can query MongoDB with prompts like:

```txt
List the collections in my MongoDB instance.
```

```txt
Show the latest 3 documents in threshold.incident_memory.
```

```txt
Find incident memories tagged with wind or plume.
```

```txt
Summarize prior bridge-collapse incident decisions from incident_memory.
```

---

## Security notes

Do not commit:

```txt
mcp.json
.env.local
MongoDB connection strings
service account JSON files
API keys
```

The repository only includes placeholder MCP configuration.

---

## Hackathon positioning

For Devpost:

> THRESHOLD uses MongoDB Atlas as persistent incident memory at runtime. We also configured MongoDB MCP Server with VS Code agent skills to query and inspect the same `incident_memory` collection through an MCP-compatible workflow. This gives the agent a partner-tool memory layer for crisis precedent retrieval.
