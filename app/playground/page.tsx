'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { NeuronLab } from '@/components/animations/NeuronLab';
import { RunnableCodeBlock } from '@/components/mdx/RunnableCodeBlock';
import { Beaker, Cpu, TrendingDown, Terminal } from 'lucide-react';

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<'neuron' | 'gradient' | 'python'>('neuron');

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
            <Beaker className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">交互实验室 (Interactive Labs)</h1>
            <p className="text-xs text-slate-400">零距离观测算法参数变化、状态流动与 Python 实时计算结果</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('neuron')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'neuron' ? 'bg-white text-teal-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            神经元实验室
          </button>
          <button
            onClick={() => setActiveTab('gradient')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'gradient' ? 'bg-white text-teal-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            梯度下降实验
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'python' ? 'bg-white text-teal-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Python 调试沙盒
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'neuron' && <NeuronLab />}

      {activeTab === 'gradient' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">梯度下降实验 (Gradient Descent Lab)</h2>
              <p className="text-xs text-slate-400">调节学习率、初始位置与迭代轮数，实时观测损失函数 J(w) 的收敛轨迹</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controls */}
            <div className="lg:col-span-4 bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-200/60">
              <h3 className="font-bold text-xs text-slate-800">实验控制</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>学习率 α</span>
                  <span className="font-mono font-bold text-teal-700">0.05</span>
                </div>
                <input type="range" min="0.01" max="0.5" step="0.01" defaultValue="0.05" className="w-full accent-teal-600" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>初始位置 w₀</span>
                  <span className="font-mono font-bold text-teal-700">-1.80</span>
                </div>
                <input type="range" min="-3" max="3" step="0.1" defaultValue="-1.8" className="w-full accent-teal-600" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>迭代轮数 Epochs</span>
                  <span className="font-mono font-bold text-teal-700">20</span>
                </div>
                <input type="range" min="5" max="50" step="5" defaultValue="20" className="w-full accent-teal-600" />
              </div>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-8 bg-[#0B132B] rounded-xl p-6 text-white min-h-[300px] flex flex-col justify-between">
              <div className="text-xs text-slate-400 font-semibold">损失二次抛物线 J(w) = w² 优化路径</div>
              <div className="my-auto text-center font-mono text-xs text-teal-300">
                [可视化二次函数曲线与梯度收敛点动画演示 Canvas/SVG]
              </div>
              <div className="text-xs text-slate-400 flex justify-between font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span>当前状态: Epoch 20/20</span>
                <span className="text-emerald-400 font-bold">Loss = 0.0004</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'python' && (
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Python 浏览器受限计算环境 (Pyodide Workers)</h2>
            <p className="text-xs text-slate-400">无需配置服务器或环境，支持纯浏览器本地 NumPy、Matplotlib、scikit-learn 代码验证</p>
          </div>

          <RunnableCodeBlock
            title="浏览器原生 Python 沙盒"
            initialCode={`import numpy as np

# 创建示例特征向量
X = np.array([[1, 2], [3, 4], [5, 6]])
w = np.array([0.5, -0.2])
b = 0.1

# 前向计算
z = X @ w + b
print("特征向量 X:\\n", X)
print("计算结果 z:\\n", z)`}
          />
        </Card>
      )}
    </div>
  );
}
