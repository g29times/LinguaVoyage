## 部署计划（本地构建后直传到 Netlify）
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