import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

const OnboardingRoute = () => {
  const { user, loading } = useAuth();
  const [checked, setChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "users", user.uid)).then(snap => {
        setNeedsOnboarding(!snap.exists() || !snap.data().onboardingComplete);
        setChecked(true);
      }).catch(err => {
        console.error("Failed to fetch user doc for onboarding route:", err);
        setChecked(true);
      });
    } else {
      setTimeout(() => setChecked(true), 0);
    }
  }, [user]);

  if (loading || !checked) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0f]">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-violet-600 border-t-transparent shadow-lg shadow-violet-500/20"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!needsOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default OnboardingRoute;
