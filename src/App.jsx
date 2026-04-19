import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import Budget from './pages/Budget';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { RiLogoutBoxLine } from 'react-icons/ri';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));

const FallbackLoader = () => (
  <div className="flex h-[80vh] items-center justify-center">
    <div className="h-14 w-14 animate-spin rounded-full border-4 border-violet-600 border-t-transparent shadow-lg shadow-violet-500/20"></div>
  </div>
);

// Inner shell: conditionally renders Navbar based on auth state
function AppShell() {
  const { authState, setIsNewUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  const isAuthenticated = authState === 'AUTHENTICATED';

  return (
    <div className="relative flex min-h-screen bg-[#0a0a0f]">
      {/* Ambient gradient overlays */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.08)_0%,transparent_60%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.06)_0%,transparent_60%)]" />

      {/* Sidebar - only show if fully authenticated */}
      {isAuthenticated && <Navbar />}

      {/* Main content */}
      <main className={`relative z-10 w-full min-h-screen flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 pb-24 md:p-8 md:pb-8 ${isAuthenticated ? 'md:ml-[240px]' : ''}`}>
        {/* Mobile Header */}
        {isAuthenticated && (
          <div className="flex md:hidden items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-emerald-400">
                <span className="text-[10px] font-bold text-white">FQ</span>
              </div>
              <span className="font-['Sora'] text-lg font-bold text-white">FinanceIQ</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 active:scale-95 transition-all"
            >
              <RiLogoutBoxLine size={16} />
              <span className="text-xs font-semibold">Sign Out</span>
            </button>
          </div>
        )}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/onboarding" element={
              <ErrorBoundary>
                <Suspense fallback={<FallbackLoader />}>
                  <Onboarding onComplete={() => setIsNewUser(false)} />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/dashboard" element={
              <ErrorBoundary>
                <Suspense fallback={<FallbackLoader />}>
                   <Dashboard />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/new" element={<AddTransaction />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/insights" element={
              <Suspense fallback={<FallbackLoader />}>
                <InsightsPage />
              </Suspense>
            } />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <AppShell />
      </FinanceProvider>
    </AuthProvider>
  );
}

export default App;
