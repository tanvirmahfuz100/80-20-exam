import React, { createContext, useContext, useEffect, useState } from 'react';
import Loading from '../components/Loading';

const AuthContext = createContext({});

const STORAGE_KEY = 'exam_local_auth';

const createDefaultSession = () => ({
    user: {
        id: 'local-tester',
        email: 'tester@local.app',
        user_metadata: { username: 'Local Tester' }
    },
    profile: {
        id: 'local-tester',
        username: 'Local Tester',
        role: 'super_admin',
        plan_type: 'premium',
        total_xp: 0,
        target_exams: ['IBA', 'BCS']
    }
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        const savedSession = raw ? JSON.parse(raw) : createDefaultSession();

        setUser(savedSession.user);
        setProfile(savedSession.profile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSession));
        setLoading(false);
    }, []);

    const updateSession = (next) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setUser(next.user);
        setProfile(next.profile);
    };

    const signIn = async ({ email }) => {
        const session = createDefaultSession();
        session.user.email = email || session.user.email;
        session.user.user_metadata.username = email ? email.split('@')[0] : session.user.user_metadata.username;
        session.profile.username = session.user.user_metadata.username;
        updateSession(session);
        return { data: session, error: null };
    };

    const signUp = async () => {
        return {
            data: null,
            error: { message: 'Registration is hidden in local testing mode.' }
        };
    };

    const signOut = async () => {
        const session = createDefaultSession();
        updateSession(session);
        return { error: null };
    };

    const role = profile?.role || 'super_admin';

    const value = {
        signUp,
        signIn,
        signOut,
        user,
        profile,
        role,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <Loading message="Initializing session..." /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
