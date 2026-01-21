import React, { useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { syncUserProfile, getUserRole } from '../services/db';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    function signup(email, password, name) {
        return createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Update the user profile with the name
                await updateProfile(userCredential.user, {
                    displayName: name
                });
                await syncUserProfile(userCredential.user); // Sync to DB
                return userCredential;
            });
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    function logout() {
        return signOut(auth);
    }

    const [sessionStart] = useState(Date.now());

    useEffect(() => {
        let unsubscribeUserDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            try {
                setCurrentUser(user);

                if (user) {
                    await syncUserProfile(user);
                    const role = await getUserRole(user.uid);
                    const isAdminEmail = user.email && user.email.toLowerCase() === 'yunusemredmrts61@gmail.com';
                    setIsAdmin(role === 'admin' || isAdminEmail);

                    // Real-time listener for session revocation
                    const userRef = doc(db, 'users', user.uid);
                    unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            if (data.sessionsRevokedAt) {
                                const revokedAt = data.sessionsRevokedAt.toMillis();
                                if (revokedAt > sessionStart) {
                                    console.log("Session revoked remotely. Logging out...");
                                    logout();
                                }
                            }
                        }
                    });
                } else {
                    setIsAdmin(false);
                    if (unsubscribeUserDoc) {
                        unsubscribeUserDoc();
                        unsubscribeUserDoc = null;
                    }
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeUserDoc) unsubscribeUserDoc();
        };
    }, [sessionStart]);

    const value = {
        currentUser,
        isAdmin,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
