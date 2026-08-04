# MindPath AI

一个用于记录、整理并公开分享 AI 学习笔记的交互式知识库。

项目通过 MDX 文档维护课程内容、前置关系、后续学习建议和术语表；网站将这些内容自动生成学习地图、笔记阅读器与真实学习进度。课程会随着个人学习过程持续补充，欢迎通过公开仓库参与讨论和改进。

- 作者：IceColaaa.（[GitHub @Ackow](https://github.com/Ackow)）
- 公开仓库：[Ackow/mindpath-ai](https://github.com/Ackow/mindpath-ai)

## 功能

- MDX 笔记阅读：目录跟随、公式、代码高亮、术语表和可勾选任务清单。
- 自动知识地图：根据文档 frontmatter 生成课程层级与前置依赖。
- 本地学习进度：任务完成度、章节状态、学习时长与学习热力图。
- 浏览器端 Python 代码运行与 Matplotlib 图像输出。
- 个人资料与学习数据 JSON 导出/导入，便于定期备份和恢复。
- 公开的内容与代码仓库，供学习记录与资料分享使用。

## 本地开发

```bash
npm install --legacy-peer-deps
npm run validate:content
npm run dev
```

访问 `http://localhost:3000`。

## 验证

```bash
npm run validate:content
npx tsc --noEmit
npm run build
```

## Cloudflare Workers 部署

项目使用 OpenNext 生成 Cloudflare Worker 产物：

```bash
npm run cf:build
npm run preview
npm run deploy
```

部署前请在 `wrangler.jsonc` 中确认 Worker 名称。学习进度和个人资料默认保存在浏览器本地；请在个人主页定期导出 JSON 备份。
