import React from 'react';
import { RiAlertLine, RiCheckboxCircleLine, RiLightbulbLine } from 'react-icons/ri';

export default function InsightCard({ type, title, detail }) {
  const config = {
    warning: {
      border: 'border-l-red-500',
      bg: 'bg-red-500/5',
      icon: <RiAlertLine className="text-red-500 text-xl" />,
    },
    positive: {
      border: 'border-l-emerald-500',
      bg: 'bg-emerald-500/5',
      icon: <RiCheckboxCircleLine className="text-emerald-500 text-xl" />,
    },
    tip: {
      border: 'border-l-amber-500',
      bg: 'bg-amber-500/5',
      icon: <RiLightbulbLine className="text-amber-500 text-xl" />,
    }
  };

  const style = config[type] || config.tip;

  return (
    <div className={`rounded-xl border border-white/10 border-l-4 ${style.border} ${style.bg} p-5 flex gap-4 transition-transform hover:scale-[1.01]`}>
      <div className="mt-1">{style.icon}</div>
      <div className="space-y-1">
        <h4 className="text-white font-medium">{title}</h4>
        <p className="text-sm text-gray-400 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}
