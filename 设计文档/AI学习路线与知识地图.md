# AI 学习路线与知识地图

> 目标：按依赖关系学习人工智能，而不是按零散视频学习。每章均应产出一篇笔记、一个可运行示例、3～5 个自测题，并在知识地图中建立前置与后续关系。

## 路线总览

```text
0. 编程、数学与数据基础
1. 机器学习通识与问题定义
2. 监督学习
3. 评估、泛化与可靠性
4. 无监督学习与推荐
5. 深度学习基础
6. 视觉 / NLP 与 LLM / 强化学习 / 生成模型与工程化（专项）
```

全路线包含 35 个核心章节。完成阶段 0～4 即可独立完成传统机器学习项目；完成阶段 5 后再选择一个专项深入，避免并行学习过多方向。

## 知识地图与文档关系配置规范

知识地图采用“文档 frontmatter 为事实来源、`global.json` 为生成产物、少量覆盖配置负责视觉调整”的模式。新增或修改文章时，优先维护 MDX 开头的 YAML 字段，不直接手工维护 `maps/global.json` 的重复信息。

### 1. 文档 frontmatter

每篇文章应配置：

```yaml
id: py-basics
title: 变量、类型与表达式
module: foundations
submodule: python
order: 2
difficulty: beginner
prerequisites: [py-environment]
estimatedMinutes: 20
tags: [Python, 变量, 数据类型]
summary: 强类型与动态类型机制、基本数据类型和表达式。
```

| 字段 | 作用 |
|---|---|
| `id` | 全局唯一文档/节点 ID |
| `title` | 文章标题、地图节点和目录标题 |
| `module`、`submodule` | 归属课程模块，必须对应 `curriculum.json` 中的 ID |
| `order` | 同一专题内的显示顺序 |
| `difficulty` | `beginner`、`intermediate` 或 `advanced` |
| `prerequisites` | 硬性学习前置，生成 `前置 → 当前` 有向边 |
| `estimatedMinutes`、`tags`、`summary` | 阅读时长、检索筛选和卡片导读 |
| `symbols` | 可选术语/公式符号表，是笔记页右侧“核心概念术语表”或“核心公式符号表”的数据源，不参与地图生成 |

### 2. 文档之间的关系

在 frontmatter 中统一使用下列关系字段：

```yaml
prerequisites: [py-environment]
relatedNotes: [py-data-structures, math-07-vector-matrix]
nextNotes: [py-control-flow]
```

- `prerequisites`：学习依赖关系。引用的文档必须先学，是知识地图的有向边来源。
- `relatedNotes`：主题关联关系。用于右侧“关联推荐笔记”和搜索推荐，不参与拓扑排序。
- `nextNotes`：可选的作者推荐后续关系。若未填写，生成器会根据其他文章的 `prerequisites` 反向推导后续节点；仅在需要表达“推荐但非硬前置”的分支时填写。

规则：`prerequisites` 不允许引用自身或形成环；`nextNotes` 与反向推导结果去重；删除或重命名文档前必须更新全部关系引用；`relatedNotes` 可单向或双向。

### 3. 地图布局与显示覆盖

默认坐标由生成器根据模块、依赖层级与 `order` 计算。需要人工微调时，可在 frontmatter 中增加：

```yaml
map:
  hidden: false
  layoutGroup: python-core
  position: {x: 660, y: 20}
  collapsedByDefault: false
  accent: teal
```

- `hidden`：是否从地图隐藏，默认 `false`；隐藏文章仍可通过路由访问。
- `layoutGroup`：稳定的自动布局分组。
- `position`：可选人工坐标覆盖；未填写时自动布局。
- `collapsedByDefault`：模块或子模块首次进入地图时的折叠状态。
- `accent`：节点视觉色彩语义名，不在文章中直接写 CSS。

坐标优先级：`maps/overrides.json` > frontmatter `map.position` > 自动布局结果。

### 4. `global.json` 自动生成

`maps/global.json` 是派生文件，由 `scripts/generate-graph.mjs` 扫描全部 `content/**/*.mdx` 后生成。生成器负责：

1. 校验 ID 唯一性和必填字段。
2. 依据文件路径生成真实文章路由。
3. 依据 `prerequisites` 生成边，并反向计算 `next`。
4. 按 `module`、`submodule`、`order` 生成默认布局。
5. 合并 frontmatter `map` 与 `maps/overrides.json` 的视觉覆盖。
6. 检查无效引用、循环依赖、重复路由和孤立节点。

派生节点示例：

```json
{
  "id": "py-basics",
  "route": "/learn/foundations/python/02-py-basics",
  "prerequisites": ["py-environment"],
  "next": ["py-control-flow", "py-data-structures"],
  "position": {"x": 660, "y": 20}
}
```

`route`、`next`、依赖边和坐标均可重新生成。用户的任务勾选和完成状态不写回 `global.json`，而保存为浏览器中的单文档进度 JSON。

### 5. 模块目录与工作流

`content/_meta/curriculum.json` 继续负责阶段、模块文案、图标、颜色和计划章节数；MDX 文件代表实际已存在的文章。生成/校验必须报告计划与文章的差异：未创建文章、未归属模块、或不存在的 `module`/`submodule` 都应明确报错或提示。

```text
修改或新增 MDX frontmatter
        ↓
npm run generate:graph
        ↓
npm run validate:content
        ↓
git diff --check
```

生成器与校验器应在 CI 中运行。提交时审查源 MDX、`curriculum.json` 和必要的 `maps/overrides.json`；`global.json` 的变化必须能由命令稳定复现。

## 阶段 0：编程、数学与数据基础（6 章）

### 0.1 Python 与科学计算

- Python 基础：函数、类、异常、文件、虚拟环境与包管理。
- Jupyter Notebook 的变量状态与可复现实验。
- NumPy：数组、索引、广播、向量化、随机数。
- pandas：读取、清洗、分组、合并与透视。
- Matplotlib：折线、散点、直方图、热图。
- Git/GitHub：提交、分支、README 与 `.gitignore`。

### 0.2 线性代数

- 向量、矩阵、张量、shape、点积、范数、投影与余弦相似度。
- 矩阵乘法、转置、逆、秩、迹与线性变换。
- 特征值、特征向量、正定矩阵。
- SVD 及其与 PCA、低秩近似的关系。

### 0.3 微积分与优化

- 偏导、梯度、方向导数、Jacobian、Hessian。
- 链式法则与计算图。
- 梯度下降、随机梯度下降、mini-batch。
- 学习率、局部极值、鞍点、凸与非凸优化。

### 0.4 概率与统计

- 随机变量、常见分布、期望、方差、协方差。
- 条件概率、贝叶斯公式、独立性。
- 大数定律、中心极限定理。
- MLE、MAP、置信区间、假设检验。
- 高斯噪声与平方误差、伯努利分布与交叉熵的联系。

### 0.5 数据处理与特征工程

- 数据类型、缺失值、重复项、异常值与数据泄漏。
- 训练/验证/测试集；分层、分组和时间切分。
- 标准化、归一化、类别编码、特征构造与特征选择。
- 数据版本、标签质量、样本代表性。

### 0.6 实验与工程习惯

- 随机种子、配置、日志、实验记录、基线模型。
- 数据校验、单元测试、训练与推理一致性。
- 错误样本分析；论文阅读的“问题—方法—实验—局限”框架。

**阶段产出**：完成一个公开表格数据集的加载、清洗、可视化与基线报告。

## Python for AI 专项路线（12 章）

Python 是阶段 0 的第一个可独立完成模块，也是后续 NumPy、数据处理、机器学习和深度学习代码的前置。建议先完成本专项，再进入线性代数和机器学习模型。

```text
Python 环境 → 基础语法 → 数据结构 → 函数/模块 → 文件/异常/测试
      ↓
NumPy → pandas → 可视化 → 数据工作流 → AI 实验规范 → 小项目
```

### PY01：环境、解释器与 Notebook

- Python 版本、解释器、`python`/`pip`、虚拟环境 `venv`。
- VS Code、Jupyter Notebook、`.py` 与 `.ipynb` 的用途差异。
- 单元格运行顺序、内核状态、重启内核和“从头运行全部”。
- `print()`、注释、帮助文档、导入包。
- 项目目录、`requirements.txt`、`.gitignore` 的最小规范。

**验收**：创建虚拟环境，运行一个 Notebook 和一个 Python 脚本，并将依赖写入文件。

### PY02：变量、基本类型与表达式

- 整数、浮点数、布尔值、字符串、`None`。
- 算术、比较、逻辑、成员和身份运算符。
- 类型转换、真值判断、浮点数精度。
- f-string、字符串切片和常用方法。
- 可变/不可变对象的初步概念。

**AI 连接**：理解数值、布尔掩码和超参数的基础表示。

### PY03：控制流与推导式

- `if/elif/else`、`for`、`while`、`break`、`continue`。
- `range`、`enumerate`、`zip`。
- 列表/集合/字典推导式。
- 基础算法复杂度直觉，避免不必要的嵌套循环。

**AI 连接**：遍历样本、批次、类别和训练轮次。

### PY04：核心数据结构

- `list`、`tuple`、`set`、`dict` 的创建、访问、修改和常用方法。
- 切片、解包、浅拷贝/深拷贝的区别。
- 字典计数、集合去重、嵌套结构。
- 何时使用列表，何时应改用 NumPy 数组或 pandas DataFrame。

**AI 连接**：用字典存配置/指标，用列表存样本与训练历史。

### PY05：函数、作用域与函数式工具

- 函数定义、参数、默认值、位置/关键字参数、返回值。
- 局部/全局作用域、可变默认参数陷阱。
- `*args`、`**kwargs`、lambda、`map`/`filter` 的适用边界。
- docstring、类型标注、可复用函数设计。

**AI 连接**：将数据加载、训练、评估、绘图拆成可测试函数。

### PY06：模块、包、面向对象与配置

- `import`、模块路径、包、`__init__.py`。
- 类、实例、方法、继承只学到能读懂常见库 API。
- `dataclass`、配置字典与简单配置文件。
- 解释 `if __name__ == '__main__'`。

**AI 连接**：读懂 `Dataset`、模型类和训练配置，而非过早设计复杂类层级。

### PY07：文件、异常、调试与测试

- `pathlib`、文本/CSV/JSON 的读写，编码明确使用 UTF-8。
- `try/except/finally`、自定义异常信息。
- 断言、日志、调试器、最小单元测试。
- 不提交密钥、数据集大文件和 Notebook 临时输出。

**AI 连接**：安全加载数据、保存实验配置和定位训练失败原因。

### PY08：NumPy 数值计算

- `ndarray`、shape、dtype、索引、切片、布尔索引。
- 广播、向量化、逐元素运算、矩阵乘法、聚合。
- 随机数生成器、种子、随机采样。
- 避免 Python 循环，实现向量/矩阵运算。

**AI 连接**：线性回归、神经元加权和、批量计算的直接前置。

### PY09：pandas 数据处理

- `Series`、`DataFrame`、读取 CSV/Excel/JSON。
- 缺失值、重复值、类型转换、筛选、排序。
- `groupby`、聚合、合并、透视表、时间列。
- EDA 的最小检查：行数、列类型、分布、空值、标签分布。

**AI 连接**：模型前的数据理解、清洗和特征准备。

### PY10：可视化与结果解释

- Matplotlib 的 Figure/Axes、折线、散点、柱状、直方、热图。
- 坐标轴、图例、标题、颜色与可读性。
- 用图发现异常值、类别不均衡、相关性和训练曲线。
- 保存图像，不把图形当成数据结论本身。

**AI 连接**：损失曲线、混淆矩阵、特征分布和预测误差图。

### PY11：AI 数据与实验工作流

- 数据加载 → 清洗 → 划分 → 特征处理 → 基线 → 评估的代码组织。
- 随机种子、配置、指标字典、训练历史、日志。
- 训练/验证/测试集绝不混用；预处理只在训练集拟合。
- `scikit-learn` 的 `Pipeline`、`fit`、`transform`、`predict` 的基础约定。

**验收**：用固定随机种子复现实验，输出可解释的指标和图表。

### PY12：综合小项目——鸢尾花分类分析

- 读取数据、做 EDA、可视化类别/特征分布。
- 划分训练和测试集，建立逻辑回归或 kNN 基线。
- 输出准确率和混淆矩阵，检查错误样本。
- 将流程拆成函数，在 README 中说明运行步骤、局限和下一步改进。

**验收**：代码可从空环境按说明运行；能解释每步的输入、输出和目的。

### Python 专项的知识地图节点

| 顺序 | 节点 ID | 标题 | 前置 |
|---:|---|---|---|
| 1 | `py-environment` | Python 环境与 Notebook | 无 |
| 2 | `py-basics` | 变量、类型与表达式 | `py-environment` |
| 3 | `py-control-flow` | 控制流与推导式 | `py-basics` |
| 4 | `py-data-structures` | 核心数据结构 | `py-basics` |
| 5 | `py-functions` | 函数与作用域 | `py-control-flow`, `py-data-structures` |
| 6 | `py-modules` | 模块、包与配置 | `py-functions` |
| 7 | `py-files-debugging` | 文件、异常、调试与测试 | `py-modules` |
| 8 | `py-numpy` | NumPy 数值计算 | `py-functions`, `math-vector` |
| 9 | `py-pandas` | pandas 数据处理 | `py-files-debugging` |
| 10 | `py-visualization` | 可视化 | `py-numpy`, `py-pandas` |
| 11 | `py-ml-workflow` | AI 数据与实验工作流 | `py-numpy`, `py-pandas`, `py-visualization` |
| 12 | `py-iris-project` | 鸢尾花分类小项目 | `py-ml-workflow` |

## 阶段 1：机器学习通识与问题定义（3 章）

### 1.1 机器学习问题地图

- 监督、无监督、半监督、自监督、强化学习。
- 回归、分类、排序、聚类、降维、异常检测与推荐。
- 特征 `X`、标签 `y`、模型、参数、损失、优化、泛化。

### 1.2 业务目标转化

- 定义样本、标签、预测目标与决策动作。
- 选择指标：分类的 Precision/Recall/F1/AUC；回归的 MAE/RMSE；排序的 NDCG。
- 理解漏检、误报和类别不均衡的业务代价。

### 1.3 端到端 ML 流程

- 任务定义 → EDA → 数据切分 → 基线 → 训练 → 评估 → 错误分析 → 迭代。
- 数据中心方法：先解决数据覆盖、标注质量与泄漏，再调复杂模型。

## 阶段 2：监督学习（7 章）

机器学习主干共 12 章：本阶段 7 章、阶段 3 的 3 章、阶段 4 的聚类和降维 2 章。

### 2.1 线性回归

- 一元/多元回归、设计矩阵、残差、MSE。
- 正规方程与梯度下降。
- 特征尺度、残差分析、离群点与线性假设。
- NumPy 从零实现，再用 `LinearRegression` 验证。

### 2.2 正则化线性模型

- 过拟合、Ridge、Lasso、Elastic Net。
- L1 稀疏性、L2 收缩、多项式/基函数特征。
- 使用交叉验证选择正则化强度。

### 2.3 逻辑回归与广义线性模型

- sigmoid、logit、决策边界、最大似然、二元交叉熵。
- 多分类 Softmax 与交叉熵。
- 概率输出、阈值选择、类别不平衡与校准。

### 2.4 kNN 与朴素贝叶斯

- 距离度量、k 的选择、特征缩放、维度灾难。
- 高斯/多项式/伯努利朴素贝叶斯与拉普拉斯平滑。
- 小数据和文本分类基线。

### 2.5 SVM 与核方法

- 最大间隔、软间隔、hinge loss、参数 `C`。
- 支持向量、RBF/多项式核、核技巧。
- 计算代价和模型适用边界。

### 2.6 决策树

- 递归划分、Gini、信息熵、信息增益、回归树误差。
- 最大深度、最小样本、剪枝与过拟合。
- 特征重要性与可解释规则。

### 2.7 集成学习

- Bagging、Bootstrap、OOB、随机森林。
- Boosting、残差拟合、AdaBoost、Gradient Boosting、XGBoost/LightGBM。
- 学习率、树深度、轮数与早停。

**阶段项目**：在同一表格数据集上比较线性模型、随机森林和梯度提升树，完成错误分析。

## 阶段 3：评估、泛化与可靠性（3 章）

### 3.1 评估与验证策略

- 混淆矩阵、Accuracy、Precision、Recall、F1、ROC-AUC、PR-AUC。
- MAE、MSE、RMSE、R²、分位数损失。
- 留出法、k 折、分层、嵌套交叉验证；时间序列与分组切分。

### 3.2 泛化与偏差—方差

- 训练误差、测试误差、欠拟合、过拟合、偏差、方差。
- 学习曲线、验证曲线与诊断。
- 数据量、模型复杂度、正则化、早停和数据增强。

### 3.3 可解释性与可靠性

- 特征重要性、部分依赖图、SHAP 的用途与限制。
- 相关与因果、混杂变量、选择偏差。
- 公平性、分布漂移、概念漂移、隐私与数据授权。

## 阶段 4：无监督学习与推荐系统（5 章）

### 4.1 聚类

- K-means 的初始化、分配—更新、SSE、局部最优。
- 肘部法、轮廓系数、层次聚类、DBSCAN。
- 聚类假设与结果解释。

### 4.2 概率聚类

- GMM、软分配、后验概率、EM 的 E/M 步。
- 与 K-means 的关系、协方差对簇形状的影响。

### 4.3 降维

- 维度灾难、压缩、可视化、去噪、特征提取。
- PCA 的方差最大化、协方差矩阵和 SVD 视角。
- t-SNE/UMAP 的可视化用途和误读风险。

### 4.4 异常检测

- 异常、噪声、新类别的区别。
- 统计阈值、Isolation Forest、One-Class SVM。
- 极度不均衡下的评估。

### 4.5 推荐与排序

- 显式/隐式反馈、用户—物品矩阵。
- 内容推荐、协同过滤、矩阵分解、冷启动与流行度偏差。
- 召回、排序、重排；Recall@K、NDCG。

**阶段项目**：完成电影/商品推荐小系统，对比热门推荐、内容推荐和协同过滤。

## 阶段 5：深度学习基础（6 章）

### 5.1 神经元与 MLP

- 加权和、偏置、感知机、线性不可分。
- MLP 的深度、宽度、表示能力。
- ReLU、sigmoid、tanh、GELU 与初始化。

### 5.2 前向传播与反向传播

- 计算图、前向缓存、分类/回归损失。
- 链式法则、自动微分、梯度检查。
- 梯度消失与爆炸。

### 5.3 优化器与训练循环

- SGD、Momentum、RMSProp、Adam、AdamW。
- batch、epoch、调度器、warmup、权重衰减。
- 训练、验证、checkpoint 与可复现实验。

### 5.4 正则化和迁移学习

- dropout、BatchNorm、LayerNorm、早停、数据增强、标签平滑。
- 预训练、微调、冻结层。

### 5.5 PyTorch 实现

- Tensor、Dataset、DataLoader、`nn.Module`、device、dtype。
- 训练/评估模式、模型保存与加载、推理。

### 5.6 表示学习与嵌入

- embedding、相似度检索、类别/词嵌入。
- 对比学习与自监督学习的基本思想。

**阶段项目**：使用 PyTorch 完成图像或文本分类，并提交训练曲线、错误样本和迁移学习对比。

## 阶段 6：可选专项

### 6A 计算机视觉（4 章）

1. **CNN 基础**：图像张量、卷积、padding、stride、池化、感受野、特征图。
2. **视觉骨干**：ResNet、Inception、DenseNet、EfficientNet、ViT 与迁移学习。
3. **视觉任务**：分类、多标签、检测（IoU/NMS/mAP）、分割（FCN/U-Net）、OCR/关键点。
4. **数据与部署**：增强、标注噪声、分组切分、量化、延迟、鲁棒性评估。

### 6B NLP、Transformer 与 LLM（6 章）

1. **传统 NLP**：分词、n-gram、TF-IDF、朴素贝叶斯、词向量、文本分类/检索/摘要任务。
2. **序列模型**：RNN、BPTT、LSTM、GRU、seq2seq、teacher forcing、beam search。
3. **Transformer**：位置编码、Q/K/V、多头注意力、残差、LayerNorm、Encoder/Decoder、因果掩码。
4. **语言模型与推理**：MLM/CLM、BPE/WordPiece、temperature、top-k/top-p、KV cache、幻觉。
5. **微调和对齐**：指令微调、PEFT、LoRA、RLHF/DPO、自动/人工评测、安全与版权。
6. **RAG 与 Agent**：切块、嵌入、检索、重排序、引用、工具调用、记忆、权限边界。

**专项项目**：为本知识库实现带文章和章节引用的 RAG 问答，先做关键词检索，再比较向量检索。

### 6C 强化学习（4 章）

1. **MDP**：状态、动作、奖励、回报、策略、价值函数、Bellman 方程、探索利用。
2. **价值方法**：动态规划、Monte Carlo、TD、Q-learning、SARSA、DQN。
3. **策略方法**：REINFORCE、advantage、Actor-Critic、PPO、SAC、on/off-policy。
4. **实践安全**：环境、奖励设计、样本效率、奖励黑客、离线 RL、仿真到现实。

### 6D 生成模型与 AI 工程（4 章）

1. **生成模型**：生成/判别模型、Autoencoder、VAE、GAN、Diffusion 的核心直觉。
2. **实验管理**：数据/模型版本、实验追踪、模型注册、环境锁定、测试。
3. **部署监控**：批/在线推理、API、容器、吞吐、延迟、成本、漂移、灰度与回滚。
4. **作品集**：需求、数据许可、baseline、消融、Demo、README、模型卡与局限性。

## 建议节奏与里程碑

| 里程碑 | 完成范围 | 可证明的能力 |
|---|---|---|
| M1 数据分析者 | 阶段 0～1 | 能定义任务、清洗数据、建立基线 |
| M2 传统 ML 实践者 | 阶段 2～4 | 能训练、比较和解释常见 ML 模型 |
| M3 深度学习实践者 | 阶段 5 | 能用 PyTorch 训练、诊断与微调模型 |
| M4 专项开发者 | 任一 6A/6B/6C | 能完成一个领域项目 |
| M5 AI 工程实践者 | 6D + 一个专项 | 能部署、评估和维护端到端原型 |

建议每周 6～8 小时：理论与笔记 2 小时、代码复现 2 小时、练习 1～2 小时、项目与复盘 1～2 小时。

## 路线来源（检索日期：2026-08-03）

本目录由下列公开课程、教材和开源仓库交叉整理，本站仅保存自己的总结与原创代码，不复制受版权保护内容：

- Stanford CS229：https://cs229.stanford.edu/
- MIT 6.036：https://ocw.mit.edu/courses/6-036-introduction-to-machine-learning-fall-2020/
- DeepLearning.AI Machine Learning Specialization：https://www.deeplearning.ai/specializations/machine-learning
- ISLR：https://www.statlearning.com/
- ESL：https://link.springer.com/book/10.1007/978-0-387-21606-5
- D2L：https://d2l.ai/ ，GitHub：https://github.com/d2l-ai
- fast.ai：https://course.fast.ai/ ，GitHub：https://github.com/fastai/courses
- Stanford CS231n：https://cs231n.stanford.edu/
- Hugging Face LLM Course：https://huggingface.co/learn/llm-course/
- OpenAI Spinning Up：https://spinningup.openai.com/ ，GitHub：https://github.com/openai/spinningup
