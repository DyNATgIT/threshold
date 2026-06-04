import { NextResponse } from 'next/server';
import { patchDecision } from '@/lib/blackboardActions';

export async function POST() {
  try {
    const patch = await patchDecision('APPROVED');
    return NextResponse.json({ ok: true, patch });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: 'Failed to approve decision.' }, { status: 500 });
  }
}
