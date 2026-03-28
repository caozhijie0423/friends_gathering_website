/**
 * 聚会历史数据导入脚本
 * 用法: node scripts/import-gatherings.mjs [excel路径]
 * 示例: node scripts/import-gatherings.mjs ./data/record_data.xlsx
 */

import { createClient } from "@supabase/supabase-js"
import XLSX from "xlsx"
import { readFileSync } from "fs"
import { config } from "dotenv"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../.env") })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ 缺少 Supabase 环境变量，请检查 .env 文件")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── 读取 Excel ─────────────────────────────────────────────────────
const excelPath = resolve(process.argv[2] ?? "./data/record_data.xlsx")
console.log(`📂 读取 Excel: ${excelPath}\n`)

const wb = XLSX.readFile(excelPath)
const ws = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(ws)   // 以第一行为 header

// ── 加载现有朋友，建立 name → id 映射 ────────────────────────────
console.log("👥 加载朋友列表...")
const { data: existingFriends, error: friendsErr } = await supabase
  .from("friends")
  .select("id, name")

if (friendsErr) {
  console.error("❌ 无法读取朋友列表:", friendsErr.message)
  process.exit(1)
}

const friendMap = new Map(existingFriends.map(f => [f.name.trim(), f.id]))
console.log(`   已有朋友 ${friendMap.size} 人\n`)

// ── 辅助：确保朋友存在，返回 id ───────────────────────────────────
async function ensureFriend(name) {
  const trimmed = name.trim()
  if (friendMap.has(trimmed)) return friendMap.get(trimmed)

  const { data, error } = await supabase
    .from("friends")
    .insert({ name: trimmed })
    .select("id, name")
    .single()

  if (error) throw new Error(`创建朋友"${trimmed}"失败: ${error.message}`)
  friendMap.set(trimmed, data.id)
  console.log(`   ➕ 新建朋友: ${trimmed}`)
  return data.id
}

// ── 主导入循环 ────────────────────────────────────────────────────
let successCount = 0
let failCount = 0

for (let i = 0; i < rows.length; i++) {
  const row = rows[i]
  const rowNum = i + 2   // Excel 行号（1=header）

  try {
    // 1. 基础字段校验
    if (!row.title || !row.held_at) {
      console.warn(`⚠️  第 ${rowNum} 行：缺少 title 或 held_at，跳过`)
      failCount++
      continue
    }

    // 2. 处理 drinks（逗号分隔 → 数组，可为空）
    const drinks = row.drinks
      ? String(row.drinks).split(",").map(d => d.trim()).filter(Boolean)
      : []

    // 3. 处理参与人（逗号或逗号+空格分隔 → name[]）
    const participantNames = row.participants
      ? String(row.participants).split(/[，,]/).map(n => n.trim()).filter(Boolean)
      : []

    // 4. 确保所有参与人都存在于 friends 表
    const participantIds = await Promise.all(participantNames.map(ensureFriend))

    // 5. 插入聚会
    const { data: gathering, error: gErr } = await supabase
      .from("gatherings")
      .insert({
        title: String(row.title).trim(),
        held_at: String(row.held_at).trim(),
        location: row.location ? String(row.location).trim() : "",
        restaurant: row.restaurant ? String(row.restaurant).trim() : null,
        drinks,
        notes: row.notes ? String(row.notes).trim() : null,
      })
      .select("id")
      .single()

    if (gErr) throw new Error(`插入聚会失败: ${gErr.message}`)

    // 6. 插入参与人关联
    if (participantIds.length > 0) {
      const { error: pErr } = await supabase
        .from("gathering_participants")
        .insert(participantIds.map(friend_id => ({ gathering_id: gathering.id, friend_id })))
      if (pErr) throw new Error(`插入参与人失败: ${pErr.message}`)
    }

    // 7. 创建空日记记录（与 createGathering 行为一致）
    await supabase
      .from("diary_entries")
      .insert({ gathering_id: gathering.id })

    console.log(`✅ [${rowNum}] ${row.title} (${row.held_at}) — ${participantIds.length} 人`)
    successCount++

  } catch (err) {
    console.error(`❌ [${rowNum}] ${row.title ?? "??"}: ${err.message}`)
    failCount++
  }
}

// ── 汇总 ──────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(40)}`)
console.log(`🎉 导入完成：成功 ${successCount} 条，失败/跳过 ${failCount} 条`)
