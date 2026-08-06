'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Database, Filter, Search, Table, Sparkles, RefreshCw } from 'lucide-react';

export function PandasDataImportLab() {
  const [activeTab, setActiveTab] = useState<'csv' | 'dict' | 'slicing' | 'filter'>('csv');

  // Interactive input states for Slicing (loc / iloc)
  const [sliceType, setSliceType] = useState<'loc' | 'iloc'>('loc');
  const [locStart, setLocStart] = useState<number>(1);
  const [locEnd, setLocEnd] = useState<number>(3);
  const [selectedCols, setSelectedCols] = useState<string[]>(['name', 'score']);

  const [ilocRowStart, setIlocRowStart] = useState<number>(1);
  const [ilocRowEnd, setIlocRowEnd] = useState<number>(4);
  const [ilocColStart, setIlocColStart] = useState<number>(1);
  const [ilocColEnd, setIlocColEnd] = useState<number>(4);

  // Interactive input states for Condition Filtering
  const [filterCol, setFilterCol] = useState<'score' | 'age'>('score');
  const [filterOp, setFilterOp] = useState<'>=' | '>' | '<=' | '<' | '=='>('>=');
  const [filterVal, setFilterVal] = useState<number>(85);

  const rawCsvData = `id,name,age,city,score
1,Alice,24,Beijing,88
2,Bob,29,Shanghai,92
3,Charlie,22,Guangzhou,79
4,David,31,Beijing,95
5,Eva,27,Shenzhen,84`;

  const allColumns = ['id', 'name', 'age', 'city', 'score'];

  const dataRows = [
    { id: 1, name: 'Alice', age: 24, city: 'Beijing', score: 88 },
    { id: 2, name: 'Bob', age: 29, city: 'Shanghai', score: 92 },
    { id: 3, name: 'Charlie', age: 22, city: 'Guangzhou', score: 79 },
    { id: 4, name: 'David', age: 31, city: 'Beijing', score: 95 },
    { id: 5, name: 'Eva', age: 27, city: 'Shenzhen', score: 84 },
  ];

  // Helper toggle for column selection in loc
  const toggleCol = (col: string) => {
    if (selectedCols.includes(col)) {
      if (selectedCols.length > 1) {
        setSelectedCols(selectedCols.filter((c) => c !== col));
      }
    } else {
      setSelectedCols([...selectedCols, col]);
    }
  };

  // Check if a cell is highlighted during slicing
  const isCellSliced = (rowIdx: number, colName: string, colIdx: number) => {
    if (activeTab !== 'slicing') return false;

    if (sliceType === 'loc') {
      const isRowInLoc = rowIdx >= locStart && rowIdx <= locEnd;
      const isColInLoc = selectedCols.includes(colName);
      return isRowInLoc && isColInLoc;
    } else {
      const isRowInIloc = rowIdx >= ilocRowStart && rowIdx < ilocRowEnd;
      const isColInIloc = colIdx >= ilocColStart && colIdx < ilocColEnd;
      return isRowInIloc && isColInIloc;
    }
  };

  // Check if a row satisfies the interactive filter condition
  const isRowFiltered = (row: typeof dataRows[0]) => {
    if (activeTab !== 'filter') return false;
    const val = row[filterCol];
    switch (filterOp) {
      case '>=': return val >= filterVal;
      case '>': return val > filterVal;
      case '<=': return val <= filterVal;
      case '<': return val < filterVal;
      case '==': return val === filterVal;
      default: return false;
    }
  };

  return (
    <div className="my-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-800 font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80">
            <Table className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>Pandas 数据导入与 DataFrame 动态交互实验室</span>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200">
                Live Input Mode
              </span>
            </h4>
            <p className="text-xs text-slate-500">支持自定义输入 loc/iloc 参数与布尔条件，观察 DataFrame 动态高亮与切片输出</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80">
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'csv'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>1. CSV 文本导入</span>
          </button>
          <button
            onClick={() => setActiveTab('dict')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dict'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>2. 字典转换</span>
          </button>
          <button
            onClick={() => setActiveTab('slicing')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'slicing'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>3. loc/iloc 自由切片</span>
          </button>
          <button
            onClick={() => setActiveTab('filter')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'filter'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>4. 条件自由筛选</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Panel: Live Input Controls & Dynamic Python Code */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 space-y-4">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 border-b border-slate-200/80 pb-2">
            <span>交互参数配置与实时 Python 代码</span>
            <span className="text-[10px] text-teal-700 font-mono font-bold">Interactive Input</span>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'csv' && (
              <motion.div
                key="code-csv"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-3"
              >
                <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-200 border border-slate-800">
                  <div className="text-slate-400 italic"># 1. 外部 CSV 数据文本</div>
                  <div className="text-emerald-400 mt-1 whitespace-pre">{rawCsvData}</div>
                </div>
                <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-200 border border-slate-800 space-y-1">
                  <div><span className="text-purple-400 font-bold">import</span> pandas <span className="text-purple-400 font-bold">as</span> pd</div>
                  <div>df = pd.<span className="text-cyan-300 font-bold">read_csv</span>(<span className="text-emerald-300">'users.csv'</span>)</div>
                </div>
              </motion.div>
            )}

            {activeTab === 'dict' && (
              <motion.div
                key="code-dict"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-3"
              >
                <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-200 border border-slate-800">
                  <div className="text-purple-400 font-bold">import <span className="text-cyan-300">pandas</span> as <span className="text-cyan-300">pd</span></div>
                  <div className="mt-2 text-slate-300">data = &#123;</div>
                  <div className="pl-4 text-amber-300">'name': ['Alice', 'Bob', ...],</div>
                  <div className="pl-4 text-amber-300">'age': [24, 29, 22, 31, 27],</div>
                  <div className="pl-4 text-amber-300">'score': [88, 92, 79, 95, 84]</div>
                  <div className="text-slate-300">&#125;</div>
                  <div className="mt-2">df = pd.<span className="text-sky-300 font-bold">DataFrame</span>(data)</div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: LOC / ILOC LIVE INPUT CONTROLS */}
            {activeTab === 'slicing' && (
              <motion.div
                key="code-slicing"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                {/* Mode Selector Toggle */}
                <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-lg">
                  <button
                    onClick={() => setSliceType('loc')}
                    className={`flex-1 py-1 text-xs font-extrabold rounded-md transition-all cursor-pointer ${
                      sliceType === 'loc' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    df.loc (按显式名称标签)
                  </button>
                  <button
                    onClick={() => setSliceType('iloc')}
                    className={`flex-1 py-1 text-xs font-extrabold rounded-md transition-all cursor-pointer ${
                      sliceType === 'iloc' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    df.iloc (按整数位置)
                  </button>
                </div>

                {sliceType === 'loc' ? (
                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        1. 行标签范围 (闭区间 `[start:end]`):
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500">start:</span>
                        <input
                          type="number"
                          min={0}
                          max={locEnd}
                          value={locStart}
                          onChange={(e) => setLocStart(Math.min(Number(e.target.value), locEnd))}
                          className="w-16 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center bg-slate-50 focus:bg-white focus:outline-teal-600"
                        />
                        <span className="font-mono text-slate-500">end:</span>
                        <input
                          type="number"
                          min={locStart}
                          max={4}
                          value={locEnd}
                          onChange={(e) => setLocEnd(Math.max(Number(e.target.value), locStart))}
                          className="w-16 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center bg-slate-50 focus:bg-white focus:outline-teal-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">
                        2. 勾选要保留的列标签 (Column Names):
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {allColumns.map((col) => (
                          <button
                            key={col}
                            onClick={() => toggleCol(col)}
                            className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all cursor-pointer ${
                              selectedCols.includes(col)
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        1. 行位置范围 (前闭后开 `[row_start:row_end)`):
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500">row_start:</span>
                        <input
                          type="number"
                          min={0}
                          max={ilocRowEnd - 1}
                          value={ilocRowStart}
                          onChange={(e) => setIlocRowStart(Math.min(Number(e.target.value), ilocRowEnd - 1))}
                          className="w-16 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center bg-slate-50 focus:bg-white focus:outline-purple-600"
                        />
                        <span className="font-mono text-slate-500">row_end:</span>
                        <input
                          type="number"
                          min={ilocRowStart + 1}
                          max={5}
                          value={ilocRowEnd}
                          onChange={(e) => setIlocRowEnd(Math.max(Number(e.target.value), ilocRowStart + 1))}
                          className="w-16 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center bg-slate-50 focus:bg-white focus:outline-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        2. 列位置范围 (前闭后开 `[col_start:col_end)`):
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500">col_start:</span>
                        <input
                          type="number"
                          min={0}
                          max={ilocColEnd - 1}
                          value={ilocColStart}
                          onChange={(e) => setIlocColStart(Math.min(Number(e.target.value), ilocColEnd - 1))}
                          className="w-16 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center bg-slate-50 focus:bg-white focus:outline-purple-600"
                        />
                        <span className="font-mono text-slate-500">col_end:</span>
                        <input
                          type="number"
                          min={ilocColStart + 1}
                          max={5}
                          value={ilocColEnd}
                          onChange={(e) => setIlocColEnd(Math.max(Number(e.target.value), ilocColStart + 1))}
                          className="w-16 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center bg-slate-50 focus:bg-white focus:outline-purple-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Generated Python Code Preview */}
                <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-200 border border-slate-800">
                  <div className="text-slate-400 italic"># 动态生成的 Python 切片指令</div>
                  {sliceType === 'loc' ? (
                    <div className="text-amber-300 font-bold mt-1">
                      sub_df = df.loc[{locStart}:{locEnd}, [{selectedCols.map((c) => `'${c}'`).join(', ')}]]
                    </div>
                  ) : (
                    <div className="text-purple-300 font-bold mt-1">
                      sub_df = df.iloc[{ilocRowStart}:{ilocRowEnd}, {ilocColStart}:{ilocColEnd}]
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 4: FILTER LIVE INPUT CONTROLS */}
            {activeTab === 'filter' && (
              <motion.div
                key="code-filter"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                  <label className="block text-slate-800 font-extrabold border-b border-slate-100 pb-1.5">
                    配置布尔条件筛选参数：
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-slate-500 font-bold">df[</span>
                    <select
                      value={filterCol}
                      onChange={(e) => setFilterCol(e.target.value as 'score' | 'age')}
                      className="px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-slate-50 text-slate-800 focus:bg-white focus:outline-teal-600"
                    >
                      <option value="score">'score'</option>
                      <option value="age">'age'</option>
                    </select>

                    <select
                      value={filterOp}
                      onChange={(e) => setFilterOp(e.target.value as any)}
                      className="px-2 py-1.5 border border-slate-300 rounded font-mono font-bold bg-slate-50 text-teal-700 focus:bg-white focus:outline-teal-600"
                    >
                      <option value=">=">&gt;=</option>
                      <option value=">">&gt;</option>
                      <option value="<=">&lt;=</option>
                      <option value="<">&lt;</option>
                      <option value="==">==</option>
                    </select>

                    <input
                      type="number"
                      value={filterVal}
                      onChange={(e) => setFilterVal(Number(e.target.value))}
                      className="w-20 px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-slate-50 text-amber-700 focus:bg-white focus:outline-teal-600"
                    />
                    <span className="font-mono text-slate-500 font-bold">]</span>
                  </div>
                </div>

                {/* Generated Python Code Preview */}
                <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-200 border border-slate-800 space-y-1">
                  <div className="text-slate-400 italic"># 动态生成的条件筛选代码</div>
                  <div className="text-teal-300 font-bold">
                    condition = df['{filterCol}'] {filterOp} {filterVal}
                  </div>
                  <div className="text-slate-200">
                    filtered_df = df[condition]
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 rounded-xl bg-teal-50 p-3 border border-teal-200/80 text-xs text-teal-900">
            <Sparkles className="h-4 w-4 shrink-0 text-teal-600" />
            <div className="font-medium leading-relaxed">
              {activeTab === 'csv' && 'Pandas 自动推断第一行为表头 (Columns)，第一列前生成 0 开始的整型 Index。'}
              {activeTab === 'dict' && '字典的 Key 映射为 DataFrame 的列名，Value 列表长度必须完全相等。'}
              {activeTab === 'slicing' && (sliceType === 'loc' ? 'loc 显式切片包含末端标签！右侧金色表格根据输入实时高亮选区。' : 'iloc 整数切片前闭后开！右侧紫色表格根据输入实时高亮选区。')}
              {activeTab === 'filter' && '布尔向量按位运算，右侧绿框高亮匹配项，并实时计算匹配行数。'}
            </div>
          </div>
        </div>

        {/* Right Panel: Interactive DataFrame Table Visualizer */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 overflow-x-auto">
          <div className="flex items-center justify-between mb-3 text-xs font-extrabold text-slate-800 border-b border-slate-200/80 pb-2">
            <span className="flex items-center gap-1.5">
              <Table className="h-4 w-4 text-teal-600" />
              <span>pd.DataFrame 实时渲染与高亮</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {activeTab === 'filter'
                ? `Filtered Shape: (${dataRows.filter(isRowFiltered).length}, 5)`
                : 'Full Shape: (5, 5)'}
            </span>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-xl border-2 border-slate-300 bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b-2 border-slate-300">
                  <th className="px-3 py-2.5 text-teal-700 font-extrabold bg-slate-200/60 border-r border-slate-300 text-center w-12">
                    Index
                  </th>
                  {allColumns.map((colName, cIdx) => {
                    const isLocColSelected = activeTab === 'slicing' && sliceType === 'loc' && selectedCols.includes(colName);
                    const isIlocColSelected = activeTab === 'slicing' && sliceType === 'iloc' && cIdx >= ilocColStart && cIdx < ilocColEnd;
                    const isHeaderActive = isLocColSelected || isIlocColSelected;

                    return (
                      <th
                        key={colName}
                        className={`px-3 py-2.5 font-extrabold transition-colors ${
                          isHeaderActive
                            ? (sliceType === 'loc' ? 'bg-amber-200 text-amber-950 border-b-2 border-amber-500' : 'bg-purple-200 text-purple-950 border-b-2 border-purple-500')
                            : 'text-slate-800'
                        }`}
                      >
                        {colName}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dataRows.map((row, rIdx) => {
                  const isFiltered = isRowFiltered(row);

                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: rIdx * 0.04 }}
                      className={`transition-colors ${
                        isFiltered
                          ? 'bg-teal-100/80 border-l-4 border-teal-600 text-teal-950 font-bold'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center font-bold text-teal-700 bg-slate-100/70 border-r border-slate-200">
                        {rIdx}
                      </td>
                      {allColumns.map((colName, cIdx) => {
                        const cellSliced = isCellSliced(rIdx, colName, cIdx);

                        let cellClass = 'text-slate-700';
                        if (cellSliced) {
                          cellClass = sliceType === 'loc'
                            ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                            : 'bg-purple-100 text-purple-950 font-bold border border-purple-300';
                        } else if (isFiltered) {
                          cellClass = 'text-teal-950 font-bold';
                        }

                        return (
                          <td key={colName} className={`px-3 py-2.5 transition-colors ${cellClass}`}>
                            {row[colName as keyof typeof row]}
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Dynamic Match Counter Footer */}
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between font-medium">
            <span>
              {activeTab === 'slicing' && (sliceType === 'loc' ? `loc Selected: [${locStart}:${locEnd}, ${selectedCols.join(',')}]` : `iloc Selected: [${ilocRowStart}:${ilocRowEnd}, ${ilocColStart}:${ilocColEnd}]`)}
              {activeTab === 'filter' && `Matching Rows: ${dataRows.filter(isRowFiltered).length} / ${dataRows.length}`}
              {activeTab !== 'slicing' && activeTab !== 'filter' && 'dtypes: id(int64), name(object), age(int64), city(object), score(int64)'}
            </span>
            <span className="text-teal-700 font-mono font-bold">Live Output</span>
          </div>
        </div>
      </div>
    </div>
  );
}
