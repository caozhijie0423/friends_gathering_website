"use client"

import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconBgColor?: string
  iconColor?: string
  subtext?: string
  change?: {
    value: number
    label: string
    isPositive?: boolean
  }
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor = "bg-indigo-50",
  iconColor = "text-indigo-500",
  subtext,
  change,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {change && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  change.isPositive !== false
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {change.isPositive !== false ? "+" : ""}
                {change.value}
              </span>
            )}
          </div>
          {(subtext || change) && (
            <p className="mt-1 text-sm text-gray-400">
              {subtext}
              {change && (
                <span className="ml-1 text-gray-400">{change.label}</span>
              )}
            </p>
          )}
        </div>
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl ${iconBgColor} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}
