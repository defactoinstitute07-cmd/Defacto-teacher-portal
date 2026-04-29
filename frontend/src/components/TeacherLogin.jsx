import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { buildApiUrl } from '../lib/api';

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
            const response = await fetch(buildApiUrl('/api/teacher/login'), {
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
        <div className="flex flex-col items-center justify-center w-full min-h-[80vh] m-auto px-4 py-8 sm:py-32">
            <section className="w-full max-w-[440px] px-6 sm:px-6 py-6 sm:py-6 glass-card-login flex flex-col gap-8 rounded-[32px] bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in-95 duration-500 ease-out relative overflow-hidden">

                {/* Decorative Background Accent */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-navy/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="flex w-full items-center p-4 bg-white">
  {/* Logo Container (Left Side) */}
  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl border border-[#D5A021] bg-[#0A1128]  shadow-xl">
    <img
      src="https://res.cloudinary.com/dsks5swu1/image/upload/v1775565407/erp_uploads/xcoemwx25dr8gcjkm4ha.png"
      alt="Defacto Institute Logo"
      loading="lazy"
      className="h-full w-full rounded-xl object-contain"
    />
  </div>

  {/* Text Container (Right Side) */}
  <div className="flex flex-col ml-4 font-sans text-left">
    <h1 className="m-0 p-0 text-3xl sm:text-4xl font-extrabold text-[#F9BF29] tracking-tight antialiased">
      Defacto
    </h1>
    <p className="m-0 p-0 text-sm sm:text-base font-semibold text-[#0A1128] antialiased">
      Institute <span className="font-light text-[#A0A0A0]">|</span> BHANIYAWALA
    </p>
  </div>
</div>

                    <div className="text-center space-y-1.5">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="text-xs sm:text-sm font-medium text-brand-navy/60">
                            Login to access your teacher dashboard
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6 relative z-10 w-full">
                    {/* Identifier Input */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="identifier" className="text-xs sm:text-[0.85rem] font-bold text-brand-navy/80 uppercase tracking-wider ml-1">
                            Teacher ID
                        </label>
                        <input
                            id="identifier"
                            name="identifier"
                            type="text"
                            className="premium-input w-full px-4 py-3 sm:py-3.5 rounded-xl border border-brand-navy/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all bg-white/70 focus:bg-white text-brand-navy text-sm sm:text-base placeholder:text-brand-navy/30"
                            placeholder="TCH2601"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col gap-2 relative">
                        <label htmlFor="password" className="text-xs sm:text-[0.85rem] font-bold text-brand-navy/80 uppercase tracking-wider ml-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className="premium-input w-full pl-4 pr-12 py-3 sm:py-3.5 rounded-xl border border-brand-navy/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all bg-white/70 focus:bg-white text-brand-navy text-sm sm:text-base placeholder:text-brand-navy/30"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5 rounded-lg transition-all"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-2 p-3 sm:p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs sm:text-sm font-medium animate-in slide-in-from-top-2">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p className="leading-tight">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="premium-button w-full flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-brand-gold text-brand-navy font-bold text-sm sm:text-base rounded-xl hover:bg-[#a67a27] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-gold/20 hover:shadow-xl hover:shadow-brand-gold/30"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                'Login to Portal'
                            )}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default TeacherLogin;
