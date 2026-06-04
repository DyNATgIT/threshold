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

export async function GET() {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  let geminiProbe: 'skipped' | 'ok' | 'failed' = 'skipped';
  let geminiError: string | null = null;

  if (hasGeminiKey) {
    try {
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

      if (response.ok) {
        geminiProbe = 'ok';
      } else {
        geminiProbe = 'failed';
        geminiError = `${response.status} ${await response.text()}`.slice(0, 500);
      }
    } catch (error) {
      geminiProbe = 'failed';
      geminiError = error instanceof Error ? error.message : 'Unknown Gemini probe error';
    }
  }

  return NextResponse.json({
    ok: true,
    env: {
      NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || null,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
      FIREBASE_SERVICE_ACCOUNT_JSON: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
      FIREBASE_SERVICE_ACCOUNT_PROJECT_ID: serviceAccountProjectId(),
      GEMINI_API_KEY: hasGeminiKey,
      GEMINI_MODEL: model
    },
    geminiProbe,
    geminiError
  });
}
