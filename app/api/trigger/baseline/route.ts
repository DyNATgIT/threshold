import { NextResponse } from 'next/server';
import { writeTriggerScenario } from '@/lib/blackboardActions';

export async function POST() {
  try {
    const snapshot = await writeTriggerScenario('baseline');
    return NextResponse.json({ ok: true, snapshot });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: 'Failed to trigger baseline.' }, { status: 500 });
  }
}
