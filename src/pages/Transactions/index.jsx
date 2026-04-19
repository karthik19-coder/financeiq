import { useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format, isToday, isYesterday } from 'date-fns';
import { RiFileListLine, RiAddLine } from 'react-icons/ri';

import useTransactions from '../../hooks/useTransactions';
import { useFinance } from '../../context/FinanceContext';
import useCurrency from '../../hooks/useCurrency';
import TransactionCard from '../../components/TransactionCard';
import SearchBar from '../../components/SearchBar'; // Placeholder for next step
import Filters from '../../components/Filters'; // Placeholder for next step
import ExportReport from '../../components/ExportReport';

export default function Transactions() {
  const navigate = useNavigate();
  const { 
    filteredTransactions, 
    deleteTransaction,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    filterType,
    setFilterType,
    filterRecurring,
    setFilterRecurring,
    dateRange,
    setDateRange,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetFilters
  } = useTransactions();
  const { addTransaction, transactions, isLoading } = useFinance(); // useFinance needed for addTransaction (undo) and total length
  const { formatCurrencyShort } = useCurrency();

  useEffect(() => {
    document.title = "Transactions | FinanceIQ";
  }, []);

  // Summary stats
  const { totalTx, totalInc, totalExp } = useMemo(() => {
    return filteredTransactions.reduce(
      (runningSums, transaction) => {
        runningSums.totalTx += 1;
        if (transaction.type === 'income') runningSums.totalInc += transaction.amount;
        else runningSums.totalExp += transaction.amount;
        return runningSums;
      },
      { totalTx: 0, totalInc: 0, totalExp: 0 }
    );
  }, [filteredTransactions]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const transactionDateGroups = {};
    filteredTransactions.forEach((transaction) => {
      const dateObj = new Date(transaction.date);
      let groupLabel = '';

      if (isToday(dateObj)) groupLabel = 'Today';
      else if (isYesterday(dateObj)) groupLabel = 'Yesterday';
      else groupLabel = format(dateObj, 'MMMM d, yyyy');

      if (!transactionDateGroups[groupLabel]) transactionDateGroups[groupLabel] = [];
      transactionDateGroups[groupLabel].push(transaction);
    });
    
    // Explicit learner debugging output targeting active filter constraints securely
    console.log("Filtered transactions count:", filteredTransactions.length);
    
    return transactionDateGroups;
  }, [filteredTransactions]);

  // Delete handler with Undo feature via toast
  // useCallback: Memoize handleDelete so TransactionCard doesn't re-render 
  // every time the parent re-renders unhelpfully.
  const handleDelete = useCallback(async (id) => {
    console.log("Attempting deletion for transaction scope matching ID:", id);
    const transactionToDelete = filteredTransactions.find((transaction) => transaction.id === id);
    if (!transactionToDelete) return;

    try {
      await deleteTransaction(id);
      
      toast(
        ({ closeToast }) => (
          <div className="flex flex-col">
            <span className="text-white">Transaction deleted</span>
            <button
              onClick={() => {
                addTransaction(transactionToDelete);
                closeToast();
                toast.success('Transaction restored');
              }}
              className="mt-1 self-start text-sm font-semibold text-emerald-400 hover:text-emerald-300 underline"
            >
              Undo
            </button>
          </div>
        ),
        {
          icon: <RiFileListLine className="text-xl text-red-400" />,
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f1f5f9',
            borderRadius: '16px'
          },
          autoClose: 6000,
        }
      );
    } catch (error) {
       toast.error("Failed to delete transaction. Please check your connection.");
    }
  }, [filteredTransactions, deleteTransaction, addTransaction]);

  // useCallback: Stabilizes the reference for the navigate action.
  const handleEdit = useCallback((id) => {
    navigate(`/transactions/new?edit=${id}`);
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-10"
    >
      {/* Header & Stats Bar */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-['Sora'] text-2xl font-semibold text-slate-100">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage and track all your transactions
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3 w-full md:w-auto">
          <ExportReport />
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 shadow-lg backdrop-blur-xl">
            <span className="text-xs text-slate-400">Total</span>
            <span className="text-sm font-medium text-slate-100">{totalTx}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 shadow-lg backdrop-blur-xl">
            <span className="text-xs text-slate-400">Income</span>
            <span className="text-sm font-medium text-emerald-400">
              +{formatCurrencyShort(totalInc)}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 shadow-lg backdrop-blur-xl">
            <span className="text-xs text-slate-400">Expense</span>
            <span className="text-sm font-medium text-red-400">
              -{formatCurrencyShort(totalExp)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar Row */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-1/3 mt-6">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
          />
        </div>
        <div className="w-full lg:w-2/3">
          <Filters 
            filters={{ filterCategory, filterType, filterRecurring, dateRange, sortBy, sortOrder }}
            setters={{ setFilterCategory, setFilterType, setFilterRecurring, setDateRange, setSortBy, setSortOrder }}
            onClear={resetFilters}
          />
        </div>
      </div>

      <div className="mb-4 text-sm text-slate-500 font-medium">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </div>

      {/* Transactions List */}
      <div className="space-y-8">
        {isLoading ? (
          // Loading Skeletons
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 w-full animate-pulse rounded-2xl bg-white/5"
              />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-24 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl"
          >
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 shadow-inner">
              <RiFileListLine className="text-6xl text-slate-600" />
            </div>
            <h3 className="mb-2 font-['Sora'] text-xl font-medium text-slate-200">
              No transactions found
            </h3>
            <p className="mb-6 text-sm text-slate-500 max-w-sm text-center">
              Looks like you haven't added any transactions yet or none match your Current filters.
            </p>
            <Link
              to="/transactions/new"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-2.5 font-semibold text-black transition-transform hover:scale-105 active:scale-95"
            >
              <RiAddLine className="text-lg" />
              Add Transaction
            </Link>
          </motion.div>
        ) : (
          // Grouped List
          Object.entries(groupedTransactions).map(([dateLabel, txs]) => (
            <div key={dateLabel}>
              <h4 className="mb-3 px-2 text-xs font-semibold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                {dateLabel}
                <div className="h-px flex-1 bg-white/5"></div>
              </h4>
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {txs.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
