import React, { useEffect, useState, useMemo } from 'react';
import { Menu, Cake, Sparkles } from 'lucide-react';
import TeacherLogin from './components/TeacherLogin';
import ProfileUpload from './components/ProfileUpload';
import PasswordSetup from './components/PasswordSetup';
import Sidebar from './components/Sidebar';
import SubjectManagement from './components/SubjectManagement';
import AttendanceManagement from './components/AttendanceManagement';
import ExamManagement from './components/ExamManagement';
import Settings from './components/Settings';

const STORAGE_KEY = 'teacherPortalSession';
const ONBOARDING_KEY = 'teacherPortalOnboarding';

function readStoredSession() {
    try {
        const storedValue = sessionStorage.getItem(STORAGE_KEY);
        return storedValue ? JSON.parse(storedValue) : null;
    } catch (error) {
        console.error('Unable to read the saved teacher session:', error);
        return null;
    }
}

function readStoredOnboarding() {
    return sessionStorage.getItem(ONBOARDING_KEY) || 'done';
}

function App() {
    const [session, setSession] = useState(() => readStoredSession());
    const [onboarding, setOnboarding] = useState(() => readStoredOnboarding());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Initialize active tab from URL hash (default to dashboard)
    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return ['subject', 'attendance', 'exams', 'settings'].includes(hash) ? hash : 'dashboard';
    });

    // Birthday Detection Logic
    const isBirthday = useMemo(() => {
        if (!session?.teacher?.dob) return false;
        const dob = new Date(session.teacher.dob);
        const today = new Date();
        return dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
    }, [session?.teacher?.dob]);

    // Listen for external hash changes (e.g., browser back button)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (['subject', 'attendance', 'exams', 'settings', 'dashboard'].includes(hash)) {
                setActiveTab(hash);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Push state changes to the URL bar so refresh persists it
    useEffect(() => {
        if (window.location.hash.replace('#', '') !== activeTab) {
            window.history.pushState(null, null, `#${activeTab}`);
        }
    }, [activeTab]);

    useEffect(() => {
        if (session) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
            sessionStorage.setItem(ONBOARDING_KEY, onboarding);
            return;
        }
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(ONBOARDING_KEY);
        setOnboarding('done');
    }, [session, onboarding]);

    const handleLoginSuccess = (data) => {
        setSession(data);
        if (!data.teacher.profileImage) {
            setOnboarding('profile');
        } else {
            setOnboarding('done');
        }
    };

    const handleProfileUploadSuccess = (newImageUrl) => {
        setSession(prev => ({
            ...prev,
            teacher: {
                ...prev.teacher,
                profileImage: newImageUrl
            }
        }));
        setOnboarding('password');
    };

    const handleSkipProfileSetup = () => {
        setOnboarding('password');
    };

    const handlePasswordSetupDone = () => {
        setOnboarding('done');
    };

    const handleLogout = () => {
        setSession(null);
        setOnboarding('done');
    };

    if (!session) {
        return <TeacherLogin onLoginSuccess={handleLoginSuccess} />
    }

    if (session?.teacher) {
        if (onboarding === 'profile') {
            return (
                <main className="min-h-screen p-8 flex items-center justify-center">
                    <ProfileUpload
                        teacherId={session.teacher.id}
                        onUploadSuccess={handleProfileUploadSuccess}
                        onSkip={handleSkipProfileSetup}
                    />
                </main>
            );
        }

        if (onboarding === 'password') {
            return (
                <main className="min-h-screen p-8 flex items-center justify-center">
                    <PasswordSetup
                        email={session.teacher.email}
                        regNo={session.teacher.regNo}
                        onSetupSuccess={handlePasswordSetupDone}
                    />
                </main>
            );
        }

        return (
            <div className="min-h-screen flex bg-[#f5efe3] md:bg-transparent">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLogout={handleLogout}
                    teacher={session.teacher}
                />

                <main className="flex-1 lg:ml-[280px] min-h-screen flex flex-col transition-all duration-300">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between p-4 
bg-gradient-to-r from-black via-gray-900 to-black 
backdrop-blur-md border-b border-white/10 
sticky top-0 z-30 shadow-lg">

                        <div className="flex items-center gap-3">
                            <img
                                src="https://www.defactoinstitute.in/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdmswb6fya%2Fimage%2Fupload%2Fv1775635083%2Ferp_uploads%2Ffwp2aeerokjfljm2aw2a.png&w=256&q=75"
                                alt="Defacto Logo"
                                className="h-10 object-contain brightness-110 contrast-110"
                            />
                        </div>

                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 bg-white/10 hover:bg-white/20 
        text-white rounded-xl transition-all duration-300 backdrop-blur-sm"
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-1 md:p-8 flex flex-col items-center justify-start overflow-y-auto bg-[#FBFBFA]">
                        {activeTab === 'dashboard' && (
                            <section className={`w-full max-w-[1100px] rounded-[32px] overflow-hidden bg-white border shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-6 sm:p-10 md:p-14 mt-4 md:mt-0 relative transition-all duration-700 ${isBirthday ? 'border-brand-gold/30 bg-gradient-to-br from-white to-brand-gold/5' : 'border-brand-navy/5'}`}>

                                {isBirthday && (
                                    <>
                                        {/* Floating Balloons Animation Container */}
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                                            {[...Array(6)].map((_, i) => (
                                                <div 
                                                    key={i}
                                                    className="absolute bottom-[-100px] animate-float-balloon opacity-20"
                                                    style={{
                                                        left: `${15 + i * 15}%`,
                                                        animationDelay: `${i * 1.5}s`,
                                                        animationDuration: `${10 + i * 2}s`
                                                    }}
                                                >
                                                    <div className={`w-12 h-16 rounded-full ${i % 2 === 0 ? 'bg-brand-gold' : 'bg-brand-navy'} relative`}>
                                                        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0.5 h-10 bg-black/10"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute top-4 right-8 z-20 animate-bounce">
                                            <div className="bg-brand-gold text-brand-navy px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg scale-110">
                                                <Cake size={14} /> IT'S YOUR DAY!
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Background Decorative Element */}
                                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 ${isBirthday ? 'bg-brand-gold/20' : 'bg-brand-gold/5'}`}></div>

                                <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 w-full md:w-auto">

                                        {/* Profile Image with Ring Effect */}
                                        <div className="relative shrink-0 group">
                                            <div className="absolute inset-0 bg-brand-gold/20 rounded-full blur-md group-hover:blur-xl transition-all duration-500 opacity-50"></div>
                                            {session.teacher.profileImage ? (
                                                <img
                                                    src={session.teacher.profileImage}
                                                    alt="Profile"
                                                    className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-xl relative z-10"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-brand-cream border-4 border-white shadow-xl flex items-center justify-center text-brand-navy/30 text-xs font-bold relative z-10">
                                                    NO IMAGE
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-2 sm:mt-0 flex-1">
                                            <span className="inline-block px-3 py-1 rounded-full bg-brand-navy/5 text-[0.65rem] md:text-[0.7rem] font-black uppercase tracking-[0.2em] text-brand-navy/60 mb-4">
                                                {isBirthday ? 'Anniversary Celebration' : 'Teacher Portal'}
                                            </span>
                                            <h1 className="font-serif text-[clamp(1.75rem,8vw,2.2rem)] sm:text-[2.8rem] md:text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.1] text-brand-navy font-bold mb-4">
                                                {isBirthday ? (
                                                    <span className="flex flex-col">
                                                        <span className="flex items-center gap-3">Happy Birthday, <Sparkles className="text-brand-gold animate-pulse" /></span>
                                                        <span className="text-brand-gold">{session.teacher.name}! 🎂</span>
                                                    </span>
                                                ) : (
                                                    <>
                                                        Welcome back,<br />
                                                        <span className="text-brand-gold">{session.teacher.name}</span>
                                                    </>
                                                )}
                                            </h1>
                                            <p className="max-w-[32rem] text-sm md:text-base leading-relaxed text-brand-navy/60 font-medium">
                                                {isBirthday 
                                                    ? "Wishing you an incredible day filled with joy and success. Thank you for everything you do for the institute!"
                                                    : "Everything looks great today. You have full access to your teaching modules and subject management."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                                    {/* Role Card */}
                                    <article className="p-5 md:p-6 rounded-[24px] bg-brand-cream/40 border border-brand-navy/5 hover:border-brand-gold/20 transition-all group">
                                        <span className="text-[0.65rem] uppercase tracking-widest text-brand-navy/40 font-bold block mb-2">System Role</span>
                                        <strong className="text-brand-navy text-lg block group-hover:text-brand-gold transition-colors">{session.teacher.systemRole}</strong>
                                    </article>

                                    {/* Status Card - Dynamic Colors */}
                                    <article className="p-5 md:p-6 rounded-[24px] bg-brand-cream/40 border border-brand-navy/5">
                                        <span className="text-[0.65rem] uppercase tracking-widest text-brand-navy/40 font-bold block mb-3">Account Status</span>
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs border ${session.teacher.status === 'active'
                                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${session.teacher.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                            {session.teacher.status}
                                        </div>
                                    </article>

                                    {/* Email Card */}
                                    <article className="p-5 md:p-6 rounded-[24px] bg-brand-cream/40 border border-brand-navy/5 lg:col-span-1">
                                        <span className="text-[0.65rem] uppercase tracking-widest text-brand-navy/40 font-bold block mb-2">Email Address</span>
                                        <strong className="text-brand-navy text-sm md:text-base truncate block" title={session.teacher.email}>
                                            {session.teacher.email || 'Not added yet'}
                                        </strong>
                                    </article>

                                    {/* Registration Card */}
                                    <article className="p-5 md:p-6 rounded-[24px] bg-brand-navy text-white shadow-lg shadow-brand-navy/10">
                                        <span className="text-[0.65rem] uppercase tracking-widest text-white/50 font-bold block mb-2">Registration No.</span>
                                        <strong className="text-lg block tracking-tight font-mono">{session.teacher.regNo || 'PENDING'}</strong>
                                    </article>

                                </div>
                            </section>
                        )}

                        {activeTab === 'subject' && (
                            <div className="w-full max-w-[1100px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <SubjectManagement session={session} />
                            </div>
                        )}

                        {activeTab === 'attendance' && (
                            <div className="w-full max-w-[1100px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <AttendanceManagement session={session} />
                            </div>
                        )}

                        {activeTab === 'exams' && (
                            <div className="w-full max-w-[1100px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <ExamManagement session={session} />
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="w-full max-w-[1100px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Settings session={session} />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-8 flex items-center justify-center">
            <TeacherLogin onLoginSuccess={handleLoginSuccess} />
        </main>
    );
}

export default App;

