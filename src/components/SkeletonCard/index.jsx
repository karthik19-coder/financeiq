export default function SkeletonCard({ tall = false }) {
  return (
    <div
      className={`rounded-xl border border-white/10 p-4 animate-pulse
        ${tall ? "h-64" : "h-24"}`}
      style={{background:"#13131a"}}>
      <div className="h-3 bg-white/10 rounded w-1/3 mb-3" />
      <div className="h-5 bg-white/10 rounded w-1/2 mb-2" />
      <div className="h-2 bg-white/5 rounded w-1/4" />
    </div>
  );
}
