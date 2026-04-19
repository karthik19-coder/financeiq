import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiAlertFill, RiDeleteBin7Line, RiHistoryLine, RiRefreshLine } from 'react-icons/ri';
import { useFinance } from '../context/FinanceContext';

export default function ResetDataModal({ isOpen, onClose }) {
  const { resetData } = useFinance();
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeSpan, setTimeSpan] = useState(7); // 7 or 30
  
  if (!isOpen) return null;

  const handleExecute = async () => {
    if (!selectedOption) return;
    
    // Double confirmation
    if (!window.confirm("Are you absolutely sure you want to proceed? This action cannot be reversed.")) {
        return;
    }

    setLoading(true);
    try {
      if (selectedOption === 'A') {
        await resetData('A', timeSpan);
      } else {
        await resetData(selectedOption);
      }
      onClose();
    } catch (err) {
      alert("Failed to reset. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#1a1a24] rounded-3xl border border-red-500/30 overflow-hidden shadow-2xl shadow-red-500/10"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/5">
            <h2 className="text-xl font-bold font-['Sora'] text-white flex items-center gap-2">
              <RiAlertFill className="text-red-500" /> Advanced Reset System
            </h2>
            <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-white transition-colors">
              <RiCloseLine className="text-2xl" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-400 mb-4">
              Select an option below. These are destructive actions and permanently delete data from the database.
            </p>

            {/* Option A */}
            <div 
               onClick={() => setSelectedOption('A')}
               className={`p-4 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${selectedOption === 'A' ? 'bg-amber-500/10 border-amber-500' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
            >
               <div className="flex items-center justify-between">
                 <h3 className="text-white font-bold flex items-center gap-2"><RiHistoryLine /> Time-Based Wipe</h3>
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedOption === 'A' ? 'border-amber-500' : 'border-gray-500'}`}>
                   {selectedOption === 'A' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                 </div>
               </div>
               <p className="text-xs text-slate-400">Deletes recent transactions but keeps older history and profile targets.</p>
               {selectedOption === 'A' && (
                 <div className="flex gap-2 mt-2">
                   <button onClick={(e) => { e.stopPropagation(); setTimeSpan(7); }} className={`px-3 py-1 text-xs rounded-lg border ${timeSpan === 7 ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent text-gray-400 border-gray-600'}`}>Last 7 Days</button>
                   <button onClick={(e) => { e.stopPropagation(); setTimeSpan(30); }} className={`px-3 py-1 text-xs rounded-lg border ${timeSpan === 30 ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent text-gray-400 border-gray-600'}`}>Last 30 Days</button>
                 </div>
               )}
            </div>

            {/* Option B */}
            <div 
               onClick={() => setSelectedOption('B')}
               className={`p-4 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${selectedOption === 'B' ? 'bg-orange-500/10 border-orange-500' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
            >
               <div className="flex items-center justify-between">
                 <h3 className="text-white font-bold flex items-center gap-2"><RiDeleteBin7Line /> Wipe All Transactions</h3>
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedOption === 'B' ? 'border-orange-500' : 'border-gray-500'}`}>
                   {selectedOption === 'B' && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                 </div>
               </div>
               <p className="text-xs text-slate-400">Deletes every transaction you have ever logged. Keeps your profile, limits, and savings targets.</p>
            </div>

            {/* Option C */}
            <div 
               onClick={() => setSelectedOption('C')}
               className={`p-4 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${selectedOption === 'C' ? 'bg-red-500/10 border-red-500' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
            >
               <div className="flex items-center justify-between">
                 <h3 className="text-red-400 font-bold flex items-center gap-2"><RiRefreshLine /> Complete Factory Reset</h3>
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedOption === 'C' ? 'border-red-500' : 'border-gray-500'}`}>
                   {selectedOption === 'C' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                 </div>
               </div>
               <p className="text-xs text-slate-400">The nuclear option. Destroys all transactions, wipes your profile logic, resets your balance to zero, and forces you back through initial Onboarding.</p>
            </div>

          </div>

          <div className="p-6 border-t border-white/5 flex gap-3">
             <button
               onClick={onClose}
               disabled={loading}
               className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
             >
               Cancel
             </button>
             <button
               onClick={handleExecute}
               disabled={loading || !selectedOption}
               className="flex-1 flex items-center justify-center py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-600/20"
             >
               {loading ? (
                 <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 'Execute Reset'
               )}
             </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
