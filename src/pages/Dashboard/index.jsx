import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiDragMove2Line, RiPaletteLine, RiSettings4Line, 
  RiArrowRightUpLine, RiArrowRightDownLine, RiWalletLine,
  RiPieChartLine, RiAddLine, RiEditLine
} from 'react-icons/ri';
import { useFinance } from "../../context/FinanceContext";
import SkeletonCard from "../../components/SkeletonCard";
import BarChart from "../../components/Charts/BarChart";
import SmartAlert from "../../components/SmartAlert";
import ResetDataModal from '../../components/ResetDataModal';
import { Link } from 'react-router-dom';
import { RiErrorWarningLine } from 'react-icons/ri';

export default function Dashboard() {
  const {
    userData,
    setUserData,
    transactions,
    stats,
    loading,
    isOffline,
    formatINR,
    updateBudget,
    addTransaction
  } = useFinance();

  // Layout State (DND)
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('dash_layout');
    return saved ? JSON.parse(saved).filter(k => k !== 'budget') : ['stats', 'chart', 'transactions', 'theme'];
  });

  // Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Appearance State
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('dash_accent') || '#8b5cf6');
  
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    localStorage.setItem('dash_accent', accentColor);
  }, [accentColor]);

  // Inline Edit State
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleStatEdit = async (item) => {
    const numVal = parseFloat(editValue);
    if (isNaN(numVal) || numVal < 0) {
       setEditingKey(null);
       return;
    }
    
    setUserData({ [item.editKey]: numVal });
    setEditingKey(null);
  };

  // DND Handlers
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('dragIndex', index);
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData('dragIndex');
    const newLayout = [...layout];
    const draggedItem = newLayout[dragIndex];
    newLayout.splice(dragIndex, 1);
    newLayout.splice(dropIndex, 0, draggedItem);
    setLayout(newLayout);
    localStorage.setItem('dash_layout', JSON.stringify(newLayout));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 space-y-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><SkeletonCard tall /></div>
          <div><SkeletonCard tall /></div>
        </div>
      </div>
    );
  }

  const widgets = {
    stats: (
      <div key="stats" className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-4 translate-z-0">
        {[
          { label: "Monthly Income", value: userData?.monthlyIncome, color: "text-emerald-400", sub: "Recurrent", type: "income", editKey: "monthlyIncome" },
          { label: "Savings Goal", value: userData?.savingsGoal, color: "text-indigo-400", sub: "Target monthly", type: "goal", editKey: "savingsGoal" },
          { label: "Total Expenses", value: stats.totalExpense, color: "text-red-400", sub: "This month", type: "expense" },
          { label: "Net Balance", value: stats.netBalance, color: stats.netBalance >= 0 ? "text-emerald-400" : "text-red-400", sub: "Savings progress", type: "balance" }
        ].map((item, idx) => (
          <motion.div 
            layout
            key={item.label}
            className="group relative rounded-2xl border border-white/10 p-5 overflow-hidden transition-all hover:border-[var(--accent)]/30"
            style={{ background: "#13131a" }}
          >
            <div className="absolute top-0 right-0 p-3 flex gap-2">
              {item.editKey && (
                 <RiEditLine 
                   className={`cursor-pointer transition-colors ${editingKey === item.editKey ? 'text-emerald-400' : 'text-white/40 hover:text-white opacity-100 md:opacity-0 md:group-hover:opacity-100'}`} 
                   title={`Edit ${item.label}`}
                   onClick={() => {
                     if (editingKey === item.editKey) {
                        handleStatEdit(item);
                     } else {
                        setEditingKey(item.editKey);
                        setEditValue(item.value?.toString() || "0");
                     }
                   }}
                 />
              )}
               <RiDragMove2Line className="text-white/20 cursor-grab hidden md:block" title="Drag to move" />
            </div>
            <p className="text-gray-500 text-xs font-medium mb-1">{item.label}</p>
            {editingKey === item.editKey ? (
              <input
                autoFocus
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleStatEdit(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStatEdit(item);
                  if (e.key === 'Escape') setEditingKey(null);
                }}
                className={`w-full bg-white/5 border-b-2 border-emerald-500/50 outline-none text-xl font-bold font-['Sora'] ${item.color} py-0 px-0`}
              />
            ) : (
              <h3 className={`text-xl font-bold font-['Sora'] ${item.color}`}>{formatINR(item.value)}</h3>
            )}
            <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-tighter">{item.sub}</p>
          </motion.div>
        ))}
      </div>
    ),
    chart: (
      <div key="chart" className="lg:col-span-2 rounded-2xl border border-white/10 p-6 flex flex-col min-h-[400px]" style={{ background: "#13131a" }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <RiPieChartLine className="text-indigo-400" /> Cash Flow Trend
          </h3>
          <RiDragMove2Line className="text-white/10 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex-1 w-full h-full min-h-[300px]">
          {stats.totalExpense === 0 && stats.totalIncome === 0 ? (
            <div className="flex h-full w-full items-center justify-center bg-black/20 rounded-xl">
               <p className="text-gray-500 text-sm">No Data Available</p>
            </div>
          ) : (
            <BarChart data={stats.monthlyTrend} />
          )}
        </div>
      </div>
    ),
    transactions: (
      <div key="transactions" className="rounded-2xl border border-white/10 p-6 flex flex-col h-full" style={{ background: "#13131a" }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-semibold">Recent Activity</h3>
          <Link to="/transactions" className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
            View All <RiArrowRightUpLine />
          </Link>
        </div>
        <div className="space-y-4">
          {stats.thisMonth.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 text-sm">No transactions found</p>
              <Link to="/transactions/new" className="text-[var(--accent)] text-xs mt-2 inline-block">Add your first expense</Link>
            </div>
          ) : (
            stats.thisMonth.slice(0, 5).map((tx, idx) => (
              <div key={tx.id || idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.type === 'income' ? <RiArrowRightUpLine /> : <RiArrowRightDownLine />}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium leading-tight">{tx.description || tx.category}</p>
                    <p className="text-gray-500 text-[10px] mt-1">{tx.category}</p>
                  </div>
                </div>
                <p className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    ),
    theme: (
      <div key="theme" className="rounded-2xl border border-white/10 p-6" style={{ background: "#13131a" }}>
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
          <RiPaletteLine className="text-indigo-400" /> Appearance
        </h3>
        <div className="flex flex-wrap gap-4">
          {[
            { name: "Violet", val: "#8b5cf6" },
            { name: "Blue", val: "#3b82f6" },
            { name: "Emerald", val: "#10b981" },
            { name: "Rose", val: "#f43f5e" },
            { name: "Amber", val: "#f59e0b" }
          ].map((color) => (
            <button
              key={color.val}
              onClick={() => setAccentColor(color.val)}
              className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${accentColor === color.val ? 'border-white' : 'border-transparent'}`}
              style={{ background: color.val }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      <SmartAlert />
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Sora'] flex items-center gap-3">
             Dashboard
             {isOffline && (
               <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                 <span className="text-[10px] text-amber-500 uppercase font-bold tracking-widest whitespace-nowrap">Offline Cache</span>
               </div>
             )}
          </h1>
          <p className="text-gray-500 text-sm">Welcome back, {userData?.name || 'User'}</p>
        </div>
        <Link 
          to="/transactions/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white font-bold text-sm shadow-lg shadow-[var(--accent)]/20 hover:scale-105 transition-transform"
        >
          <RiAddLine className="text-lg" /> Add Transaction
        </Link>
      </div>

      {/* Grid Layout (Draggable) */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 content-start">
        {layout.map((widgetKey, idx) => widgets[widgetKey] && (
          <div
            key={widgetKey}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, idx)}
            className={`transition-all duration-300 ${widgetKey === 'stats' ? 'md:col-span-4' : widgetKey === 'chart' ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-2 lg:col-span-1'}`}
          >
             {widgets[widgetKey]}
          </div>
        ))}
      </div>

      <style>{`
        :root { --accent: #8b5cf6; }
        .translate-z-0 { transform: translateZ(0); }
      `}</style>
      
      {/* Advanced Reset Section */}
      <div className="mt-8 p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-red-400 font-bold flex items-center gap-2">
            <RiErrorWarningLine /> Danger Zone
          </h3>
          <p className="text-gray-400 text-sm mt-1">Need a fresh start? You can wipe specific history or factory reset your entire account locally and remotely.</p>
        </div>
        <button 
          onClick={() => setIsResetModalOpen(true)}
          className="px-6 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/30 rounded-xl font-bold transition-colors whitespace-nowrap"
        >
          Reset Database
        </button>
      </div>

      <ResetDataModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />
    </div>
  );
}
