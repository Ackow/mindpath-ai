'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { RefreshCw, Layers, ShieldCheck, Zap } from 'lucide-react';

interface Point {
  x: number; // Feature 1 (e.g. Age: 20~60)
  y: number; // Feature 2 (e.g. Income: 10~90)
  label: 0 | 1;
}

// 初始静态双数组散点数据 (Class 0: 青色 Teal, Class 1: 紫色 Indigo)
const INITIAL_POINTS: Point[] = [
  // Class 0 (Teal)
  { x: 25, y: 30, label: 0 },
  { x: 30, y: 25, label: 0 },
  { x: 35, y: 35, label: 0 },
  { x: 28, y: 45, label: 0 },
  { x: 40, y: 28, label: 0 },
  { x: 22, y: 38, label: 0 },
  { x: 45, y: 42, label: 0 },
  { x: 32, y: 55, label: 0 },
  { x: 38, y: 50, label: 0 },
  // Class 1 (Indigo)
  { x: 55, y: 65, label: 1 },
  { x: 60, y: 75, label: 1 },
  { x: 65, y: 60, label: 1 },
  { x: 70, y: 80, label: 1 },
  { x: 50, y: 70, label: 1 },
  { x: 75, y: 72, label: 1 },
  { x: 58, y: 85, label: 1 },
  { x: 68, y: 55, label: 1 },
  { x: 80, y: 68, label: 1 },
];

export const KnnDecisionBoundaryLab: React.FC = () => {
  const [points, setPoints] = useState<Point[]>(INITIAL_POINTS);
  const [kValue, setKValue] = useState<number>(3);
  const [metric, setMetric] = useState<'euclidean' | 'manhattan'>('euclidean');
  const [useScaling, setUseScaling] = useState<boolean>(true);
  const [showBoundary, setShowBoundary] = useState<boolean>(true);
  
  // 待测试点的自由坐标 (默认 45, 52)
  const [testPoint, setTestPoint] = useState<{ x: number; y: number }>({ x: 45, y: 52 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 计算特征基准均值与标准差 (用于 Z-Score 标准化)
  const stats = useMemo(() => {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
    const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
    const stdX = Math.sqrt(xs.reduce((a, b) => a + Math.pow(b - meanX, 2), 0) / xs.length) || 1;
    const stdY = Math.sqrt(ys.reduce((a, b) => a + Math.pow(b - meanY, 2), 0) / ys.length) || 1;
    return { meanX, meanY, stdX, stdY };
  }, [points]);

  // 计算两点间距离 (已考虑标准化开关)
  const calcDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    let x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
    if (useScaling) {
      x1 = (x1 - stats.meanX) / stats.stdX;
      x2 = (x2 - stats.meanX) / stats.stdX;
      y1 = (y1 - stats.meanY) / stats.stdY;
      y2 = (y2 - stats.meanY) / stats.stdY;
    }

    if (metric === 'euclidean') {
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    } else {
      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
  };

  // 寻找测试点的 k 个最近邻
  const nearestNeighbors = useMemo(() => {
    const distances = points.map((p, idx) => ({
      point: p,
      index: idx,
      dist: calcDistance(testPoint, p),
    }));

    distances.sort((a, b) => a.dist - b.dist);
    return distances.slice(0, Math.min(kValue, points.length));
  }, [points, testPoint, kValue, metric, useScaling, stats]);

  // 计算决策预测结果 (少数服从多数)
  const prediction = useMemo(() => {
    let class0Votes = 0;
    let class1Votes = 0;
    nearestNeighbors.forEach((nn) => {
      if (nn.point.label === 0) class0Votes++;
      else class1Votes++;
    });

    const predClass = class0Votes >= class1Votes ? 0 : 1;
    return { predClass, class0Votes, class1Votes };
  }, [nearestNeighbors]);

  // 画布重绘逻辑
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 坐标映射转换函数: 特征值 (10~90) <-> 画布像素 (0~width)
    const toCanvasX = (val: number) => ((val - 10) / 80) * width;
    const toCanvasY = (val: number) => height - ((val - 10) / 80) * height;
    const fromCanvasX = (px: number) => 10 + (px / width) * 80;
    const fromCanvasY = (py: number) => 10 + ((height - py) / height) * 80;

    // 1. 绘制决策边界热力图网格
    if (showBoundary) {
      const step = 6; // 6px 网格精度
      for (let px = 0; px < width; px += step) {
        for (let py = 0; py < height; py += step) {
          const fx = fromCanvasX(px + step / 2);
          const fy = fromCanvasY(py + step / 2);

          // 对当前网格中心计算 k 个近邻
          const gridDists = points.map((p) => ({
            label: p.label,
            dist: calcDistance({ x: fx, y: fy }, p),
          }));
          gridDists.sort((a, b) => a.dist - b.dist);

          const kGrid = gridDists.slice(0, Math.min(kValue, points.length));
          let c0 = 0, c1 = 0;
          kGrid.forEach((g) => (g.label === 0 ? c0++ : c1++));

          ctx.fillStyle = c0 >= c1 ? 'rgba(20, 184, 166, 0.12)' : 'rgba(99, 102, 241, 0.12)';
          ctx.fillRect(px, py, step, step);
        }
      }
    }

    // 绘制坐标网格背景线
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 80; i += 10) {
      const cx = toCanvasX(10 + i);
      const cy = toCanvasY(10 + i);
      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(width, cy);
      ctx.stroke();
    }

    // 2. 绘制近邻连线 (虚线)
    nearestNeighbors.forEach((nn) => {
      const targetCx = toCanvasX(testPoint.x);
      const targetCy = toCanvasY(testPoint.y);
      const nnCx = toCanvasX(nn.point.x);
      const nnCy = toCanvasY(nn.point.y);

      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = nn.point.label === 0 ? '#14B8A6' : '#6366F1';
      ctx.lineWidth = 2;
      ctx.moveTo(targetCx, targetCy);
      ctx.lineTo(nnCx, nnCy);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 3. 绘制已知散点 points
    points.forEach((p) => {
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(p.y);

      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 0 ? '#14B8A6' : '#6366F1';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 给 k 个近邻增加外围亮圈提示
      const isNN = nearestNeighbors.some((nn) => nn.point === p);
      if (isNN) {
        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.strokeStyle = p.label === 0 ? '#0D9488' : '#4F46E5';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // 4. 绘制交互测试点 (Pulsing Target Star)
    const tCx = toCanvasX(testPoint.x);
    const tCy = toCanvasY(testPoint.y);

    ctx.beginPath();
    ctx.arc(tCx, tCy, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B'; // 琥珀黄
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 绘制中心十字星
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(tCx - 4, tCy); ctx.lineTo(tCx + 4, tCy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tCx, tCy - 4); ctx.lineTo(tCx, tCy + 4); ctx.stroke();

  }, [points, testPoint, kValue, metric, useScaling, showBoundary, nearestNeighbors]);

  // 鼠标与触摸屏拖拽移动测试点 (手机移动端适配)
  const handleCanvasClickOrDrag = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    const fx = Math.min(85, Math.max(15, 10 + (px / width) * 80));
    const fy = Math.min(85, Math.max(15, 10 + ((height - py) / height) * 80));

    setTestPoint({ x: Math.round(fx * 10) / 10, y: Math.round(fy * 10) / 10 });
  };

  // 添加随机噪声样本点
  const handleAddRandomPoint = () => {
    const rx = Math.floor(Math.random() * 60) + 20;
    const ry = Math.floor(Math.random() * 60) + 20;
    const rLabel: 0 | 1 = Math.random() > 0.5 ? 1 : 0;
    setPoints([...points, { x: rx, y: ry, label: rLabel }]);
  };

  // 重置样本
  const handleReset = () => {
    setPoints(INITIAL_POINTS);
    setKValue(3);
    setMetric('euclidean');
    setUseScaling(true);
    setTestPoint({ x: 45, y: 52 });
  };

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-white font-sans">
      {/* 头部标题栏 - 浅色风 */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 m-0">kNN 决策边界与 k 值交互实验室</h4>
            <p className="text-[11px] text-slate-500 m-0">点击或拖拽画布移动测试点，观察 k 个邻居投票与决策边界演变</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddRandomPoint}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            + 添加新样本
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-sm"
            title="重置数据集"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 主体交互区域 */}
      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 bg-slate-50/50">
        {/* 左侧 Canvas 2D 交互画布 */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[440px] aspect-square rounded-xl overflow-hidden border-2 border-slate-200 bg-white shadow-sm cursor-crosshair touch-none">
            <canvas
              ref={canvasRef}
              width={440}
              height={440}
              onClick={(e) => handleCanvasClickOrDrag(e.clientX, e.clientY)}
              onMouseMove={(e) => {
                if (e.buttons === 1) handleCanvasClickOrDrag(e.clientX, e.clientY);
              }}
              onTouchStart={(e) => {
                if (e.touches.length > 0) handleCanvasClickOrDrag(e.touches[0].clientX, e.touches[0].clientY);
              }}
              onTouchMove={(e) => {
                if (e.touches.length > 0) handleCanvasClickOrDrag(e.touches[0].clientX, e.touches[0].clientY);
              }}
              className="w-full h-full block"
            />
            {/* 图例 */}
            <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 flex items-center gap-3 shadow-sm">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" /> 类别 0 (Teal)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> 类别 1 (Indigo)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> 测试点 (Target)
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">提示：直接用鼠标在画布上拖动琥珀黄测试点</span>
        </div>

        {/* 右侧 控制面板与实时投票诊断 */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* 实时决策判定卡片 */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                测试点预测结果
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                prediction.predClass === 0 ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                类别 {prediction.predClass} ({prediction.predClass === 0 ? 'Teal' : 'Indigo'})
              </span>
            </div>

            {/* 投票比例统计 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>k = {kValue} 个最近邻投票比:</span>
                <span>{prediction.class0Votes} 票 (类别0) vs {prediction.class1Votes} 票 (类别1)</span>
              </div>
              <div className="w-full h-2.5 bg-indigo-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${(prediction.class0Votes / kValue) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* 超参数调节面板 */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
            {/* 1. k 值滑动条 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">k 值选择 (近邻个数):</label>
                <span className="text-xs font-mono font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  k = {kValue}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={Math.min(15, points.length)}
                step={2}
                value={kValue}
                onChange={(e) => setKValue(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>k=1 (陡峭过拟合)</span>
                <span>k=15 (平滑欠拟合)</span>
              </div>
            </div>

            {/* 2. 距离度量单选 */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">距离度量公式:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMetric('euclidean')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    metric === 'euclidean'
                      ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  欧氏距离 (Euclidean)
                </button>
                <button
                  onClick={() => setMetric('manhattan')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    metric === 'manhattan'
                      ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  曼哈顿距离 (Manhattan)
                </button>
              </div>
            </div>

            {/* 3. 开关控制 */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer">
                <span>Z-Score 特征标准化 (Scaling)</span>
                <input
                  type="checkbox"
                  checked={useScaling}
                  onChange={(e) => setUseScaling(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer">
                <span>显示决策边界热力网格</span>
                <input
                  type="checkbox"
                  checked={showBoundary}
                  onChange={(e) => setShowBoundary(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
