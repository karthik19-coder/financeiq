import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'transactions';

/**
 * Add a new transaction
 * @param {Object} transactionData - { uid, amount, category, type, note, date }
 */
export const addTransaction = async (transactionData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...transactionData,
      amount: parseFloat(transactionData.amount),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
};

/**
 * Get all transactions for a specific user (Real-time)
 * @param {string} uid - User ID
 * @param {function} callback - Function to handle the data
 */
export const getTransactions = (uid, callback) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("uid", "==", uid),
    orderBy("date", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const transactions = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    callback(transactions);
  }, (error) => {
    console.error("Error listening to transactions: ", error);
  });
};

/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 */
export const deleteTransaction = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting transaction: ", error);
    throw error;
  }
};

/**
 * Get monthly statistics for a user
 * Note: For simplicity, this calculates stats client-side from all fetched transactions.
 * @param {string} uid - User ID
 */
export const getMonthlyStats = async (uid) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("uid", "==", uid)
    );
    const querySnapshot = await getDocs(q);
    
    const stats = {
      totalIncome: 0,
      totalExpense: 0,
      categories: {}
    };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const transDate = data.date.toDate ? data.date.toDate() : new Date(data.date);
      
      if (transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear) {
        const amount = parseFloat(data.amount);
        if (data.type === 'income') {
          stats.totalIncome += amount;
        } else {
          stats.totalExpense += amount;
          stats.categories[data.category] = (stats.categories[data.category] || 0) + amount;
        }
      }
    });

    return stats;
  } catch (error) {
    console.error("Error getting monthly stats: ", error);
    throw error;
  }
};
