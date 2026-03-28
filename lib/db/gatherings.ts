import { supabase } from "@/lib/supabase"
import type {
  Gathering,
  GatheringWithParticipants,
  CreateGatheringInput,
  UpdateGatheringInput,
} from "@/types"

export async function getGatherings(): Promise<GatheringWithParticipants[]> {
  const { data, error } = await supabase
    .from("gatherings")
    .select(`
      *,
      participants:gathering_participants(
        friend:friends(*)
      ),
      photos(*)
    `)
    .order("held_at", { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((g) => ({
    ...g,
    participants: g.participants.map((p: any) => p.friend),
  }))
}

export async function getGathering(id: string): Promise<GatheringWithParticipants> {
  const { data, error } = await supabase
    .from("gatherings")
    .select(`
      *,
      participants:gathering_participants(
        friend:friends(*)
      ),
      photos(*)
    `)
    .eq("id", id)
    .single()

  if (error) throw new Error(error.message)

  return {
    ...data,
    participants: data.participants.map((p: any) => p.friend),
  }
}

export async function createGathering(
  input: CreateGatheringInput
): Promise<Gathering> {
  const { participant_ids, ...gatheringData } = input

  // 1. 创建聚会
  const { data: gathering, error } = await supabase
    .from("gatherings")
    .insert(gatheringData)
    .select()
    .single()

  if (error) throw new Error(error.message)

  // 2. 添加参与人
  if (participant_ids && participant_ids.length > 0) {
    const { error: participantError } = await supabase
      .from("gathering_participants")
      .insert(
        participant_ids.map((friend_id) => ({
          gathering_id: gathering.id,
          friend_id,
        }))
      )
    if (participantError) throw new Error(participantError.message)
  }

  // 3. 自动创建日记记录
  await supabase
    .from("diary_entries")
    .insert({ gathering_id: gathering.id })

  return gathering
}

export async function updateGathering(
  id: string,
  input: UpdateGatheringInput
): Promise<Gathering> {
  const { participant_ids, ...gatheringData } = input

  // 1. 更新聚会基本信息
  const { data: gathering, error } = await supabase
    .from("gatherings")
    .update(gatheringData)
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  // 2. 更新参与人（先删后插）
  if (participant_ids !== undefined) {
    await supabase
      .from("gathering_participants")
      .delete()
      .eq("gathering_id", id)

    if (participant_ids.length > 0) {
      const { error: participantError } = await supabase
        .from("gathering_participants")
        .insert(
          participant_ids.map((friend_id) => ({
            gathering_id: id,
            friend_id,
          }))
        )
      if (participantError) throw new Error(participantError.message)
    }
  }

  return gathering
}

export async function deleteGathering(id: string): Promise<void> {
  const { error } = await supabase
    .from("gatherings")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)
}
