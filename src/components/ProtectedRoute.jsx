import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false, superAdminOnly = false }) => {
    const { user, role, loading } = useAuth();

    // 1. If still loading auth/profile, show a professional loading screen (NOT black)
    if (loading) {
        return (
            <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 border-t-4 border-primary rounded-full animate-spin"></div>
                    <ShieldAlert className="absolute inset-0 m-auto w-8 h-8 text-primary/50" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Verifying Clearance</h2>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mt-2">Neural Identity Sync in Progress</p>
                </div>
            </div>
        );
    }

    // 2. If no user, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Level Check (Super Admin vs Content Admin vs Student)
    const isSuper = role === 'super_admin';
    const isAnyAdmin = role === 'super_admin' || role === 'content_admin';

    if (superAdminOnly && !isSuper) {
        console.warn("Access Denied: Super Admin Clearance Missing");
        return <Navigate to="/" replace />;
    }

    if (adminOnly && !isAnyAdmin) {
        console.warn("Access Denied: Admin Clearance Missing");
        return <Navigate to="/" replace />;
    }

    // 4. Authorized
    return children;
};

export default ProtectedRoute;
