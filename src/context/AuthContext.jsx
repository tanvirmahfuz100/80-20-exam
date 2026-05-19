import React, { createContext, useContext, useEffect, useState } from 'react';
import Loading from '../components/Loading';

const AuthContext = createContext({});

const STORAGE_KEY = 'exam_local_auth';

const createDefaultSession = () => ({
    user: {
        id: 'local-tester',
        email: 'tester@local.app',
        user_metadata: {}
    },
    profile: {
        id: 'local-tester',
        username: '',
        role: 'student',
        plan_type: 'premium',
        total_xp: 0,
        target_exams: [],
        question_version: null
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
        const baseName = email ? email.split('@')[0] : 'student';
        session.user.user_metadata = { username: baseName };
        session.profile.username = baseName;

        if (email === 'admin@80-20.test') {
            session.profile.role = 'super_admin';
        }

        updateSession(session);
        return { data: session, error: null };
    };

    const updateProfileFields = (profileUpdate) => {
        const raw = localStorage.getItem(STORAGE_KEY);
        const currentSession = raw ? JSON.parse(raw) : createDefaultSession();
        const nextProfile = { ...currentSession.profile, ...profileUpdate };
        const nextSession = { ...currentSession, profile: nextProfile };
        if (profileUpdate.username) {
            nextSession.user.user_metadata = { ...nextSession.user.user_metadata, username: profileUpdate.username };
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
        setUser(nextSession.user);
        setProfile(nextProfile);
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

    const role = profile?.role || 'student';

    const value = {
        signUp,
        signIn,
        signOut,
        updateProfileFields,
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
