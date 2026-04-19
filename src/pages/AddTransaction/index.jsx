/*
  FILE: AddTransaction/index.jsx
  WHAT IT DOES: Provides a secure, validated form for user input, appending new expense or income nodes into the global context layer natively via context hooks.
  USED IN: App.jsx (Route definition for /transactions/new)
*/
import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import useCurrency from '../../hooks/useCurrency';
import {
  RiSendPlaneLine,
  RiErrorWarningLine,
  RiArrowLeftLine,
  RiLoader4Line
} from 'react-icons/ri';

const EXPENSE_CATEGORIES = [
  { value: 'Food', label: 'Food 🍕' },
  { value: 'Travel', label: 'Travel ✈️' },
  { value: 'Rent', label: 'Rent 🏠' },
  { value: 'Shopping', label: 'Shopping 🛍️' },
  { value: 'Entertainment', label: 'Entertainment 🎬' },
  { value: 'Health', label: 'Health 💊' },
  { value: 'Utilities', label: 'Utilities ⚡' },
  { value: 'Subscriptions', label: 'Subscriptions 📱' },
];

const INCOME_CATEGORIES = [
  { value: 'Salary', label: 'Salary 💼' },
  { value: 'Freelance', label: 'Freelance 💻' },
  { value: 'Investment', label: 'Investment 📈' },
  { value: 'Other', label: 'Other 💰' },
];

const schema = yup.object({
  title: yup.string().required("Title is required").min(2).max(50),
  amount: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .typeError("Amount must be a number")
    .required("Amount is required")
    .positive("Amount must be positive")
    .max(10000000),
  type: yup.string().oneOf(["income", "expense"]).required(),
  category: yup.string().required("Please select a category"),
  date: yup.string().required("Date is required"),
  notes: yup.string().max(200).optional(),
  recurring: yup.boolean().default(false),
});

export default function AddTransaction() {
  const { addTransaction, updateTransaction, transactions } = useFinance();
  const { formatCurrency } = useCurrency(); // kept if needed elsewhere, safely ignored
  void formatCurrency;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const isEditMode = Boolean(editId);
  const amountRef = useRef(null);
  const prevCategoryRef = useRef(null);

  // Sync the browser tab title to reflect the precise view context dynamically
  useEffect(() => {
    document.title = isEditMode ? "Edit Transaction | FinanceIQ" : "Add Transaction | FinanceIQ";
    
    // useRef: Auto-focus the amount field on page load for faster entry if not in edit mode
    if (!isEditMode && amountRef.current) {
      amountRef.current.focus();
    }
  }, [isEditMode]);

  // Extract the specific transaction object context securely mapping the ID against global storage
  const existingTransactionContext = useMemo(() => {
    return isEditMode ? transactions.find(transaction => transaction.id === editId) : null;
  }, [isEditMode, editId, transactions]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      recurring: false,
    }
  });

  const selectedType = watch('type');
  const notesValue = watch('notes') || '';
  
  // Populate form natively if we successfully found a transaction mapped to editMode securely
  useEffect(() => {
    if (isEditMode && existingTransactionContext) {
      reset({
        title: existingTransactionContext.title,
        amount: existingTransactionContext.amount,
        type: existingTransactionContext.type,
        category: existingTransactionContext.category,
        date: new Date(existingTransactionContext.date).toISOString().split('T')[0],
        notes: existingTransactionContext.notes || '',
        recurring: existingTransactionContext.recurring || false,
      });
    } else if (isEditMode && !existingTransactionContext) {
      toast.error('Transaction not found');
      navigate('/transactions');
    }
  }, [isEditMode, existingTransactionContext, reset, navigate]);

  // Dynamically reset the category selector state downwards natively if the Core 'Type' mode boundary switches
  useEffect(() => {
    const isIncome = selectedType === 'income';
    const validCategories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const currentCategory = watch('category');
    
    if (currentCategory && !validCategories.find(c => c.value === currentCategory)) {
      setValue('category', '');
    }
  }, [selectedType, setValue, watch]);

  // Native submit intercept handler wrapping Form context structure mappings across local context payloads globally
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Step 1: Parse and strictly validate numerical invariants natively against NaN constraints
      const rawAmount = parseFloat(data.amount);
      if (isNaN(rawAmount) || rawAmount <= 0) {
         toast.error("Invalid transaction amount. Please enter a valid positive number.");
         setIsSubmitting(false);
         return;
      }
      
      // Step 2: Extract string format structure boundaries resolving exact payload structure natively
      const finalData = {
        ...data,
        amount: rawAmount,
        date: new Date(data.date).toISOString()
      };
      
      // Step 3: Implement ID-based edit resolution mapping directly via contexts natively synced across endpoints
      if (isEditMode && editId) {
        console.log("Executing transaction update sync on ID:", editId);
        await updateTransaction(editId, finalData);
        toast.success('Transaction updated! ✨', {
          style: {
            background: '#1a1a2e',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        });
      } else {
        console.log("Adding new transaction sequence:", finalData);
        await addTransaction(finalData);
        toast.success('Transaction added! 🎉', {
          style: {
            background: '#1a1a2e',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        });
      }
      
      // Strict Context Reset + State Drop (forces searchParams clearing natively via React Router)
      reset();
      navigate('/transactions');
      
    } catch (error) {
      console.error("Failed to execute sync pipeline:", error);
      toast.error("Network sync failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const headerText = isEditMode ? 'Edit Transaction' : 'Add New Transaction';
  const buttonText = isEditMode ? 'Update Transaction' : 'Save Transaction';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-10"
    >
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/transactions')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RiArrowLeftLine size={20} />
        </button>
        <div>
          <h1 className="font-['Sora'] text-2xl font-semibold text-slate-100">
            {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isEditMode ? 'Update your transaction details' : 'Record a new income or expense'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-8">
        <div className="mb-6 inline-block">
          <h2 className="font-['Sora'] text-lg text-slate-100">{headerText}</h2>
          <div className="mt-1 h-1 w-1/2 rounded-full bg-gradient-to-r from-violet-500 to-emerald-400"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Type Toggle */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Transaction Type</label>
            <div className="relative flex h-12 w-full rounded-xl bg-[#0a0a0f] border border-white/10 p-1">
              <div 
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-out"
                style={{
                  transform: selectedType === 'expense' ? 'translateX(0)' : 'translateX(100%)',
                  backgroundColor: selectedType === 'expense' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid ' + (selectedType === 'expense' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(16, 185, 129, 0.3)')
                }}
              />
              <button
                type="button"
                onClick={() => setValue('type', 'expense')}
                className={`relative z-10 flex flex-1 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'expense' ? 'text-red-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setValue('type', 'income')}
                className={`relative z-10 flex flex-1 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'income' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Income
              </button>
            </div>
            {errors.type && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                <RiErrorWarningLine /> {errors.type.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Title</label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Amazon Shopping"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
              {errors.title && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <RiErrorWarningLine /> {errors.title.message}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  ref={amountRef}
                  type="number"
                  step="0.01"
                  {...register('amount')}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <RiErrorWarningLine /> {errors.amount.message}
                </p>
              )}
              <p className="mt-1 text-[10px] text-slate-500">Enter the total amount for this transaction</p>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2 relative z-50">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Category</label>
                {prevCategoryRef.current && (
                  <span className="text-[10px] text-violet-400 font-medium animate-pulse">
                    Last used: {prevCategoryRef.current}
                  </span>
                )}
              </div>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => {
                  const selectedOption = categories.find(opt => opt.value === value);

                  return (
                    <div className="relative w-full" ref={categoryDropdownRef}>
                      <div 
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className={`w-full rounded-xl border ${errors.category ? 'border-red-500' : 'border-white/10'} bg-[#0f0f1a] hover:bg-white/5 cursor-pointer px-4 py-2.5 text-slate-100 placeholder-slate-500 transition-all duration-200 flex justify-between items-center ${isCategoryOpen ? 'ring-1 ring-violet-500/30 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : ''}`}
                      >
                        <span className={selectedOption ? "text-slate-100 font-medium tracking-wide" : "text-slate-500 font-medium"}>
                          {selectedOption ? selectedOption.label : "Select Category"}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-violet-400' : ''}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>

                      <AnimatePresence>
                        {isCategoryOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute z-[100] w-full mt-2 rounded-xl border border-white/10 bg-[#1a1a24]/95 shadow-2xl overflow-hidden backdrop-blur-2xl"
                          >
                            <div className="max-h-56 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                              {categories.map((option) => (
                                <div
                                  key={option.value}
                                  onClick={() => {
                                    onChange(option.value);
                                    prevCategoryRef.current = option.value;
                                    setIsCategoryOpen(false);
                                  }}
                                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${value === option.value ? 'bg-violet-500/10 text-violet-300' : 'text-slate-200 hover:bg-white/5'}`}
                                >
                                  <span className="font-medium text-sm tracking-wide">{option.label}</span>
                                  {value === option.value && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-violet-400">
                                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }}
              />
              {errors.category && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <RiErrorWarningLine /> {errors.category.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Date</label>
              <input
                type="date"
                {...register('date')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 [color-scheme:dark]"
              />
              {errors.date && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <RiErrorWarningLine /> {errors.date.message}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-300">Notes (Optional)</label>
              <span className={`text-xs ${notesValue.length > 200 ? 'text-red-400' : 'text-slate-500'}`}>
                {notesValue.length}/200
              </span>
            </div>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Add some details about this transaction..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
            />
            {errors.notes && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                <RiErrorWarningLine /> {errors.notes.message}
              </p>
            )}
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
            <div>
              <label className="text-sm font-medium text-slate-200">Mark as recurring {selectedType === 'expense' ? 'expense' : 'income'}</label>
              <p className="text-xs text-slate-500 mt-0.5">This transaction repeats monthly</p>
            </div>
            
            <Controller
              name="recurring"
              control={control}
              render={({ field: { onChange, value } }) => (
                <button
                  type="button"
                  onClick={() => onChange(!value)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-[#0d0d1a] ${
                    value ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                  role="switch"
                  aria-checked={value}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}
            />
          </div>

          {/* Submit & Cancel */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-3 text-base font-bold text-black transition-transform active:scale-[0.99] hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <RiLoader4Line className="animate-spin text-xl" />
                  Saving...
                </>
              ) : (
                <>
                  <RiSendPlaneLine className="text-xl" />
                  {buttonText}
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="text-center text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
