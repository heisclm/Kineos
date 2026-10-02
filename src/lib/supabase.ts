import { createClient } from '@supabase/supabase-js';

if (typeof global !== 'undefined' && !global.WebSocket) {
  global.WebSocket = class WebSocket {} as any;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase admin client (server-side only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function uploadMedia(file: File, path: string): Promise<string> {
  // Convert File to Buffer because Next.js File objects can cause stream errors in supabase-js
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabaseAdmin.storage
    .from('media')
    .upload(path, buffer, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Supabase upload error: ${error.message} (Path: ${path})`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from('media').getPublicUrl(path);
  return publicUrlData.publicUrl;
}
