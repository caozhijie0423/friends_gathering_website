import type { Metadata, Viewport } from "next"
import "./globals.css"
import Sidebar from "@/components/layout/Sidebar"

export const metadata: Metadata = {
  title: "聚会日记",
  description: "记录朋友聚会的美好时光",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh" className="h-full antialiased">
      <body className="h-full bg-gray-50">
        <Sidebar />
        <main className="relative min-h-screen lg:pl-64 overflow-y-auto pb-20 lg:pb-0">
          {/* Indigo Banner Background */}
          <div className="absolute top-0 left-0 right-0 h-36 bg-indigo-500 -z-10 rounded-bl-3xl" />
          {children}
        </main>
      </body>
    </html>
  )
}
