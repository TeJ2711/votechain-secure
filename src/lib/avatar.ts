import { supabase } from '@/integrations/supabase/client';

/**
 * Given an avatar_url from the database (which may be an old public URL or a signed URL),
 * extract the storage path and generate a fresh signed URL.
 */
export async function getSignedAvatarUrl(avatarUrl: string): Promise<string | null> {
  // If it's already a signed URL that hasn't expired, it might still work,
  // but let's always generate a fresh one from the path.
  
  // Extract path from various URL formats
  let path = '';
  
  // Format: .../storage/v1/object/public/avatars/userId/avatar.ext?...
  const publicMatch = avatarUrl.match(/\/storage\/v1\/object\/(?:public|sign)\/avatars\/(.+?)(?:\?|$)/);
  if (publicMatch) {
    path = publicMatch[1];
  }
  
  // Format: .../storage/v1/object/sign/avatars/userId/avatar.ext?token=...
  const signMatch = avatarUrl.match(/\/storage\/v1\/s3\/object\/avatars\/(.+?)(?:\?|$)/);
  if (!path && signMatch) {
    path = signMatch[1];
  }

  // If we couldn't extract a path, try using the URL as-is (it may be a direct signed URL)
  if (!path) {
    // Maybe it's already a working signed URL
    return avatarUrl;
  }

  const { data } = await supabase.storage
    .from('avatars')
    .createSignedUrl(path, 60 * 60); // 1 hour

  return data?.signedUrl || null;
}
