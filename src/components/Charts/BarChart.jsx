import { useRef, useState, useEffect } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BarChart({ data, title }) {
  const containerRef = useRef(null);
  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsCalculated(true);
        } else {
          setIsCalculated(false);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[220px] md:h-[350px] w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {title && <h3 className="mb-4 w-full text-left font-['Sora'] text-lg font-medium text-slate-100">{title}</h3>}
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-500">No data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[220px] md:h-[350px] w-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {title && <h3 className="mb-6 font-['Sora'] text-lg font-medium text-slate-100">{title}</h3>}
      <div className="h-full w-full flex-1" ref={containerRef}>
        {isCalculated && (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-white/10 bg-[#0f0f1a]/95 p-3 shadow-xl backdrop-blur-xl min-w-[120px]">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                        <div className="space-y-1.5">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                                <span className="text-slate-300 capitalize">{entry.name}</span>
                              </div>
                              <span className="font-semibold text-slate-100">₹{entry.value.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </RechartsBarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
