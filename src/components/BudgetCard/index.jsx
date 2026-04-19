/*
  FILE: BudgetCard/index.jsx
  WHAT IT DOES: Renders a visual snapshot of current budget utilization against a defined ceiling, utilizing dynamic color thresholds to warn users.
  USED IN: Dashboard/index.jsx, Budget/index.jsx
*/
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function BudgetCard({ title, current, total, color = "emerald" }) {
  // Step 1: Calculate percentage securely to ensure we don't output NaN formatting if total is zero.
  let percentage = 0;
  if (total > 0) {
    percentage = Math.min(Math.round((current / total) * 100), 100);
  }
  
  // Step 2: Extract base UI formatting styles defaults
  let barColorClass = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
  let textColorClass = 'text-emerald-400';
  
  // Step 3: Map automatic usage threshold warnings (danger/warning colors)
  if (percentage >= 90) {
    barColorClass = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    textColorClass = 'text-red-400';
  } else if (percentage >= 70) {
    barColorClass = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
    textColorClass = 'text-yellow-400';
  }
  
  // Step 4: Override colors if specifically requested via components props
  if (color === 'red') {
    barColorClass = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    textColorClass = 'text-red-400';
  } else if (color === 'blue') {
    barColorClass = 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
    textColorClass = 'text-blue-400';
  } else if (color === 'purple') {
    barColorClass = 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
    textColorClass = 'text-purple-400';
  } else if (color === 'orange') {
    barColorClass = 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
    textColorClass = 'text-orange-400';
  }

  // Calculate integer math difference for label printing
  const remaining = total - current;

  return (
    <div className="flex w-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-white/10">
      <div className="mb-3 flex items-end justify-between">
        <h4 className="text-sm font-medium text-slate-300">{title}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-slate-100">₹{current.toLocaleString()}</span>
          <span className="text-xs text-slate-500">of ₹{total.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="mb-3 flex items-center gap-3">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#0a0a0f] border border-white/5 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
            className={`h-full rounded-full ${barColorClass}`}
          />
        </div>
        <span className={`text-xs font-bold leading-none ${textColorClass}`}>
          {percentage}%
        </span>
      </div>

      <div className="text-xs text-slate-400">
        {remaining >= 0 ? (
          <span><strong className="text-emerald-400 font-semibold">₹{remaining.toLocaleString()}</strong> remaining</span>
        ) : (
          <span><strong className="text-red-400 font-semibold">₹{Math.abs(remaining).toLocaleString()}</strong> over budget</span>
        )}
      </div>
    </div>
  );
}

// Proptypes explicitly required to validate component usage patterns safely.
BudgetCard.propTypes = {
  title: PropTypes.string.isRequired,
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.oneOf(['emerald', 'red', 'blue', 'purple', 'orange']),
};
