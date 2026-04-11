import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

function Settings({ session }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        try {
            setLoading(true);
            const token = session.token;
            const baseUrl = import.meta.env.VITE_API_URL || 
                (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/_/backend' : 'http://localhost:5000');
            
            const response = await fetch(`${baseUrl}/api/teacher/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update password');
            }

            setSuccess(data.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-brand-gold/15 rounded-2xl">
                        <ShieldCheck className="text-brand-gold" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">Security Settings</h1>
                        <p className="text-brand-navy/60 text-sm">Manage your account security and authentication preferences.</p>
                    </div>
                </div>
            </header>

            {/* Password Change Card */}
            <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-brand-navy/5 relative overflow-hidden">
                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-bl-full -z-0"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <Lock size={18} className="text-brand-gold" />
                        <h2 className="text-lg font-bold text-brand-navy">Change Password</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                        {/* Current Password */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-brand-navy/60 uppercase tracking-wider ml-1">
                                Current Password
                            </label>
                            <div className="relative group">
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full bg-brand-cream/20 border border-brand-navy/10 rounded-2xl px-5 py-3.5 text-brand-navy outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-navy/30 hover:text-brand-navy transition-colors"
                                >
                                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="py-2">
                            <div className="h-px bg-brand-navy/5 w-full"></div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-brand-navy/60 uppercase tracking-wider ml-1">
                                New Password
                            </label>
                            <div className="relative group">
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full bg-brand-cream/20 border border-brand-navy/10 rounded-2xl px-5 py-3.5 text-brand-navy outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all font-medium"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-navy/30 hover:text-brand-navy transition-colors"
                                >
                                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-brand-navy/60 uppercase tracking-wider ml-1">
                                Confirm New Password
                            </label>
                            <div className="relative group">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-brand-cream/20 border border-brand-navy/10 rounded-2xl px-5 py-3.5 text-brand-navy outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all font-medium"
                                    placeholder="Re-type new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-navy/30 hover:text-brand-navy transition-colors"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Feedback Messages */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm animate-in fade-in zoom-in-95">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-sm animate-in fade-in zoom-in-95">
                                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                                <p className="font-medium">{success}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-navy text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-navy/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-brand-navy/10 mt-4 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                                    Update Password
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-8 p-4 bg-brand-gold/5 rounded-2xl border border-brand-gold/10">
                <p className="text-[11px] text-brand-navy/50 leading-relaxed">
                    <strong className="text-brand-gold uppercase tracking-wider mr-1">Security Tip:</strong> 
                    Use a strong password with at least 8 characters, including numbers and special symbols. Never share your credentials with anyone.
                </p>
            </div>
        </div>
    );
}

export default Settings;
