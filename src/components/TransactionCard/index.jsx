/*
  FILE: TransactionCard/index.jsx
  WHAT IT DOES: Renders an individual list item representing a single financial transaction. It handles inline category badge formatting, recurring spin animations, and built-in delete confirmation logic without disrupting the UX layout via external modals.
  USED IN: Dashboard/index.jsx, Transactions/index.jsx
*/
import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiEditLine,
  RiDeleteBinLine,
  RiRestaurantLine,
  RiFlightTakeoffLine,
  RiHome4Line,
  RiShoppingBag3Line,
  RiFilmLine,
  RiStethoscopeLine,
  RiFlashlightLine,
  RiSmartphoneLine,
  RiBriefcaseLine, // Changed from RiBriefcase4Line
  RiMacbookLine,
  RiStockLine, // Changed from RiLineChartLine
  RiMoneyDollarCircleLine,
  RiRefreshLine,
  RiCloseLine,
  RiCheckLine
} from 'react-icons/ri';
import useCurrency from '../../hooks/useCurrency';
import { format } from 'date-fns'; // Added import for date-fns

// Map categories to specific icons and gradient colors
const categoryConfig = {
  Food: { icon: RiRestaurantLine, color: 'from-orange-500 to-amber-400' },
  Travel: { icon: RiFlightTakeoffLine, color: 'from-blue-500 to-cyan-400' },
  Rent: { icon: RiHome4Line, color: 'from-purple-500 to-fuchsia-400' },
  Shopping: { icon: RiShoppingBag3Line, color: 'from-pink-500 to-rose-400' },
  Entertainment: { icon: RiFilmLine, color: 'from-yellow-500 to-amber-300' },
  Health: { icon: RiStethoscopeLine, color: 'from-green-500 to-emerald-400' },
  Utilities: { icon: RiFlashlightLine, color: 'from-cyan-500 to-teal-400' },
  Subscriptions: { icon: RiSmartphoneLine, color: 'from-violet-500 to-purple-400' },
  Salary: { icon: RiBriefcaseLine, color: 'from-emerald-500 to-green-400' }, // Updated icon
  Freelance: { icon: RiMacbookLine, color: 'from-teal-500 to-cyan-400' },
  Investment: { icon: RiStockLine, color: 'from-blue-600 to-indigo-500' }, // Updated icon
  Other: { icon: RiMoneyDollarCircleLine, color: 'from-slate-500 to-gray-400' },
};

export default function TransactionCard({ transaction, onEdit, onDelete }) {
  const { formatCurrency } = useCurrency();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Added state for hover

  const config = categoryConfig[transaction.category] || categoryConfig.Other;
  const Icon = config.icon;
  const isIncome = transaction.type === 'income';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`group relative flex w-full flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden rounded-2xl border bg-white/5 px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 hover:bg-white/10 ${
        transaction.recurring
          ? 'border-y-white/10 border-r-white/10 border-l-4 border-l-violet-500'
          : 'border-white/10'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left side: Icon + Details */}
      <div className="flex items-center gap-4">
        {/* Category Icon */}
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${config.color} shadow-lg`}
        >
          <Icon className="text-xl text-white drop-shadow-sm" />
        </div>

        {/* Text details */}
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium text-slate-100 line-clamp-1">
            {transaction.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-400">
              {transaction.category}
            </span>
            {transaction.recurring && (
              <span className="flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-400 border border-violet-500/30" title="Recurring transaction">
                <RiRefreshLine className="animate-[spin_3s_linear_infinite]" /> Recurring
              </span>
            )}
            <span className="text-xs text-slate-500 hidden sm:inline-block">
              {format(new Date(transaction.date), 'HH:mm')}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Amount + Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-4 pl-14 sm:pl-0">
        
        {/* Amount & Type */}
        <div className="flex flex-col items-start sm:items-end">
          <span
            className={`text-base font-semibold ${
              isIncome ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </span>
          <span
            className={`mt-1 rounded-sm px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
              isIncome
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {transaction.type}
          </span>
        </div>

        {/* Hover Actions / Inline Confirm */}
        <div className="flex items-center sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 min-w-[70px] justify-end">
          <AnimatePresence mode="wait">
            {showConfirm ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 bg-red-500/10 rounded-lg p-1 border border-red-500/20"
              >
                <span className="text-xs text-red-400 font-medium px-1">Delete?</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(transaction.id);
                  }}
                  className="rounded bg-red-500/20 p-1 text-red-400 hover:bg-red-500/40 transition-colors"
                  aria-label="Confirm delete"
                >
                  <RiCheckLine size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(false);
                  }}
                  className="rounded bg-white/5 p-1 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
                  aria-label="Cancel delete"
                >
                  <RiCloseLine size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(transaction.id);
                  }}
                  className="rounded-lg bg-white/5 p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Edit transaction"
                >
                  <RiEditLine size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(true);
                  }}
                  className="rounded-lg bg-red-500/10 p-1.5 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                  aria-label="Delete transaction"
                >
                  <RiDeleteBinLine size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Proptypes explicitly required to validate component incoming node schemas safely.
TransactionCard.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['income', 'expense']).isRequired,
    category: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    recurring: PropTypes.bool,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
