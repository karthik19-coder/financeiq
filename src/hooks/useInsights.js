import { useState, useMemo, useCallback } from 'react';
import { useFinance } from '../context/FinanceContext';

export const useInsights = () => {
  const { transactions, budget, budgets } = useFinance();

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastYear = lastMonthDate.getFullYear();

    const thisMonthTxs = transactions.filter(tx => {
      const d = tx.date?.toDate?.() || new Date(tx.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthTxs = transactions.filter(tx => {
      const d = tx.date?.toDate?.() || new Date(tx.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    });

    const totalSpent = thisMonthTxs
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const lastMonthSpent = lastMonthTxs
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const totalIncome = thisMonthTxs
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const categoryBreakdown = thisMonthTxs
      .filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount || 0);
        return acc;
      }, {});

    const lastMonthCategoryBreakdown = lastMonthTxs
      .filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => {
         acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount || 0);
         return acc;
      }, {});

    const topCategoryEntry = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])[0];
    const topCategory = topCategoryEntry ? topCategoryEntry[0] : 'None';

    const savingsRate = totalIncome > 0 
      ? Number((((totalIncome - totalSpent) / totalIncome) * 100).toFixed(1))
      : 0;

    const daysElapsed = Math.max(1, now.getDate());
    const dailyAverage = Number((totalSpent / daysElapsed).toFixed(0));

    const trendVal = lastMonthSpent > 0 
      ? Number((((totalSpent - lastMonthSpent) / lastMonthSpent) * 100).toFixed(1))
      : 0;
    const trend = `${trendVal > 0 ? 'up' : 'down'} ${Math.abs(trendVal)}%`;

    // Mathematical Deterministic Financial Health Score
    // (Savings Rate) + (Budget Adherence) - (Over-budget categories)
    let overBudgetCount = 0;
    const catLimits = {};
    if (budgets && budgets.length > 0) {
       budgets.forEach(b => {
          catLimits[b.id] = b.limit;
          if ((categoryBreakdown[b.id] || 0) > b.limit) {
             overBudgetCount += 1;
          }
       });
    }
    const budgetAdherence = budget?.monthlyBudget ? Math.max(0, 100 - (totalSpent / budget.monthlyBudget * 100)) : 100;
    const healthScore = Math.max(0, Math.min(100, Math.round(savingsRate + budgetAdherence - (overBudgetCount * 5))));

    const txHash = `${transactions.length}_${totalSpent}_${budget?.monthlyBudget}`;

    return { 
      totalSpent, totalIncome, topCategory, savingsRate, 
      categoryBreakdown, lastMonthCategoryBreakdown, catLimits, 
      dailyAverage, trend, healthScore, txHash 
    };
  }, [transactions, budget, budgets]);

  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);

  const generateInsight = useCallback(async () => {
    if (stats.totalSpent === 0 && stats.totalIncome === 0) {
       setError("Add some transactions first to get AI insights!");
       return;
    }

    // Advanced Fingerprint Cache Checking
    try {
       const cachedBytes = localStorage.getItem('financeiq_ai_insights');
       if (cachedBytes) {
          const payload = JSON.parse(cachedBytes);
          if (payload.hash === stats.txHash) {
             setInsight(payload.data);
             setLastGenerated(new Date(payload.timestamp));
             setError(null);
             return; // Break API Chain seamlessly
          }
       }
    } catch(e) {}

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
       // FALLBACK: Generate smart local insights if no API key is provided
       setLoading(true);
       await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate analysis
       
       const localInsights = {
         summary: stats.totalSpent > stats.totalIncome 
           ? "Your expenses exceeded your income this month. Consider reviewing your top categories."
           : "Great job! You've maintained a healthy savings rate this month.",
         score: stats.healthScore,
         insights: [
           { 
             type: stats.savingsRate > 20 ? "positive" : "warning", 
             title: "Monthly Savings", 
             detail: `Your savings rate is ${stats.savingsRate}%. ${stats.savingsRate > 20 ? "Excellent progress towards your goals." : "Try to aim for at least 20% savings."}` 
           },
           { 
             type: "tip", 
             title: "Top Category Control", 
             detail: stats.topCategory !== 'None' && stats.categoryBreakdown[stats.topCategory]
               ? `You spent ₹${stats.categoryBreakdown[stats.topCategory].toLocaleString()} on ${stats.topCategory}. Reducing this by 10% next month could save you ₹${(stats.categoryBreakdown[stats.topCategory] * 0.1).toFixed(0)}.`
               : "You haven't spent anything this month. Keep up the good work!" 
           },
           { 
             type: stats.trend.startsWith("up") ? "warning" : "positive", 
             title: "Spending Trend", 
             detail: `Your spending is ${stats.trend} compared to last month. ${stats.trend.startsWith("up") ? "Look for recent one-off expenses." : "Keep up the disciplined spending!"}` 
           }
         ],
         prediction: `At your daily average of ₹${stats.dailyAverage}, you're projected to spend ₹${(stats.dailyAverage * 30).toLocaleString()} by month-end.`
       };

       setInsight(localInsights);
       setLastGenerated(new Date());
       setLoading(false);
       return;
    }

    setLoading(true);
    setError(null);
    try {
      const prompt = `
        You are an advanced quantitative personal finance advisor. Analyze the user's spending data and provide exactly 3 actionable, comparative insights.
        Use Indian Rupee (₹) formats. 

        CRITICAL LOGIC REQUIREMENTS:
        1. "Trend Analysis": Compare this month to last month. Identify specific categories where spending increased/decreased by notable percentages and expressly state them.
        2. "Actionable Advice": Do not give generic tips. If a category is over budget, specifically calculate the percentage overflow (e.g. "You spent ₹25,000 on Entertainment, which is 417% of your budget") and suggest an exact mathematical reallocation from another category to cover it safely.

        DATA MATRIX:
        - Total Spent: ₹${stats.totalSpent}
        - Savings Rate: ${stats.savingsRate}%
        - Global Trend Offset: ${stats.trend}
        - Active Limits per Category: ${JSON.stringify(stats.catLimits)}
        - This Month's Category Spending: ${JSON.stringify(stats.categoryBreakdown)}
        - Last Month's Category Spending: ${JSON.stringify(stats.lastMonthCategoryBreakdown)}

        Return a JSON object mathematically formatted exactly as:
        {
          "summary": "one sentence precise quantitative summary of current trajectory.",
          "insights": [
            { "type": "warning|tip|positive", "title": "short categorical title", "detail": "2 sentence specific advice mentioning actual calculated percentages, Rs values, and precise reallocation strategies." }
          ],
          "prediction": "At your daily rate of ₹X you will spend ₹Y by month end."
        }
        Do not calculate or return "score". Only valid JSON. No markdown wrappers.
      `;

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'API Error');
      }
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No insights generated. Please try again with more transaction data.');
      }

      const text = data.candidates[0].content.parts[0].text;
      
      let cleanJson = text.replace(/```json|```/g, '').trim();
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleanJson = jsonMatch[0];

      const parsed = JSON.parse(cleanJson);
      parsed.score = stats.healthScore; // Force natively secured deterministic score
      
      localStorage.setItem('financeiq_ai_insights', JSON.stringify({ hash: stats.txHash, data: parsed, timestamp: new Date().toISOString() }));

      setInsight(parsed);
      setLastGenerated(new Date());
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not generate insights. Please check your API key and transaction data.');
    } finally {
      setLoading(false);
    }
  }, [stats]);

  return { insight, loading, error, stats, generateInsight, lastGenerated };
};
