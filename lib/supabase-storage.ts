import { getServiceSupabase } from './supabase';

const AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET || 'avatars';

export async function uploadAvatar(
  address: string,
  file: Buffer,
  contentType: string
): Promise<string | null> {
  const supabase = getServiceSupabase();
  if (!supabase) return null;

  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const path = `${address.toLowerCase()}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.error('[supabase] avatar upload', error);
    return null;
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export { AVATAR_BUCKET };
