import React, { createContext, useContext, useEffect, useState } from 'react';
import Loading from '../components/Loading';
import type { User, Profile, AuthSession } from '../types';
import { api } from '../services/localApi';

interface AuthContextValue {
  signUp: () => Promise<{ data: null; error: { message: string } | null }>;
  signIn: (params: { email?: string }) => Promise<{ data: AuthSession; error: null }>;
  signOut: () => Promise<{ error: null }>;
  updateProfileFields: (update: Partial<Profile>) => void;
  user: User | null;
  profile: Profile | null;
  role: string;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

const IS_PROTOTYPE_AUTH = true;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const raw = localStorage.getItem(STORAGE_KEY);
            const savedSession = raw ? JSON.parse(raw) : createDefaultSession();

            setUser(savedSession.user);
            setProfile(savedSession.profile);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSession));

            if (savedSession.user?.id) {
                const { data } = await api.getProfile(savedSession.user.id);
                if (data) {
                    const merged = { ...savedSession.profile, ...data };
                    const nextSession = { ...savedSession, profile: merged };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
                    setProfile(merged);
                }
            }

            setLoading(false);

            if (IS_PROTOTYPE_AUTH) {
                console.warn('[AuthContext] Running in prototype mode. All users share local storage. Replace with Supabase before launch.');
            }
        };
        init();
    }, []);

    const updateSession = (next: AuthSession) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setUser(next.user);
        setProfile(next.profile);
    };

    const signIn = async ({ email }: { email?: string }) => {
        const session = createDefaultSession();
        session.user.email = email || session.user.email;
        const baseName = email ? email.split('@')[0] : 'student';
        session.user.user_metadata = { username: baseName };
        session.profile.username = baseName;

        if (email === 'admin@fireman.test') {
            session.profile.role = 'super_admin';
        }

        updateSession(session);
        return { data: session, error: null };
    };

    const updateProfileFields = async (profileUpdate: Partial<Profile>) => {
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
        await api.updateProfile(currentSession.user.id, profileUpdate);
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
