# AI 学习知识库与知识地图网站 (AI Learning Map)

这是一个基于 **Next.js 14 (App Router) + TypeScript + Tailwind CSS + MDX + React Flow** 构建的纯静态个人 AI 学习知识库与交互学习平台。

## 🌟 核心特性

- 🧠 **全局与模块知识地图**：使用 React Flow 渲染可视化图谱，展示知识节点前置与后续依赖关系。
- 📖 **三栏 MDX 笔记阅读器**：支持 LaTeX 数学公式 ($z = \sum w_i x_i + b$)、交互定义卡片与全自动目录跟踪。
- 🧪 **交互实验室 (Interactive Labs)**：动态调节神经元输入、权重与偏置，实时观察数据流与 Python 结果。
- 💻 **浏览器端代码执行**：受控受限代码运行环境。
- 🔒 **纯静态与数据备份**：零后端服务器，学习进度保存在浏览器 LocalStorage，支持 JSON 导出与恢复。

## 🚀 开发指南

### 本地启动

```bash
# 1. 安装依赖
npm install

# 2. 内容校验
npm run validate:content

# 3. 启动本地开发服务
npm run dev
```

打开浏览器访问 `http://localhost:3000`。

### 静态编译构建

```bash
npm run build
```

编译完成后产物将生成在 `out/` 文件夹，可以直接打包托管于 GitHub Pages、Vercel 或 Cloudflare Pages。
