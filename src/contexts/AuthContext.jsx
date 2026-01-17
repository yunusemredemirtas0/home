import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Sync user data on every auth state change (login/refresh)
                await syncUserProfile(user);

                // Check role
                // HARDCODED ADMIN FOR SETUP:
                // You can replace this with purely DB based role check later
                // For now, let's say the current user is admin if email matches, OR if DB says so.
                const role = await getUserRole(user.uid);
                // Replace 'yunusemredemirtas@gmail.com' or similar with the actual admin email if known,
                // or just rely on DB role. We'll rely on DB role 'admin'.
                setIsAdmin(role === 'admin');
            } else {
                setIsAdmin(false);
            }
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        isAdmin,
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
