'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Code2, LineChart, Sparkles, BarChart2, PieChart, Layers } from 'lucide-react';

export function MatplotlibParamsLab() {
  // Chart Type Selector State (2D AI Plots only, 3D removed)
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter' | 'heatmap'>('line');

  // Theme Style Preset
  const [themeStyle, setThemeStyle] = useState<'default' | 'seaborn' | 'dark'>('default');

  // Common Text & Axis Controls
  const [chartTitle, setChartTitle] = useState<string>('Model Training Performance');
  const [xLabelText, setXLabelText] = useState<string>('Epochs / Features');
  const [yLabelText, setYLabelText] = useState<string>('Loss / Value');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Line Chart Specific Params
  const [lineColor, setLineColor] = useState<string>('#0d9488');
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted' | 'dashdot'>('solid');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [marker, setMarker] = useState<'circle' | 'square' | 'triangle' | 'star' | 'none'>('circle');
  const [showAnnotate, setShowAnnotate] = useState<boolean>(true);

  // Bar Chart Specific Params
  const [barColor, setBarColor] = useState<string>('#6366f1');
  const [barWidth, setBarWidth] = useState<number>(0.6);
  const [showValuesOnBar, setShowValuesOnBar] = useState<boolean>(true);

  // Scatter Plot Specific Params
  const [scatterCmap, setScatterCmap] = useState<'viridis' | 'plasma' | 'coolwarm'>('viridis');
  const [pointSize, setPointSize] = useState<number>(7);

  // SVG Dimensions
  const width = 460;
  const height = 230;
  const padding = 42;

  // Dynamic SVG Marker rendering helper
  const renderSvgMarker = (cx: number, cy: number, key: any) => {
    if (marker === 'none') return null;
    const r = lineWidth + 2.5;

    if (marker === 'square') {
      return <rect key={key} x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={lineColor} stroke="#ffffff" strokeWidth={1.5} rx={1} />;
    }
    if (marker === 'triangle') {
      const points = `${cx},${cy - r - 2} ${cx - r - 1},${cy + r} ${cx + r + 1},${cy + r}`;
      return <polygon key={key} points={points} fill={lineColor} stroke="#ffffff" strokeWidth={1.5} />;
    }
    if (marker === 'star') {
      return (
        <polygon
          key={key}
          points={`${cx},${cy - r - 3} ${cx + 2.5},${cy - 1} ${cx + r + 2},${cy - 1} ${cx + 4},${cy + 2.5} ${cx + 6},${cy + r + 2} ${cx},${cy + 5} ${cx - 6},${cy + r + 2} ${cx - 4},${cy + 2.5} ${cx - r - 2},${cy - 1} ${cx - 2.5},${cy - 1}`}
          fill={lineColor}
          stroke="#ffffff"
          strokeWidth={1}
        />
      );
    }
    // Default: Circle
    return <circle key={key} cx={cx} cy={cy} r={r} fill={lineColor} stroke="#ffffff" strokeWidth={1.5} />;
  };

  // Stroke Dash Array helper
  const getStrokeDashArray = (style: string) => {
    switch (style) {
      case 'dashed': return '8 5';
      case 'dotted': return '3 3';
      case 'dashdot': return '9 4 3 4';
      default: return 'none';
    }
  };

  // Code Generation Helper
  const getPythonCode = () => {
    const lsMap = { solid: "'-'", dashed: "'--'", dotted: "':'", dashdot: "'-.'" };
    const markerMap = { circle: "'o'", square: "'s'", triangle: "'^'", star: "'*'", none: "None" };

    let code = `import matplotlib.pyplot as plt\nimport numpy as np\n\n`;

    if (themeStyle !== 'default') {
      code += `plt.style.use('${themeStyle === 'seaborn' ? 'seaborn-v0_8' : 'dark_background'}')\n`;
    }

    if (chartType === 'line') {
      code += `# 1. 创建 Figure 与 Axes\nfig, ax = plt.subplots(figsize=(8, 5))\n\n`;
      code += `# 2. 绘制 Loss 训练与验证曲线\nax.plot(epochs, train_loss, color='${lineColor}', linestyle=${lsMap[lineStyle]}, linewidth=${lineWidth}, marker=${markerMap[marker]}, label='Train Loss')\n`;
      code += `ax.plot(epochs, val_loss, color='#f43f5e', linestyle='--', label='Val Loss')\n\n`;
      code += `# 3. 标签与标注\nax.set_title('${chartTitle}', fontsize=12, fontweight='bold')\nax.set_xlabel('${xLabelText}')\nax.set_ylabel('${yLabelText}')\n`;
      if (showAnnotate) code += `ax.annotate('Min Loss: 0.14', xy=(7, 0.14), xytext=(5, 0.38), arrowprops=dict(facecolor='gold', shrink=0.05))\n`;
      if (showGrid) code += `ax.grid(True, linestyle="--", alpha=0.5)\n`;
      if (showLegend) code += `ax.legend(loc='upper right')\n`;
    } else if (chartType === 'bar') {
      code += `# 1. 创建柱状图\nfig, ax = plt.subplots(figsize=(8, 5))\ncategories = ['Class A', 'Class B', 'Class C', 'Class D']\nvalues = [88, 92, 79, 95]\n\n`;
      code += `bars = ax.bar(categories, values, color='${barColor}', width=${barWidth})\n`;
      if (showValuesOnBar) code += `ax.bar_label(bars, padding=3)\n`;
      code += `ax.set_title('${chartTitle}')\nax.set_xlabel('${xLabelText}')\nax.set_ylabel('${yLabelText}')\n`;
      if (showGrid) code += `ax.grid(axis='y', linestyle='--', alpha=0.5)\n`;
    } else if (chartType === 'scatter') {
      code += `# 1. 高维散点图\nfig, ax = plt.subplots(figsize=(8, 5))\n`;
      code += `scatter = ax.scatter(x_data, y_data, c=colors, s=${pointSize * 10}, cmap='${scatterCmap}', alpha=0.8)\n`;
      code += `fig.colorbar(scatter, ax=ax, label='Probability Density')\n`;
      code += `ax.set_title('${chartTitle}')\nax.set_xlabel('${xLabelText}')\nax.set_ylabel('${yLabelText}')\n`;
    } else if (chartType === 'heatmap') {
      code += `import seaborn as sns\n\n# 1. 绘制混淆矩阵热力图\nfig, ax = plt.subplots(figsize=(6, 5))\nconfusion_matrix = [[45, 3], [5, 47]]\n`;
      code += `sns.heatmap(confusion_matrix, annot=True, fmt='d', cmap='Blues', ax=ax)\n`;
      code += `ax.set_title('${chartTitle}')\nax.set_xlabel('Predicted Label')\nax.set_ylabel('True Label')\n`;
    }

    code += `plt.show()`;
    return code;
  };

  // PyCharm Syntax Highlighter
  const renderPyCharmPythonCode = (codeText: string) => {
    const lines = codeText.split('\n');
    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        return <div key={lineIdx} className="text-[#808080] italic">{line || ' '}</div>;
      }
      const tokens = line.split(/(".*?"|'.*?'|#.*$|\b\d+\.?\d*\b|\b[a-zA-Z_]\w*\b|[(),=**+\-/:.@<>]|\s+)/).filter(Boolean);
      return (
        <div key={lineIdx}>
          {line ? tokens.map((token, tokenIdx) => {
            if (!token) return null;
            if (token.startsWith('#')) return <span key={tokenIdx} className="text-[#808080] italic">{token}</span>;
            if (/^(".*?"|'.*?')$/.test(token)) return <span key={tokenIdx} className="text-[#7C9D6B] font-medium">{token}</span>;
            if (/^(import|from|as|def|class|return|if|else|elif|for|in|while|with|print|label|True|False|None)$/.test(token)) {
              return <span key={tokenIdx} className="text-[#CC7832] font-bold">{token}</span>;
            }
            if (/^(plt|ax|fig|subplots|plot|bar|scatter|heatmap|set_title|set_xlabel|set_ylabel|grid|legend|show|style|use|figure|colorbar|bar_label)$/.test(token)) {
              return <span key={tokenIdx} className="text-[#FFC66D] font-bold">{token}</span>;
            }
            if (/^-?\d+\.?\d*$/.test(token)) return <span key={tokenIdx} className="text-[#6897BB] font-bold">{token}</span>;
            if (/^[=**+\-/:.@<>!&|^]+$/.test(token)) return <span key={tokenIdx} className="text-[#A9B7C6] font-bold">{token}</span>;
            return <span key={tokenIdx} className="text-[#A9B7C6]">{token}</span>;
          }) : ' '}
        </div>
      );
    });
  };

  return (
    <div className="my-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-800 font-sans">
      {/* Top Bar: Title & Multi-Chart Type Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80">
            <LineChart className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>Matplotlib 常用图形与参数调优实验室</span>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200">
                Interactive Lab
              </span>
            </h4>
            <p className="text-xs text-slate-500">支持常用 AI 图形切变与实时全量参数调优</p>
          </div>
        </div>

        {/* Multi Chart Type Tabs (3D removed) */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
          <button
            onClick={() => { setChartType('line'); setChartTitle('Model Loss Curve'); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartType === 'line' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChart className="h-3.5 w-3.5" />
            <span>折线图</span>
          </button>
          <button
            onClick={() => { setChartType('bar'); setChartTitle('Class Accuracy Comparison'); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartType === 'bar' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>统计柱状图</span>
          </button>
          <button
            onClick={() => { setChartType('scatter'); setChartTitle('Feature Distribution Scatter'); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartType === 'scatter' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="h-3.5 w-3.5" />
            <span>散点图</span>
          </button>
          <button
            onClick={() => { setChartType('heatmap'); setChartTitle('Confusion Matrix Heatmap'); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartType === 'heatmap' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>混淆矩阵</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Grid (items-stretch for automatic vertical alignment) */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Panel: Parameter Control Cards (col-span-6, justify-start for top alignment) */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200/80 bg-slate-50/80 p-5 space-y-4 flex flex-col justify-start">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 border-b border-slate-200/80 pb-2">
            <span className="flex items-center gap-2 text-slate-900">
              <Sliders className="h-4 w-4 text-teal-600" />
              <span>【全量参数配置面板】({chartType.toUpperCase()})</span>
            </span>
            {/* Theme Preset Pill */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px]">
              <button
                onClick={() => setThemeStyle('default')}
                className={`px-2 py-0.5 rounded ${themeStyle === 'default' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
              >
                Default
              </button>
              <button
                onClick={() => setThemeStyle('dark')}
                className={`px-2 py-0.5 rounded ${themeStyle === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* 1. Global Text & Titles Card */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5 text-xs">
            <label className="block text-slate-800 font-extrabold border-b border-slate-100 pb-1">
              1. 基础标题与 X/Y 轴文本设置:
            </label>
            <div>
              <span className="text-slate-600 font-bold">图表主标题 (`ax.set_title`):</span>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                className="w-full mt-1 px-2.5 py-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white focus:outline-teal-600 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-600 font-bold">X轴标签 (`set_xlabel`):</span>
                <input
                  type="text"
                  value={xLabelText}
                  onChange={(e) => setXLabelText(e.target.value)}
                  className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white font-medium"
                />
              </div>
              <div>
                <span className="text-slate-600 font-bold">Y轴标签 (`set_ylabel`):</span>
                <input
                  type="text"
                  value={yLabelText}
                  onChange={(e) => setYLabelText(e.target.value)}
                  className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* 2. Specific Chart Options Cards */}
          {chartType === 'line' && (
            <>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3 text-xs">
                <label className="block text-slate-800 font-extrabold border-b border-slate-100 pb-1">
                  2. 折线图颜色、线型与 Marker 调参:
                </label>
                <div>
                  <span className="text-slate-600 font-bold block mb-1.5">曲线颜色 (`color`):</span>
                  <div className="flex items-center gap-3">
                    {['#0d9488', '#6366f1', '#a855f7', '#f59e0b', '#10b981'].map((hex) => (
                      <button
                        key={hex}
                        onClick={() => setLineColor(hex)}
                        className={`h-7 w-7 rounded-full border-2 transition-all cursor-pointer ${
                          lineColor === hex ? 'scale-110 border-slate-900 ring-2 ring-teal-500/40' : 'border-transparent opacity-80'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-600 font-bold block mb-1.5">线型样式 (`linestyle`):</span>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    {[
                      { label: "'-' (solid 实线)", val: 'solid' },
                      { label: "'--' (dashed 虚线)", val: 'dashed' },
                      { label: "':' (dotted 点线)", val: 'dotted' },
                      { label: "'-.' (dashdot 点划线)", val: 'dashdot' },
                    ].map((st) => (
                      <button
                        key={st.val}
                        onClick={() => setLineStyle(st.val as any)}
                        className={`px-2.5 py-1.5 rounded border text-xs font-bold transition-all cursor-pointer ${
                          lineStyle === st.val ? 'bg-teal-600 text-white border-teal-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-600 font-bold block mb-1">线宽 (`linewidth`): {lineWidth}px</span>
                    <input type="range" min={1} max={6} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full accent-teal-600" />
                  </div>
                  <div>
                    <span className="text-slate-600 font-bold block mb-1">数据点标记 (`marker`):</span>
                    <select value={marker} onChange={(e) => setMarker(e.target.value as any)} className="w-full p-1 border rounded bg-slate-50 font-bold">
                      <option value="circle">Circle ('o')</option>
                      <option value="square">Square ('s')</option>
                      <option value="triangle">Triangle ('^')</option>
                      <option value="star">Star ('*')</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-bold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showAnnotate} onChange={(e) => setShowAnnotate(e.target.checked)} className="h-4 w-4 accent-teal-600" />
                  <span>极小值箭头标注 (`ax.annotate`)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showLegend} onChange={(e) => setShowLegend(e.target.checked)} className="h-4 w-4 accent-teal-600" />
                  <span>显示图例 (`ax.legend`)</span>
                </label>
              </div>
            </>
          )}

          {chartType === 'bar' && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-3 text-xs">
              <label className="block text-slate-800 font-extrabold border-b border-slate-100 pb-1">
                2. 统计柱状图专属参数:
              </label>
              <div>
                <span className="text-slate-600 font-bold block mb-1.5">柱体填充颜色 (`barColor`):</span>
                <div className="flex items-center gap-3">
                  {['#6366f1', '#0d9488', '#f59e0b', '#ec4899', '#3b82f6'].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setBarColor(hex)}
                      className={`h-7 w-7 rounded-full border-2 ${barColor === hex ? 'scale-110 border-slate-900 ring-2 ring-indigo-500/40' : ''}`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-600 font-bold block mb-1">柱体宽度 (`width`): {barWidth}</span>
                <input type="range" min={0.3} max={0.9} step={0.1} value={barWidth} onChange={(e) => setBarWidth(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-bold pt-1">
                <input type="checkbox" checked={showValuesOnBar} onChange={(e) => setShowValuesOnBar(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
                <span>显示柱顶数值标签 (`ax.bar_label`)</span>
              </label>
            </div>
          )}

          {chartType === 'scatter' && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-3 text-xs">
              <label className="block text-slate-800 font-extrabold border-b border-slate-100 pb-1">
                2. 散点图与颜色映射 (Colormap) 参数:
              </label>
              <div>
                <span className="text-slate-600 font-bold block mb-1.5">配色渐变映射 (`cmap`):</span>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {['viridis', 'plasma', 'coolwarm'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setScatterCmap(c as any)}
                      className={`py-1.5 rounded border font-bold capitalize ${scatterCmap === c ? 'bg-teal-600 text-white' : 'bg-slate-50 text-slate-700'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-600 font-bold block mb-1">散点尺寸 (`s`): {pointSize * 10}px</span>
                <input type="range" min={3} max={12} value={pointSize} onChange={(e) => setPointSize(Number(e.target.value))} className="w-full accent-teal-600" />
              </div>
            </div>
          )}

          {chartType === 'heatmap' && (
            <div className="bg-white p-3.5 rounded-xl border border-indigo-200 space-y-3 text-xs bg-indigo-50/30">
              <label className="block text-indigo-900 font-extrabold border-b border-indigo-200 pb-1">
                2. 混淆矩阵 (Confusion Matrix) 特效参数:
              </label>
              <div className="text-slate-600 leading-relaxed font-medium">
                展示二分类任务中的 True Positive, False Positive, True Negative, False Negative 色彩热力分布。自动在矩阵格内填入 `annot=True` 数量标注。
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: SVG Visualizer & PyCharm Syntax Highlighted Code */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* SVG Rendering Stage */}
          <div className={`rounded-xl border-2 p-4 transition-colors flex-1 flex flex-col justify-between ${
            themeStyle === 'dark' ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-300 shadow-xs'
          }`}>
            <div className="flex items-center justify-between border-b pb-2 mb-2 border-slate-200/60 text-xs font-bold">
              <span>Matplotlib 画布渲染窗口 ({chartType.toUpperCase()})</span>
              <span className="font-mono text-[10px] text-teal-600 font-extrabold">figsize=(8, 5), dpi=100</span>
            </div>

            <div className="flex justify-center items-center overflow-x-auto my-auto py-2">
              <svg width={width} height={height} className="overflow-visible select-none">
                {/* 1. LINE CHART */}
                {chartType === 'line' && (
                  <>
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={themeStyle === 'dark' ? '#475569' : '#0f172a'} strokeWidth={1.5} />
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke={themeStyle === 'dark' ? '#475569' : '#0f172a'} strokeWidth={1.5} />

                    <path d="M 42 50 L 98 95 L 154 125 L 210 145 L 266 158 L 322 166 L 378 172" fill="none" stroke={lineColor} strokeWidth={lineWidth} strokeDasharray={getStrokeDashArray(lineStyle)} />
                    {[50, 95, 125, 145, 158, 166, 172].map((y, i) => (
                      renderSvgMarker(42 + i * 56, y, i)
                    ))}

                    {showAnnotate && (
                      <g transform="translate(378, 172)">
                        <line x1={0} y1={0} x2={-40} y2={-25} stroke="#f59e0b" strokeWidth={2} strokeDasharray="2 2" />
                        <rect x={-105} y={-40} width={75} height={20} rx={4} fill="#f59e0b" />
                        <text x={-67.5} y={-26} textAnchor="middle" className="text-[10px] font-extrabold fill-slate-950">Min Loss: 0.14</text>
                      </g>
                    )}

                    {/* Dynamic Legend Box Toggle */}
                    {showLegend && (
                      <g transform={`translate(${width - padding - 85}, ${padding - 20})`}>
                        <rect width={85} height={36} rx={6} fill={themeStyle === 'dark' ? '#1e293b' : '#ffffff'} stroke={themeStyle === 'dark' ? '#475569' : '#cbd5e1'} strokeWidth={1} opacity={0.95} />
                        <line x1={8} y1={12} x2={22} y2={12} stroke={lineColor} strokeWidth={2} />
                        <text x={28} y={15} className={`text-[10px] font-extrabold ${themeStyle === 'dark' ? 'fill-slate-200' : 'fill-slate-800'}`}>Train Loss</text>
                        <line x1={8} y1={24} x2={22} y2={24} stroke="#f43f5e" strokeWidth={2} strokeDasharray="3 2" />
                        <text x={28} y={27} className={`text-[10px] font-extrabold ${themeStyle === 'dark' ? 'fill-slate-200' : 'fill-slate-800'}`}>Val Loss</text>
                      </g>
                    )}
                  </>
                )}

                {/* 2. BAR CHART */}
                {chartType === 'bar' && (
                  <>
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#0f172a" strokeWidth={1.5} />
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#0f172a" strokeWidth={1.5} />

                    {[
                      { cat: 'Class A', val: 88, h: 140 },
                      { cat: 'Class B', val: 92, h: 155 },
                      { cat: 'Class C', val: 79, h: 120 },
                      { cat: 'Class D', val: 95, h: 165 },
                    ].map((b, idx) => {
                      const bw = 50 * barWidth;
                      const x = 75 + idx * 80 - bw / 2;
                      const y = height - padding - b.h;
                      return (
                        <g key={b.cat}>
                          <rect x={x} y={y} width={bw} height={b.h} fill={barColor} rx={4} />
                          {showValuesOnBar && (
                            <text x={x + bw / 2} y={y - 6} textAnchor="middle" className="text-[10px] font-bold fill-slate-800">
                              {b.val}%
                            </text>
                          )}
                          <text x={x + bw / 2} y={height - padding + 15} textAnchor="middle" className="text-[10px] font-medium fill-slate-600">
                            {b.cat}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}

                {/* 3. SCATTER PLOT */}
                {chartType === 'scatter' && (
                  <>
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#0f172a" strokeWidth={1.5} />
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#0f172a" strokeWidth={1.5} />

                    {[
                      { x: 80, y: 150, c: '#440154' }, { x: 120, y: 120, c: '#3b528b' },
                      { x: 160, y: 90, c: '#21918c' }, { x: 210, y: 140, c: '#5ec962' },
                      { x: 260, y: 80, c: '#fde725' }, { x: 300, y: 60, c: '#fde725' },
                      { x: 340, y: 110, c: '#21918c' }, { x: 190, y: 180, c: '#440154' },
                    ].map((pt, i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r={pointSize} fill={scatterCmap === 'coolwarm' ? (i % 2 === 0 ? '#3b82f6' : '#ef4444') : pt.c} opacity={0.85} stroke="#fff" strokeWidth={1} />
                    ))}
                  </>
                )}

                {/* 4. HEATMAP */}
                {chartType === 'heatmap' && (
                  <g transform="translate(110, 40)">
                    <rect x={0} y={0} width={90} height={70} fill="#1e3a8a" rx={4} />
                    <text x={45} y={40} textAnchor="middle" className="text-sm font-extrabold fill-white">45 (TP)</text>

                    <rect x={100} y={0} width={90} height={70} fill="#93c5fd" rx={4} />
                    <text x={145} y={40} textAnchor="middle" className="text-sm font-extrabold fill-slate-900">3 (FP)</text>

                    <rect x={0} y={80} width={90} height={70} fill="#bfdbfe" rx={4} />
                    <text x={45} y={120} textAnchor="middle" className="text-sm font-extrabold fill-slate-900">5 (FN)</text>

                    <rect x={100} y={80} width={90} height={70} fill="#1e40af" rx={4} />
                    <text x={145} y={120} textAnchor="middle" className="text-sm font-extrabold fill-white">47 (TN)</text>
                  </g>
                )}

                {/* Dynamic Title & Axis Labels */}
                <text x={width / 2} y={padding - 20} textAnchor="middle" className={`text-xs font-extrabold ${themeStyle === 'dark' ? 'fill-slate-100' : 'fill-slate-900'}`}>
                  {chartTitle}
                </text>
                {chartType !== 'heatmap' && (
                  <>
                    <text x={width / 2} y={height - 12} textAnchor="middle" className={`text-[11px] font-extrabold ${themeStyle === 'dark' ? 'fill-slate-300' : 'fill-slate-800'}`}>{xLabelText}</text>
                    <text x={24} y={height / 2} textAnchor="middle" transform={`rotate(-90 24 ${height / 2})`} className={`text-[11px] font-extrabold ${themeStyle === 'dark' ? 'fill-slate-300' : 'fill-slate-800'}`}>{yLabelText}</text>
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* Generated Python Code Preview with PyCharm Color Syntax Highlighting (Spacious Code Window) */}
          <div className="rounded-xl border border-slate-800 bg-[#070D1E] p-3.5 space-y-2 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800/80 pb-1.5">
              <span className="flex items-center gap-1.5 text-teal-400 font-extrabold">
                <Code2 className="h-3.5 w-3.5" />
                <span>实时生成的 Python 代码 (PyCharm Syntax)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">{chartType.toUpperCase()} Mode</span>
            </div>

            <div className="font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[250px] overflow-y-auto whitespace-pre p-2.5 bg-[#0B132B] rounded-lg border border-slate-800/90">
              {renderPyCharmPythonCode(getPythonCode())}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
