# LinguaVoyage - 待修复问题清单

## 🚨 高优先级问题

### 产品设计闭环
    用户体验、积分、MBTI解锁、成就、好友闭环
    
### 1. 环境变量与安全（已解决）
**问题：** Supabase 与 OpenRouter 密钥在前端暴露，存在安全与 CORS 风险。
**方案：**
- 将 `src/lib/supabase.ts` 改为使用 `import.meta.env.VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
- 完善 `.env.example` 与 `README.md` 的环境配置说明
- 将 OpenRouter 调用迁移至后端（Supabase Edge Function/轻服务），前端仅调用受控接口
- 过渡期：使用 `.env.local` 管理 `VITE_OPENROUTER_API_KEY`，并保留组件内回退逻辑

### 2. 数据库类型与代码一致性
**问题：** 实际使用表未在 `Database` 类型中定义，易导致类型漂移/运行时错误。
**方案：**
- 在 `src/lib/supabase.ts` 的 `Database` 中补充 `app_24b6a0157d_learning_modules`、`app_24b6a0157d_user_module_progress`
- 为查询添加显式类型注解或采用 codegen 生成类型，提升类型安全

### 3. 进度与积分来源统一
**问题：** MBTI 页面从多源读取积分，可能出现不一致。
**方案：**
- 统一以单一可信源计算/存储 `total_ip`
- 调整 `src/hooks/useUserProgress.ts`（及 `useUserData`）读取与刷新策略，提供一致的 `refreshProgress`

### 4. MBTI 结果解析健壮性
**问题：** LLM JSON 输出偶发不规范。
**方案：**
- 使用 `zod` 校验 `MBTIAssessmentResult` 结构
- 完善错误日志与回退策略，保证 UI 稳定

## 🟢 低优先级问题

### Review Module 按钮不显示（暂不做）
**问题：** 已完成课程仍显示"Start Module"而不是"Review Module"
**方案：** 检查完成状态查询逻辑，必要时增加 localStorage 兜底

## ✅ 已修复问题

- ✅ Section 计数不匹配（硬编码 vs 实际 sections）
- ✅ 未开发课程错误提示，已替换为 Coming Soon 降级页面
- ✅ JavaScript运行时错误导致应用崩溃
- ✅ Supabase 400 Bad Request错误
- ✅ Progress页面假数据(85%, 1,247, 156)
- ✅ 无限循环请求问题

## 📊 当前状态
- **应用状态：** 正常运行，无崩溃
- **开发服务器：** http://localhost:5174/
- **调试模式：** 已启用详细日志

---
*最后更新：2025-08-17*