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
    
### 1. 环境变量与安全（已解决）
**问题：** Supabase 与 OpenRouter 密钥在前端暴露，存在安全与 CORS 风险。
**方案：**
- 将 `src/lib/supabase.ts` 改为使用 `import.meta.env.VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
- 完善 `.env.example` 与 `README.md` 的环境配置说明
- 将 OpenRouter 调用迁移至后端（Supabase Edge Function/轻服务），前端仅调用受控接口
- 过渡期：使用 `.env.local` 管理 `VITE_OPENROUTER_API_KEY`，并保留组件内回退逻辑

### 2. 数据库类型与代码一致性（已解决）
**问题：** 实际使用表未在 `Database` 类型中定义，易导致类型漂移/运行时错误。
**方案：**
- 在 `src/lib/supabase.ts` 的 `Database` 中补充 `app_24b6a0157d_learning_modules`、`app_24b6a0157d_user_module_progress`
- 为查询添加显式类型注解或采用 codegen 生成类型，提升类型安全
 - 注：当前后端仅存在 `user_id` 列，前端统一按 `user_id` 读取；如需切换为 `user_id_uuid`，应先在后端通过迁移或视图对齐，再更新前端与类型定义。

### 3. 进度与积分来源统一（已解决）
**问题：** MBTI 页面从多源读取积分，可能出现不一致。
**已实施：**
- 统一以 `progress.total_ip` 为优先数据源，回退 `userProgress.totalIP`
- `Dashboard.tsx`、`MBTIProgress.tsx`、`GamificationPanel.tsx` 的积分展示与解锁判断一致
- `MBTIProgress` 支持展示“当前/需要”IP，并在可解锁时“一键解锁”
- `src/lib/mockData.ts` 将 `mbti_vision.ip_cost` 调整为 25

### 4. MBTI 结果解析健壮性
**问题：** LLM JSON 输出偶发不规范。
**进展：** Supabase Edge Function 已将 LLM 输出解析为结构化 JSON，增加分数归一化与错误处理。
**待办：** 引入 `zod` 对 `MBTIAssessmentResult` 进行模式校验，进一步提升健壮性。

### 5. MBTI 重测扣费与历史展示（已实施）
**问题/目标：** 用户可随时查看历史评估；每次“成功评估”需扣 25 IP，解锁仅追加一次且不重复；并发与刷新应避免重复扣费。
**已实施：**
- `AIAssessmentResult.tsx`：预检积分（<25 阻止启动）、评估成功后原子写入 `mbti_indicators`、扣 25 IP、去重追加 `mbti_vision`。
- 请求去重：`requestDeduplicator` 防并发重复写；仅在写入成功后才 `setAssessment` 与刷新 UI。
- 历史展示：无新评估时展示 `progress.mbti_indicators` 的上次结果；按钮显示“Costs 25 IP”，余额不足禁用。
**验证点：** 每次成功重测仅扣一次；`unlocked_spells` 不重复；Dashboard 与 `/mbti` 积分/指标即时同步。
**后续：** 迁移为服务端原子 RPC + 积分流水，彻底规避边界并发风险。

### 6. 积分流水与原子化扣费（规划中）
**问题：** 用户看不到积分来源/去向；前端扣费+保存非原子，极端并发下可能二次扣费。
**方案：**
- 新表 `app_24b6a0157d_ip_ledger`：`id`、`user_id`、`direction(earn/spend)`、`amount`、`balance_after`、`source`、`idempotency_key`（唯一约束 `(user_id, idempotency_key)`）、`metadata`、`created_at`；RLS：仅本人可读，禁止客户端直接写。
- 原子 RPC `mbti_assess_commit`：单事务内“锁行/校验余额/扣费/更新指标/去重解锁/写流水”，支持幂等 `idempotency_key`。
- 前端改造：`AIAssessmentResult` 改为调用 RPC；仍保留预检与请求去重。
- UI：新增“Points History”页面与 Dashboard 最近流水组件，支持 Earn/Spend 筛选与分页。
**待办：** SQL 迁移（表/索引/RLS/RPC）、前端接入、历史期初余额补账（可选）。
服务端
    新建 app_24b6a0157d_ip_ledger 表、索引、RLS
    事务型 RPC mbti_assess_commit（锁行校验余额→扣费→更新指标→去重解锁→写流水，支持 idempotency_key）
前端
    AIAssessmentResult
    改为调用 RPC，保留预检与请求去重
    新增 “Points History” 页面与 Dashboard 最近流水组件

## 🟢 低优先级问题

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
