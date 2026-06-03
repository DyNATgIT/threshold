# THRESHOLD

A tactical command-center demo for hackathons and crisis-response pitches.

It is built around the exact thesis you outlined:

- **THRESHOLD is a system**, not a chatbot
- agents debate through a **central blackboard**
- the UI exposes the blackboard as a **live command center**
- judges can watch the system adapt when you change a variable mid-demo

## What is built

This repo is now a **Next.js + TypeScript** project with a production-shaped frontend and a demo-safe runtime.

### Included in the UI
- left rail **Agent Stream**
- center **tactical map** with live heat zone and route overlays
- right rail **Decision Card** with human-in-the-loop approve/reject controls
- lower **simulation branch cards**
- lower **Council Debate** transcript
- mutation controls for the pitch moment:
  - **Baseline**
  - **Wind Shift**
  - **Bridge Collapse**

## Architecture model

### Blackboard pattern
Use Firestore as the shared state plane.

**Collection:** `current_crisis_state`

**Document:** `active`

Agents read from and write to the same document tree instead of calling each other directly.

Example shape:

```json
{
  "systemName": "THRESHOLD",
  "city": "Metropolitan South Grid",
  "sector": "Sector 4",
  "activeMutation": "Baseline Flood Escalation",
  "threatIndex": 9.1,
  "consensus": 92,
  "reviewWindowSec": 88,
  "forecastWindowMin": 41,
  "agentCount": 8,
  "triggerState": "HUMAN REVIEW",
  "hotspotLevel": 0.74,
  "decision": {
    "action": "Evacuate Ward A First",
    "confidence": 92,
    "reasoning": "Optimized for life-safety over asset-protection.",
    "status": "AUTO_ARMED"
  },
  "eventStream": [],
  "debate": [],
  "branches": [],
  "writes": []
}
```

## Demo mode vs live Firestore mode

This repo supports two modes:

### 1. Demo mode
Default.

The app runs a mock blackboard sequence locally so you can preview and pitch immediately.

### 2. Firestore mode
Set:

```bash
NEXT_PUBLIC_DEMO_MODE=false
```

and provide Firebase credentials in `.env.local`.

Then the frontend listens to:

```text
current_crisis_state / active
```

This lets your backend agents write real updates while the UI animates in real time.

## Recommended backend split

### Agent roles
- **SENTINEL** — ingest images, telemetry, incident signals
- **SIMULACRA** — generate branching futures
- **COUNCIL** — run the three-value debate
- **JUDGE** — collapse debate into one decision
- **EXECUTOR** — trigger outbound APIs and ops actions

### Google / Firebase stack
- **Firestore** — blackboard state
- **Pub/Sub** — orchestration between agent workers
- **Vertex AI / Gemini** — simulation and reasoning
- **Vector Search** — memory and precedent retrieval
- **Cloud Functions or Cloud Run** — agent execution

## The hackathon trick

Do **not** run real physics simulation during the demo.

Have **SIMULACRA** call Gemini with a structured prompt and force JSON output:

```text
You are a disaster simulation engine.
Given the current crisis state, generate 3 branching futures.
For each future return:
- probability
- resource cost
- casualty estimate
- recommended action
Output strict JSON.
```

That gives you fast, convincing “simulation” without blowing up latency.

## Project structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  AgentStream.tsx
  Dashboard.tsx
  DebatePanel.tsx
  DecisionPanel.tsx
  SimulationPanel.tsx
  TacticalMap.tsx
lib/
  firebase.ts
  mockBlackboard.ts
  useBlackboard.ts
types/
  index.ts
.env.example
package.json
```

## Run locally

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Add environment variables from `.env.example` if you want Firestore mode.
4. Deploy.

## Naming note

The project name is now **THRESHOLD**.
