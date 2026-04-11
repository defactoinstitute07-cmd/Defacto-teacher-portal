import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, Loader2, ArrowRight, ArrowLeft, Clock, CheckCircle2, CircleDashed, RotateCcw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/_/backend' : 'http://localhost:5000');

function SubjectManagement({ session }) {
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // UI State
    const [selectedClassLevel, setSelectedClassLevel] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [updatingChapterId, setUpdatingChapterId] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                if (!session?.token) throw new Error('No authentication token found.');

                const response = await fetch(`${API_BASE_URL}/api/teacher/subjects`, {
                    headers: {
                        'Authorization': `Bearer ${session.token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch subjects');
                }

                const fetchedSubjects = data.subjects || [];
                setSubjects(fetchedSubjects);

                if (fetchedSubjects.length > 0) {
                    const levels = [...new Set(fetchedSubjects.map(s => s.classLevel || 'General'))].sort();
                    setSelectedClassLevel(levels[0]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubjects();
    }, [session?.token]);

    const handleUpdateChapterStatus = async (subjectId, chapterId, targetStatus) => {
        try {
            setUpdatingChapterId(chapterId);
            const response = await fetch(`${API_BASE_URL}/api/teacher/subjects/${subjectId}/chapters/${chapterId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`
                },
                body: JSON.stringify({ status: targetStatus })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update chapter status');
            }

            setSubjects(prevSubjects =>
                prevSubjects.map(sub => {
                    if (sub._id === subjectId) {
                        return {
                            ...sub,
                            chapters: sub.chapters.map(chap =>
                                chap._id === chapterId ? { ...chap, status: targetStatus } : chap
                            )
                        };
                    }
                    return sub;
                })
            );

            setSelectedSubject(prev => {
                if (prev && prev._id === subjectId) {
                    return {
                        ...prev,
                        chapters: prev.chapters.map(chap =>
                            chap._id === chapterId ? { ...chap, status: targetStatus } : chap
                        )
                    };
                }
                return prev;
            });

        } catch (err) {
            console.error(err);
            alert(`Unable to advance chapter: ${err.message}`);
        } finally {
            setUpdatingChapterId(null);
        }
    };

    const groupedSubjects = subjects.reduce((acc, subject) => {
        const level = subject.classLevel || 'General';
        if (!acc[level]) {
            acc[level] = [];
        }
        acc[level].push(subject);
        return acc;
    }, {});

    const sortedClassLevels = Object.keys(groupedSubjects).sort();

    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed': return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10 border-green-500/20' };
            case 'ongoing': return { icon: Loader2, color: 'text-brand-gold', bg: 'bg-brand-gold/10 border-brand-gold/20' };
            case 'upcoming': default: return { icon: CircleDashed, color: 'text-brand-navy/50', bg: 'bg-brand-navy/5 border-brand-navy/10' };
        }
    };

    if (isLoading) {
        return (
            <div className="w-full flex-1 flex flex-col items-center justify-center p-8 min-h-[400px]">
                <Loader2 className="animate-spin text-brand-gold mb-4" size={48} />
                <h2 className="font-serif text-xl text-brand-navy">Loading Module...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="bg-red-500/10 border border-red-500/30 p-6 sm:p-8 rounded-3xl flex flex-col items-center w-full max-w-md text-center animate-in fade-in">
                    <AlertCircle className="text-red-500 mb-4" size={48} />
                    <h2 className="font-serif text-xl text-brand-navy font-bold mb-2">Notice</h2>
                    <p className="text-brand-navy/70 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (subjects.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-12 text-center opacity-60">
                <BookOpen className="text-brand-navy/30 mb-6" size={80} />
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mb-4">No Subjects Assigned</h2>
                <p className="text-brand-navy/70 max-w-md mx-auto text-sm sm:text-base">
                    You currently do not have any active subjects assigned to your profile. Please contact the administrator.
                </p>
            </div>
        );
    }

    // TIER 3: Detailed Chapter View
    if (selectedSubject) {
        const chapters = selectedSubject.chapters || [];

        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-10 flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500 ease-out">

                {/* Back Button & Header */}
                <div className="w-full border-b border-brand-navy/10 pb-6 sm:pb-8 flex flex-col gap-6">
                    <button
                        onClick={() => setSelectedSubject(null)}
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-navy/60 hover:text-brand-navy hover:-translate-x-1 transition-all w-fit group"
                    >
                        <div className="p-1.5 rounded-full bg-brand-navy/5 group-hover:bg-brand-navy group-hover:text-white transition-colors">
                            <ArrowLeft size={14} />
                        </div>
                        Back to Subjects
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-brand-gold/10 text-[10px] sm:text-xs uppercase tracking-[0.15em] text-brand-gold font-black inline-block">
                                {selectedSubject.classLevel || 'General'}
                            </span>
                            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-brand-navy tracking-tight leading-tight">
                                {selectedSubject.name}
                            </h1>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 bg-brand-navy/[0.03] p-3 sm:p-4 rounded-2xl border border-brand-navy/5 min-w-[140px]">
                            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-brand-navy/40">Subject Code</span>
                            <span className="text-lg sm:text-xl font-mono font-bold tracking-tighter text-brand-navy">
                                {selectedSubject.code || 'NO-CODE'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Chapter List Section */}
                <div className="w-full flex flex-col gap-4 sm:gap-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg sm:text-xl font-serif text-brand-navy font-bold flex items-center gap-3">
                            Assigned Chapters
                            <span className="px-2 py-0.5 rounded-full bg-brand-navy/5 text-[10px] sm:text-xs font-black text-brand-navy/40 border border-brand-navy/5">
                                {chapters.length}
                            </span>
                        </h2>
                    </div>

                    {chapters.length === 0 ? (
                        <div className="w-full py-16 sm:py-20 rounded-3xl bg-brand-cream/30 border-2 border-dashed border-brand-navy/10 text-center flex flex-col items-center justify-center text-brand-navy/40 px-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                <BookOpen size={28} className="text-brand-navy/20" />
                            </div>
                            <p className="font-bold text-base sm:text-lg text-brand-navy/60">No chapters mapped</p>
                            <p className="text-xs sm:text-sm max-w-[250px] mt-1">Curriculum details for this subject will appear here.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {chapters.map((chapter, index) => {
                                const statusConfig = getStatusConfig(chapter.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div
                                        key={chapter._id || index}
                                        className={`group w-full p-4 sm:p-6 rounded-2xl sm:rounded-[24px] bg-white border transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-5
                                        ${chapter.status === 'ongoing'
                                                ? 'border-brand-gold shadow-[0_8px_30px_rgba(179,134,47,0.08)] ring-1 ring-brand-gold/10 lg:scale-[1.01]'
                                                : 'border-brand-navy/5 shadow-sm hover:shadow-md'}`}
                                    >
                                        <div className="flex items-start sm:items-center gap-3 sm:gap-5">
                                            {/* Numbering Logic */}
                                            <div className="relative shrink-0 mt-1 sm:mt-0">
                                                {chapter.status === 'ongoing' && (
                                                    <span className="absolute inset-0 rounded-full bg-brand-gold/30 animate-ping"></span>
                                                )}
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-base transition-transform lg:group-hover:scale-105 relative z-10 
                                                ${chapter.status === 'ongoing' ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/20' : 'bg-brand-navy/5 text-brand-navy/30'}`}>
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 sm:gap-1.5 min-w-0">
                                                <h3 className="font-bold text-brand-navy text-base sm:text-lg lg:text-xl leading-tight lg:group-hover:text-brand-gold transition-colors break-words">
                                                    {chapter.name}
                                                </h3>
                                                <div className="flex items-center gap-4 text-[10px] sm:text-xs font-black uppercase tracking-wider text-brand-navy/40 mt-1 sm:mt-0">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={12} className="text-brand-gold" />
                                                        {chapter.durationDays} Days Allocated
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status & Actions */}
                                        <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-4 border-t border-brand-navy/5 lg:border-t-0 pt-3 sm:pt-4 lg:pt-0 mt-2 sm:mt-0">
                                            <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border text-[10px] sm:text-xs font-black uppercase tracking-tighter flex items-center gap-1.5 sm:gap-2 transition-all duration-500 shrink-0
                                                ${chapter.status === 'ongoing'
                                                    ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20 ring-1 ring-brand-gold/20 shadow-[0_0_15px_rgba(179,134,47,0.1)]'
                                                    : statusConfig.bg + ' ' + statusConfig.color + ' border-transparent'}`}>

                                                {chapter.status === 'ongoing' ? (
                                                    <>
                                                        <div className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-brand-gold"></span>
                                                        </div>
                                                        In Progress
                                                    </>
                                                ) : (
                                                    <>
                                                        <StatusIcon size={12} className="sm:w-[14px] sm:h-[14px]" />
                                                        {chapter.status}
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {chapter.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleUpdateChapterStatus(selectedSubject._id, chapter._id, chapter.status === 'upcoming' ? 'ongoing' : 'completed')}
                                                        disabled={updatingChapterId === chapter._id}
                                                        className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm active:scale-95 whitespace-nowrap
                                                        ${chapter.status === 'upcoming'
                                                                ? 'bg-brand-navy text-white hover:bg-brand-navy/90'
                                                                : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'}`}
                                                    >
                                                        {updatingChapterId === chapter._id ? <Loader2 size={12} className="animate-spin sm:w-[14px] sm:h-[14px]" /> :
                                                            chapter.status === 'upcoming' ? 'Start' : 'Complete'}
                                                    </button>
                                                )}

                                                {chapter.status !== 'upcoming' && (
                                                    <button
                                                        onClick={() => handleUpdateChapterStatus(selectedSubject._id, chapter._id, 'upcoming')}
                                                        disabled={updatingChapterId === chapter._id}
                                                        className="p-2 sm:p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 shrink-0"
                                                        title="Reset Progress"
                                                    >
                                                        <RotateCcw size={14} className="sm:w-4 sm:h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // TIER 1 & 2: Class Selection & Subject Grid
    const activeSubjects = groupedSubjects[selectedClassLevel] || [];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-10 flex flex-col gap-6 sm:gap-8 animate-in fade-in fill-mode-both">

            {/* Header Section */}
            <div className="w-full space-y-2">
                <h1 className="font-serif text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl md:text-5xl">
                    Select a <span className="text-brand-gold">Subject</span>
                </h1>
                <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-brand-navy/70 font-medium mt-2">
                    Filter by class level below to view all mapped academic courses and their respective chapters.
                </p>
            </div>

            {/* Filter Chips - Wrap Fixed for Mobile */}
            <div className="w-full relative pt-1 pb-4">
                <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3">
                    {sortedClassLevels.map((level) => (
                        <button
                            key={level}
                            onClick={() => setSelectedClassLevel(level)}
                            className={`rounded-full px-5 py-2 text-xs font-bold transition-all duration-300 border-2 active:scale-95 sm:text-sm sm:px-6 sm:py-2.5 ${selectedClassLevel === level
                                    ? 'bg-brand-navy text-white border-brand-navy shadow-lg shadow-brand-navy/20 scale-[1.02]'
                                    : 'bg-white text-brand-navy/60 border-brand-navy/5 hover:border-brand-navy/20 hover:text-brand-navy'
                                }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            {/* Subject Grid - Responsive Columns */}
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 md:gap-6">
                {activeSubjects.map(subject => (
                    <article
                        key={subject._id}
                        onClick={() => setSelectedSubject(subject)}
                        className="group relative flex flex-col gap-4 sm:gap-5 overflow-hidden rounded-3xl sm:rounded-[28px] border border-brand-navy/5 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(179,134,47,0.1)] cursor-pointer sm:p-6"
                    >
                        {/* Decorative Background Accent */}
                        <div className="absolute right-0 top-0 -z-10 h-20 w-20 sm:h-24 sm:w-24 rounded-bl-full bg-brand-gold/5 transition-transform duration-700 lg:group-hover:scale-[2]"></div>

                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="flex flex-col gap-1.5 min-w-0">
                                {/* Stylized Subject Code */}
                                <span className="w-fit px-2 py-0.5 rounded bg-brand-navy/[0.03] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-brand-navy/40 border border-brand-navy/5">
                                    {subject.code || 'NC-00'}
                                </span>

                                <h3 className="line-clamp-2 font-serif text-lg sm:text-xl font-bold leading-tight text-brand-navy transition-colors duration-300 lg:group-hover:text-brand-gold mt-1 sm:mt-0">
                                    {subject.name}
                                </h3>
                            </div>

                            {/* Minimalist Status Badge */}
                            <div
                                className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-tighter ${subject.isActive
                                    ? 'border-green-500/10 bg-green-500/5 text-green-600'
                                    : 'border-red-500/10 bg-red-500/5 text-red-600'
                                    }`}
                            >
                                {subject.isActive ? '● Active' : '○ Archived'}
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="mt-auto flex items-center justify-between border-t border-brand-navy/5 pt-4 sm:pt-5">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-navy/30">Chapters</span>
                                <strong className="text-lg sm:text-xl font-bold text-brand-navy leading-none">
                                    {subject.chapters?.length || subject.totalChapters || 0}
                                </strong>
                            </div>

                            {/* Arrow Icon with Ring Effect */}
                            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-brand-navy/[0.03] text-brand-navy transition-all duration-300 lg:group-hover:bg-brand-gold lg:group-hover:text-white lg:group-hover:rotate-[-45deg] shadow-inner">
                                <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

export default SubjectManagement;