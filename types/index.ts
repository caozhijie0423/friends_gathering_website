// ─── Core Entities ───────────────────────────────────────────────

export type Friend = {
  id: string
  name: string
  created_at: string
}

export type Gathering = {
  id: string
  title: string
  held_at: string
  location: string
  restaurant?: string | null
  drinks: string[]
  notes?: string | null
  created_at: string
}

export type GatheringWithParticipants = Gathering & {
  participants: Friend[]
  photos: Photo[]
}

export type Photo = {
  id: string
  gathering_id: string
  url: string
  caption?: string | null
  sort_order: number
  uploaded_at: string
}

export type DiaryEntry = {
  id: string
  gathering_id: string
  content?: string | null
  created_at: string
  updated_at: string
}

export type GatheringParticipant = {
  id: string
  gathering_id: string
  friend_id: string
}

// ─── Input Types (for create/update) ─────────────────────────────

export type CreateGatheringInput = {
  title: string
  held_at: string
  location: string
  restaurant?: string
  drinks?: string[]
  notes?: string
  participant_ids?: string[]
}

export type UpdateGatheringInput = Partial<CreateGatheringInput>

export type CreateFriendInput = {
  name: string
}

// ─── Stats Types ──────────────────────────────────────────────────

export type QuarterlyStat = {
  quarter: 1 | 2 | 3 | 4
  label: string   // "Q1", "Q2", etc.
  value: number
}

export type AttendanceStat = {
  friend: Friend
  count: number
}

export type StatsOverview = {
  quarterly_counts: QuarterlyStat[]
  quarterly_avg_participants: QuarterlyStat[]
  top_attendee: AttendanceStat | null
  bottom_attendee: AttendanceStat | null
}

// ─── API Response ─────────────────────────────────────────────────

export type ApiResponse<T> = {
  data: T | null
  error: string | null
}
