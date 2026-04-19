import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiRestaurantLine, RiFlightTakeoffLine, RiHome4Line, RiShoppingBag3Line,
  RiFilmLine, RiStethoscopeLine, RiFlashlightLine, RiSmartphoneLine, RiMoneyDollarCircleLine
} from 'react-icons/ri';
import { useFinance } from '../../context/FinanceContext';
import BudgetCard from '../../components/BudgetCard';

const categoryIcons = {
  Food: RiRestaurantLine, Travel: RiFlightTakeoffLine, Rent: RiHome4Line,
  Shopping: RiShoppingBag3Line, Entertainment: RiFilmLine, Health: RiStethoscopeLine,
  Utilities: RiFlashlightLine, Subscriptions: RiSmartphoneLine, Other: RiMoneyDollarCircleLine
};

// Colors must map to simple names for dynamic Tailwind processing natively inside BudgetCard
const categoryColors = {
  Food: 'orange', Travel: 'blue', Rent: 'purple', Shopping: 'red',
  Entertainment: 'yellow', Health: 'emerald', Utilities: 'cyan',
  Subscriptions: 'purple', Other: 'blue'
};

export default function Budget() {
  const { budget, setBudget, budgetStatus, expensesByCategory, budgets, updateBudget } = useFinance();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(budget.monthlyBudget);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [sliderValues, setSliderValues] = useState({});
  const [lockedCats, setLockedCats] = useState({});

  // Background Debounce Real-Time Syncing Protocol Hooks (1 second)
  useEffect(() => {
    if (Object.keys(sliderValues).length === 0) return;
    
    const timeoutId = setTimeout(() => {
      Object.entries(sliderValues).forEach(([cat, val]) => {
        updateBudget(cat, val);
      });
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [sliderValues]);

  useEffect(() => {
    document.title = "Budget | FinanceIQ";
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleSaveBudget = () => {
    const val = Number(editValue);
    if (!isNaN(val) && val > 0 && val <= 10000000) {
      setBudget(val);
      setIsEditing(false);
      toast.success('Budget updated! 🎯', {
        style: { background: '#1a1a2e', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' }
      });
    } else {
      toast.error('Please enter a valid amount (greater than 0)');
    }
  };

  const categories = useMemo(() => Object.keys(categoryIcons), []);

  // useMemo: Pre-calculate category allocation stats safely merged with synchronous slider overrides 
  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const spent = expensesByCategory[cat] || 0;
      const isPriority = ['Food', 'Rent', 'Travel', 'Shopping'].includes(cat);
      
      const customBudget = budgets.find(b => b.id === cat);
      const simulatedRatios = {
        Rent: 0.30, Food: 0.20, Travel: 0.10, Shopping: 0.15,
        Health: 0.05, Utilities: 0.10, Entertainment: 0.05, Subscriptions: 0.03, Other: 0.02
      };
      
      // Override seamlessly dynamically if the user is sliding
      let suggestedLimit = sliderValues[cat];
      if (suggestedLimit === undefined) {
         suggestedLimit = customBudget?.limit || Math.max(Math.round(budget.monthlyBudget * (simulatedRatios[cat] || 0.1)), 1000);
      }

      return { cat, spent, isPriority, suggestedLimit };
    });
  }, [categories, expensesByCategory, budget.monthlyBudget, budgets, sliderValues]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="pb-10">
      <div className="mb-8">
        <h1 className="font-['Sora'] text-2xl font-semibold text-slate-100">Budget</h1>
        <p className="mt-1 text-sm text-slate-400">Set and track your monthly spending limits</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* TOP/LEFT: Budget settings card */}
        <motion.div variants={itemVariants} className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl relative overflow-hidden">
          {/* Subtle gradient blob inside card */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-violet-600/10 blur-[80px]"></div>
          
          <p className="text-sm font-medium text-slate-400 mb-3 relative z-10">Monthly Budget Level</p>
          {isEditing ? (
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full max-w-[220px] border-b-2 border-violet-500 bg-transparent py-1 font-['Sora'] text-4xl font-bold text-slate-100 placeholder-slate-600 focus:border-violet-400 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSaveBudget} className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-2 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/20">
                  <RiCheckLine size={18} /> Save
                </button>
                <button onClick={() => { setIsEditing(false); setEditValue(budget.monthlyBudget); }} className="flex items-center justify-center gap-1.5 rounded-xl bg-white/5 px-5 py-2 text-sm font-medium text-slate-300 transition-colors border border-white/10 hover:bg-white/10 hover:text-white">
                  <RiCloseLine size={18} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 relative z-10 group">
              <h2 className="font-['Sora'] text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                ₹{budget.monthlyBudget.toLocaleString()}
              </h2>
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition-all border border-white/10 hover:bg-violet-500/20 hover:text-violet-300 hover:border-violet-500/30 shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100" 
                title="Edit Budget"
              >
                <RiEditLine size={20} />
              </button>
            </div>
          )}
        </motion.div>

        {/* MIDDLE/RIGHT: This month overview */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Sora'] text-lg font-medium text-slate-100">Overall Status</h3>
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
              budgetStatus.percentage >= 90 ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]' :
              budgetStatus.percentage >= 70 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]' :
              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
            }`}>
              {budgetStatus.percentage >= 90 ? <><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span> Over budget! 🚨</> : 
               budgetStatus.percentage >= 70 ? "Approaching limit ⚠️" : "You're on track 👍"}
            </span>
          </div>
          <BudgetCard 
            title="Expenses vs Budget" 
            current={budgetStatus.spent} 
            total={budget.monthlyBudget} 
            color="emerald"
          />
        </motion.div>
      </div>

      {/* BOTTOM: Per-category breakdown */}
      <motion.div variants={itemVariants} className="mt-12">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-['Sora'] text-lg font-medium text-slate-100">Category Allocations</h3>
            <p className="text-xs text-slate-500">Edit individual category limits to fit your needs</p>
          </div>
          <button 
            onClick={() => {
              const initial = {};
              let curSum = 0;
              categoryStats.forEach(s => { initial[s.cat] = s.suggestedLimit; curSum += s.suggestedLimit; });
              
              // Normalize the initially opened parameters to inherently equal TotalMonthlyBudget on the first loop
              if (curSum !== budget.monthlyBudget && curSum > 0) {
                 const scale = budget.monthlyBudget / curSum;
                 let newSum = 0;
                 categoryStats.forEach(s => {
                    initial[s.cat] = Math.round(initial[s.cat] * scale);
                    newSum += initial[s.cat];
                 });
                 // Fix normalization edge rounding errors
                 if (newSum !== budget.monthlyBudget) {
                    initial['Other'] += (budget.monthlyBudget - newSum);
                    if (initial['Other'] < 0) initial['Other'] = 0;
                 }
              }
              
              setSliderValues(initial);
              setShowCategoryModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-slate-300 transition-colors border border-white/10 whitespace-nowrap"
          >
            <RiEditLine size={16} /> Edit Limits
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categoryStats.map(({ cat, spent, isPriority, suggestedLimit }) => {
            if (spent === 0 && !isPriority) return null;
            
            const Icon = categoryIcons[cat];
            const colorName = categoryColors[cat];
            
            return (
              <motion.div key={cat} variants={itemVariants}>
                <BudgetCard 
                  title={
                    <span className="flex items-center gap-2">
                      <div className={`p-1 rounded bg-${colorName}-500/20 text-${colorName}-400`}>
                        <Icon className="text-sm" />
                      </div>
                      <span className="text-sm font-semibold">{cat}</span>
                    </span>
                  }
                  current={spent}
                  total={suggestedLimit}
                  color={colorName}
                />
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Category Edit Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCategoryModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#1a1a2e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center px-6 md:px-8 py-6 border-b border-white/5 bg-[#1a1a2e] z-10 shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold font-['Sora'] text-white">Adjust Category Limits</h2>
                  {(() => {
                    const currentSum = Object.values(sliderValues).reduce((a, b) => a + b, 0);
                    const isOver = currentSum > budget.monthlyBudget;
                    if (isOver) {
                       return <p className="text-xs font-bold text-red-500 mt-1 bg-red-500/10 px-2 py-0.5 rounded inline-block border border-red-500/20">🚨 OVER BUDGET: ₹{(currentSum - budget.monthlyBudget).toLocaleString()}</p>;
                    }
                    return (
                      <p className="text-xs font-semibold text-slate-400 mt-1">
                        Total Budget Remaining: <span className={Math.abs(budget.monthlyBudget - currentSum) < 2 ? "text-emerald-400" : "text-yellow-400"}>
                          ₹{Math.max(0, budget.monthlyBudget - currentSum).toLocaleString()}
                        </span>
                      </p>
                    );
                  })()}
                </div>
                <button onClick={() => setShowCategoryModal(false)} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                  <RiCloseLine size={24} />
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {categoryStats.map(({ cat }) => {
                  const Icon = categoryIcons[cat];
                  const colorName = categoryColors[cat];
                  const val = sliderValues[cat] || 0;
                  
                  return (
                    <div key={cat} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-3">
                          <button 
                            onClick={() => setLockedCats(prev => ({ ...prev, [cat]: !prev[cat] }))}
                            className={`p-1 mt-0.5 rounded-md transition-colors ${lockedCats[cat] ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                            title={lockedCats[cat] ? "Unlock Category" : "Lock Category"}
                          >
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                             {lockedCats[cat] ? (
                               <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                             ) : (
                               <path fillRule="evenodd" d="M14.5 1A4.5 4.5 0 0010 5.5V9H3a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1.5V5.5a3 3 0 116 0v2.75a.75.75 0 001.5 0V5.5A4.5 4.5 0 0014.5 1z" clipRule="evenodd" />
                             )}
                           </svg>
                          </button>
                          <div className={`p-1.5 w-8 h-8 flex items-center justify-center shrink-0 rounded bg-${colorName}-500/20 text-${colorName}-400`}><Icon /></div>
                          <span className="font-semibold text-slate-200">{cat}</span>
                        </span>
                        <span className="text-lg font-bold font-['Sora'] text-white">₹{val.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max={budget.monthlyBudget || 100000} 
                        step="1"
                        value={val}
                        disabled={lockedCats[cat]}
                        onChange={(e) => {
                          const newVal = Number(e.target.value);
                          setSliderValues(prev => {
                            const oldVal = prev[cat];
                            let delta = newVal - oldVal;
                            
                            let U = Object.keys(prev).filter(c => c !== cat && !lockedCats[c]);
                            let next = { ...prev };
                            
                            let available = U.reduce((sum, c) => sum + next[c], 0);
                            
                            // Upper Bound Clause
                            if (delta > 0 && available < delta) {
                              delta = available;
                            }
                            
                            next[cat] = oldVal + delta;
                            let remainingToDistribute = delta;
                            
                            // Iterative Floor Distribution Algorithm
                            while (Math.abs(remainingToDistribute) > 0.5 && U.length > 0) {
                              let W = U.reduce((sum, c) => sum + next[c], 0);
                              let stepDelta = remainingToDistribute;
                              let actualDistributed = 0;
                              let nextU = [];
                              
                              U.forEach((c) => {
                                let w = W > 0 ? (next[c] / W) : (1 / U.length);
                                let change = Math.floor(stepDelta * w);
                                let proposed = next[c] - change;
                                
                                if (proposed < 0) {
                                  actualDistributed += next[c];
                                  next[c] = 0;
                                } else {
                                  actualDistributed += change;
                                  next[c] = proposed;
                                  nextU.push(c);
                                }
                              });
                              
                              remainingToDistribute -= actualDistributed;
                              
                              if (Math.abs(remainingToDistribute) > 0.5) {
                                if (nextU.length > 0) {
                                   let maxCat = nextU[0];
                                   nextU.forEach(c => { if (next[c] > next[maxCat]) maxCat = c; });
                                   
                                   if (remainingToDistribute > 0) {
                                      if (next[maxCat] >= remainingToDistribute) {
                                         next[maxCat] -= remainingToDistribute;
                                         remainingToDistribute = 0;
                                      } else {
                                         remainingToDistribute -= next[maxCat];
                                         next[maxCat] = 0;
                                         nextU = nextU.filter(c => c !== maxCat);
                                      }
                                   } else {
                                      next[maxCat] -= remainingToDistribute; 
                                      remainingToDistribute = 0;
                                   }
                                } else {
                                   if (remainingToDistribute > 0) next[cat] -= remainingToDistribute;
                                   remainingToDistribute = 0;
                                }
                              }
                              U = nextU;
                            }
                            return next;
                          });
                        }}
                        className={`w-full h-2 rounded-lg appearance-none ${lockedCats[cat] ? 'cursor-not-allowed opacity-50 bg-white/5' : 'cursor-pointer bg-white/10'} accent-${colorName}-500`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-6 md:px-8 py-5 flex justify-end gap-3 bg-[#1a1a2e] border-t border-white/5 z-20 shadow-[0_-10px_40px_rgba(26,26,46,1)]">
                <button onClick={() => setShowCategoryModal(false)} className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors font-medium">
                  Cancel
                </button>
                <button 
                  disabled={Object.values(sliderValues).reduce((a, b) => a + b, 0) > budget.monthlyBudget}
                  onClick={() => {
                    // The background hook securely synchronized this data already
                    setShowCategoryModal(false);
                    toast.success('Category limits confirmed! 📊', { style: { background: '#1a1a2e', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' } });
                  }}
                  className="disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-violet-500/20"
                >
                  Save Limits
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
