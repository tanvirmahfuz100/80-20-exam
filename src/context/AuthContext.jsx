import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId, email, userAuth) => {
        try {
            console.log("AuthContext: Fetching profile for", userId);
            // 1. Try to get existing profile
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // 2. Self-Healing: If profile is missing OR we hit a server error
            if (error) {
                console.error("AuthContext: Profile fetch error", error);

                // If the error is 'PGRST116' (not found) or a 500 server error, try to fallback/recreate
                if (error.code === 'PGRST116' || error.status >= 500) {
                    console.log("AuthContext: Attempting profile recovery...");
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .upsert([{
                            id: userId,
                            role: email === 'tanvirmahfuz100@gmail.com' ? 'super_admin' : 'student',
                            phone_number: userAuth?.user_metadata?.phone_number || null,
                            target_exams: userAuth?.user_metadata?.target_exams || []
                        }])
                        .select()
                        .single();

                    if (!createError) data = newProfile;
                }
            }

            if (data) {
                console.log("AuthContext: Profile loaded successfully");
                setProfile(data);
            } else {
                // Return a skeleton profile if all else fails to prevent crashes
                setProfile({ role: email === 'tanvirmahfuz100@gmail.com' ? 'super_admin' : 'student' });
            }
        } catch (err) {
            console.error("AuthContext: Fatal profile error:", err);
            setProfile({ role: 'student' });
        }
    };

    useEffect(() => {
        console.log("AuthContext: Initializing...");

        // 🛡️ SAFETY TIMEOUT: Ensure loading is disabled after 5 seconds
        const safetyTimer = setTimeout(() => {
            if (loading) {
                console.warn("AuthContext: Loading timed out, force-starting app.");
                setLoading(false);
            }
        }, 5000);

        const getSession = async () => {
            try {
                console.log("AuthContext: Fetching session...");
                const { data: { session } } = await supabase.auth.getSession();
                console.log("AuthContext: Session response:", session ? "Session found" : "No session");

                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id, session.user.email, session.user);
                }
            } catch (err) {
                console.error("AuthContext: Session error:", err);
            } finally {
                setLoading(false);
                clearTimeout(safetyTimer);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log("AuthContext: Auth state changed:", _event);
            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id, session.user.email, session.user);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
            clearTimeout(safetyTimer);
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(safetyTimer);
        };
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
