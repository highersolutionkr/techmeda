import { createClient } from "@/lib/supabase/client";

/**
 * Uploads an image to the public "article-images" Storage bucket and
 * returns its public URL. Used for cover images and inline content images.
 */
export async function uploadArticleImage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("article-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("article-images").getPublicUrl(path);
  return data.publicUrl;
}
