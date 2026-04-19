import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { db } from "../services/firebase";
import {
  collection, doc, getDoc, getDocs,
  query, where, orderBy, limit,
  onSnapshot, serverTimestamp, setDoc, updateDoc, deleteDoc, addDoc, writeBatch
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

const FinanceContext = createContext();
export const useFinance = () => useContext(FinanceContext);

export function FinanceProvider({ children }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Load from localStorage cache INSTANTLY
  const getCached = (key) => {
    try {
      const c = localStorage.getItem(key + "_" + currentUser?.uid);
      return c ? JSON.parse(c) : null;
    } catch { return null; }
  };
  const setCache = (key, data) => {
    try {
      localStorage.setItem(key + "_" + currentUser?.uid, JSON.stringify(data));
    } catch {}
  };

  const [userData, setUserData] = useState(() => getCached("userData"));
  const [transactions, setTransactions] = useState(() => getCached("transactions") || []);
  const [budgets, setBudgets] = useState(() => getCached("budgets") || []);

  const refreshData = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const [uSnap, bSnap] = await Promise.all([
        getDoc(doc(db, "users", currentUser.uid)),
        getDocs(query(collection(db, "budgets"), where("uid", "==", currentUser.uid)))
      ]);

      const uData = uSnap.exists() ? uSnap.data() : {
        name: currentUser.displayName || "User",
        monthlyIncome: 0,
        savingsGoal: 0,
        currency: "INR"
      };
      
      const bData = bSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setUserData(uData);
      setBudgets(bData);
      setCache("userData", uData);
      setCache("budgets", bData);
      setIsOffline(false);
    } catch (err) {
      console.error("Refresh error:", err);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    refreshData();

    // Real-time transactions listener (Sub-collection routing)
    const txQuery = query(
      collection(db, `users/${currentUser.uid}/transactions`),
      orderBy("date", "desc"),
      limit(100)
    );

    const unsubTx = onSnapshot(txQuery, (snap) => {
      const txData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(txData);
      setCache("transactions", txData);
    }, (err) => {
      console.error("TX listener error:", err);
      setIsOffline(true);
    });

    return () => unsubTx();
  }, [currentUser?.uid, refreshData]);

  // ---- CRUD Operations ----
  const addTransaction = async (tx) => {
    try {
      await addDoc(collection(db, `users/${currentUser.uid}/transactions`), {
        ...tx,
        createdAt: serverTimestamp()
      });
    } catch (err) { console.error(err); throw err; }
  };

  const deleteTransaction = async (id) => {
    try { 
      // Instant Optimistic Deletion
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Async Secure Wipe
      await deleteDoc(doc(db, `users/${currentUser.uid}/transactions`, id)); 
    } catch (err) { 
      console.error(err); 
      // Revert if failed
      refreshData();
      throw err; 
    }
  };

  const updateTransaction = async (id, updates) => {
    try { await updateDoc(doc(db, `users/${currentUser.uid}/transactions`, id), updates); } catch (err) { console.error(err); throw err; }
  };

  const resetData = async (option, wipeSpanDays = 0) => {
    try {
      const batch = writeBatch(db);
      
      if (option === 'A' || option === 'B' || option === 'C') {
        const txQuery = query(collection(db, `users/${currentUser.uid}/transactions`));
        const txSnap = await getDocs(txQuery);
        
        let cutoffDate = null;
        if (option === 'A' && wipeSpanDays > 0) {
            cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - wipeSpanDays);
        }

        txSnap.docs.forEach((d) => {
          if (cutoffDate) {
            const docDate = d.data().date?.toDate?.() || new Date(d.data().date);
            if (docDate < cutoffDate) return; // Keep transaction
          }
          batch.delete(d.ref); // Delete it
        });

        if (option === 'C') {
          // Factory Reset User Doc
          const userRef = doc(db, "users", currentUser.uid);
          batch.update(userRef, {
             hasCompletedOnboarding: false,
             onboardingComplete: false, // Legacy fallback
             monthlyIncome: 0,
             savingsGoal: 0,
             monthlyBudget: 0
          });
        }

        await batch.commit();

        // Strict Sync to prevent caching ghosts
        if (option === 'B' || option === 'C') {
           setTransactions([]);
           setCache("transactions", []);
        }

        if (option === 'C') {
           setUserData(prev => ({ ...prev, hasCompletedOnboarding: false, onboardingComplete: false, monthlyIncome: 0, savingsGoal: 0, monthlyBudget: 0 }));
           // Natively forces Auth State Machine to drop user into Onboarding Layer safely
           setTimeout(() => window.location.href = "/onboarding", 500); 
        } else {
           refreshData(); // Force pull correct new ratios
        }
      }
    } catch (err) {
      console.error("Batch Reset Error:", err);
      throw err;
    }
  };

  const updateBudget = async (id, amount) => {
     try {
       if (id === 'global') {
         // Optimistic UI update for global budget
         setUserData(prev => {
           const next = { ...prev, monthlyBudget: amount };
           setCache("userData", next);
           return next;
         });
         await setDoc(doc(db, "users", currentUser.uid), { monthlyBudget: amount }, { merge: true });
       } else {
         // Optimistic UI update for specific category budgets
         setBudgets(prev => {
           const next = prev.map(b => b.id === id ? { ...b, limit: amount } : b);
           setCache("budgets", next);
           return next;
         });
         await updateDoc(doc(db, "budgets", id), { limit: amount });
       }
     } catch (err) { console.error(err); }
  };

  const setUserProfile = async (updates) => {
    try {
      // Optimistic UI updates
      setUserData(prev => {
        const next = { ...prev, ...updates };
        setCache("userData", next);
        return next;
      });
      await setDoc(doc(db, "users", currentUser.uid), updates, { merge: true });
    } catch (err) { console.error(err); }
  };

  // ---- Computed Stats ----
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthTxs = transactions.filter(tx => {
      const d = tx.date?.toDate?.() || new Date(tx.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const totalExpense = currentMonthTxs
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      
    // Combine base monthlyIncome with additional manual income transactions (excluding 'Salary' category to avoid double-counting)
    const manualIncome = currentMonthTxs
      .filter(tx => tx.type === "income" && tx.category !== 'Salary')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    
    const totalIncome = (userData?.monthlyIncome || 0) + manualIncome;

    const expensesByCategory = currentMonthTxs
      .filter(tx => tx.type === "expense")
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount || 0);
        return acc;
      }, {});

    // Monthly Trend (Last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      
      const mExp = transactions
        .filter(tx => {
          const txd = tx.date?.toDate?.() || new Date(tx.date);
          return txd.getMonth() === d.getMonth() && txd.getFullYear() === d.getFullYear() && tx.type === 'expense';
        })
        .reduce((s, t) => s + Number(t.amount), 0);
        
      const mIncManual = transactions
        .filter(tx => {
          const txd = tx.date?.toDate?.() || new Date(tx.date);
          return txd.getMonth() === d.getMonth() && txd.getFullYear() === d.getFullYear() && tx.type === 'income' && tx.category !== 'Salary';
        })
        .reduce((s, t) => s + Number(t.amount), 0);
      
      const mIncTotal = (userData?.monthlyIncome || 0) + mIncManual;
      
      monthlyTrend.push({ name: monthLabel, income: mIncTotal, expense: mExp });
    }

    const netBalance = (userData?.monthlyIncome || 0) - totalExpense;
    const activeMonthlyBudget = userData?.monthlyBudget || Math.max(0, (userData?.monthlyIncome || 0) - (userData?.savingsGoal || 0));

    const budgetStatus = {
      spent: totalExpense,
      percentage: activeMonthlyBudget ? (totalExpense / activeMonthlyBudget) * 100 : 0
    };

    return { 
      totalExpense, 
      totalIncome, 
      netBalance, 
      expensesByCategory, 
      monthlyTrend, 
      budgetStatus,
      thisMonth: currentMonthTxs 
    };
  }, [transactions, userData]);

  // Format INR utility
  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount || 0);

  return (
    <FinanceContext.Provider value={{
      userData,
      setUserData: setUserProfile,
      transactions,
      budgets,
      stats,
      // Legacy support for older page versions
      budget: { monthlyBudget: userData?.monthlyBudget || Math.max(0, (userData?.monthlyIncome || 0) - (userData?.savingsGoal || 0)) },
      totals: { totalIncome: stats.totalIncome, totalExpense: stats.totalExpense, netBalance: stats.netBalance },
      expensesByCategory: stats.expensesByCategory,
      monthlyTrend: stats.monthlyTrend,
      budgetStatus: stats.budgetStatus,
      //
      loading,
      isOffline,
      formatINR,
      refreshData,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      resetData,
      updateBudget,
      setBudget: (val) => updateBudget('global', val)
    }}>
      {children}
    </FinanceContext.Provider>
  );
}
