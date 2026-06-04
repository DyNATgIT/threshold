import { NextResponse } from 'next/server';

function serviceAccountProjectId() {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed.project_id === 'string' ? parsed.project_id : null;
  } catch {
    return 'INVALID_JSON';
  }
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

async function probeModel(model: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: { maxOutputTokens: 8 },
        contents: [{ role: 'user', parts: [{ text: 'Return OK.' }] }]
      })
    }
  );

  if (response.ok) return { model, ok: true as const };
  return { model, ok: false as const, error: `${response.status} ${await response.text()}`.slice(0, 500) };
}

export async function GET() {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const models = candidateModels();
  let geminiProbe: 'skipped' | 'ok' | 'failed' = 'skipped';
  let geminiWorkingModel: string | null = null;
  const geminiErrors: Array<{ model: string; error: string }> = [];

  if (hasGeminiKey) {
    for (const model of models) {
      try {
        const result = await probeModel(model);
        if (result.ok) {
          geminiProbe = 'ok';
          geminiWorkingModel = model;
          break;
        }
        geminiErrors.push({ model, error: result.error });
      } catch (error) {
        geminiErrors.push({
          model,
          error: error instanceof Error ? error.message : 'Unknown Gemini probe error'
        });
      }
    }

    if (!geminiWorkingModel) geminiProbe = 'failed';
  }

  return NextResponse.json({
    ok: true,
    env: {
      NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || null,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
      FIREBASE_SERVICE_ACCOUNT_JSON: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
      FIREBASE_SERVICE_ACCOUNT_PROJECT_ID: serviceAccountProjectId(),
      GEMINI_API_KEY: hasGeminiKey,
      GEMINI_MODEL: process.env.GEMINI_MODEL || null,
      GEMINI_CANDIDATE_MODELS: models,
      MONGODB_URI: Boolean(process.env.MONGODB_URI),
      MONGODB_DB: process.env.MONGODB_DB || 'threshold',
      MONGODB_MEMORY_COLLECTION: process.env.MONGODB_MEMORY_COLLECTION || 'incident_memory'
    },
    geminiProbe,
    geminiWorkingModel,
    geminiErrors
  });
}
