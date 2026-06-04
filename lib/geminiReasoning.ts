import type { CrisisSnapshot, DebateMessage, ScenarioBranch } from '@/types';

type TriggerKey = 'baseline' | 'wind-shift' | 'bridge-collapse';

type GeminiBranch = {
  label: string;
  probability: number;
  resourceCost: string;
  casualtyEstimate: string;
  status: 'candidate' | 'rejected' | 'selected';
};

type GeminiDebate = {
  agent: string;
  role: string;
  tone: 'cyan' | 'amber' | 'red' | 'gold';
  content: string;
};

type GeminiDecision = {
  action: string;
  confidence: number;
  reasoning: string;
  status: 'AUTO_ARMED' | 'HUMAN_REVIEW';
};

type GeminiPayload = {
  eventSummary: string;
  branches: GeminiBranch[];
  debate: GeminiDebate[];
  decision: GeminiDecision;
};

function stripCodeFence(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

function extractJson(text: string) {
  const stripped = stripCodeFence(text);
  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Gemini did not return a JSON object.');
  }

  return stripped.slice(firstBrace, lastBrace + 1);
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function safeString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeStatus(value: unknown, fallback: GeminiBranch['status']): GeminiBranch['status'] {
  if (value === 'selected' || value === 'candidate' || value === 'rejected') return value;
  return fallback;
}

function normalizeTone(value: unknown, fallback: GeminiDebate['tone']): GeminiDebate['tone'] {
  if (value === 'cyan' || value === 'amber' || value === 'red' || value === 'gold') return value;
  return fallback;
}

function buildPrompt(trigger: TriggerKey, snapshot: CrisisSnapshot) {
  return `
You are SIMULACRA + COUNCIL + JUDGE inside THRESHOLD, an autonomous crisis command system.

Tone: cold, precise, authoritative. No marketing language.
Scenario trigger: ${trigger}
Current snapshot:
${JSON.stringify(
  {
    sector: snapshot.sector,
    activeMutation: snapshot.activeMutation,
    threatIndex: snapshot.threatIndex,
    consensus: snapshot.consensus,
    forecastWindowMin: snapshot.forecastWindowMin,
    triggerState: snapshot.triggerState,
    existingDecision: snapshot.decision
  },
  null,
  2
)}

You must respond with a single valid JSON object. The first character must be { and the last character must be }.
No markdown. No prose. No comments. Keep every sentence short.

JSON shape:
{
  "eventSummary": "one short operational log line",
  "branches": [
    {
      "label": "short response path name",
      "probability": 0-100,
      "resourceCost": "short cost string like 58 units",
      "casualtyEstimate": "short estimate like < 74",
      "status": "selected | candidate | rejected"
    }
  ],
  "debate": [
    {
      "agent": "PRAGMATIST | ACCOUNTANT | ETHICIST | JUDGE",
      "role": "short role label",
      "tone": "cyan | amber | red | gold",
      "content": "one sentence argument"
    }
  ],
  "decision": {
    "action": "short imperative action",
    "confidence": 0-100,
    "reasoning": "one precise sentence",
    "status": "AUTO_ARMED | HUMAN_REVIEW"
  }
}

Rules:
- Return exactly 3 branches.
- Exactly one branch must be selected.
- Return exactly 4 debate messages: PRAGMATIST, ACCOUNTANT, ETHICIST, JUDGE.
- Use cyan for PRAGMATIST, amber for ACCOUNTANT, red for ETHICIST, gold for JUDGE.
- Keep each debate content under 18 words.
- Keep reasoning under 20 words.
- Make the JUDGE synthesize the other three.
`;
}

function normalizePayload(payload: Partial<GeminiPayload>, fallback: CrisisSnapshot): GeminiPayload {
  const fallbackBranches = fallback.branches.slice(0, 3);
  const fallbackDebate = fallback.debate.slice(0, 4);

  const branches = Array.from({ length: 3 }, (_, index): GeminiBranch => {
    const branch = payload.branches?.[index];
    const fallbackBranch = fallbackBranches[index] || fallbackBranches[0];
    return {
      label: safeString(branch?.label, fallbackBranch.label),
      probability: clampNumber(branch?.probability, fallbackBranch.probability, 0, 100),
      resourceCost: safeString(branch?.resourceCost, fallbackBranch.resourceCost),
      casualtyEstimate: safeString(branch?.casualtyEstimate, fallbackBranch.casualtyEstimate),
      status: normalizeStatus(branch?.status, fallbackBranch.status)
    };
  });

  if (!branches.some((branch) => branch.status === 'selected')) {
    branches[0].status = 'selected';
  }

  const selectedSeen = { value: false };
  branches.forEach((branch) => {
    if (branch.status === 'selected') {
      if (selectedSeen.value) branch.status = 'candidate';
      selectedSeen.value = true;
    }
  });

  const debateOrder: Array<Pick<GeminiDebate, 'agent' | 'role' | 'tone'>> = [
    { agent: 'PRAGMATIST', role: 'Life Safety', tone: 'cyan' },
    { agent: 'ACCOUNTANT', role: 'Resource Discipline', tone: 'amber' },
    { agent: 'ETHICIST', role: 'Equity Check', tone: 'red' },
    { agent: 'JUDGE', role: 'Synthesis', tone: 'gold' }
  ];

  const debate = debateOrder.map((defaults, index): GeminiDebate => {
    const message = payload.debate?.[index];
    const fallbackMessage = fallbackDebate[index] || fallbackDebate[0];
    return {
      agent: safeString(message?.agent, defaults.agent).toUpperCase(),
      role: safeString(message?.role, defaults.role),
      tone: normalizeTone(message?.tone, defaults.tone),
      content: safeString(message?.content, fallbackMessage.content)
    };
  });

  return {
    eventSummary: safeString(payload.eventSummary, 'Gemini reasoning completed. Decision branch updated.'),
    branches,
    debate,
    decision: {
      action: safeString(payload.decision?.action, fallback.decision.action),
      confidence: clampNumber(payload.decision?.confidence, fallback.decision.confidence, 0, 100),
      reasoning: safeString(payload.decision?.reasoning, fallback.decision.reasoning),
      status: payload.decision?.status === 'HUMAN_REVIEW' ? 'HUMAN_REVIEW' : 'AUTO_ARMED'
    }
  };
}

function candidateModels() {
  return Array.from(
    new Set([
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash'
    ].filter(Boolean) as string[])
  );
}

async function callGemini(model: string, apiKey: string, prompt: string, jsonMode: boolean) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 2200,
          ...(jsonMode ? { responseMimeType: 'application/json' } : {})
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );
}

export async function generateGeminiReasoning(trigger: TriggerKey, snapshot: CrisisSnapshot): Promise<GeminiPayload | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return null;

  const prompt = buildPrompt(trigger, snapshot);
  const errors: string[] = [];

  for (const model of candidateModels()) {
    for (const jsonMode of [true, false]) {
      const response = await callGemini(model, apiKey, prompt, jsonMode);

      if (!response.ok) {
        const errorBody = await response.text();
        errors.push(`${model}${jsonMode ? '/json' : '/text'}: ${response.status} ${errorBody.slice(0, 240)}`);
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (typeof text !== 'string') {
        errors.push(`${model}${jsonMode ? '/json' : '/text'}: response did not include text`);
        continue;
      }

      try {
        const parsed = JSON.parse(extractJson(text)) as Partial<GeminiPayload>;
        return normalizePayload(parsed, snapshot);
      } catch (error) {
        errors.push(
          `${model}${jsonMode ? '/json' : '/text'}: ${error instanceof Error ? error.message : 'parse failed'} // raw=${text.slice(0, 220)}`
        );
      }
    }
  }

  throw new Error(`Gemini request failed for all candidate models: ${errors.join(' | ')}`);
}

export function applyGeminiPayload(snapshot: CrisisSnapshot, payload: GeminiPayload): CrisisSnapshot {
  const geminiTimestamp = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());

  const geminiEvent = {
    id: `gemini-event-${Date.now().toString(36)}`,
    agent: 'GEMINI',
    phase: 'reason',
    severity: 'success' as const,
    message: payload.eventSummary,
    timestamp: geminiTimestamp
  };

  const geminiWrite = {
    id: `gemini-write-${Date.now().toString(36)}`,
    actor: 'GEMINI',
    target: 'current_crisis_state/active.reasoning',
    payload: `Generated ${payload.branches.length} futures and ${payload.debate.length} debate messages.`
  };

  const branches: ScenarioBranch[] = payload.branches.map((branch, index) => ({ 
    id: `gemini-branch-${index + 1}`,
    label: branch.label,
    probability: branch.probability,
    resourceCost: branch.resourceCost,
    casualtyEstimate: branch.casualtyEstimate,
    status: branch.status
  }));

  const debate: DebateMessage[] = payload.debate.map((message, index) => ({
    id: `gemini-debate-${index + 1}`,
    agent: message.agent,
    role: message.role,
    tone: message.tone,
    content: message.content
  }));

  return {
    ...snapshot,
    consensus: Math.max(snapshot.consensus, payload.decision.confidence),
    branches,
    debate,
    decision: {
      ...snapshot.decision,
      action: payload.decision.action,
      confidence: payload.decision.confidence,
      reasoning: payload.decision.reasoning,
      status: payload.decision.status
    },
    eventStream: [
      ...snapshot.eventStream,
      geminiEvent
    ].slice(-18),
    writes: [
      ...snapshot.writes,
      geminiWrite
    ].slice(-8)
  };
}
