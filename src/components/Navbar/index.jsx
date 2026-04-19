/*
  FILE: Navbar/index.jsx
  WHAT IT DOES: Renders the primary navigation framing the application UI. Adapts between a desktop sidebar and a mobile bottom tab bar.
*/
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  RiDashboardLine,
  RiExchangeLine,
  RiAddCircleLine,
  RiWallet3Line,
  RiBarChartLine,
  RiLogoutBoxLine,
  RiLightbulbLine
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
  { to: '/transactions', label: 'Transactions', icon: RiExchangeLine },
  { to: '/transactions/new', label: 'Add', icon: RiAddCircleLine },
  { to: '/budget', label: 'Budget', icon: RiWallet3Line },
  { to: '/analytics', label: 'Analytics', icon: RiBarChartLine },
  { to: '/insights', label: 'Insights', icon: RiLightbulbLine },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-[80px] w-full items-center justify-around border-t border-white/5 bg-[#0d0d1a]/95 backdrop-blur-xl md:top-0 md:h-screen md:w-[240px] md:flex-col md:justify-start md:border-r md:border-t-0 md:bg-[#0d0d1a] px-2 md:px-0">
      
      {/* ---- Logo (Desktop Only) ---- */}
      <Link to="/dashboard" className="hidden md:flex items-center gap-3 px-6 py-7 w-full hover:opacity-80 transition-opacity">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-emerald-400 shadow-lg shadow-violet-500/20">
          <span className="text-sm font-bold text-white">FQ</span>
        </div>
        <span className="font-['Sora'] text-lg font-semibold tracking-tight text-slate-100 line-clamp-1">
          FinanceIQ
        </span>
      </Link>

      {/* ---- Divider (Desktop Only) ---- */}
      <div className="hidden md:block mx-5 mb-4 border-t border-white/5 w-[calc(100%-40px)]" />

      {/* ---- Nav Links ---- */}
      <div className="flex w-full items-center justify-around md:flex-1 md:flex-col md:justify-start md:gap-1 md:px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => `
              group flex aspect-square sm:aspect-auto flex-col sm:flex-row items-center justify-center sm:gap-3 rounded-xl p-3 md:w-full md:justify-start md:px-4 md:py-2.5 md:text-sm font-medium transition-all duration-200
              ${isActive
                ? 'text-emerald-400 md:border-l-2 md:border-emerald-400 md:bg-white/10 md:text-slate-100'
                : 'text-slate-500 hover:text-slate-300 md:border-l-2 md:border-transparent md:text-slate-400 md:hover:bg-white/5 md:hover:text-slate-200'
              }
            `}
          >
            <Icon
              className={`flex-shrink-0 transition-transform duration-200 ${location.pathname === to
                ? 'h-[24px] w-[24px] md:h-[18px] md:w-[18px] scale-110 md:scale-100' 
                : 'h-[22px] w-[22px] md:h-[18px] md:w-[18px]'
              }`}
            />
            <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">
              {label}
            </span>
          </NavLink>
        ))}
      </div>

      {/* ---- User Profile & Logout (Desktop Sidebar Footer) ---- */}
      {user && (
        <div className="hidden md:flex flex-col w-full px-4 py-6 border-t border-white/5 bg-black/10 mt-auto">
          <div className="flex items-center gap-3 mb-4 overflow-hidden">
            <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-inner shadow-black/20">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">{user.displayName || 'User'}</span>
              <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all active:scale-95 border border-transparent hover:border-rose-500/20"
          >
            <RiLogoutBoxLine className="text-lg" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* ---- Mobile Logout (Last Item in Bottom Tab Bar) ---- */}
      <button 
        onClick={handleLogout}
        className="flex md:hidden flex-col items-center justify-center p-2 text-slate-500 hover:text-rose-400"
        title="Logout"
      >
        <RiLogoutBoxLine className="h-[20px] w-[20px]" />
        <span className="text-[10px] font-medium mt-1">Exit</span>
      </button>
      
    </nav>
  );
}
