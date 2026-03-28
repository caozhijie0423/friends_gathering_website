"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Camera, ImageOff } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import PageHeader from "@/components/layout/PageHeader"
import { getGathering, getPhotosByGathering, updatePhotoCaption } from "@/lib/db"
import type { GatheringWithParticipants, Photo } from "@/types"

export default function DiaryDetailPage({
  params,
}: {
  params: { gathering_id: string }
}) {
  const { gathering_id } = params
  const [gathering, setGathering] = useState<GatheringWithParticipants | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getGathering(gathering_id),
      getPhotosByGathering(gathering_id),
    ])
      .then(([g, p]) => {
        setGathering(g)
        setPhotos(p)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [gathering_id])

  if (loading) {
    return (
      <>
        <PageHeader breadcrumb="日记" title="加载中..." />
        <div className="px-6 py-12 text-center text-gray-500">加载中...</div>
      </>
    )
  }

  if (!gathering) {
    return (
      <>
        <PageHeader breadcrumb="日记" title="未找到" />
        <div className="px-6 py-6 text-gray-500">聚会不存在</div>
      </>
    )
  }

  return (
    <>
      <PageHeader breadcrumb="日记" title={gathering.title} />
      <div className="px-6 py-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/diary"
            className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回日记
          </Link>
          <span className="text-white/50 text-sm">·</span>
          <p className="text-sm text-white/70">
            {format(new Date(gathering.held_at), "yyyy年M月d日 EEEE", { locale: zhCN })}
          </p>
        </div>

      {/* 照片网格 */}
      {photos.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <ImageOff className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">还没有照片</h3>
          <p className="mt-1 text-gray-500">
            去{" "}
            <Link href="/gatherings" className="text-blue-600 hover:underline">
              聚会页
            </Link>{" "}
            上传照片吧！
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onCaptionSaved={(updatedPhoto) =>
                setPhotos((prev) =>
                  prev.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p))
                )
              }
            />
          ))}
        </div>
      )}
      </div>
    </>
  )
}

function PhotoCard({
  photo,
  onCaptionSaved,
}: {
  photo: Photo
  onCaptionSaved: (photo: Photo) => void
}) {
  const [editing, setEditing] = useState(false)
  const [caption, setCaption] = useState(photo.caption ?? "")
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function startEdit() {
    setEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  async function saveCaption() {
    if (saving) return
    setSaving(true)
    try {
      const updated = await updatePhotoCaption(photo.id, caption)
      onCaptionSaved(updated)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      saveCaption()
    }
    if (e.key === "Escape") {
      setCaption(photo.caption ?? "")
      setEditing(false)
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-md">
      {/* 图片 */}
      <a href={photo.url} target="_blank" rel="noopener noreferrer">
        <img
          src={photo.url}
          alt={photo.caption ?? ""}
          className="w-full aspect-square object-cover hover:opacity-90 transition-opacity"
        />
      </a>

      {/* Caption */}
      <div className="p-2">
        {editing ? (
          <textarea
            ref={textareaRef}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={saveCaption}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="添加描述..."
            className="w-full text-sm text-gray-700 resize-none rounded border border-blue-300 p-1 outline-none focus:ring-1 focus:ring-blue-400"
          />
        ) : (
          <p
            className="text-sm min-h-[2rem] cursor-text rounded px-1 py-0.5 hover:bg-gray-50 transition-colors"
            onClick={startEdit}
          >
            {caption ? (
              <span className="text-gray-700">{caption}</span>
            ) : (
              <span className="text-gray-400 italic">添加描述...</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
