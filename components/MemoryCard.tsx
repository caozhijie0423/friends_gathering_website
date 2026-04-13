"use client"

import { format, isSameDay, isYesterday, isTomorrow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Calendar, MapPin, Users, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { GatheringWithParticipants } from "@/types"

interface MemoryCardProps {
  gathering: GatheringWithParticipants
  daysDiff: number
  isFuture: boolean
  originalDate: Date
}

export default function MemoryCard({
  gathering,
  daysDiff,
  isFuture,
  originalDate,
}: MemoryCardProps) {
  const today = new Date()

  // 判断是否是特殊的临近日期（今天/昨天/明天）
  const isSpecialDay =
    isSameDay(originalDate, today) ||
    isYesterday(originalDate) ||
    isTomorrow(originalDate)

  // 获取描述文字
  const getMemoryText = () => {
    if (isSameDay(originalDate, today)) return "就在今天"
    if (isYesterday(originalDate)) return "就在昨天"
    if (isTomorrow(originalDate)) return "就在明天"

    // 计算年份差
    const yearDiff = today.getFullYear() - originalDate.getFullYear()

    if (isFuture) {
      if (daysDiff <= 7) return `还有 ${daysDiff} 天`
      if (daysDiff <= 30) return `还有 ${Math.floor(daysDiff / 7)} 周`
      return `还有 ${Math.floor(daysDiff / 30)} 个月`
    } else {
      // 优先用年份表达
      if (yearDiff >= 1) return `${yearDiff} 年前的时光`
      if (daysDiff <= 7) return `${daysDiff} 天前的回忆`
      if (daysDiff <= 30) return `${Math.floor(daysDiff / 7)} 周前的时光`
      return `${Math.floor(daysDiff / 30)} 个月前的记忆`
    }
  }

  return (
    <Link
      href={`/gatherings?highlight=${gathering.id}`}
      className="block relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50 border border-amber-100/50 shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
    >
      {/* 装饰性背景元素 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200/20 to-amber-200/20 rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* 内容区 */}
      <div className="relative px-6 py-6">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              回忆
            </h3>
            {isSpecialDay ? (
              <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm animate-pulse">
                {getMemoryText()}
              </span>
            ) : (
              <span className="text-sm text-amber-600/70 ml-1">· {getMemoryText()}</span>
            )}
          </div>
          {/* 跳转指示 */}
          <div className="flex items-center gap-1 text-amber-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>查看详情</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* 聚会信息卡片 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-amber-100/50">
          {/* 聚会标题和日期 */}
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-xl font-bold text-gray-800">
              {gathering.title}
            </h4>
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-100/50 px-3 py-1 rounded-full text-sm">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {format(originalDate, "yyyy年M月d日", { locale: zhCN })}
              </span>
            </div>
          </div>

          {/* 地点 */}
          {(gathering.location || gathering.cuisine) && (
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span className="text-sm">
                {gathering.location}
                {gathering.location && gathering.cuisine && " · "}
                {gathering.cuisine}
              </span>
            </div>
          )}

          {/* 参与成员 */}
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {gathering.participants.length > 0 ? (
                gathering.participants.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-amber-100 text-amber-700 shadow-sm"
                  >
                    {p.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">暂无参与成员记录</span>
              )}
            </div>
          </div>
        </div>

        {/* 底部装饰线 */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-200" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-200" />
        </div>
      </div>
    </Link>
  )
}

// 空状态组件
export function MemoryCardEmpty() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100 shadow-md">
      <div className="px-6 py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <h3 className="text-base font-medium text-gray-600 mb-1">回忆</h3>
        <p className="text-sm text-gray-400">
          还没有历史回忆，快去创建新的聚会吧！
        </p>
      </div>
    </div>
  )
}
