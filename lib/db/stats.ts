import { supabase } from "@/lib/supabase"
import type { QuarterlyStat, AttendanceStat, StatsOverview, Friend, GatheringWithParticipants } from "@/types"

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

// 年度成员出勤排行榜（含0次）
export interface YearlyAttendanceRanking {
  friend: Friend
  count: number
}

export async function getYearlyAttendanceRanking(year: number): Promise<YearlyAttendanceRanking[]> {
  // 1. 获取所有朋友
  const { data: allFriends, error: friendsError } = await supabase
    .from("friends")
    .select("*")
    .order("name", { ascending: true })

  if (friendsError) throw new Error(friendsError.message)

  // 2. 获取该年所有参与记录
  const { data: participantRows, error: participantError } = await supabase
    .from("gathering_participants")
    .select(`
      friend_id,
      gathering:gatherings(held_at)
    `)

  if (participantError) throw new Error(participantError.message)

  // 3. 统计每人年度出勤次数
  const friendCountMap: Record<string, number> = {}
  for (const row of participantRows ?? []) {
    const heldAt = (row.gathering as any)?.held_at
    if (!heldAt) continue
    const y = new Date(heldAt).getFullYear()
    if (y !== year) continue
    friendCountMap[row.friend_id] = (friendCountMap[row.friend_id] ?? 0) + 1
  }

  // 4. 构建结果（包含所有朋友，0次的也显示）
  const results: YearlyAttendanceRanking[] = (allFriends ?? []).map((friend) => ({
    friend,
    count: friendCountMap[friend.id] ?? 0,
  }))

  // 5. 排序：次数降序，次数相同按姓名字母升序
  results.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.friend.name.localeCompare(b.friend.name, "zh-CN")
  })

  return results
}

// 获取年度聚会总次数
export async function getYearlyGatheringCount(year: number): Promise<number> {
  const { count, error } = await supabase
    .from("gatherings")
    .select("*", { count: "exact", head: true })
    .gte("held_at", `${year}-01-01`)
    .lte("held_at", `${year}-12-31`)

  if (error) throw new Error(error.message)
  return count ?? 0
}

// 获取最接近今天日期的历史聚会（忽略年份，只看 MM-DD）
export interface ClosestMemory {
  gathering: GatheringWithParticipants
  daysDiff: number      // 绝对值天数差
  isFuture: boolean     // true = 日期在今年之后，false = 日期在今年之前或就是今天
  originalDate: Date
}

export async function getClosestHistoricalGathering(): Promise<ClosestMemory | null> {
  // 1. 获取所有聚会
  const { data: gatherings, error } = await supabase
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
  if (!gatherings || gatherings.length === 0) return null

  // 2. 计算每条记录与今天（MM-DD）的差值
  const today = new Date()
  const currentYear = today.getFullYear()

  let closest: ClosestMemory | null = null
  let minDiff = Infinity

  for (const g of gatherings) {
    const date = new Date(g.held_at)
    const month = date.getMonth()
    const day = date.getDate()

    // 将该聚会的日期映射到今年，计算与今天的天数差
    // 考虑两种可能：今年的这个日期，和去年的这个日期（跨年情况）
    const thisYearDate = new Date(currentYear, month, day)
    const lastYearDate = new Date(currentYear - 1, month, day)
    const nextYearDate = new Date(currentYear + 1, month, day)

    // 计算与今天的天数差（绝对值）
    const diffThisYear = Math.abs(thisYearDate.getTime() - today.getTime()) / 86400000
    const diffLastYear = Math.abs(lastYearDate.getTime() - today.getTime()) / 86400000
    const diffNextYear = Math.abs(nextYearDate.getTime() - today.getTime()) / 86400000

    // 取最小的差值
    const minDiffForThisGathering = Math.min(diffThisYear, diffLastYear, diffNextYear)

    if (minDiffForThisGathering < minDiff) {
      minDiff = minDiffForThisGathering

      // 判断是向前（未来）还是向后（过去）
      // 选择产生最小差值的那个日期与今天比较
      const bestDate =
        diffThisYear <= diffLastYear && diffThisYear <= diffNextYear
          ? thisYearDate
          : diffLastYear <= diffNextYear
            ? lastYearDate
            : nextYearDate

      const isFuture = bestDate.getTime() > today.getTime()

      closest = {
        gathering: {
          ...g,
          participants: g.participants.map((p: any) => p.friend),
        },
        daysDiff: Math.round(minDiffForThisGathering),
        isFuture,
        originalDate: date,
      }
    }
  }

  return closest
}
