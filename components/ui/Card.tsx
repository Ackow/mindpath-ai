import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card transition-all duration-200",
          hoverable && "hover:shadow-md hover:border-slate-300 cursor-pointer",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
