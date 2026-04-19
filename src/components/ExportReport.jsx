import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiDownloadCloud2Line, RiCloseLine, RiFileExcel2Line, RiFilePdfLine, RiLoader4Line } from 'react-icons/ri';
import { useFinance } from '../context/FinanceContext';
import { toast } from 'react-toastify';
import { isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export default function ExportReport() {
  const { transactions } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState('current');
  const [format, setFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const generatePDF = async (filteredTx, rangeTitle, totalIncome, totalExpense, net) => {
    return new Promise((resolve, reject) => {
      // Inject Html2Pdf dynamically to easily render perfect ₹ fonts from the browser DOM
      const scriptId = 'html2pdf-script';
      let script = document.getElementById(scriptId);
      
      const executeExport = async () => {
        try {
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.top = '-9999px';
          container.style.width = '800px';
          container.style.backgroundColor = '#ffffff';
          container.style.padding = '40px';
          container.style.fontFamily = 'Sora, sans-serif';
          container.style.color = '#1a1a2e';
          
          document.body.appendChild(container);
          
          let tableHtml = `
            <table style="width:100%; border-collapse: collapse; margin-top: 20px; font-size: 13px;">
              <thead>
                <tr style="background: #8b5cf6; text-align: left;">
                  <th style="padding: 12px; color: #fff;">Date</th>
                  <th style="padding: 12px; color: #fff;">Title</th>
                  <th style="padding: 12px; color: #fff;">Category</th>
                  <th style="padding: 12px; color: #fff;">Type</th>
                  <th style="padding: 12px; color: #fff;">Amount</th>
                  <th style="padding: 12px; color: #fff;">Notes</th>
                </tr>
              </thead>
              <tbody>
          `;
          
          filteredTx.forEach((t, i) => {
            const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
            tableHtml += `
              <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px;">${new Date(t.date).toLocaleDateString()}</td>
                <td style="padding: 10px;">${t.title}</td>
                <td style="padding: 10px;">${t.category}</td>
                <td style="padding: 10px;">${t.type === 'income' ? 'Income' : 'Expense'}</td>
                <td style="padding: 10px; font-weight: bold;">₹${Number(t.amount).toLocaleString()}</td>
                <td style="padding: 10px; color: #64748b; font-size: 11px;">${t.notes || ''}</td>
              </tr>
            `;
          });
          
          tableHtml += `</tbody></table>`;
          
          container.innerHTML = `
            <div style="border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; margin-bottom: 20px;">
              <h1 style="margin: 0; color: #8b5cf6; font-size: 28px;">FinanceIQ Statement</h1>
              <p style="margin: 5px 0 0; color: #475569;">Period: ${rangeTitle} • Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px;">
               <div style="text-align: center;">
                 <div style="color: #64748b; font-size: 12px; text-transform: uppercase;">Total Income</div>
                 <div style="font-size: 20px; font-weight: bold; color: #10b981;">₹${totalIncome.toLocaleString()}</div>
               </div>
               <div style="text-align: center;">
                 <div style="color: #64748b; font-size: 12px; text-transform: uppercase;">Total Expense</div>
                 <div style="font-size: 20px; font-weight: bold; color: #ef4444;">₹${totalExpense.toLocaleString()}</div>
               </div>
               <div style="text-align: center;">
                 <div style="color: #64748b; font-size: 12px; text-transform: uppercase;">Net Balance</div>
                 <div style="font-size: 20px; font-weight: bold; color: #0f172a;">₹${net.toLocaleString()}</div>
               </div>
            </div>
            
            ${tableHtml}
          `;
          
          const opt = {
            margin:       10,
            filename:     'FinanceIQ_Statement.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          
          await window.html2pdf().from(container).set(opt).save();
          document.body.removeChild(container);
          resolve();
        } catch(e) {
          reject(e);
        }
      };

      if (!window.html2pdf) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = executeExport;
        script.onerror = () => reject(new Error("Failed to load PDF library"));
        document.body.appendChild(script);
      } else {
        executeExport();
      }
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const now = new Date();
      let filteredTx = transactions;
      let rangeTitle = "All Time";
      
      if (dateRange === 'current') {
         const start = startOfMonth(now);
         const end = endOfMonth(now);
         filteredTx = transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
         rangeTitle = "Current Month";
      } else if (dateRange === '3months') {
         const start = startOfMonth(subMonths(now, 2));
         const end = endOfMonth(now);
         filteredTx = transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
         rangeTitle = "Last 3 Months";
      } else if (dateRange === 'custom') {
         if (!customStart || !customEnd) throw new Error("Please select valid dates");
         const start = new Date(customStart);
         const end = new Date(customEnd);
         end.setHours(23, 59, 59, 999);
         filteredTx = transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
         rangeTitle = `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
      }
      
      const totalIncome = filteredTx.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0);
      const totalExpense = filteredTx.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0);
      const net = totalIncome - totalExpense;

      // Simulated buffer for user UX
      await new Promise(r => setTimeout(r, 800));

      if (format === 'pdf') {
         await generatePDF(filteredTx, rangeTitle, totalIncome, totalExpense, net);
      } else {
         const headers = ['Date', 'Title', 'Category', 'Type', 'Amount (INR)', 'Notes'];
         const rows = filteredTx.map(t => [
            new Date(t.date).toLocaleDateString(),
            `"${t.title.replace(/"/g, '""')}"`,
            t.category,
            t.type,
            t.amount,
            `"${(t.notes || '').replace(/"/g, '""')}"`
         ]);
         
         const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
            
         const encodedUri = encodeURI(csvContent);
         const link = document.createElement("a");
         link.setAttribute("href", encodedUri);
         link.setAttribute("download", "FinanceIQ_Statement.csv");
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
      }
      
      toast.success('Report exported successfully! 📊', { style: { background: '#1a1a2e', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' } });
      setIsOpen(false);
    } catch(err) {
      console.error(err);
      toast.error(err.message || 'Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-slate-300 transition-colors border border-white/10"
      >
        <RiDownloadCloud2Line size={18} /> Export
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isExporting && setIsOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#1a1a2e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-['Sora'] text-white">Export Report</h2>
                {!isExporting && (
                   <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                     <RiCloseLine size={24} />
                   </button>
                )}
              </div>

              {isExporting ? (
                <div className="py-8 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin"></div>
                  <h3 className="font-semibold text-slate-200">Preparing your report...</h3>
                  <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-violet-500 rounded-full w-full animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Date Range Options */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Select Date Range</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['current', '3months', 'custom'].map(r => (
                        <button
                          key={r}
                          onClick={() => setDateRange(r)}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${dateRange === r ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                        >
                          {r === 'current' ? 'This Month' : r === '3months' ? 'Last 3 Months' : 'Custom'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Date Picker (conditionally rendered) */}
                  <AnimatePresence>
                    {dateRange === 'custom' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-2 gap-4 overflow-hidden"
                      >
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
                          <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 [color-scheme:dark]" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">End Date</label>
                          <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 [color-scheme:dark]" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Format Selector */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Export Format</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setFormat('pdf')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${format === 'pdf' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                      >
                        <RiFilePdfLine size={28} />
                        <span className="text-sm font-semibold">PDF Document</span>
                      </button>
                      <button
                        onClick={() => setFormat('csv')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${format === 'csv' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                      >
                        <RiFileExcel2Line size={28} />
                        <span className="text-sm font-semibold">Excel / CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    onClick={handleExport}
                    className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-violet-500/20"
                  >
                    Generate Report
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
