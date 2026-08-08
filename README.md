# MindPath AI — 交互式 AI 知识图谱与学习路线通用框架


<p align="center">
  <strong>一个通用的、开箱即用的现代化 AI / 技术知识拓扑图谱与交互式学习路线图框架</strong>
</p>

<p align="center">
  <a href="https://github.com/Ackow/mindpath-ai"><img src="https://img.shields.io/github/stars/Ackow/mindpath-ai?style=flat-square&logo=github&color=0D9488" alt="GitHub Stars"></a>
  <a href="https://github.com/Ackow/mindpath-ai/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.style=flat-square" alt="License"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js" alt="Next.js"></a>
  <a href="https://pyodide.org/"><img src="https://img.shields.io/badge/Python-WASM%20(Pyodide)-3776AB?style=flat-square&logo=python" alt="Pyodide WASM"></a>
  <a href="https://pages.cloudflare.com/"><img src="https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?style=flat-square&logo=cloudflare" alt="Cloudflare Pages"></a>
</p>

---

## 📖 框架简介 (Framework Overview)

**MindPath AI** 不仅仅是一个具体的 AI 课程库，更是一个**通用、高度可定制的现代化技术知识图谱与互动学习路线图框架**。

任何作者或开发者只需通过撰写标准的 **MDX Markdown 文档** 并声明前置依赖关系，框架即可**自动编译生成动态拓扑依赖图谱**，并提供**浏览器端零后端代码运行器 (WASM)**、**可视化交互实验室**与**自测答题系统**。

---

## 🗺️ 仓库内容与大致学习路线 (Curriculum Roadmap)

本仓库内置了一套开箱即用的 AI 学习体系，分为以下 3 个核心阶段：

```mermaid
graph LR
    Stage0["阶段 0：准备知识<br/>(数学基础 & Python 专项)"] --> Stage1["阶段 1：机器学习<br/>(问题地图 / 工作流 / 可视化 / 实战)"]
    Stage1 --> Stage2["阶段 2：深度学习 & 现代 AI<br/>(神经元 / 神经网络 / 大模型)"]
```

1. **阶段 0：准备知识 (Foundations)**
   - **数学基础**：线性代数、特征值与 SVD、多元微积分与梯度、概率论与贝叶斯推断、假设检验；
   - **Python 专项**：语言基础、面向对象、NumPy 高性能计算、Pandas 数据分析；
2. **阶段 1：机器学习 (Machine Learning)**
   - 机器学习问题定义、防数据泄露规范 (Cutoff Time)、Matplotlib/Seaborn 可视化、实验工作流 Pipeline；
3. **阶段 2：深度学习与现代 AI (Deep Learning)**
   - 单个人工神经元、前向传播、反向传播与深度神经网络。

---

## 🚀 快速开始与运行 (Getting Started)

### 1. 安装依赖

```bash
# 克隆项目仓库
git clone https://github.com/Ackow/mindpath-ai.git
cd mindpath-ai

# 安装依赖 (建议使用 --legacy-peer-deps 选项)
npm install --legacy-peer-deps
```

### 2. 校验内容与生成图谱

在启动或构建前，运行内容校验与拓扑编译脚本：

```bash
# 1. 校验全站 MDX 的 Frontmatter 依赖与元数据合法性
npm run validate:content

# 2. 自动提取 MDX 依赖并生成全局图谱 JSON
node scripts/generate-graph.mjs
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 `http://localhost:3000` 预览学习图谱与课程。

---

## 📝 如何创建新文档 (How to Create Docs)

在 `content/` 目录下创建新的 `.mdx` 文件（例如 `content/machine-learning/05-decision-tree.mdx`）。每篇文档必须包含标准的 Frontmatter 元数据：

```mdx
---
id: ml-decision-tree                   # 唯一知识点 ID (必填，用于图谱节点关联)
title: 05. 决策树算法与信息熵            # 文章标题 (必填)
module: machine-learning               # 所属顶层模块 (如 foundations / machine-learning / deep-learning)
submodule: supervised                  # 所属子阶段/分组 ID (可选)
order: 5                               # 在子模块中的排序序号
difficulty: intermediate               # 难度: beginner | intermediate | advanced
prerequisites: [ml-problem-map]        # 前置知识依赖 ID 列表 (框架将据此自动连线生成拓扑图谱)
relatedNotes: [py-pandas]              # 关联参考笔记 ID 列表
nextNotes: [ml-random-forest]          # 推荐下一章笔记 ID 列表
map:
  layoutGroup: machine-learning        # 图谱布局分组
estimatedMinutes: 30                   # 预计阅读分钟数
tags: [决策树, 信息熵, 机器学习]         # 检索标签
summary: 理解信息增益、Gini 拆分与决策树构建原理。  # 简短摘要
---

# 05. 决策树算法与信息熵

正文 Markdown 内容...
```

> 💡 **提示**：创建/修改文档后，只需运行 `node scripts/generate-graph.mjs`，框架会自动将新文档编译进图谱并在网页端生成路由。

---

## 🧩 MDX 内置交互组件及使用说明 (Built-in MDX Components)

框架内置了丰富的 MDX 自定义组件，可直接在文章中像 HTML 标签一样嵌入使用：

### 1. 概念强调卡片 (`<ConceptCard>`)
用于突出显示核心结论、直觉或物理含义。

```mdx
<ConceptCard title="💡 核心直觉">
神经元先计算输入特征的加权和 $z = \sum w_i x_i + b$，再通过非线性激活函数产生输出。
</ConceptCard>
```

### 2. GitHub 风格提示框 (`<CalloutAlert>`)
支持 `NOTE`、`TIP`、`IMPORTANT`、`WARNING`、`CAUTION` 5 种级别。也可直接使用 GitHub Markdown 原生语法 `> [!NOTE]`。

```mdx
<CalloutAlert type="warning">
⚠️ 严禁在划分训练集与测试集之前执行特征缩放 (StandardScaler)，否则会导致严重的数据泄露！
</CalloutAlert>
```

### 3. WASM 交互代码块 (`<RunnableCodeBlock>`)
在浏览器沙盒内直接执行 Python 代码，支持变量打印与图形绘制。

```mdx
<RunnableCodeBlock title="用 Python 计算加权和">
{`import numpy as np

x = np.array([0.8, -0.4])
w = np.array([1.2, 0.7])
b = 0.3

z = np.dot(x, w) + b
print(f"z = {z:.2f}")`}
</RunnableCodeBlock>
```

### 4. 课后互动自测答题卡 (`<InteractiveQuiz>`)
支持单选、多选与代码预测题，包含即时正误高亮、抖动反馈与考点精讲展开。

```mdx
<InteractiveQuiz
  title="🎯 课后概念自测"
  questions={[
    {
      id: "q1",
      type: "single",
      question: "在对特征进行标准化时，Fit 步骤应该作用于？",
      options: [
        "A. 作用于全量数据集 (Train + Test)",
        "B. 仅作用于训练集 (Train)"
      ],
      answer: 1,
      explanation: "标定参数 fit 必须仅基于训练集计算，防范数据泄露。"
    }
  ]}
/>
```

### 5. 交互式算法实验室 (Custom Labs)
框架支持插入自定义的高性能动画实验室组件，如：
- `<MatplotlibParamsLab />`: 可视化调节 Matplotlib 绘图参数
- `<PandasDataImportLab />`: 演示 Pandas 数据流切片
- `<NeuronLab initialInputs={[0.8, -0.4]} />`: 神经元参数调优实验室

---

## 🚀 部署指南 (Deployment Guide)

框架采用生产级 **静态导出 (`output: 'export'`)** 架构，可发布至 Cloudflare Pages、Vercel 或 GitHub Pages。

### 1. 本地构建测试

```bash
npm run build
```

构建成功后，静态产物将生成在 `./out` 目录中。

### 2. Cloudflare Pages 自动部署

1. 在 Cloudflare Dashboard 中创建应用 $\rightarrow$ 选择 **Pages** $\rightarrow$ **Connect to Git**；
2. 绑定 GitHub 仓库，配置参数如下：
   - **Framework preset**: `Next.js (Static Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Node.js Version**: `20.x`
3. 保存后，每次向 `master` / `main` 分支 `git push`，Cloudflare 都会在云端自动构建并秒级发布上线！

---

## 📜 许可协议 (License)

本项目采用 [MIT License](LICENSE) 许可协议开源。
