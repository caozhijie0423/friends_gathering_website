# 朋友聚会记录 Web 应用

## 项目概述
记录朋友聚会的 Web 应用，支持聚会管理、日记（图片集）、数据统计。

**设计方案完整文档：** `~/.claude/plans/radiant-purring-wand.md`

---

## 技术栈
- Next.js 14 App Router + TypeScript + Tailwind CSS
- shadcn/ui 组件库（已安装）
- Supabase JS 客户端（数据库操作，HTTPS，不受网络限制）
- Recharts（图表）
- react-dropzone（图片上传）
- **注意：本地无法直连 Supabase 数据库端口，所有 DB 操作走 Supabase JS 客户端**

---

## Supabase 配置
- Project ID：`msktunyznrtbpcuzneni`
- URL：`https://msktunyznrtbpcuzneni.supabase.co`
- anon key 已写入 `.env`
- Supabase JS 客户端：`lib/supabase.ts` ✅
- Storage bucket：`gathering-photos`（Public）✅

---

## 当前进度

### ✅ Week 1 全部完成
- Next.js 14 项目初始化
- 所有依赖安装（Prisma, Supabase, shadcn/ui, Recharts, react-dropzone）
- Supabase 数据库建表（5张表）
- user_id 列已删除，users 表已删除（MVP 无认证）
- Supabase Storage bucket `gathering-photos` 创建完成
- Supabase JS 客户端配置（`lib/supabase.ts`）
- TypeScript 类型定义（`types/index.ts`）
- 左侧导航栏布局（`app/layout.tsx` + `components/layout/Sidebar.tsx`）
- 数据访问层完整实现（`lib/db/`，含 friends/gatherings/photos/diary/stats）
- 所有页面路由骨架（首页、聚会、日记、日记详情、朋友）

### ✅ Week 2 朋友页 CRUD 完成
- 朋友列表展示（姓名 + 首字母 Avatar）
- 添加朋友（弹窗表单）
- 编辑朋友（弹窗表单）
- 删除朋友（确认对话框）
- 空状态处理（无朋友时显示引导）
- 使用 `lib/db/friends.ts` 数据访问层函数

### ✅ Week 2 聚会列表页完成
- 聚会列表展示（完整详情：主题、时间、地点、餐厅、酒类、参与人、备注）
- 新建/编辑/删除弹窗表单
- **图片上传**：弹窗内选图，最多 5 张，即时预览，编辑时可删旧图/加新图
- 空状态处理

### ✅ Week 3 日记页完成
- 日记时间线页（垂直时间线 + 封面图 + 点击跳转）
- 日记详情页（图片网格 + inline caption 编辑）
- 空状态处理

### ✅ Week 4 首页图表完成
- 年份选择器（默认当前年）
- 每季度聚会次数 BarChart（Recharts）
- 每季度平均人数 BarChart（Recharts）
- 出勤第一 / 出勤最少展示
- 最近 5 场聚会列表

### ✅ Week 5 UI 精装改版完成（Argon Dashboard 风格）
- **全局布局升级**：顶部 indigo banner（`h-72 bg-indigo-500`）+ 页面主体 `bg-gray-50`
- **Sidebar 浮动卡片化**：`rounded-2xl shadow-xl`，与页面有间距（`p-4`），彩色图标（indigo/pink/cyan/orange）
- **导航项新样式**：active 状态 `bg-indigo-500/10 rounded-xl`，无左边竖线
- **新建 PageHeader 组件**：面包屑 + 白色大标题（位于 indigo banner 上）
- **卡片视觉统一升级**：所有 Card `rounded-2xl shadow-md`（之前是 `rounded-lg shadow-sm`）
- **按钮主色改为 indigo-500**：与整体品牌色统一
- **首页出勤榜图标**：改为饱和色圆形（Trophy→amber-500 白图标，Snail→slate-400 白图标）
- **朋友页 Avatar**：改为 `bg-indigo-500 text-white`
- **所有页面结构更新**：首页、聚会、朋友、日记、日记详情页全部应用新布局

### 🔄 下一步：移动端适配 + Toast 错误处理
- 移动端 Sidebar 响应式优化
- Toast 提示完善错误处理

---

## MVP 设计决策（已确认，不要改动）
- **无登录/认证**（MVP 跳过）
- **无独立统计页**（首页已包含图表）
- 图片上传在聚会弹窗，最多 5 张
- 日记 = 图片集 + 每张图描述，无长文正文
- 数据访问层统一放 `lib/db/`（便于后期加认证）

---

## 导航栏（左侧纵向）
| 路由 | 页面 |
|------|------|
| `/` | 首页（图表 + 出勤榜 + 最近聚会）|
| `/gatherings` | 聚会列表（新建/修改弹窗）|
| `/diary` | 日记时间瀑布流 |
| `/diary/:gathering_id` | 日记详情（图片网格 + caption）|
| `/friends` | 朋友管理 |

---

## 文件结构（当前实际状态）
```
gathering-diary/
├── app/
│   ├── layout.tsx              ✅ 左侧导航布局
│   ├── page.tsx                ✅ 首页（图表 + 出勤榜 + 最近聚会）
│   ├── gatherings/page.tsx     ✅ 聚会页（CRUD 完整实现）
│   ├── diary/
│   │   ├── page.tsx            ✅ 日记时间线（完整实现）
│   │   └── [gathering_id]/page.tsx ✅ 日记详情（图片网格 + caption 编辑）
│   └── friends/page.tsx        ✅ 朋友页（CRUD 完整实现）
├── components/
│   ├── ui/                     ✅ shadcn 组件
│   └── layout/
│       └── Sidebar.tsx         ✅ 左侧导航栏
├── lib/
│   ├── supabase.ts             ✅ Supabase 客户端
│   └── db/                     ✅ 数据访问层（完整实现）
│       ├── friends.ts          ✅ getFriends / addFriend / updateFriend / deleteFriend
│       ├── gatherings.ts       ✅ getGatherings / createGathering / updateGathering / deleteGathering
│       ├── photos.ts           ✅ uploadPhoto / updatePhotoCaption / deletePhoto
│       ├── diary.ts            ✅ getDiaryEntry / getDiaryList
│       ├── stats.ts            ✅ getStatsOverview
│       └── index.ts            ✅ 统一导出
└── types/
    └── index.ts                ✅ 所有核心类型定义
```

---

## 开发命令
```bash
cd /Users/zhijiecao/Documents/CC_project/gathering-diary
npm run dev
```
