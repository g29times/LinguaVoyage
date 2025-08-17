## 部署说明（本地构建后直传到 Netlify）
### 前置确认：
在项目根目录创建 .env.local，至少包含：
    VITE_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY
    （可选）VITE_OPENROUTER_API_KEY、VITE_SUNRA_API_KEY

### 步骤（PowerShell）：
安装依赖并构建
    npm install
    npm run build
登录 Netlify（浏览器会弹出授权）
    npx netlify-cli login
新建并绑定站点（站点名尽量用“lingua-voyage”，若被占用会提示换名）
    npx netlify-cli sites:create --name "lingua-voyage"
    npx netlify-cli link
发布生产版（使用本地 dist，避免远端构建依赖环境变量）
    npx netlify-cli deploy --prod --dir=dist

### 说明：
已生成 netlify.toml，构建命令和 SPA 重写规则已就位。
如果 “lingua-voyage” 已被占用，Netlify 会提示你改名（可加轻量后缀）。
本流程使用本地构建，不依赖 Netlify 的环境变量；但若后续在 Netlify 仪表盘触发远端重建，请在那里补充 VITE_* 环境变量。

## Supabase Edge Function 原理与部署

### 核心概念与调用链
- __调用链__：浏览器 → `supabase/functions`（边缘函数，Deno 运行时）→ LLM 提供商 API → 标准化 JSON 返回给浏览器。
- __安全性__：LLM 提供商 API Key 仅保存在服务端（Edge Function 环境变量/Secrets），前端永不暴露。
- __业务闭环__：可在函数内做鉴权、限流、幂等、结果标准化；配合数据库 RPC（如 `supabase/sql/ip_rpcs.sql` 中的 `fn_mbti_save_and_charge`）实现“评估 → 扣费/记账 → 保存”的原子一致。

### 代码位置
- 函数目录：`supabase/functions/mbti-assess/`
- 前端调用：`src/services/mbti-assessment.ts` 中优先调用 Edge Function，再回退本地启发式。

### Secrets 与环境变量
- 在 Supabase 仪表盘或 CLI 设置函数所需 Secrets（例如 `OPENROUTER_API_KEY`）。
  - CLI 示例：`supabase secrets set OPENROUTER_API_KEY=**** --project-ref <PROJECT_REF> --env prod`
- Edge Function 通过 `Deno.env.get('OPENROUTER_API_KEY')` 读取，不要在前端注入此密钥。

### GitHub Actions 工作流与触发
- 工作流文件：``.github/workflows/deploy-functions.yml``
  ```yaml
  on:
    push:
      branches: [ main ]
      paths:
        - "supabase/functions/**"
    workflow_dispatch:
  ```
- __触发规则__：仅当 push 到 `main` 且本次变更触及 `supabase/functions/**` 路径时自动部署；否则不触发。
- __最佳实践__：保持 `branches + paths` 精确触发，避免无关推送占用 CI；需要临时手动发布时使用 `workflow_dispatch`（Actions 页面手动运行）。

### 本地开发与联调
1) 安装并登录 CLI：`supabase --version` / `supabase login`
2) 本地运行函数（可选跳过 JWT 校验便于调试）：
   - `supabase functions serve mbti-assess --no-verify-jwt`
3) 本地调用：
   - `POST http://localhost:54321/functions/v1/mbti-assess`
   - 生产/联调时携带 `Authorization: Bearer <JWT>`；纯本地快速验证可加 `--no-verify-jwt`。

### 部署到生产
- __CI 部署（推荐）__：推送满足触发条件后，Actions 使用 Supabase CLI 执行：
  - `supabase functions deploy mbti-assess --project-ref $SUPABASE_PROJECT_REF`
- __本地手动部署（备选）__：
  - 先 `supabase login`，再执行：`supabase functions deploy mbti-assess --project-ref <PROJECT_REF>`

### 观测与排障
- 查看日志：Supabase 仪表盘 → Edge Functions → Logs。
- 常见原因导致工作流未触发：
  - __未触及路径过滤__（只改了 `src/**`、`supabase/sql/**` 等）。
  - __分支不匹配__（未推送到 `main`）。
  - __手动跳过 CI__（Commit 信息含 `[skip ci]`）。
  - __Actions 权限/策略__（仓库未启用 Actions 或需要审批）。

### 推荐实践
- __安全优先__：密钥只在服务端；所有函数入口做鉴权/速率限制。
- __幂等性__：使用 `idempotency_key` 贯穿调用与扣费 RPC，避免重复扣费。
- __标准化输出__：Edge Function 统一返回结构化 JSON，前端逻辑简单稳健。
- __精确触发__：使用 `branches + paths` 作为默认策略；确需“每次 main push 都部署”时再移除 `paths`。

## 闭环架构变体：Edge Function 内调用 RPC 完成扣费与保存

### 适用场景
- __目标__：把“模型调用 + 扣费/记账 + 保存结果”在服务端一次完成，减少前端往返，控制面更集中。
- __优点__：更强的一致性、可观测性集中、前端更薄；便于加入重试/熔断/报警。
- __代价__：函数内需要访问数据库/RPC；要小心超时与重试导致的重复扣费，务必使用幂等键。

### 调用序列
1) 浏览器 → `mbti-assess`（携带用户 JWT）。
2) Edge 校验 JWT、解析请求、生成 `idempotency_key`（若未提供）。
3) Edge 调用 LLM，获取指标与置信度。
4) Edge 以“用户身份”（Bearer <JWT>）调用 PostgREST RPC `fn_mbti_save_and_charge`，提交 `indicators/confidence/metadata/idempotency_key`。
5) 成功：返回最终标准化结果；失败：根据错误类型回退或告警。

### 伪代码（TypeScript / Deno）
```ts
// supabase/functions/mbti-assess/index.ts（示意）
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

export default async (req: Request) => {
  const auth = req.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing JWT' }), { status: 401 });
  }
  const jwt = auth.replace('Bearer ', '');

  const { prompt, idempotency_key: k } = await req.json();
  const idempotency_key = k ?? crypto.randomUUID();

  // 1) 调用 LLM（略）
  const { indicators, confidence, model_raw } = await callLLM(prompt);

  // 2) 以“用户身份”调用 RPC（RLS 生效；RPC 为 security definer，承担原子扣费 + 保存）
  const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/fn_mbti_save_and_charge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      p_indicators: indicators,
      p_confidence: confidence,
      p_metadata: { source: 'edge', model_raw },
      p_idempotency_key: idempotency_key,
    }),
  });

  if (!rpcRes.ok) {
    const msg = await rpcRes.text();
    return new Response(JSON.stringify({ error: 'RPC failed', details: msg }), { status: 500 });
  }

  const saved = await rpcRes.json();
  return new Response(JSON.stringify({
    indicators,
    confidence,
    saved,
    idempotency_key,
  }), { headers: { 'Content-Type': 'application/json' } });
};
```

### 注意事项
- __幂等键__：由前端或 Edge 生成并贯穿，RPC 侧必须唯一约束/去重。
- __权限模型__：建议以用户 JWT 调用 RPC，既保留 RLS，又由 `security definer` 实现原子扣费；必要时再引入 Service Role 仅用于后台管理任务。
- __超时/重试__：函数层做超时保护与幂等重试，避免重复计费。
- __日志__：记录模型请求摘要、耗时、token/响应大小、RPC 结果与幂等键，便于审计与成本优化。