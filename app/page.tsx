"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Trophy, Snail, Flame } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import LineChartCard from "@/components/charts/LineChartCard"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { getStatsOverview, getGatherings } from "@/lib/db"
import type { StatsOverview, GatheringWithParticipants } from "@/types"

export default function Home() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [stats, setStats] = useState<StatsOverview | null>(null)
  const [recentGatherings, setRecentGatherings] = useState<GatheringWithParticipants[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getStatsOverview(year),
      getGatherings(),
    ])
      .then(([s, g]) => {
        setStats(s)
        setRecentGatherings(g.slice(0, 5))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [year])

  return (
    <>
      {/* 自定义 Header */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-white text-2xl font-bold">年度聚会统计</h1>
        <p className="text-white/60 text-sm mt-1">
          {format(new Date(), "yyyy年M月d日 EEEE", { locale: zhCN })}
        </p>
        {(() => {
          const last = recentGatherings[0]
          const days = last
            ? Math.floor((Date.now() - new Date(last.held_at).getTime()) / 86400000)
            : 0
          return (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <Flame className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-sm font-bold text-white">
                距上次聚会已过去 {days} 日
              </span>
            </div>
          )
        })()}
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* 年份选择 — pt-4 确保落在白色区域内 */}
        <div className="flex items-center justify-end gap-2 pt-4">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-gray-700 w-16 text-center">{year}</span>
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
            {/* 出勤榜 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-2xl shadow-md">
                <CardContent className="pt-6 flex items-center gap-5">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full bg-amber-500 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">出勤第一</p>
                    {stats?.top_attendee ? (
                      <>
                        <p className="text-3xl font-bold text-gray-800">{stats.top_attendee.friend.name}</p>
                        <p className="text-base text-gray-500">出勤 {stats.top_attendee.count} 次</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">暂无数据</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-md">
                <CardContent className="pt-6 flex items-center gap-5">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full bg-slate-400 flex items-center justify-center">
                    <Snail className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">出勤最少</p>
                    {stats?.bottom_attendee ? (
                      <>
                        <p className="text-3xl font-bold text-gray-800">{stats.bottom_attendee.friend.name}</p>
                        <p className="text-base text-gray-500">出勤 {stats.bottom_attendee.count} 次</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">暂无数据</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ApexCharts 折线图 */}
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

            {/* 最近聚会 */}
            <Card className="rounded-2xl shadow-md">
              <div className="px-6 pt-5 pb-2">
                <h3 className="text-base font-medium text-gray-700">最近聚会</h3>
              </div>
              <div className="px-6 pb-5">
                {recentGatherings.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">还没有聚会记录</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {recentGatherings.map((g) => (
                      <li key={g.id} className="flex items-center justify-between py-2.5">
                        <div>
                          <p className="font-medium text-gray-800">{g.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {format(new Date(g.held_at), "yyyy年M月d日", { locale: zhCN })}
                            {g.location ? `  ·  ${g.location}` : ""}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 flex-shrink-0 ml-4">
                          {g.participants.length} 人
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  )
}
