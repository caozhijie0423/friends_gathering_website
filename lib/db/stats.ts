import { supabase } from "@/lib/supabase"
import type { QuarterlyStat, AttendanceStat, StatsOverview } from "@/types"

function getQuarter(dateStr: string): 1 | 2 | 3 | 4 {
  const month = new Date(dateStr).getMonth() + 1
  if (month <= 3) return 1
  if (month <= 6) return 2
  if (month <= 9) return 3
  return 4
}

export async function getStatsOverview(year: number): Promise<StatsOverview> {
  // 1. 获取该年所有聚会（含参与人数）
  const { data: gatherings, error } = await supabase
    .from("gatherings")
    .select(`
      id,
      held_at,
      participants:gathering_participants(count)
    `)
    .gte("held_at", `${year}-01-01`)
    .lte("held_at", `${year}-12-31`)

  if (error) throw new Error(error.message)

  // 2. 季度聚会次数
  const countMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
  const participantMap: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [] }

  for (const g of gatherings ?? []) {
    const q = getQuarter(g.held_at)
    countMap[q]++
    const count = (g.participants as any[])[0]?.count ?? 0
    participantMap[q].push(Number(count))
  }

  const labels = ["Q1", "Q2", "Q3", "Q4"]
  const quarterly_counts: QuarterlyStat[] = [1, 2, 3, 4].map((q) => ({
    quarter: q as 1 | 2 | 3 | 4,
    label: labels[q - 1],
    value: countMap[q],
  }))

  const quarterly_avg_participants: QuarterlyStat[] = [1, 2, 3, 4].map((q) => {
    const arr = participantMap[q]
    const avg = arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
    return {
      quarter: q as 1 | 2 | 3 | 4,
      label: labels[q - 1],
      value: Math.round(avg * 10) / 10,
    }
  })

  // 3. 出勤榜（本年度所有参与记录）
  const { data: participantRows } = await supabase
    .from("gathering_participants")
    .select(`
      friend_id,
      gathering:gatherings(held_at)
    `)

  const friendCountMap: Record<string, number> = {}
  for (const row of participantRows ?? []) {
    const heldAt = (row.gathering as any)?.held_at
    if (!heldAt) continue
    const y = new Date(heldAt).getFullYear()
    if (y !== year) continue
    friendCountMap[row.friend_id] = (friendCountMap[row.friend_id] ?? 0) + 1
  }

  const entries = Object.entries(friendCountMap)
  let top_attendee: AttendanceStat | null = null
  let bottom_attendee: AttendanceStat | null = null

  if (entries.length > 0) {
    entries.sort((a, b) => b[1] - a[1])
    const topId = entries[0][0]
    const bottomId = entries[entries.length - 1][0]

    const { data: friends } = await supabase
      .from("friends")
      .select("*")
      .in("id", [topId, bottomId])

    const topFriend = friends?.find((f) => f.id === topId)
    const bottomFriend = friends?.find((f) => f.id === bottomId)

    if (topFriend) top_attendee = { friend: topFriend, count: entries[0][1] }
    if (bottomFriend)
      bottom_attendee = {
        friend: bottomFriend,
        count: entries[entries.length - 1][1],
      }
  }

  return {
    quarterly_counts,
    quarterly_avg_participants,
    top_attendee,
    bottom_attendee,
  }
}
