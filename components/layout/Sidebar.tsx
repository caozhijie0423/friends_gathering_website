"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, CalendarDays, BookOpen, Users, Menu, X, Zap } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/", label: "首页", icon: Home, color: "text-indigo-500" },
  { href: "/gatherings", label: "聚会", icon: CalendarDays, color: "text-pink-500" },
  { href: "/diary", label: "日记", icon: BookOpen, color: "text-cyan-500" },
  { href: "/friends", label: "朋友", icon: Users, color: "text-orange-500" },
]

// 桌面端侧边栏
function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 p-4 hidden lg:block">
      <div className="bg-white rounded-2xl shadow-xl h-full flex flex-col overflow-hidden">
        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-grow">
          {navItems.map(({ href, label, icon: Icon, color }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-500/10 text-indigo-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", color)} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* 赞助商广告位 */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-3">
            <div className="flex items-start gap-2 mb-3">
              <div className="mt-0.5 w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800 leading-tight">赞助商空缺中</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">支持这个小项目的成长</p>
              </div>
            </div>
            <button className="w-full rounded-lg bg-indigo-500 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600 transition-colors">
              报名
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

// 移动端底部导航
function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5",
                isActive ? "text-indigo-600" : "text-gray-400"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? color : "text-gray-400")} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// 移动端顶部标题栏
function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const currentNav = navItems.find(item =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  )

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-indigo-500 h-14 flex items-center justify-between px-4 lg:hidden">
        <h1 className="text-white font-bold text-lg">
          {currentNav?.label || "聚会日记"}
        </h1>
      </header>
      {/* 占位元素，避免内容被顶部栏遮挡 */}
      <div className="h-14 lg:hidden" />
    </>
  )
}

export default function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileHeader />
      <MobileBottomNav />
    </>
  )
}
