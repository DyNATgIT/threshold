# THRESHOLD — Devpost Submission Draft

## Project Name

THRESHOLD

## Tagline

Autonomous crisis preemption: Gemini agents simulate, debate, and arm response before impact.

## Inspiration

Most emergency systems are designed around reporting. Reports arrive after signals are already visible, after teams have already lost time, and after the crisis has already moved. We wanted to build an agent system for the moment before the room is certain.

THRESHOLD was inspired by the question: what if a district emergency officer could watch agents reason through a crisis live, not as a chatbot, but as a command system?

## What it does

THRESHOLD is a live crisis command interface powered by Gemini and a Firestore blackboard. A user can trigger changing crisis conditions like a wind shift or bridge collapse. Gemini generates simulation branches, council debate, and a final judge decision. The result is written to Firestore and reflected instantly in the UI.

The dashboard shows:

- Agent Stream
- tactical map
- future branches
- council debate
- judge decision
- approve/reject controls

## How we built it

- Next.js and TypeScript for the frontend
- Vercel API routes as server-side agent/action endpoints
- Gemini API for simulation, debate, and decision generation
- Firebase Admin SDK for secure Firestore writes
- Firestore as the blackboard state plane
- GSAP/CSS for high-stakes command-center presentation

## Agent architecture

- SENTINEL observes the crisis state
- SIMULACRA generates futures
- COUNCIL debates tradeoffs
- JUDGE selects a response
- EXECUTOR records operator action

## What makes it agentic

The system does not just answer questions. It performs a multi-step mission:

1. Accept a live crisis mutation
2. Generate possible futures
3. Debate competing priorities
4. Select a response
5. Write the operational decision to shared state
6. Update the interface live
7. Keep a human operator in control

## Challenges we ran into

- Making Gemini return structured JSON reliably
- Avoiding a chatbot-shaped UX
- Designing a dashboard that felt operational rather than decorative
- Keeping real-time Firestore updates stable across Vercel deployments
- Balancing cinematic presentation with performance

## Accomplishments we are proud of

- Real Gemini-generated crisis branches and debates
- Firestore blackboard architecture
- Live UI updates from backend writes
- Human-in-the-loop approval flow
- A demo that visibly adapts when crisis variables change

## What we learned

Agent UX is not chat UX. The most compelling part of an agent system is not the text response; it is watching state change, actions form, and decisions become visible.

## What's next

- Add partner MCP integration for final track submission
- Add incident memory and precedent retrieval
- Add operator authentication
- Add real alerting and dispatch integrations
- Add post-event audit trace and explainability exports
