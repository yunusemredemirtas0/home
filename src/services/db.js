import { db } from '../firebase';
import {
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    onSnapshot,
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
        const currentData = userSnap.data();
        const updates = { ...userData };
        if (!currentData.displayName && user.displayName) updates.displayName = user.displayName;
        if (!currentData.photoURL && user.photoURL) updates.photoURL = user.photoURL;
        await setDoc(userRef, updates, { merge: true });
    }
};

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

// ... (previous code)

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

export const revokeSessions = async (uid) => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
        sessionsRevokedAt: serverTimestamp()
    }, { merge: true });
};

export const getUserDataForExport = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const ticketsQ = query(collection(db, 'tickets'), where('userId', '==', uid));
    const ticketsSnap = await getDocs(ticketsQ);
    const tickets = ticketsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return {
        profile: userData,
        tickets: tickets,
        exportDate: new Date().toISOString()
    };
};

export const deleteTicket = async (ticketId) => {
    const ticketRef = doc(db, 'tickets', ticketId);
    await deleteDoc(ticketRef);
};

export const getUserTickets = async (userId) => {
    const q = query(
        collection(db, 'tickets'),
        where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const tickets = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    return tickets.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || Date.now();
        const timeB = b.createdAt?.toMillis?.() || Date.now();
        return timeB - timeA;
    });
};

export const getAllTickets = async () => {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const streamTickets = (userId, isAdmin, callback) => {
    let q;
    if (isAdmin) {
        q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    } else {
        q = query(collection(db, 'tickets'), where('userId', '==', userId));
    }

    return onSnapshot(q, (snapshot) => {
        const tickets = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        if (!isAdmin) {
            tickets.sort((a, b) => {
                const timeA = a.createdAt?.toMillis?.() || Date.now();
                const timeB = b.createdAt?.toMillis?.() || Date.now();
                return timeB - timeA;
            });
        }
        callback(tickets);
    });
};

export const streamMessages = (ticketId, callback) => {
    const q = query(
        collection(db, 'tickets', ticketId, 'messages'),
        orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

export const updateTicketStatus = async (ticketId, status) => {
    const ticketRef = doc(db, 'tickets', ticketId);
    await setDoc(ticketRef, {
        status,
        updatedAt: serverTimestamp()
    }, { merge: true });
};

export const addTicketMessage = async (ticketId, userId, userEmail, message, isAdminSender) => {
    const messagesRef = collection(db, 'tickets', ticketId, 'messages');
    await addDoc(messagesRef, {
        userId,
        userEmail,
        message,
        createdAt: serverTimestamp()
    });

    const ticketRef = doc(db, 'tickets', ticketId);
    const updates = {
        updatedAt: serverTimestamp()
    };

    if (isAdminSender) {
        updates.unreadForUser = true;
    } else {
        updates.unreadForAdmin = true;
    }

    await setDoc(ticketRef, updates, { merge: true });
};

export const markTicketAsRead = async (ticketId, isAdmin) => {
    const ticketRef = doc(db, 'tickets', ticketId);
    const updates = {};
    if (isAdmin) {
        updates.unreadForAdmin = false;
    } else {
        updates.unreadForUser = false;
    }
    await setDoc(ticketRef, updates, { merge: true });
};

export const getTicketMessages = async (ticketId) => {
    const q = query(
        collection(db, 'tickets', ticketId, 'messages'),
        orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};
