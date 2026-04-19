import React, { useState, useMemo, useEffect } from 'react';
import { RiCloseLine, RiBarChartLine, RiMoneyDollarCircleLine, RiErrorWarningLine } from 'react-icons/ri';
import { useFinance } from '../context/FinanceContext';

export default function SmartAlert() {
  const { stats, userData, budgets, formatINR, transactions } = useFinance();
  const [dismissed, setDismissed] = useState([]);

  const alerts = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Find the most recent expense transaction
    const recentExpense = [...transactions]
      .filter(tx => tx.type === 'expense')
      .sort((a, b) => {
        const dateA = a.date?.toDate?.() || new Date(a.date);
        const dateB = b.date?.toDate?.() || new Date(b.date);
        return dateB - dateA; // descending (newest first)
      })[0];

    if (!recentExpense) return [];

    const cat = recentExpense.category;
    if (!cat) return [];

    // Calculate limit and spent for this specific category
    const spent = stats.expensesByCategory[cat] || 0;
    
    // Calculate global budget for dynamic limits
    const globalBudget = userData?.monthlyBudget || Math.max(0, (userData?.monthlyIncome || 0) - (userData?.savingsGoal || 0));
    
    const simulatedRatios = {
      Rent: 0.30, Food: 0.20, Travel: 0.10, Shopping: 0.15,
      Health: 0.05, Utilities: 0.10, Entertainment: 0.05, Subscriptions: 0.03, Other: 0.02
    };

    const customBudget = budgets.find(b => b.id === cat);
    const limit = customBudget?.limit || Math.max(Math.round(globalBudget * (simulatedRatios[cat] || 0.1)), 1000);
    
    const pct = limit > 0 ? (spent / limit) * 100 : 0;

    // Check if we already dismissed this specific recent action
    // We bind the ID to the specific transaction ID rather than the category, so if they make ANOTHER food purchase, it shows up again!
    const alertId = `recent_${recentExpense.id || recentExpense.date}`;
    
    if (dismissed.includes(alertId)) return [];

    return [{
      id: alertId,
      icon: <RiBarChartLine />,
      text: `Recent transaction: ${cat} is now at ${Math.round(pct)}% of its ${formatINR(limit)} monthly limit.`,
      color: pct > 90 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
    }];
  }, [transactions, stats, userData, dismissed, budgets, formatINR]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {alerts.map(alert => (
        <div key={alert.id} className={`flex items-center justify-between p-4 rounded-xl border ${alert.color} transition-all animate-in fade-in slide-in-from-top-4`}>
          <div className="flex items-center gap-3">
            <span className="text-lg">{alert.icon}</span>
            <p className="text-sm font-medium">{alert.text}</p>
          </div>
          <button 
            onClick={() => setDismissed(prev => [...prev, alert.id])}
            className="p-1 hover:bg-black/10 rounded-lg transition-colors"
          >
            <RiCloseLine className="text-lg opacity-60 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  );
}
