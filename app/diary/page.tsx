"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Camera, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import PageHeader from "@/components/layout/PageHeader"
import { getDiaryList } from "@/lib/db"
import type { DiaryEntry } from "@/types"

type DiaryListItem = DiaryEntry & {
  gathering: { title: string; held_at: string }
  cover_photo: string | null
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDiaryList()
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <PageHeader breadcrumb="页面" title="日记" />
        <div className="px-6 py-12 text-center text-gray-500">加载中...</div>
      </>
    )
  }

  return (
    <>
      <PageHeader breadcrumb="页面" title="日记" />
      <div className="px-6 py-6">

      {entries.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">还没有日记</h3>
          <p className="mt-1 text-gray-500">
            去{" "}
            <Link href="/gatherings" className="text-blue-600 hover:underline">
              聚会页
            </Link>{" "}
            创建聚会并上传照片吧！
          </p>
        </div>
      ) : (
        <div className="mt-6 relative">
          {/* 时间线竖线 */}
          <div className="absolute left-[7.5rem] top-0 bottom-0 w-px bg-gray-200" />

          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className="flex gap-6">
                {/* 左侧日期 */}
                <div className="w-28 flex-shrink-0 text-right pt-3">
                  <p className="text-sm font-medium text-gray-700">
                    {format(new Date(entry.gathering.held_at), "yyyy年", { locale: zhCN })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(entry.gathering.held_at), "M月d日", { locale: zhCN })}
                  </p>
                </div>

                {/* 时间点圆圈 */}
                <div className="relative flex-shrink-0 w-4 flex items-start pt-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
                </div>

                {/* 右侧卡片 */}
                <Link
                  href={`/diary/${entry.gathering_id}`}
                  className="flex-1 group block"
                >
                  <div className="flex gap-4 rounded-2xl shadow-md bg-white p-4 transition hover:shadow-lg">
                    {/* 封面图 */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {entry.cover_photo ? (
                        <img
                          src={entry.cover_photo}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="h-8 w-8 text-gray-300" />
                      )}
                    </div>

                    {/* 标题 */}
                    <div className="flex flex-col justify-center">
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {entry.gathering.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {format(new Date(entry.gathering.held_at), "EEEE", { locale: zhCN })}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </>
  )
}
