import React, { useState } from 'react';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';

export default function Onboarding({ onComplete }) {
  const { user } = useAuth();
  const { refreshData } = useFinance();
  
  const [currentCard, setCurrentCard] = useState(0);
  const [direction, setDirection] = useState("forward");
  const [animating, setAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    monthlyIncome: "",
    savingsGoal: "",
    currency: "INR"
  });

  const cards = [
    {
      id: 0,
      title: "Hey there! What should we call you?",
      subtext: "Let's personalize your experience.",
      content: (
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Your Name"
          className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:border-indigo-500 outline-none transition-colors"
        />
      ),
      isValid: formData.name.trim().length > 0
    },
    {
      id: 1,
      title: "What is your monthly income?",
      subtext: "This helps us set baseline metrics for your budgeting.",
      content: (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">₹</span>
          <input
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
            placeholder="0"
            className="w-full bg-[#1a1a24] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-lg focus:border-indigo-500 outline-none transition-colors"
          />
        </div>
      ),
      isValid: formData.monthlyIncome && parseFloat(formData.monthlyIncome) > 0
    },
    {
      id: 2,
      title: "What is your monthly savings goal?",
      subtext: "Aim high, but keep it realistic. You can edit this later.",
      content: (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">₹</span>
          <input
            type="number"
            value={formData.savingsGoal}
            onChange={(e) => setFormData({ ...formData, savingsGoal: e.target.value })}
            placeholder="0"
            className="w-full bg-[#1a1a24] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-lg focus:border-indigo-500 outline-none transition-colors"
          />
        </div>
      ),
      isValid: formData.savingsGoal && parseFloat(formData.savingsGoal) > 0
    },
    {
      id: 3,
      title: "Pick your preferred currency",
      subtext: "This app displays in ₹ INR, but we'll record your preference.",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {['INR', 'USD', 'EUR', 'GBP'].map((curr) => {
            const isSelected = formData.currency === curr;
            return (
              <button
                key={curr}
                onClick={() => setFormData({ ...formData, currency: curr })}
                className={`py-3 px-4 rounded-xl font-semibold border transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-[#1a1a24] text-gray-400 border-white/10 hover:border-white/20"
                }`}
              >
                {curr === 'INR' ? '₹ ' : curr === 'USD' ? '$ ' : curr === 'EUR' ? '€ ' : '£ '}{curr}
              </button>
            );
          })}
        </div>
      ),
      isValid: true
    },
    {
      id: 4,
      title: "You're all set! Let's build your financial future.",
      subtext: "Your dashboard is ready.",
      content: (
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-white/10 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Name</span>
            <span className="text-white font-medium">{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Income</span>
            <span className="text-emerald-400 font-medium">₹{parseFloat(formData.monthlyIncome || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Goal</span>
            <span className="text-indigo-400 font-medium">₹{parseFloat(formData.savingsGoal || 0).toLocaleString()}</span>
          </div>
        </div>
      ),
      isValid: true
    }
  ];

  const handleNext = () => {
    if (currentCard === cards.length - 1) {
      handleComplete();
      return;
    }
    
    if (animating) return;
    setAnimating(true);
    setDirection("forward");
    
    setTimeout(() => {
      setCurrentCard(prev => prev + 1);
      setTimeout(() => setAnimating(false), 50);
    }, 10);
  };

  const handleBack = () => {
    if (currentCard === 0 || animating) return;
    setAnimating(true);
    setDirection("backward");
    
    setTimeout(() => {
      setCurrentCard(prev => prev - 1);
      setTimeout(() => setAnimating(false), 50);
    }, 10);
  };

  const handleComplete = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: user.email,
        monthlyIncome: Number(formData.monthlyIncome),
        savingsGoal: Number(formData.savingsGoal),
        currency: formData.currency,
        onboardingComplete: true,
        createdAt: serverTimestamp(),
      }, { merge: true });

      // Signal completion back to AppShell natively escaping route
      await refreshData();
      onComplete();
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const activeCard = cards[currentCard];
  const animationClass = direction === "forward" 
    ? "onboarding-card-enter-active" 
    : "onboarding-card-exit-active"; 
  // Custom manual CSS mapping logic. For React dynamic unmounting, we typically map the entering animation classes onto the active card
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0f] flex items-center justify-center">
      <div 
        key={currentCard}
        className={`w-full max-w-[480px] p-8 mx-4 bg-[#13131a] rounded-2xl border border-white/10 shadow-2xl ${
          animating 
            ? (direction === "forward" ? "onboarding-card-enter" : "onboarding-card-exit") 
            : "onboarding-card-enter-active"
        } transition-all duration-350`}
        // Note: Using standard CSS animation states on React key change forces DOM remount enabling pure CSS transforms
        style={{ animation: animating ? 'none' : `${direction === 'forward' ? 'slideInRight 350ms ease-in-out' : 'slideInLeft 350ms ease-in-out'}` }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">{activeCard.title}</h2>
        <p className="text-gray-400 text-sm mb-6">{activeCard.subtext}</p>
        
        <div className="mb-6">
          {activeCard.content}
        </div>
        
        <button
          disabled={!activeCard.isValid || isSubmitting}
          onClick={handleNext}
          className="w-full py-3 rounded-xl font-medium mt-6 bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-12"
        >
          {isSubmitting ? (
             <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : currentCard === cards.length - 1 ? (
            "Go to Dashboard"
          ) : (
            "Continue"
          )}
        </button>
        
        {currentCard > 0 && !isSubmitting && (
          <button
            onClick={handleBack}
            className="w-full text-gray-500 hover:text-white text-sm mt-3 transition-colors py-2"
          >
            Back
          </button>
        )}

        <div className="flex justify-center gap-2 mt-8">
          {cards.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentCard ? "bg-indigo-500 w-6" : "bg-white/20 w-2"
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Inline styles for the pure CSS animations as a fallback if index.css ones are tricky with remounting */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
