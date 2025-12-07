# Zero-Point — 全栈博客系统

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

**Zero-Point** 是一个采用 **Monorepo 架构** 的现代化全栈博客平台，包含：

- 🌐 **前台博客（Blog）**：基于 Nuxt 4（Vue 3）构建，支持 SEO、多语言、响应式布局、主题切换
- 🛠️ **后台管理（Admin）**：基于 Vue 3 + Element Plus，提供文章、项目、标签、站点配置等完整管理能力
- 🗄️ **后端服务**：原生 `pg` 驱动 + 自定义迁移脚本，无 ORM 依赖，轻量高效
- ☁️ **云集成**：支持腾讯云 COS 图片上传、Redis 会话存储

---

## 🔧 核心功能

### 前台（Blog）

- ✅ 首页 + 博客列表 + 博客详情页
- ✅ 响应式设计 + 毛玻璃导航栏 + 抽屉菜单
- ✅ CSS 变量驱动的**无依赖主题切换**
- ✅ 首屏进入动画 & 路由过渡效果
- ✅ 全站 SEO 优化（meta、title、结构化数据）
- ✅ 支持 Markdown 渲染 + 代码高亮（highlight.js）
- ✅ 接入后台动态站点配置（Logo、社交链接、Meta 等）

### 后台（Admin）

- ✅ 文章管理（增删改查 + 封面上传）
- ✅ 项目集管理（Projects）
- ✅ 标签系统（关系型存储，非数组）
- ✅ 站点设置（Site Settings）
- ✅ 系统监控面板（CPU/内存/网络趋势图）
- ✅ 用户资料编辑（头像、昵称、社交链接）
- ✅ 基于 Pinia 的状态管理 + 国际化（i18n）

### 后端 & 基础设施

- 🚀 原生 PostgreSQL 操作（`pg` 驱动），**移除 Knex**
- 📦 自定义数据库迁移 & 种子脚本（TypeScript）
- 🔒 认证中间件（JWT + Session + Redis）
- 🖼️ 图片/封面上传至本地或腾讯云 COS
- 🌍 CORS 策略优化 + 请求日志
- 🧪 完整 API 分层：`/api/blog`（公开）、`/api/admin`（受保护）

---

## 🛠️ 技术栈

| 模块         | 技术                                             |
| ------------ | ------------------------------------------------ |
| **包管理**   | pnpm (workspace)                                 |
| **前端框架** | Vue 3 + TypeScript                               |
| **前台**     | Nuxt 4, Vue Router, i18n, Sass, Markdown-it      |
| **后台**     | Vite, Element Plus, ECharts, md-editor-v3, Pinia |
| **后端**     | Nuxt4, pg, redis, bcrypt, zod                    |
| **工具链**   | Oxlint, Prettier, unplugin-auto-import, vue-tsc  |
| **部署**     | 支持 SSR（Nuxt） + 静态预览                      |

---

## 🚀 本地开发

### 前置要求

- Node.js ≥ v20.19 或 ≥ v22.12
- pnpm ≥ v10
- PostgreSQL + Redis

### 安装依赖

```bash
pnpm install
```
