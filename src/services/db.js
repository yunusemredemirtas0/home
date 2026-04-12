import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const getUserData = async (uid) => {
    if (!db) return null;
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
        console.error("Error getting user data", e);
        return null;
    }
}
