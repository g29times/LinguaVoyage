# LinguaVoyage - 待修复问题清单
每次更新TODO时，将标记已解决的问题移入已修复问题列表（简述）。

## 📊 当前状态
- **应用状态：** 正常运行，无崩溃
- **开发服务器：** http://localhost:5174/
- **调试模式：** 已启用详细日志

---
*最后更新：2025-08-17*

## 🚨 高优先级问题

### 产品设计闭环
    用户体验、积分、MBTI解锁、成就、好友闭环
    课程由AI设计和生成，记忆系统

## 🟢 低优先级问题

### 后端余额视图/字段
积分余额后端支持：在 app_24b6a0157d_ip_ledger 增加 balance_after 或创建视图，便于跨分页/过滤展示准确余额（现在 
src/pages/Points.tsx
 仅在第一页、无筛选时前端回溯计算）。
 
### 按路由代码分割
在 vite.config.ts 使用 build.rollupOptions.output.manualChunks 或对重页面做动态 import，降低首包。

### MBTI 结果解析健壮性
**问题：** LLM JSON 输出偶发不规范。
**进展：** Supabase Edge Function 已将 LLM 输出解析为结构化 JSON，增加分数归一化与错误处理。
**待办：** 引入 `zod` 对 `MBTIAssessmentResult` 进行模式校验，进一步提升健壮性。

### 配置 Netlify 环境变量（用于将来远端重建）（待办）
为避免在 Netlify 仪表盘触发远端重建时因缺少环境变量而失败，请前往：
Site settings → Build & deploy → Environment，新增：
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- （可选）VITE_OPENROUTER_API_KEY、VITE_SUNRA_API_KEY

### Review Module 按钮不显示（暂不做）
**问题：** 已完成课程仍显示"Start Module"而不是"Review Module"
**方案：** 检查完成状态查询逻辑，必要时增加 localStorage 兜底

### Vite 构建内存占用（Windows）
**问题：** 构建阶段偶发 OOM。
**方案：** 提升 Node 可用内存后再构建（PowerShell）
```
$env:NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

## ✅ 已修复问题

 - ✅ 环境变量与安全：前端改用 `VITE_SUPABASE_URL/ANON_KEY`，完善 `.env.example`/`README`，`VITE_OPENROUTER_API_KEY` 暂存于 `.env.local` 并保留回退。
 - ✅ 数据库类型与一致性：补全 `Database` 类型，统一以 `user_id` 读取，避免 42703/表名回退等问题。
 - ✅ 进度与积分来源统一：以 `progress.total_ip` 为准，`Dashboard`/`MBTIProgress`/`GamificationPanel` 展示与解锁判断一致，MBTI 解锁成本为 25 IP。
 - ✅ 原子化扣费与积分流水：上线 `app_24b6a0157d_ip_ledger` + 安全策略，启用 RPC `fn_spend_ip_and_log`、`fn_mbti_save_and_charge`（security definer、幂等），前端接入并在生产验证通过。
 - ✅ 部署与域名：Netlify 站点 `lingua-voyage` 已上线（https://lingua-voyage.netlify.app），已配置 Supabase Auth 回调白名单。
 
- ✅ Section 计数不匹配（硬编码 vs 实际 sections）
- ✅ 未开发课程错误提示，已替换为 Coming Soon 降级页面
- ✅ JavaScript运行时错误导致应用崩溃
- ✅ Supabase 400 Bad Request错误
- ✅ Progress页面假数据(85%, 1,247, 156)
- ✅ 无限循环请求问题
- ✅ MBTI 置信度显示统一为百分比（0~1 → 0~100）
- ✅ 统一 MBTI 解锁成本与积分显示（Dashboard / MBTIProgress / GamificationPanel）
- ✅ 进度页支持一键解锁 MBTI Vision（25 IP）
- ✅ 后端 Edge Function 返回结构化 JSON，并增加解析/归一化与错误处理
 - ✅ 修复 Supabase 表名错误回退导致的 PGRST205：移除对 `public.user_progress` 的回退，仅访问 `public.app_24b6a0157d_user_progress`，并用 `maybeSingle()` 与默认值兜底
 - ✅ 修复列名不一致引发的 42703：去除对 `user_id_uuid` 的过滤，统一使用 `user_id` 读取，确认网络面板无相关错误
