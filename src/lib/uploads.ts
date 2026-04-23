import { supabase } from "./supabase";

/**
 * Upload helpers for Lovable Cloud (Supabase) Storage.
 * If the user is not authenticated yet, falls back to a local data-URL so the
 * UI keeps working in demo mode. Returned `url` is always usable in <img src>.
 */

export interface UploadResult {
  url: string;
  path: string | null;
  remote: boolean;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

async function uploadOrFallback(bucket: string, path: string, file: File): Promise<UploadResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { url: await fileToDataUrl(file), path: null, remote: false };
  }
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) {
    console.warn(`[upload] ${bucket}/${path} failed, falling back to data-url:`, error.message);
    return { url: await fileToDataUrl(file), path: null, remote: false };
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path, remote: true };
}

/** Avatar upload — public bucket, path = `{userId}/avatar.{ext}`. */
export async function uploadAvatar(file: File, ownerKey?: string): Promise<UploadResult> {
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user?.id ?? "anon";
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const key = ownerKey ?? uid;
  const path = `${uid}/${key}-${Date.now()}.${ext}`;
  return uploadOrFallback("avatars", path, file);
}

/** Nutrition file upload — private; path = `{trainerId}/{clientId}/filename`. */
export async function uploadNutritionFile(file: File, clientId: string): Promise<UploadResult> {
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user?.id ?? "anon";
  const safeName = file.name.replace(/[^a-z0-9.\-_]/gi, "_");
  const path = `${uid}/${clientId}/${Date.now()}-${safeName}`;
  const result = await uploadOrFallback("nutrition-files", path, file);
  // For private buckets, switch to a signed URL so the PT can preview it.
  if (result.remote && result.path) {
    const { data } = await supabase.storage.from("nutrition-files").createSignedUrl(result.path, 60 * 60 * 24 * 7);
    if (data?.signedUrl) return { ...result, url: data.signedUrl };
  }
  return result;
}

/** Progress photo upload — private; path = `{userId}/{timestamp}.{ext}`. */
export async function uploadProgressPhoto(file: File): Promise<UploadResult> {
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user?.id ?? "anon";
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${uid}/${Date.now()}.${ext}`;
  const result = await uploadOrFallback("progress-photos", path, file);
  if (result.remote && result.path) {
    const { data } = await supabase.storage.from("progress-photos").createSignedUrl(result.path, 60 * 60 * 24 * 30);
    if (data?.signedUrl) return { ...result, url: data.signedUrl };
  }
  return result;
}
