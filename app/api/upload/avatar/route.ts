import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { uploadAvatar } from '@/lib/supabase-storage';
import { getServiceSupabase } from '@/lib/supabase';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(req: NextRequest) {
  try {
    const session = readSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!getServiceSupabase()) {
      return NextResponse.json(
        { error: 'Supabase storage not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 503 }
      );
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'file required' }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 2 MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadAvatar(session.address, buffer, file.type);
    if (!url) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[upload/avatar]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
