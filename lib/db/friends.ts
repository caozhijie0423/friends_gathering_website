import { supabase } from "@/lib/supabase"
import type { Friend, CreateFriendInput } from "@/types"

export async function getFriends(): Promise<Friend[]> {
  const { data, error } = await supabase
    .from("friends")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function addFriend(input: CreateFriendInput): Promise<Friend> {
  const { data, error } = await supabase
    .from("friends")
    .insert({ name: input.name })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateFriend(id: string, name: string): Promise<Friend> {
  const { data, error } = await supabase
    .from("friends")
    .update({ name })
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteFriend(id: string): Promise<void> {
  const { error } = await supabase
    .from("friends")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)
}
