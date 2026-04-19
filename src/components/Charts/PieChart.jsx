import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PieChart({ data, title }) {
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
      {title && <h3 className="mb-2 font-['Sora'] text-lg font-medium text-slate-100">{title}</h3>}
      <div className="h-full w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              isAnimationActive={true}
              animationDuration={800}
              label={({ cx, cy, midAngle, outerRadius, percent, index }) => {
                // Determine layout inside logic natively
                const RADIAN = Math.PI / 180;
                const radius = outerRadius * 1.15;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                if (percent < 0.04) return null; // Hide tiny labels
                return (
                  <text 
                    x={x} y={y} 
                    fill={data[index].color} 
                    textAnchor={x > cx ? 'start' : 'end'} 
                    dominantBaseline="central" 
                    fontSize={12} 
                    className="font-medium drop-shadow-sm"
                  >
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
              labelLine={false}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color}40)` }} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-white/10 bg-[#0f0f1a]/95 p-3 shadow-xl backdrop-blur-xl">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: payload[0].payload.color }} />
                        <span className="text-sm text-slate-300">{payload[0].name}</span>
                      </div>
                      <p className="mt-1 pl-4.5 text-base font-bold text-slate-100">
                        ₹{payload[0].value.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              content={(props) => {
                const { payload } = props;
                return (
                  <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2">
                    {payload.map((entry, index) => (
                      <li key={`item-${index}`} className="flex items-center gap-1.5 text-xs text-slate-400">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="capitalize">{entry.value}</span>
                      </li>
                    ))}
                  </ul>
                );
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
