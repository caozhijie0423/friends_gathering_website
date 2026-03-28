"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, CalendarDays, BookOpen, Users } from "lucide-react"

const navItems = [
  { href: "/", label: "首页", icon: Home, color: "text-indigo-500" },
  { href: "/gatherings", label: "聚会", icon: CalendarDays, color: "text-pink-500" },
  { href: "/diary", label: "日记", icon: BookOpen, color: "text-cyan-500" },
  { href: "/friends", label: "朋友", icon: Users, color: "text-orange-500" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 p-4">
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

        {/* Footer Help Area */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="text-center mb-3">
            <p className="text-sm font-semibold text-gray-700 mb-1">需要帮助?</p>
            <p className="text-xs text-gray-500">查看项目文档</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
