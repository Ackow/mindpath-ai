'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn, ZoomOut, RotateCcw, X, Maximize2 } from 'lucide-react';

interface ZoomableImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!src) return null;

  // 提取有效的图片 alt 作为图注文本
  const captionText = alt && alt.trim() && !alt.startsWith('/') ? alt.trim() : null;

  const handleOpen = () => {
    setIsOpen(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleClose = () => {
    setIsOpen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.5, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.2, 4));
    } else {
      setScale((prev) => Math.max(prev - 0.2, 0.5));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 transition-all animate-in fade-in duration-200"
      onClick={handleClose}
    >
      {/* 顶部控制栏 */}
      <div
        className="absolute top-4 right-4 z-[10000] flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 p-1.5 text-slate-200 shadow-xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white"
          title="放大 (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono px-2 text-teal-400 font-bold">{Math.round(scale * 100)}%</span>
        <button
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white"
          title="缩小 (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white"
          title="重置"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-800 my-auto" />
        <button
          onClick={handleClose}
          className="p-1.5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
          title="关闭 (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 图像放大视口 */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt || '插图放大'}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
        />
      </div>

      {/* 弹窗底部图注 */}
      {captionText && (
        <div className="absolute bottom-6 inset-x-0 text-center pointer-events-none z-[10000] px-4">
          <span className="inline-block bg-slate-900/90 border border-slate-800 text-slate-200 text-xs px-4 py-2 rounded-xl backdrop-blur-md shadow-xl font-medium">
            图：{captionText}
          </span>
        </div>
      )}
    </div>
  ) : null;

  return (
    <span className="my-6 flex flex-col items-center justify-center">
      {/* 行内图片容器 */}
      <span
        onClick={handleOpen}
        className="group relative cursor-pointer inline-block overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 shadow-xs transition-all hover:shadow-md hover:border-teal-400"
      >
        <img
          src={src}
          alt={alt || '插图'}
          className={`max-w-full h-auto object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01] ${className || ''}`}
        />
        {/* 鼠标悬浮提示层 */}
        <span className="absolute inset-0 bg-slate-900/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white font-medium text-xs backdrop-blur-[1px]">
          <Maximize2 className="w-4 h-4" />
          <span>点击放大查看</span>
        </span>
      </span>

      {/* 自动生成的中文图注 */}
      {captionText && (
        <span className="mt-2.5 text-center text-xs text-slate-500 font-medium leading-relaxed italic flex items-center gap-1">
          <span>图：{captionText}</span>
        </span>
      )}

      {/* 全屏 Modal 使用 React Portal 挂载到 document.body，彻底避免 <p> 标签嵌套 <div> 的 Hydration 错误 */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </span>
  );
};
