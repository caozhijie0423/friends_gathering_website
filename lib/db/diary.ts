import { supabase } from "@/lib/supabase"
import type { DiaryEntry } from "@/types"

export async function getDiaryEntry(gathering_id: string): Promise<DiaryEntry | null> {
  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("gathering_id", gathering_id)
    .single()

  if (error) return null
  return data
}

export async function getDiaryList(): Promise<
  (DiaryEntry & { gathering: { title: string; held_at: string }; cover_photo: string | null })[]
> {
  const { data, error } = await supabase
    .from("diary_entries")
    .select(`
      *,
      gathering:gatherings(title, held_at),
      cover_photo:gatherings(
        photos(url, sort_order)
      )
    `)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((entry: any) => {
    const photos = entry.cover_photo?.photos ?? []
    const sorted = [...photos].sort((a: any, b: any) => a.sort_order - b.sort_order)
    return {
      ...entry,
      gathering: entry.gathering,
      cover_photo: sorted[0]?.url ?? null,
    }
  })
}
