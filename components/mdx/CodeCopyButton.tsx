'use client';

import React, { useState } from 'react';

interface CodeCopyButtonProps {
  codeText?: string;
}

export const CodeCopyButton: React.FC<CodeCopyButtonProps> = ({ codeText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (codeText) {
      navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-slate-400 hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
    >
      {copied ? '已复制' : '复制'}
    </button>
  );
};
