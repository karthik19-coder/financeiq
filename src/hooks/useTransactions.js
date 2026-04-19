import { useState, useMemo, useCallback } from 'react';
import { useFinance } from '../context/FinanceContext';

export default function useTransactions() {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
  } = useFinance();

  // ---- Local filter / search / sort state ----
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRecurring, setFilterRecurring] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // ---- Filtered + sorted transactions ----
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply all filters
    result = result.filter((tx) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !tx.title.toLowerCase().includes(q) &&
          !(tx.notes && tx.notes.toLowerCase().includes(q))
        ) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'all' && tx.category !== filterCategory) {
        return false;
      }

      // Recurring filter
      if (filterRecurring && !tx.recurring) {
        return false;
      }

      // Date range filter
      if (dateRange?.start) {
        const from = new Date(dateRange.start);
        from.setHours(0, 0, 0, 0); // Normalize to start of day
        if (new Date(tx.date) < from) {
          return false;
        }
      }
      if (dateRange?.end) {
        const to = new Date(dateRange.end);
        to.setHours(23, 59, 59, 999); // Normalize to end of day
        if (new Date(tx.date) > to) {
          return false;
        }
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'date':
          cmp = new Date(a.date) - new Date(b.date);
          break;
        case 'amount':
          cmp = a.amount - b.amount;
          break;
        case 'category':
          cmp = a.category.localeCompare(b.category);
          break;
        default:
          cmp = new Date(a.date) - new Date(b.date);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [
    transactions,
    searchQuery,
    filterCategory,
    filterType,
    filterRecurring,
    dateRange,
    sortBy,
    sortOrder,
  ]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterRecurring(false);
    setDateRange({ start: '', end: '' });
    setSortBy('date');
    setSortOrder('desc');
  }, []);

  return {
    // data
    filteredTransactions,
    // CRUD (pass-through)
    addTransaction,
    deleteTransaction,
    updateTransaction,
    // search & filters
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
    resetFilters,
  };
}
