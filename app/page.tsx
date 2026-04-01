"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Flame, CalendarDays } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import StatCard from "@/components/StatCard"
import AttendanceRankingTable from "@/components/AttendanceRankingTable"
import MemoryCard, { MemoryCardEmpty } from "@/components/MemoryCard"
import LineChartCard from "@/components/charts/LineChartCard"
import {
  getStatsOverview,
  getYearlyAttendanceRanking,
  getYearlyGatheringCount,
  getClosestHistoricalGathering,
  getMostRecentGathering,
  type YearlyAttendanceRanking,
  type ClosestMemory,
} from "@/lib/db"
import type { StatsOverview, GatheringWithParticipants } from "@/types"

export default function Home() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [stats, setStats] = useState<StatsOverview | null>(null)
  const [ranking, setRanking] = useState<YearlyAttendanceRanking[]>([])
  const [yearlyCount, setYearlyCount] = useState(0)
  const [lastYearCount, setLastYearCount] = useState(0)
  const [memory, setMemory] = useState<ClosestMemory | null>(null)
  const [mostRecent, setMostRecent] = useState<GatheringWithParticipants | null>(null)
  const [daysSinceLast, setDaysSinceLast] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getStatsOverview(year),
      getYearlyAttendanceRanking(year),
      getYearlyGatheringCount(year),
      getYearlyGatheringCount(year - 1),
      getClosestHistoricalGathering(),
      getMostRecentGathering(),
    ])
      .then(([s, r, count, lastCount, m, recent]) => {
        setStats(s)
        setRanking(r)
        setYearlyCount(count)
        setLastYearCount(lastCount)
        setMemory(m)
        setMostRecent(recent)

        // 计算距上次聚会天数（使用真正的最近聚会）
        if (recent) {
          const lastDate = new Date(recent.held_at)
          const days = Math.floor(
            (Date.now() - lastDate.getTime()) / 86400000
          )
          setDaysSinceLast(days)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [year])

  return (
    <>
      {/* 自定义 Header */}
      <div className="px-4 lg:px-6 pt-8 pb-6">
        <h1 className="text-white text-2xl font-bold">年度聚会统计</h1>
        <p className="text-white/60 text-sm mt-1">
          {format(new Date(), "yyyy年M月d日 EEEE", { locale: zhCN })}
        </p>

        {/* 统计卡片 */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="距上次聚会"
            value={daysSinceLast}
            icon={Flame}
            iconBgColor="bg-amber-50"
            iconColor="text-amber-500"
            subtext={
              mostRecent
                ? `上次：${format(new Date(mostRecent.held_at), "yyyy年M月d日", {
                    locale: zhCN,
                  })}`
                : "暂无聚会记录"
            }
          />
          <StatCard
            title="本年度聚会次数"
            value={yearlyCount}
            icon={CalendarDays}
            iconBgColor="bg-indigo-50"
            iconColor="text-indigo-500"
            subtext={`较${year - 1}年`}
            change={
              lastYearCount > 0
                ? {
                    value: yearlyCount - lastYearCount,
                    label: "次",
                    isPositive: yearlyCount >= lastYearCount,
                  }
                : undefined
            }
          />
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-6 space-y-6">
        {/* 年份选择 */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-gray-700 w-16 text-center">
            {year}
          </span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">加载中...</div>
        ) : (
          <>
            {/* 成员年度聚会排行榜 */}
            <AttendanceRankingTable data={ranking} year={year} />

            {/* 折线图 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LineChartCard
                title="每季度聚会次数"
                data={stats?.quarterly_counts ?? []}
                unit="次"
                color="#465fff"
              />
              <LineChartCard
                title="每季度平均人数"
                data={stats?.quarterly_avg_participants ?? []}
                unit="人"
                color="#8b5cf6"
              />
            </div>

            {/* 回忆栏目 */}
            {memory ? (
              <MemoryCard
                gathering={memory.gathering}
                daysDiff={memory.daysDiff}
                isFuture={memory.isFuture}
                originalDate={memory.originalDate}
              />
            ) : (
              <MemoryCardEmpty />
            )}
          </>
        )}
      </div>
    </>
  )
}
