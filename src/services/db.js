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

    const isAdminEmail = user.email.toLowerCase() === 'yunusemredmrts61@gmail.com';
    const userData = {
        email: user.email,
        lastLogin: new Date(),
        // Only update role if it's an admin email, otherwise keep existing role or default to user
        role: isAdminEmail ? 'admin' : (userSnap.exists() ? userSnap.data().role : 'user')
    };

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            ...userData,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date()
        });
    } else {
        // Sync basic auth data but don't overwrite profile if custom data exists
        // We only forcefully update email, lastLogin, and role
        // DisplayName and PhotoURL should be managed by the profile settings if they exist in DB
        const currentData = userSnap.data();
        const updates = { ...userData };

        // If DB doesn't have displayName but Auth does, add it. 
        // If DB has it, we assume the DB version is the source of truth (handled by profile settings)
        if (!currentData.displayName && user.displayName) updates.displayName = user.displayName;
        if (!currentData.photoURL && user.photoURL) updates.photoURL = user.photoURL;

        await setDoc(userRef, updates, { merge: true });
    }
};

// Update extended profile data
export const updateUserProfileData = async (uid, data) => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
        ...data,
        updatedAt: new Date()
    }, { merge: true });
};

export const getUserRole = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data().role;
    }
    return 'user';
};

export const getUserData = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
};

export const getAllUsers = async () => {
    const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Ticket Operations
export const createTicket = async (userId, userEmail, subject, content) => {
    await addDoc(collection(db, 'tickets'), {
        userId,
        userEmail,
        subject,
        content,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
    });
};

export const getUserTickets = async (userId) => {
    const q = query(
        collection(db, 'tickets'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllTickets = async () => {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};
