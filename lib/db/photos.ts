import { supabase } from "@/lib/supabase"
import type { Photo } from "@/types"

const BUCKET = "gathering-photos"

export async function getPhotosByGathering(gathering_id: string): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("gathering_id", gathering_id)
    .order("sort_order", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function uploadPhoto(
  gathering_id: string,
  file: File,
  caption?: string
): Promise<Photo> {
  const ext = file.name.split(".").pop()
  const path = `${gathering_id}/${Date.now()}.${ext}`

  // 1. 上传到 Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file)

  if (uploadError) throw new Error(uploadError.message)

  // 2. 获取公开 URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)

  // 3. 获取当前最大 sort_order
  const { data: existing } = await supabase
    .from("photos")
    .select("sort_order")
    .eq("gathering_id", gathering_id)
    .order("sort_order", { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

  // 4. 存入数据库
  const { data, error } = await supabase
    .from("photos")
    .insert({
      gathering_id,
      url: urlData.publicUrl,
      caption: caption ?? null,
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updatePhotoCaption(
  id: string,
  caption: string
): Promise<Photo> {
  const { data, error } = await supabase
    .from("photos")
    .update({ caption })
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deletePhoto(id: string, url: string): Promise<void> {
  // 从 URL 提取 Storage path
  const path = url.split(`${BUCKET}/`)[1]

  // 1. 删数据库记录
  const { error } = await supabase.from("photos").delete().eq("id", id)
  if (error) throw new Error(error.message)

  // 2. 删 Storage 文件
  if (path) {
    await supabase.storage.from(BUCKET).remove([path])
  }
}
