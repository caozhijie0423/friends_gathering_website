"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PageHeader from "@/components/layout/PageHeader"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Pencil, Trash2, CalendarIcon, MapPin, Utensils, Wine, Users, X, ImagePlus, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  getGatherings,
  createGathering,
  updateGathering,
  deleteGathering,
  getFriends,
  uploadPhoto,
  deletePhoto,
} from "@/lib/db"
import type { GatheringWithParticipants, Friend, Photo } from "@/types"

export default function GatheringsPage() {
  const searchParams = useSearchParams()
  const [gatherings, setGatherings] = useState<GatheringWithParticipants[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [gatheringToDelete, setGatheringToDelete] = useState<GatheringWithParticipants | null>(null)
  const [editingGathering, setEditingGathering] = useState<GatheringWithParticipants | null>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    title: "",
    held_at: new Date(),
    location: "",
    restaurant: "",
    drinks: "",
    notes: "",
    participant_ids: [] as string[],
  })

  // Step 1: 图片相关状态
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [photosToDelete, setPhotosToDelete] = useState<{ id: string; url: string }[]>([])
  // 编辑时展示在弹窗内的已有照片（不含已标记删除的）
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>([])

  // 加载数据
  useEffect(() => {
    loadData()
  }, [])

  // 高亮并滚动到指定聚会卡片
  useEffect(() => {
    const id = searchParams.get("highlight")
    if (!id || loading) return
    setHighlightId(id)
    setTimeout(() => {
      const el = document.getElementById(`gathering-${id}`)
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
    setTimeout(() => setHighlightId(null), 2500)
  }, [searchParams, loading])

  async function loadData() {
    try {
      setLoading(true)
      const [gatheringsData, friendsData] = await Promise.all([
        getGatherings(),
        getFriends(),
      ])
      setGatherings(gatheringsData)
      setFriends(friendsData)
    } catch (error) {
      console.error("加载数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  // 重置表单（含图片状态）
  function resetForm() {
    setFormData({
      title: "",
      held_at: new Date(),
      location: "",
      restaurant: "",
      drinks: "",
      notes: "",
      participant_ids: [],
    })
    setSelectedFiles([])
    setPhotosToDelete([])
    setExistingPhotos([])
  }

  // 打开编辑对话框 — Step 4
  function openEditDialog(gathering: GatheringWithParticipants) {
    setEditingGathering(gathering)
    setFormData({
      title: gathering.title,
      held_at: new Date(gathering.held_at),
      location: gathering.location || "",
      restaurant: gathering.restaurant || "",
      drinks: gathering.drinks?.join(", ") || "",
      notes: gathering.notes || "",
      participant_ids: gathering.participants.map((p) => p.id),
    })
    setExistingPhotos(gathering.photos ?? [])
    setSelectedFiles([])
    setPhotosToDelete([])
    setIsEditDialogOpen(true)
  }

  // 打开删除对话框
  function openDeleteDialog(gathering: GatheringWithParticipants) {
    setGatheringToDelete(gathering)
    setIsDeleteDialogOpen(true)
  }

  // 创建聚会 — Step 2
  async function handleCreateGathering() {
    try {
      const gathering = await createGathering({
        title: formData.title,
        held_at: formData.held_at.toISOString(),
        location: formData.location || "",
        restaurant: formData.restaurant || undefined,
        drinks: formData.drinks ? formData.drinks.split(",").map((d) => d.trim()).filter(Boolean) : undefined,
        notes: formData.notes || undefined,
        participant_ids: formData.participant_ids,
      })
      // 上传图片
      for (const file of selectedFiles) {
        await uploadPhoto(gathering.id, file)
      }
      setIsAddDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error("创建聚会失败:", error)
    }
  }

  // 更新聚会 — Step 3
  async function handleUpdateGathering() {
    if (!editingGathering) return
    setSaving(true)
    try {
      await updateGathering(editingGathering.id, {
        title: formData.title,
        held_at: formData.held_at.toISOString(),
        location: formData.location || "",
        restaurant: formData.restaurant || undefined,
        drinks: formData.drinks ? formData.drinks.split(",").map((d) => d.trim()).filter(Boolean) : undefined,
        notes: formData.notes || undefined,
        participant_ids: formData.participant_ids,
      })
      // 删除标记的照片
      for (const p of photosToDelete) {
        await deletePhoto(p.id, p.url)
      }
      // 上传新照片
      for (const file of selectedFiles) {
        await uploadPhoto(editingGathering.id, file)
      }
      setSaveSuccess(true)
      loadData()
      setTimeout(() => {
        setIsEditDialogOpen(false)
        setEditingGathering(null)
        resetForm()
        setSaveSuccess(false)
      }, 1500)
    } catch (error) {
      console.error("更新聚会失败:", error)
    } finally {
      setSaving(false)
    }
  }

  // 删除聚会
  async function handleDeleteGathering() {
    if (!gatheringToDelete) return

    try {
      await deleteGathering(gatheringToDelete.id)
      setIsDeleteDialogOpen(false)
      setGatheringToDelete(null)
      loadData()
    } catch (error) {
      console.error("删除聚会失败:", error)
    }
  }

  // 切换参与人选择
  function toggleParticipant(friendId: string) {
    setFormData((prev) => ({
      ...prev,
      participant_ids: prev.participant_ids.includes(friendId)
        ? prev.participant_ids.filter((id) => id !== friendId)
        : [...prev.participant_ids, friendId],
    }))
  }

  // 标记已有照片为待删除
  function handleRemoveExistingPhoto(photo: Photo) {
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    setPhotosToDelete((prev) => [...prev, { id: photo.id, url: photo.url }])
  }

  if (loading) {
    return (
      <>
        <PageHeader breadcrumb="页面" title="聚会" />
        <div className="px-6 py-12 text-center text-gray-500">加载中...</div>
      </>
    )
  }

  return (
    <>
      <PageHeader breadcrumb="页面" title="聚会记录" />

      {/* 新建聚会 Dialog（全局，两处触发点共用） */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsAddDialogOpen(open) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新建聚会</DialogTitle>
            <DialogDescription>填写聚会信息，创建新的聚会记录。</DialogDescription>
          </DialogHeader>
          <GatheringForm
            formData={formData}
            setFormData={setFormData}
            friends={friends}
            toggleParticipant={toggleParticipant}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            existingPhotos={[]}
            onRemoveExisting={() => {}}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              取消
            </Button>
            <Button onClick={handleCreateGathering} disabled={!formData.title.trim()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="px-6 py-6 space-y-6">
        {gatherings.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <CalendarIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">还没有聚会</h3>
            <p className="mt-1 text-gray-500">记录你们第一次聚会吧</p>
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium
                         text-blue-600 border border-transparent
                         transition-all duration-200
                         hover:bg-blue-50 hover:shadow-sm
                         active:bg-blue-600 active:text-white focus:outline-none focus:bg-blue-600 focus:text-white"
            >
              <Plus className="h-4 w-4" />
              新建聚会
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium
                           text-blue-600 border border-transparent
                           transition-all duration-200
                           hover:bg-blue-50 hover:shadow-sm
                           active:bg-blue-600 active:text-white focus:outline-none focus:bg-blue-600 focus:text-white"
              >
                <Plus className="h-4 w-4" />
                新建聚会
              </button>
            </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {gatherings.map((gathering) => (
              <Card
                key={gathering.id}
                id={`gathering-${gathering.id}`}
                className={`group rounded-2xl shadow-md transition-all duration-500 ${
                  highlightId === gathering.id
                    ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg"
                    : ""
                }`}
              >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{gathering.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(gathering.held_at), "yyyy年MM月dd日 EEEE", { locale: zhCN })}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(gathering)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => openDeleteDialog(gathering)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {gathering.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{gathering.location}</span>
                  </div>
                )}
                {gathering.restaurant && (
                  <div className="flex items-center gap-2 text-sm">
                    <Utensils className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{gathering.restaurant}</span>
                  </div>
                )}
                {gathering.drinks && gathering.drinks.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Wine className="h-4 w-4 text-gray-400" />
                    <div className="flex gap-1 flex-wrap">
                      {gathering.drinks.map((drink, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {drink}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {gathering.participants.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div className="flex gap-1 flex-wrap">
                      {gathering.participants.map((friend) => (
                        <Badge key={friend.id} variant="outline" className="text-xs">
                          {friend.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {gathering.notes && (
                  <p className="text-sm text-gray-600 mt-2">{gathering.notes}</p>
                )}
                {gathering.photos && gathering.photos.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {gathering.photos.slice(0, 3).map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt=""
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ))}
                    {gathering.photos.length > 3 && (
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-500">
                        +{gathering.photos.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          </div>
          </>
        )}

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsEditDialogOpen(open) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑聚会</DialogTitle>
            <DialogDescription>修改聚会信息。</DialogDescription>
          </DialogHeader>
          <GatheringForm
            formData={formData}
            setFormData={setFormData}
            friends={friends}
            toggleParticipant={toggleParticipant}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            existingPhotos={existingPhotos}
            onRemoveExisting={handleRemoveExistingPhoto}
          />
          <DialogFooter className="flex items-center gap-2 sm:justify-between">
            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  保存成功，即将关闭…
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => { setIsEditDialogOpen(false); resetForm(); setSaveSuccess(false) }}
              >
                退出
              </Button>
              <Button
                onClick={handleUpdateGathering}
                disabled={!formData.title.trim() || saving}
              >
                {saving ? "保存中…" : "保存"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除聚会</DialogTitle>
            <DialogDescription>
              确定要删除聚会 <strong>{gatheringToDelete?.title}</strong> 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteGathering}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  )
}

// 聚会表单组件 — Step 5
function GatheringForm({
  formData,
  setFormData,
  friends,
  toggleParticipant,
  selectedFiles,
  setSelectedFiles,
  existingPhotos,
  onRemoveExisting,
}: {
  formData: {
    title: string
    held_at: Date
    location: string
    restaurant: string
    drinks: string
    notes: string
    participant_ids: string[]
  }
  setFormData: React.Dispatch<React.SetStateAction<typeof formData>>
  friends: Friend[]
  toggleParticipant: (friendId: string) => void
  selectedFiles: File[]
  setSelectedFiles: (files: File[]) => void
  existingPhotos: Photo[]
  onRemoveExisting: (photo: Photo) => void
}) {
  const [dateOpen, setDateOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalCount = existingPhotos.length + selectedFiles.length
  const canAddMore = totalCount < 5

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const remaining = 5 - totalCount
    const toAdd = files.slice(0, remaining)
    setSelectedFiles([...selectedFiles, ...toAdd])
    // 清空 input 以便下次选同一文件
    e.target.value = ""
  }

  function removeNewFile(index: number) {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          聚会主题 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="例如：周末聚餐"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>聚会时间</Label>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger
            className="w-full flex items-center justify-start gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-sm hover:bg-accent"
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {format(formData.held_at, "yyyy年MM月dd日", { locale: zhCN })}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.held_at}
              onSelect={(date) => {
                if (date) {
                  setFormData((prev) => ({ ...prev, held_at: date }))
                  setDateOpen(false)
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">地点</Label>
          <Input
            id="location"
            placeholder="聚会地点"
            value={formData.location}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="restaurant">餐厅</Label>
          <Input
            id="restaurant"
            placeholder="餐厅名称"
            value={formData.restaurant}
            onChange={(e) => setFormData((prev) => ({ ...prev, restaurant: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="drinks">酒类（用逗号分隔）</Label>
        <Input
          id="drinks"
          placeholder="例如：啤酒, 红酒, 威士忌"
          value={formData.drinks}
          onChange={(e) => setFormData((prev) => ({ ...prev, drinks: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>参与人</Label>
        <div className="flex flex-wrap gap-2 p-3 border rounded-lg">
          {friends.length === 0 ? (
            <p className="text-sm text-gray-500">暂无朋友，请先添加朋友</p>
          ) : (
            friends.map((friend) => (
              <Badge
                key={friend.id}
                variant={formData.participant_ids.includes(friend.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleParticipant(friend.id)}
              >
                {friend.name}
                {formData.participant_ids.includes(friend.id) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">备注</Label>
        <Textarea
          id="notes"
          placeholder="其他备注信息..."
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
        />
      </div>

      {/* 图片上传区 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>图片（最多 5 张）</Label>
          <span className="text-xs text-gray-400">{totalCount} / 5</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* 已有照片（编辑模式） */}
          {existingPhotos.map((photo) => (
            <div key={photo.id} className="relative w-16 h-16">
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => onRemoveExisting(photo)}
                className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}

          {/* 新选文件预览 */}
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="relative w-16 h-16">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeNewFile(idx)}
                className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}

          {/* 添加按钮 */}
          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
            >
              <ImagePlus className="h-6 w-6" />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
