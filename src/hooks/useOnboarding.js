import { useNavigate } from 'react-router-dom';
import { getDoc, doc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function useOnboarding() {
  const navigate = useNavigate();

  const checkAndRedirect = async (user) => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists() || !userDoc.data().onboardingComplete) {
        // NEW USER DETECTED
        
        // 1. Completely clear localStorage for this newly registered user context 
        // to prevent any state leakage from previous anonymous or stale sessions across the machine
        Object.keys(localStorage)
          .filter(key => key.includes(user.uid) || key.includes("cached") || key === "finance_transactions")
          .forEach(key => localStorage.removeItem(key));
          
        navigate("/onboarding");
      } else {
        // RETURNING USER
        // Preload cache so dashboard is instant
        const prefetch = async (uid) => {
          try {
            const [uSnap, tSnap] = await Promise.all([
              getDoc(doc(db, "users", uid)),
              getDocs(query(
                collection(db, "transactions"),
                where("uid", "==", uid),
                orderBy("date", "desc"),
                limit(50)
              ))
            ]);
            
            const pData = {
              userData: uSnap.exists() ? uSnap.data() : {},
              transactions: tSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            };
            
            localStorage.setItem("dashboard_" + uid, JSON.stringify(pData));
          } catch (e) {
            console.error("Prefetch error:", e);
          }
        };
        
        prefetch(user.uid); // fire and forget
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error during onboarding check:", error);
      // Fallback in case of network issue
      navigate("/dashboard");
    }
  };

  return { checkAndRedirect };
}
