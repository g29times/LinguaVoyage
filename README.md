# 🌍 LinguaVoyage - AI-Powered Language Learning Platform

*Embark on your language learning journey with intelligent, interactive modules*

[中文](#中文说明) | [English](#english)

---

## English

### 🚀 About LinguaVoyage

LinguaVoyage is a cutting-edge language learning platform that combines artificial intelligence with modern web technologies to create an immersive and effective learning experience. Our platform features intelligent learning modules, personalized progress tracking, and a beautiful, responsive user interface.

### ✨ Key Features

- **🧠 AI-Driven Learning Modules**
  - Reading comprehension with interactive content
  - Vocabulary building with spaced repetition
  - Interactive exercises and quizzes
  - Adaptive learning paths

- **📊 Smart Progress Tracking**
  - Real-time learning analytics
  - Module completion validation
  - Personalized learning statistics
  - Achievement system

- **🎨 Modern User Experience**
  - Beautiful, responsive design
  - Seamless authentication system
  - Real-time data synchronization
  - Mobile-optimized interface

- **🔐 Secure & Scalable**
  - User authentication with OAuth support
  - Cloud-based data storage
  - Real-time updates
  - Edge function integration

### 🛠️ Technology Stack

**Frontend:**
- **React 18** - Modern component-based UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - High-quality component library
- **React Router** - Client-side routing
- **TanStack Query** - Server state management

**Backend & Services:**
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication & authorization
  - Edge functions
  - File storage

**Development Tools:**
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **PostCSS** - CSS processing

### 🚀 Quick Start

#### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/g29times/LinguaVoyage.git
   cd LinguaVoyage
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   # Windows (PowerShell)
   Copy-Item .env.example .env.local
   # macOS/Linux
   cp .env.example .env.local

   # Edit .env.local and fill these vars
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   # Optional for local direct OpenRouter calls (prod uses Edge Function)
   VITE_OPENROUTER_API_KEY=
   # Optional
   VITE_SUNRA_API_KEY=
   ```

   Notes:
   - Do NOT commit `.env.local`.
   - Place env files at project root (not inside `src/`).
   - Keys are read via `import.meta.env` in Vite.

4. **Start development server**
   ```bash
   pnpm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

#### Building for Production

```bash
# Build the application
pnpm run build

# Preview the build
pnpm run preview
```

### 🔌 Supabase Edge Function (OpenRouter proxy)

To avoid exposing keys and handle CORS, MBTI assessment calls a server-side function.

Path: `supabase/functions/mbti-assess/index.ts`

Deploy steps (using Supabase CLI):

```bash
# 1) Login and link (run once per machine/project)
supabase login
supabase link --project-ref <your-project-ref>

# 2) Set server secret (OpenRouter API key stays on server)
supabase secrets set OPENROUTER_API_KEY=sk-or-... 

# 3) Deploy the function
supabase functions deploy mbti-assess

# (Optional) Local serve for testing
supabase functions serve mbti-assess --env-file .env
```

Frontend calls:

```ts
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.functions.invoke('mbti-assess', {
  body: { prompt, model: 'google/gemini-2.5-flash-lite' },
});
```

Security:
- API keys are not shipped to the browser.
- Remove hardcoded keys from source; use env + server-side proxy.

### 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── learning/        # Learning module components
│   └── ui/              # Shadcn/ui components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── pages/               # Page components
├── utils/               # Helper functions
└── types/               # TypeScript type definitions
```

### 🎯 Current Features

- ✅ User authentication (Email + OAuth)
- ✅ Dashboard with learning modules
- ✅ Reading comprehension system
- ✅ Vocabulary learning with flashcards
- ✅ Interactive exercises
- ✅ Progress tracking and validation
- ✅ Responsive design
- ✅ Real-time data synchronization

### 🚧 Roadmap

- 🔄 AI-powered content generation
- 🔄 Speech recognition and pronunciation
- 🔄 Multi-language support expansion
- 🔄 Social learning features
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app development

### 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 中文说明

### 🚀 关于 LinguaVoyage

LinguaVoyage 是一个前沿的语言学习平台，结合人工智能与现代网络技术，创造沉浸式和高效的学习体验。我们的平台特色包括智能学习模块、个性化进度跟踪和美观响应式用户界面。

### ✨ 核心特性

- **🧠 AI驱动的学习模块**
  - 互动式阅读理解
  - 间隔重复词汇构建
  - 互动练习和测验
  - 自适应学习路径

- **📊 智能进度跟踪**
  - 实时学习分析
  - 模块完成验证
  - 个性化学习统计
  - 成就系统

- **🎨 现代用户体验**
  - 美观响应式设计
  - 无缝认证系统
  - 实时数据同步
  - 移动端优化界面

- **🔐 安全可扩展**
  - 支持OAuth的用户认证
  - 云端数据存储
  - 实时更新
  - 边缘函数集成

### 🛠️ 技术栈

**前端：**
- **React 18** - 现代组件化UI框架
- **TypeScript** - 类型安全开发
- **Vite** - 闪电般快速构建工具
- **Tailwind CSS** - 实用优先样式
- **Shadcn/ui** - 高质量组件库

**后端服务：**
- **Supabase** - 后端即服务平台
  - PostgreSQL 数据库
  - 实时订阅
  - 认证授权
  - 边缘函数

### 🚀 快速开始

请参考上方英文部分的安装指南。

### 🎯 当前功能

- ✅ 用户认证（邮箱 + OAuth）
- ✅ 学习模块仪表板
- ✅ 阅读理解系统
- ✅ 词汇学习和闪卡
- ✅ 互动练习
- ✅ 进度跟踪和验证

### 🚧 开发路线图

- 🔄 AI内容生成
- 🔄 语音识别和发音
- 🔄 多语言支持扩展
- 🔄 社交学习功能
- 🔄 高级分析仪表板

---

## 📧 Contact & Support

- **Project Maintainer**: NEO Team
- **GitHub Issues**: [Report bugs or request features](https://github.com/g29times/LinguaVoyage/issues)

---

<div align="center">
  <strong>🌟 Star this repository if you find it helpful! 🌟</strong>
  <br><br>
  Made with ❤️ by the NEO Team
</div>