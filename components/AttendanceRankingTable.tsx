"use client"

import type { Friend } from "@/types"

interface RankingItem {
  friend: Friend
  count: number
}

interface AttendanceRankingTableProps {
  data: RankingItem[]
  year: number
}

export default function AttendanceRankingTable({
  data,
  year,
}: AttendanceRankingTableProps) {
  const getInitials = (name: string) => name.charAt(0).toUpperCase()

  // 有出勤记录的成员
  const activeParticipants = data.filter((item) => item.count > 0)
  const maxCount = data[0]?.count ?? 0
  const minActiveCount =
    activeParticipants.length > 0
      ? activeParticipants[activeParticipants.length - 1].count
      : -1

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">出席次数排行榜</h3>
          <span className="text-xs text-gray-400">{year}年</span>
        </div>
      </div>

      <div className="px-5 py-2">
        {/* 表头 */}
        <div className="flex items-center py-2 text-xs font-medium text-gray-400 border-b border-gray-50">
          <span className="flex-1">成员</span>
          <span className="w-20 text-right">次数</span>
        </div>

        {data.length === 0 ? (
          <div className="py-6 text-center text-gray-400 text-sm">暂无数据</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.map((item, index) => {
              // 并列第一名：次数等于最高次数（且>0）
              const isFirst = maxCount > 0 && item.count === maxCount
              // 并列最后一名：次数等于最低有效次数，且不与第一名相同（即不是所有人次数相同）
              const isLastPlace =
                item.count > 0 &&
                item.count === minActiveCount &&
                maxCount !== minActiveCount

              return (
                <div
                  key={item.friend.id}
                  className={`flex items-center py-2.5 transition-colors ${
                    isLastPlace ? "bg-gray-50/80" : "hover:bg-gray-50/50"
                  }`}
                >
                  {/* 排名图标 */}
                  <div className="flex items-center gap-2.5 flex-1">
                    {isFirst ? (
                      <img
                        src="/icons/first.png"
                        className="w-6 h-6 object-contain flex-shrink-0"
                        alt="第一名"
                      />
                    ) : isLastPlace ? (
                      <img
                        src="/icons/last.png"
                        className="w-6 h-6 object-contain flex-shrink-0"
                        alt="最后一名"
                      />
                    ) : (
                      <span className="w-6 text-center text-xs text-gray-300 font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                    )}

                    {/* 头像 */}
                    <div
                      className={`w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium text-xs flex-shrink-0 ${
                        isLastPlace ? "grayscale-[0.4]" : ""
                      }`}
                    >
                      {getInitials(item.friend.name)}
                    </div>

                    {/* 姓名 + 标签 */}
                    <div className="flex items-center min-w-0">
                      <span
                        className={`font-medium text-sm truncate ${
                          isLastPlace ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        {item.friend.name}
                      </span>
                      {isLastPlace && (
                        <span className="ml-2 flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          忙碌中
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 次数徽章 */}
                  <div className="w-20 text-right flex-shrink-0">
                    <span
                      className={`inline-flex items-center justify-center min-w-[1.75rem] px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.count > 0
                          ? isLastPlace
                            ? "bg-gray-100 text-gray-400"
                            : "bg-indigo-50 text-indigo-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {item.count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
