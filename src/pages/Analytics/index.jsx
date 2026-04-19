import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  RiArrowDownLine,
  RiRestaurantLine, RiFlightTakeoffLine, RiHome4Line, RiShoppingBag3Line,
  RiFilmLine, RiStethoscopeLine, RiFlashlightLine, RiSmartphoneLine, RiMoneyDollarCircleLine
} from 'react-icons/ri';
import { useFinance } from '../../context/FinanceContext';
import useCurrency from '../../hooks/useCurrency';
import PieChart from '../../components/Charts/PieChart';
import LineChart from '../../components/Charts/LineChart';
import BarChart from '../../components/Charts/BarChart';

const categoryIcons = {
  Food: RiRestaurantLine, Travel: RiFlightTakeoffLine, Rent: RiHome4Line,
  Shopping: RiShoppingBag3Line, Entertainment: RiFilmLine, Health: RiStethoscopeLine,
  Utilities: RiFlashlightLine, Subscriptions: RiSmartphoneLine, Other: RiMoneyDollarCircleLine
};

const categoryColors = {
  Food: '#f97316', Travel: '#0ea5e9', Rent: '#a855f7', Shopping: '#ec4899',
  Entertainment: '#eab308', Health: '#10b981', Utilities: '#06b6d4',
  Subscriptions: '#8b5cf6', Other: '#64748b'
};

export default function Analytics() {
  const { totals, expensesByCategory, monthlyTrend } = useFinance();
  const { formatCurrency, formatCurrencyShort } = useCurrency();

  useEffect(() => {
    document.title = "Analytics | FinanceIQ";
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const savingsRate = totals.totalIncome > 0 
    ? Math.max(0, Math.round(((totals.totalIncome - totals.totalExpense) / totals.totalIncome) * 100)) 
    : 0;

  // useMemo: Memoize pieData to avoid expensive filter, sort, and map operations 
  // on every render unless the source data changes.
  const pieData = useMemo(() => {
    return Object.entries(expensesByCategory)
      .filter(([_, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        color: categoryColors[name] || '#64748b'
      }));
  }, [expensesByCategory]);

  // useMemo: Simple reference stability for trend data.
  const trendData = useMemo(() => Object.values(monthlyTrend), [monthlyTrend]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="pb-10">
      <div className="mb-8">
        <h1 className="font-['Sora'] text-2xl font-semibold text-slate-100">Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">Deep dive into your financial data</p>
      </div>

      {/* SECTION 1: Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <p className="text-sm font-medium text-slate-400">Total Income</p>
          <p className="mt-2 font-['Sora'] text-2xl font-bold text-emerald-400">+{formatCurrencyShort(totals.totalIncome)}</p>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <p className="text-sm font-medium text-slate-400">Total Expenses</p>
          <p className="mt-2 font-['Sora'] text-2xl font-bold text-red-400">-{formatCurrencyShort(totals.totalExpense)}</p>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <p className="text-sm font-medium text-slate-400">Net Balance</p>
          <p className="mt-2 font-['Sora'] text-2xl font-bold text-slate-100">₹{formatCurrency(totals.netBalance)}</p>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl border-t-violet-500/30">
          <p className="text-sm font-medium text-slate-400">Savings Rate</p>
          <p className="mt-2 font-['Sora'] text-2xl font-bold text-violet-400">{savingsRate}%</p>
        </motion.div>
      </div>

      {/* SECTION 2 & 3: Charts Grid */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <PieChart data={pieData} title="Spending by Category" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <LineChart data={trendData} title="Monthly Trend" />
        </motion.div>
      </div>

      {/* SECTION 4: Bar Chart */}
      <motion.div variants={itemVariants} className="mb-8 w-full">
        <BarChart data={trendData} title="Income vs Expenses (Last 6 Months)" />
      </motion.div>

      {/* SECTION 5: Category Breakdown Table */}
      <motion.div variants={itemVariants} className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl flex flex-col">
        <h3 className="mb-6 font-['Sora'] text-lg font-medium text-slate-100">Category Breakdown</h3>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="pb-4 font-medium pl-2">Category</th>
                <th className="pb-4 font-medium px-4 text-right">Amount Spent</th>
                <th className="pb-4 font-medium px-4">% of Total</th>
                <th className="pb-4 font-medium px-4">vs Last Month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {pieData.map((item) => {
                const Icon = categoryIcons[item.name] || categoryIcons.Other;
                const percentage = totals.totalExpense > 0 ? ((item.value / totals.totalExpense) * 100).toFixed(1) : 0;
                return (
                  <tr key={item.name} className="hover:bg-white-[0.02] transition-colors group">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/5 shadow-sm" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                          <Icon size={18} />
                        </div>
                        <span className="font-medium text-slate-200">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-[15px] font-semibold text-red-400">
                      -{formatCurrencyShort(item.value)}
                    </td>
                    <td className="py-4 px-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="relative h-1.5 w-full bg-black/30 rounded-full overflow-hidden flex-1 shadow-inner border border-white/5">
                          <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}60` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-400 w-12 text-right">{percentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {/* Placeholder for trend indicator */}
                      <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md w-fit inline-flex">
                        <RiArrowDownLine /> 2.4%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pieData.length === 0 && (
            <div className="flex py-12 items-center justify-center text-slate-500 text-sm">
              No category data found
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
