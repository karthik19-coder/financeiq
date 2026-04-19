import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiLightbulbLine, RiCalendarCheckLine, RiArrowUpLine, RiArrowDownLine, RiTimeLine } from 'react-icons/ri';
import { useInsights } from '../hooks/useInsights';
import HealthScoreRing from '../components/HealthScoreRing';
import InsightCard from '../components/InsightCard';
import ExportReport from '../components/ExportReport';

const TypewriterLoader = () => {
   const [text, setText] = React.useState("");
   const fullText = "Initializing Gemini Neural Network...\nAnalyzing temporal spending vectors...\nCross-referencing active category constraints...\nFormulating quantitative strategies...";
   
   React.useEffect(() => {
     let i = 0;
     const timer = setInterval(() => {
       setText(fullText.slice(0, i));
       i++;
       if (i > fullText.length) clearInterval(timer);
     }, 30);
     return () => clearInterval(timer);
   }, []);

   return (
     <div className="flex flex-col items-center justify-center py-16 space-y-8 w-full">
       <div className="relative">
         <div className="absolute inset-0 bg-violet-600/30 blur-2xl rounded-full animate-pulse"></div>
         <RiLightbulbLine className="text-6xl text-violet-400 relative z-10 animate-bounce" />
       </div>
       <div className="bg-[#0f0f16] border border-violet-500/20 p-6 rounded-2xl w-full max-w-2xl min-h-[140px] shadow-[0_0_40px_rgba(139,92,246,0.1)] relative overflow-hidden backdrop-blur-xl">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50 animate-pulse"></div>
         <p className="text-violet-300 font-mono text-sm sm:text-base whitespace-pre-line leading-relaxed">
           {text}<span className="animate-ping inline-block w-2.5 h-4 ml-1 bg-violet-400 align-middle"></span>
         </p>
       </div>
     </div>
   );
};

export default function InsightsPage() {
  const { insight, loading, error, stats, generateInsight, lastGenerated } = useInsights();
  
  React.useEffect(() => {
    if (!insight && !error && !loading) {
       generateInsight();
    }
  }, [insight, error, loading, generateInsight]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Sora'] flex items-center gap-3">
            <RiLightbulbLine className="text-violet-400" /> AI Spending Insights
          </h1>
          <p className="text-gray-400 mt-2">Personalized financial advisory powered by Gemini AI</p>
        </div>
        <ExportReport />
      </header>

      {/* TOP STATS GRID */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Score Card */}
        <motion.div variants={itemVariants} className="bg-[#13131a] rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center space-y-3">
          <HealthScoreRing score={insight?.score || 0} />
          <div className="text-center">
            <p className="text-white font-semibold">Financial Health</p>
            <p className="text-xs text-gray-500">out of 100</p>
          </div>
        </motion.div>

        {/* Savings Rate Card */}
        <motion.div variants={itemVariants} className="bg-[#13131a] rounded-2xl border border-white/10 p-6">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Savings Rate</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">{stats.savingsRate}%</span>
            <div className={`flex items-center text-xs mb-1 ${stats.trend.startsWith('up') ? 'text-red-400' : 'text-emerald-400'}`}>
              {stats.trend.startsWith('up') ? <RiArrowUpLine /> : <RiArrowDownLine />}
              {stats.trend.split(' ')[1]}
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mt-4 uppercase font-bold tracking-widest">vs Last Month</p>
        </motion.div>

        {/* Daily Spend Card */}
        <motion.div variants={itemVariants} className="bg-[#13131a] rounded-2xl border border-white/10 p-6">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Daily Avg Spend</p>
          <span className="text-3xl font-bold text-white font-['Sora']">₹{stats.dailyAverage}</span>
          <p className="text-[10px] text-indigo-400 mt-4 uppercase font-bold tracking-widest bg-indigo-500/10 w-fit px-2 py-0.5 rounded">At this rate</p>
        </motion.div>

        {/* Top Category Card */}
        <motion.div variants={itemVariants} className="bg-[#13131a] rounded-2xl border border-white/10 p-6">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Top Category</p>
          <span className="text-xl font-bold text-white block truncate">
            {stats.topCategory === 'None' ? 'No Expenses' : stats.topCategory}
          </span>
          <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 w-2/3 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]"></div>
          </div>
          <p className="text-[10px] text-gray-600 mt-2 uppercase font-bold tracking-widest">Highest Spending</p>
        </motion.div>
      </motion.div>

      {/* ACTION SECTION REMOVED */}
      {loading && <TypewriterLoader />}

      {error && !loading && (
        <div className="mx-auto bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm max-w-md text-center">
          {error}
        </div>
      )}

      {/* RESULTS SECTION */}
      <AnimatePresence mode="wait">
        {loading ? null : insight ? (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="space-y-8"
          >
            {/* Summary Banner */}
            <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-white/10 rounded-2xl p-6 text-center">
               <p className="text-white text-lg font-medium italic">"{insight.summary}"</p>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insight.insights.map((item, idx) => (
                <InsightCard key={idx} {...item} />
              ))}
            </div>

            {/* Prediction Banner */}
            <div className="bg-gradient-to-b from-[#13131a] to-[#0a0a0f] border border-violet-500/20 rounded-3xl p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <RiCalendarCheckLine className="text-9xl text-violet-500 -rotate-12" />
               </div>
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                  <div className="p-4 bg-violet-500/10 rounded-2xl text-violet-400">
                     <RiCalendarCheckLine className="text-4xl" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400 mb-2">Spending Prediction</h3>
                    <p className="text-white text-xl md:text-2xl font-['Sora'] leading-snug">
                       {insight.prediction}
                    </p>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : !error && (
          <div key="empty" className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <RiLightbulbLine className="text-4xl text-gray-700" />
            </div>
            <h3 className="text-gray-500 font-medium">Ready for your AI financial review?</h3>
            <p className="text-gray-600 text-sm mt-1">We'll analyze your {stats.totalSpent > 0 ? 'monthly habits' : 'data'} and provide actionable tips.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
