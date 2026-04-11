import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/_/backend' : 'http://localhost:5000');

function TeacherLogin({ onLoginSuccess }) {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/teacher/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: formData.identifier,
                    password: formData.password
                })
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message || 'Login failed. Please try again.');
            }

            onLoginSuccess({
                token: payload.token,
                teacher: payload.teacher
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-[440px] mx-auto">
            <section className="w-full px-6 sm:px-8 md:px-12 py-10 md:py-14 glass-card-login flex flex-col gap-6 md:gap-8 rounded-[28px] md:rounded-[32px]">
                <img 
                    src="/logo.png" 
                    alt="Institute Logo" 
                    className="w-[90px] h-[90px] mx-auto block object-contain drop-shadow-[0_4px_12px_rgba(179,134,47,0.15)]" 
                />
                
                <h2 className="text-2xl font-serif font-bold text-center text-brand-navy">
                    Login
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2 text-[0.95rem] font-bold text-brand-blue">
                        <label htmlFor="identifier">Email / Registration No.</label>
                        <input
                            id="identifier"
                            name="identifier"
                            type="text"
                            className="premium-input"
                            placeholder="name@example.com"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="flex flex-col gap-2 text-[0.95rem] font-bold text-brand-blue relative">
                        <label htmlFor="password">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className="premium-input pr-12"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
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
                        <div className="p-[12px_14px] rounded-2xl bg-red-600/10 border border-red-600/16 text-red-600 text-[0.95rem] text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 mt-2">
                        <button 
                            type="submit" 
                            className="premium-button w-full" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Login to Portal'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default TeacherLogin;
