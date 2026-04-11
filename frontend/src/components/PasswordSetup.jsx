import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function PasswordSetup({ email, regNo, onSetupSuccess }) {
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/teacher/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    regNo,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update password');
            }

            onSetupSuccess();
        } catch (err) {
            setError(err.message || 'An error occurred during password setup.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-[440px] mx-auto text-center">
            <section className="w-full px-6 sm:px-8 md:px-12 py-10 md:py-14 glass-card flex flex-col gap-6 md:gap-8 rounded-[28px] md:rounded-[32px]">
                <div>
                    <div className="w-16 h-16 rounded-full bg-brand-cream border-4 border-white shadow-md flex items-center justify-center text-brand-gold mx-auto mb-4">
                        <LockKeyhole size={28} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-brand-navy mb-2">Set Your Password</h2>
                    <p className="text-sm text-brand-navy/70">
                        Please establish a secure password for your portal access.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
                    <div className="flex flex-col gap-2 text-[0.95rem] font-bold text-brand-blue relative">
                        <label htmlFor="newPassword">New Password</label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={showPassword ? "text" : "password"}
                                className="premium-input pr-12 w-full"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue/50 hover:text-brand-blue transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 w-full rounded-2xl bg-red-600/10 border border-red-600/16 text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="premium-button w-full mt-2"
                    >
                        {isSubmitting ? 'Updating...' : 'Secure My Account'}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={onSetupSuccess}
                        disabled={isSubmitting}
                        className="text-sm font-semibold text-brand-navy/60 hover:text-brand-navy transition-colors py-2 text-center"
                    >
                        Skip for now
                    </button>
                </form>
            </section>
        </div>
    );
}

export default PasswordSetup;
