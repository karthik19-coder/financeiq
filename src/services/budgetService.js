import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  increment,
  query
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'budgets';

/**
 * Set budget for a category
 * @param {string} uid - User ID
 * @param {string} category - Category name
 * @param {number} limit - Budget limit
 */
export const setBudget = async (uid, category, limit) => {
  try {
    const budgetRef = doc(db, COLLECTION_NAME, uid, 'categories', category);
    await setDoc(budgetRef, {
      limit: parseFloat(limit),
      spent: 0 // Initialize spent to 0 if new
    }, { merge: true });
  } catch (error) {
    console.error("Error setting budget: ", error);
    throw error;
  }
};

/**
 * Get all budgets for a user (Real-time)
 * @param {string} uid - User ID
 * @param {function} callback - Function to handle the data
 */
export const getBudgets = (uid, callback) => {
  const budgetsRef = collection(db, COLLECTION_NAME, uid, 'categories');

  return onSnapshot(budgetsRef, (querySnapshot) => {
    const budgets = [];
    querySnapshot.forEach((doc) => {
      budgets.push({ category: doc.id, ...doc.data() });
    });
    callback(budgets);
  }, (error) => {
    console.error("Error listening to budgets: ", error);
  });
};

/**
 * Update spent amount for a category
 * @param {string} uid - User ID
 * @param {string} category - Category name
 * @param {number} amount - Amount to add to spent
 */
export const updateSpent = async (uid, category, amount) => {
  try {
    const budgetRef = doc(db, COLLECTION_NAME, uid, 'categories', category);
    await updateDoc(budgetRef, {
      spent: increment(parseFloat(amount))
    });
  } catch (error) {
    console.error("Error updating spent: ", error);
    // Note: If document doesn't exist, you might want to handle it (e.g., create it)
    throw error;
  }
};
