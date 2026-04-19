/*
  FILE: Filters/index.jsx
  WHAT IT DOES: Renders the comprehensive list of buttons and forms allowing users to modify active list sorting permutations.
  USED IN: Transactions/index.jsx
*/
import { motion, AnimatePresence } from 'framer-motion';
import { RiSortAsc, RiSortDesc, RiRefreshLine, RiFilter3Line, RiArrowDownSLine } from 'react-icons/ri';
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const CATEGORIES = [
  'All', 'Food', 'Travel', 'Rent', 'Shopping', 
  'Entertainment', 'Health', 'Utilities', 'Subscriptions',
  'Salary', 'Freelance', 'Investment', 'Other'
];

export default function Filters({ filters, setters, onClear }) {
  const {
    filterCategory,
    filterType,
    filterRecurring,
    dateRange,
    sortBy,
    sortOrder,
  } = filters;

  const {
    setFilterCategory,
    setFilterType,
    setFilterRecurring,
    setDateRange,
    setSortBy,
    setSortOrder,
  } = setters;

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate active filters count
  const activeCount = 
    (filterCategory !== 'all' ? 1 : 0) +
    (filterType !== 'all' ? 1 : 0) +
    (filterRecurring ? 1 : 0) +
    (dateRange?.start ? 1 : 0) +
    (dateRange?.end ? 1 : 0) +
    (sortBy !== 'date' ? 1 : 0) +
    (sortOrder !== 'desc' ? 1 : 0);

  const handleCategoryClick = (cat) => {
    setFilterCategory(cat === 'All' ? 'all' : cat);
  };

  const handleTypeClick = (type) => {
    setFilterType(type === 'All' ? 'all' : type.toLowerCase());
  };

  return (
    <div className="flex w-full flex-col gap-3 relative z-[50]">
      <div className="flex items-center justify-between px-1">
        <h3 className="flex items-center gap-2 text-sm font-medium text-slate-300">
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-sm font-medium text-red-400 transition-colors hover:text-red-300"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pb-2 overflow-visible">
        {/* Category Filter Dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-all ${
              filterCategory !== 'all'
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/50'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            <RiFilter3Line className="text-sm" />
            <span>{filterCategory === 'all' ? 'All Categories' : filterCategory}</span>
            <RiArrowDownSLine className={`transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isCategoryMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 top-full z-[100] mt-2 w-64 rounded-2xl border border-white/10 bg-[#0d0d1a]/95 p-2 shadow-2xl backdrop-blur-2xl"
              >
                <div className="grid grid-cols-2 gap-1">
                  {CATEGORIES.map((cat) => {
                    const isSelected = (cat === 'All' && filterCategory === 'all') || cat === filterCategory;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          handleCategoryClick(cat);
                          setIsCategoryMenuOpen(false);
                        }}
                        className={`rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-violet-500 text-white font-semibold'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Type Filter */}
        <motion.div whileHover={{ scale: 1.02 }} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-[#0f0f1a] p-1 shadow-sm">
          {['All', 'Income', 'Expense'].map(type => {
            const typeLower = type.toLowerCase();
            const isSelected = (type === 'All' && filterType === 'all') || filterType === typeLower;
            return (
              <button
                key={type}
                onClick={() => handleTypeClick(type)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50'
                    : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            );
          })}
        </motion.div>

        {/* Recurring Toggle Button */}
        <motion.div whileHover={{ scale: 1.02 }} className="flex shrink-0">
          <button
            onClick={() => setFilterRecurring(!filterRecurring)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-medium transition-colors border ${
              filterRecurring
                ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <RiRefreshLine className={filterRecurring ? "animate-[spin_3s_linear_infinite]" : ""} />
            Recurring
          </button>
        </motion.div>

        {/* Date From */}
        <motion.div whileHover={{ scale: 1.02 }} className="flex shrink-0 items-center rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 shadow-sm">
          <label className="mr-2 text-xs font-medium text-slate-400">From:</label>
          <input
            type="date"
            value={dateRange?.start || ''}
            onChange={(e) => setDateRange({ ...(dateRange || {}), start: e.target.value })}
            className="bg-transparent text-sm font-medium text-slate-100 outline-none [color-scheme:dark]"
          />
        </motion.div>

        {/* Date To */}
        <motion.div whileHover={{ scale: 1.02 }} className="flex shrink-0 items-center rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 shadow-sm">
          <label className="mr-2 text-xs font-medium text-slate-400">To:</label>
          <input
            type="date"
            value={dateRange?.end || ''}
            onChange={(e) => setDateRange({ ...(dateRange || {}), end: e.target.value })}
            className="bg-transparent text-sm font-medium text-slate-100 outline-none [color-scheme:dark]"
          />
        </motion.div>

        {/* Sort By & Order Component */}
        <motion.div whileHover={{ scale: 1.02 }} className="flex shrink-0 items-center gap-0 rounded-xl border border-white/10 bg-[#0f0f1a] shadow-sm">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-l-xl bg-transparent px-3 py-2.5 text-xs font-medium text-slate-200 outline-none appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9' /%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1em 1em',
              paddingRight: '1.5rem'
            }}
          >
            <option value="date" className="bg-[#0f0f1a]">Date</option>
            <option value="amount" className="bg-[#0f0f1a]">Amount</option>
            <option value="category" className="bg-[#0f0f1a]">Category</option>
          </select>
          <div className="h-4 w-px bg-white/10"></div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center justify-center rounded-r-xl px-2 py-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Toggle sort order"
          >
            {sortOrder === 'asc' ? <RiSortAsc size={16} /> : <RiSortDesc size={16} />}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

Filters.propTypes = {
  filters: PropTypes.shape({
    filterCategory: PropTypes.string,
    filterType: PropTypes.string,
    filterRecurring: PropTypes.bool,
    dateRange: PropTypes.shape({
      start: PropTypes.string,
      end: PropTypes.string,
    }),
    sortBy: PropTypes.string,
    sortOrder: PropTypes.oneOf(['asc', 'desc']),
  }).isRequired,
  setters: PropTypes.shape({
    setFilterCategory: PropTypes.func,
    setFilterType: PropTypes.func,
    setFilterRecurring: PropTypes.func,
    setDateRange: PropTypes.func,
    setSortBy: PropTypes.func,
    setSortOrder: PropTypes.func,
  }).isRequired,
  onClear: PropTypes.func.isRequired,
};
