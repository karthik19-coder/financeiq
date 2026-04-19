import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiGhostLine, RiArrowLeftLine } from 'react-icons/ri';

export default function NotFound() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center pb-20 md:pb-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-10 text-center rounded-3xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl max-w-md w-full"
      >
        <RiGhostLine className="text-6xl text-violet-400 mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold font-['Sora'] text-slate-100 mb-2">404</h1>
        <h2 className="text-xl font-medium text-slate-300 mb-6">Page Not Found</h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-semibold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <RiArrowLeftLine /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
