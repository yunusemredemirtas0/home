import { db } from '../firebase';
import {
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

// User Operations
export const syncUserProfile = async (user) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const userData = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
    };

    if (!userSnap.exists()) {
        // New user
        await setDoc(userRef, {
            ...userData,
            role: 'user', // Default role
            createdAt: serverTimestamp()
        });
    } else {
        // Update existing user
        await setDoc(userRef, userData, { merge: true });
    }
};

export const getUserRole = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data().role;
    }
    return 'user';
};

export const getAllUsers = async () => {
    const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Ticket Operations
export const createTicket = async (userId, userEmail, subject, content) => {
    await addDoc(collection(db, 'tickets'), {
        userId,
        userEmail,
        subject,
        content,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
};

export const getUserTickets = async (userId) => {
    const q = query(
        collection(db, 'tickets'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllTickets = async () => {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
