import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId, email, userAuth) => {
        try {
            // 1. Try to get existing profile
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // 2. Self-Healing: If profile is missing, create it
            if (error && (error.code === 'PGRST116' || error.message?.includes('0 rows'))) {
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert([{
                        id: userId,
                        role: email === 'tanvirmahfuz100@gmail.com' ? 'super_admin' : 'student',
                        phone_number: userAuth?.user_metadata?.phone_number || null,
                        target_exams: userAuth?.user_metadata?.target_exams || []
                    }])
                    .select()
                    .single();

                if (!createError) data = newProfile;
            }

            if (data) setProfile(data);
        } catch (err) {
            console.error("Profile loading error:", err);
        }
    };

    useEffect(() => {
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id, session.user.email, session.user);
                }
            } catch (err) {
                console.error("Auth session error:", err);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id, session.user.email, session.user);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 🛑 EMERGENCY BYPASS: If database fails, check email directly
    const effectiveRole = profile?.role || (user?.email === 'tanvirmahfuz100@gmail.com' ? 'super_admin' : 'student');

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
        profile,
        role: effectiveRole,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
