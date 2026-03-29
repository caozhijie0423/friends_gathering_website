"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Pencil, Trash2, User } from "lucide-react"
import { getFriends, addFriend, updateFriend, deleteFriend } from "@/lib/db"
import type { Friend } from "@/types"

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [newFriendName, setNewFriendName] = useState("")
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null)
  const [editName, setEditName] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [friendToDelete, setFriendToDelete] = useState<Friend | null>(null)

  // 加载朋友列表
  useEffect(() => {
    loadFriends()
  }, [])

  async function loadFriends() {
    try {
      setLoading(true)
      const data = await getFriends()
      setFriends(data)
    } catch (error) {
      console.error("加载朋友列表失败:", error)
    } finally {
      setLoading(false)
    }
  }

  // 添加朋友
  async function handleAddFriend() {
    if (!newFriendName.trim()) return

    try {
      await addFriend({ name: newFriendName.trim() })
      setNewFriendName("")
      setIsAddDialogOpen(false)
      loadFriends()
    } catch (error) {
      console.error("添加朋友失败:", error)
    }
  }

  // 编辑朋友
  async function handleEditFriend() {
    if (!editingFriend || !editName.trim()) return

    try {
      await updateFriend(editingFriend.id, editName.trim())
      setEditingFriend(null)
      setEditName("")
      setIsEditDialogOpen(false)
      loadFriends()
    } catch (error) {
      console.error("更新朋友失败:", error)
    }
  }

  // 删除朋友
  async function handleDeleteFriend() {
    if (!friendToDelete) return

    try {
      await deleteFriend(friendToDelete.id)
      setFriendToDelete(null)
      setIsDeleteDialogOpen(false)
      loadFriends()
    } catch (error) {
      console.error("删除朋友失败:", error)
    }
  }

  // 打开编辑对话框
  function openEditDialog(friend: Friend) {
    setEditingFriend(friend)
    setEditName(friend.name)
    setIsEditDialogOpen(true)
  }

  // 打开删除对话框
  function openDeleteDialog(friend: Friend) {
    setFriendToDelete(friend)
    setIsDeleteDialogOpen(true)
  }

  // 获取首字母
  function getInitials(name: string) {
    return name.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <>
        <PageHeader breadcrumb="页面" title="朋友" />
        <div className="px-6 py-12 text-center text-gray-500">加载中...</div>
      </>
    )
  }

  return (
    <>
      <PageHeader breadcrumb="页面" title="朋友" />
      <div className="px-6 py-6 space-y-6">
        <div className="flex items-center justify-end">
          <Button className="gap-2 bg-indigo-500 hover:bg-indigo-600" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            添加朋友
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新朋友</DialogTitle>
              <DialogDescription>
                输入朋友的姓名，点击保存即可添加。
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="朋友姓名"
                value={newFriendName}
                onChange={(e) => setNewFriendName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddFriend()
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddFriend} disabled={!newFriendName.trim()}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>

        {friends.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <User className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">还没有朋友</h3>
          <p className="mt-1 text-gray-500">点击上方按钮添加第一个朋友吧！</p>
        </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {friends.map((friend) => (
              <Card key={friend.id} className="group rounded-2xl shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-indigo-500 text-white">
                        {getInitials(friend.name)}
                      </AvatarFallback>
                    </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-gray-900 truncate">
                      {friend.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      添加于 {new Date(friend.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(friend)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => openDeleteDialog(friend)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑朋友</DialogTitle>
            <DialogDescription>修改朋友的姓名。</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="朋友姓名"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditFriend()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditFriend} disabled={!editName.trim()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除朋友</DialogTitle>
            <DialogDescription>
              确定要删除 <strong>{friendToDelete?.name}</strong> 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteFriend}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  )
}
