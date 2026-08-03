import React from 'react';
import { Lightbulb, AlertTriangle, Info } from 'lucide-react';

interface ConceptCardProps {
  title?: string;
  type?: 'intuition' | 'warning' | 'info';
  children: React.ReactNode;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({
  title = "核心定义",
  type = "intuition",
  children,
}) => {
  const styles = {
    intuition: {
      bg: "bg-teal-50/60",
      border: "border-teal-200",
      icon: Lightbulb,
      iconColor: "text-teal-600",
      titleColor: "text-teal-900",
    },
    warning: {
      bg: "bg-amber-50/60",
      border: "border-amber-200",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      titleColor: "text-amber-900",
    },
    info: {
      bg: "bg-blue-50/60",
      border: "border-blue-200",
      icon: Info,
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
    },
  };

  const current = styles[type] || styles.intuition;
  const Icon = current.icon;

  return (
    <div className={`my-4 p-4 rounded-xl border ${current.bg} ${current.border} shadow-sm space-y-1.5`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${current.iconColor}`} />
        <h4 className={`font-bold text-xs ${current.titleColor}`}>{title}</h4>
      </div>
      <div className="text-xs text-slate-700 leading-relaxed pl-6">{children}</div>
    </div>
  );
};
