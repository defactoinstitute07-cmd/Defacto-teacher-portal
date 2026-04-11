import React, { useState, useEffect } from 'react';
import { FileText, Save, Plus, AlertCircle, Search, Beaker, Check, X } from 'lucide-react';

function ExamManagement({ session }) {
    const [subjectsData, setSubjectsData] = useState([]);

    // Cascading Dropdown State
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    // Derived Lists for Dropdowns
    const [availableClasses, setAvailableClasses] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);

    // Exam Management State
    const [exams, setExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const [recentExams, setRecentExams] = useState([]);

    const [showCreateExam, setShowCreateExam] = useState(false);
    const [newExam, setNewExam] = useState({ name: '', chapter: '', date: '', totalMarks: 20, passingMarks: 15 });
    const [creatingExam, setCreatingExam] = useState(false);

    // Results State
    const [selectedExam, setSelectedExam] = useState(null);
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [savingResults, setSavingResults] = useState(false);

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const token = session?.token;

    useEffect(() => {
        fetchInitialData();
    }, [token]);

    const fetchInitialData = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/subjects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch subjects');
            const data = await res.json();
            const subs = data.subjects || [];

            setSubjectsData(subs);

            const classes = [...new Set(subs.map(s => s.classLevel).filter(Boolean))];
            setAvailableClasses(classes);

            const recentRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/exams`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (recentRes.ok) {
                const recentData = await recentRes.json();
                setRecentExams(recentData.exams || []);
            }

        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        setSelectedSubject('');
        setSelectedExam(null);
        setExams([]);

        if (!selectedClass) {
            setAvailableSubjects([]);
            return;
        }

        const subs = subjectsData.filter(sub => sub.classLevel === selectedClass);
        setAvailableSubjects(subs);
    }, [selectedClass, subjectsData]);

    useEffect(() => {
        setSelectedExam(null);
        if (selectedSubject) {
            fetchExams(selectedSubject);
        } else {
            setExams([]);
        }
    }, [selectedSubject]);

    useEffect(() => {
        if (selectedExam) {
            fetchStudents(selectedExam._id);
        } else {
            setStudents([]);
        }
    }, [selectedExam]);

    const fetchExams = async (subjId) => {
        try {
            setLoadingExams(true);
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/exams?subjectId=${subjId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch exams');
            const data = await res.json();
            setExams(data.exams || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingExams(false);
        }
    };

    const fetchStudents = async (examId) => {
        try {
            setLoadingStudents(true);
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/exams/${examId}/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch students for this exam');
            const data = await res.json();

            const mapped = (data.data || []).map(student => ({
                ...student,
                currentMarks: student.result?.marksObtained !== undefined ? student.result.marksObtained : '',
                isPresent: student.result ? student.result.isPresent : true,
                remarks: student.result?.remarks || ''
            }));

            const hasExisting = mapped.some(student => student.result);
            setIsLocked(hasExisting);

            setStudents(mapped);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            setCreatingExam(true);
            setError(null);

            const currentSubject = availableSubjects.find(s => s._id === selectedSubject);
            const defaultBatchId = currentSubject && currentSubject.batchIds && currentSubject.batchIds.length > 0
                ? (currentSubject.batchIds[0]._id || currentSubject.batchIds[0])
                : null;

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/exams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newExam.name,
                    subjectId: selectedSubject,
                    batchId: defaultBatchId,
                    chapter: newExam.chapter,
                    date: newExam.date,
                    totalMarks: Number(newExam.totalMarks),
                    passingMarks: Number(newExam.passingMarks)
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to create exam');
            }

            const data = await res.json();
            setExams([data.exam, ...exams]);
            setRecentExams([data.exam, ...recentExams]);
            setShowCreateExam(false);
            setNewExam({ name: '', chapter: '', date: '', totalMarks: 20, passingMarks: 15 });
            setSuccessMessage('Exam created successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setCreatingExam(false);
        }
    };

    const handleSaveResults = async () => {
        try {
            setLoadingStudents(true);
            setIsLocked(false);
            setError(null);

            const resultsData = students.map(s => ({
                studentId: s._id,
                batchId: s.batchId,
                marksObtained: s.currentMarks === '' || s.currentMarks === null ? 0 : Number(s.currentMarks),
                isPresent: s.isPresent,
                remarks: s.remarks
            }));

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/exams/${selectedExam._id}/results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ resultsData })
            });

            if (!res.ok) throw new Error('Failed to save results');

            setSuccessMessage('Results saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);

            await fetchStudents(selectedExam._id);
        } catch (err) {
            setError(err.message);
        } finally {
            setSavingResults(false);
        }
    };

    const handleStudentDataChange = (studentId, field, value) => {
        setStudents(prev => prev.map(s => {
            if (s._id === studentId) {
                if (field === 'currentMarks' && value !== '') {
                    const num = Number(value);
                    if (num > selectedExam.totalMarks) return s;
                    if (num < 0) return s;
                }
                return { ...s, [field]: value };
            }
            return s;
        }));
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-10">
            {/* Header Area */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-brand-navy flex items-center gap-2">
                        <FileText size={28} className="text-brand-gold" />
                        Exams & Results
                    </h1>
                    <p className="text-brand-navy/60 text-sm mt-1">
                        Select a class, batch, and subject to manage tests and enter marks.
                    </p>
                </div>
            </header>

            {/* Notifications */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-in fade-in">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-in fade-in">
                    <Check size={18} />
                    {successMessage}
                </div>
            )}

            {/* Selection Filters */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-brand-navy/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-brand-navy/60 uppercase tracking-wider mb-2">1. Class Level</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full bg-brand-cream/30 border border-brand-navy/10 rounded-xl px-4 py-3 text-brand-navy font-medium outline-none focus:border-brand-gold transition-colors cursor-pointer appearance-none"
                        >
                            <option value="">Select Class</option>
                            {availableClasses.map(lvl => (
                                <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-brand-navy/60 uppercase tracking-wider mb-2">2. Subject</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={!selectedClass}
                            className="w-full bg-brand-cream/30 border border-brand-navy/10 rounded-xl px-4 py-3 text-brand-navy font-medium outline-none focus:border-brand-gold disabled:opacity-50 transition-colors cursor-pointer appearance-none"
                        >
                            <option value="">Select Subject</option>
                            {availableSubjects.map(sub => (
                                <option key={sub._id} value={sub._id}>{sub.name} {sub.code ? `(${sub.code})` : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Global Recent Exam History (when no subject is selected) */}
            {!selectedSubject && recentExams.length > 0 && !selectedExam && (
                <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-brand-navy/5 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-lg font-bold font-serif text-brand-navy flex items-center gap-2 mb-6">
                        <FileText size={20} className="text-brand-gold" />
                        Recent Test History
                    </h2>

                    {/* MOBILE VIEW: Recent Tests Card Grid (Visible < 1024px) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                        {recentExams.map(exam => (
                            <div key={exam._id} className="bg-white border border-brand-navy/10 p-4 rounded-2xl flex flex-col gap-3 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-brand-navy text-sm">{exam.name}</h3>
                                    <div className="flex flex-col gap-1 items-end">
                                        <span className="bg-brand-cream/50 text-brand-navy/70 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap">
                                            {exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'}
                                        </span>
                                        {exam.isGraded && (
                                            <span className="bg-green-500/10 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-green-500/20 uppercase tracking-tighter">
                                                Marks Uploaded
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-brand-navy/80 flex flex-col gap-1">
                                    <span className="font-medium">Subject: <span className="opacity-80">{exam.subject} ({exam.classLevel})</span></span>
                                    <span className="font-medium">Chapter: <span className="opacity-80">{exam.chapter}</span></span>
                                </div>
                                <div className="mt-2 pt-3 border-t border-brand-navy/5 flex justify-between items-center text-xs">
                                    <span className="text-brand-navy/60 font-medium">Marks (Pass/Total)</span>
                                    <span className="font-bold text-brand-navy bg-brand-gold/10 px-2 py-1 rounded-md">{exam.passingMarks} / {exam.totalMarks}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DESKTOP VIEW: Recent Tests Table (Visible >= 1024px) */}
                    <div className="hidden lg:block overflow-x-auto rounded-xl border border-brand-navy/5">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-brand-cream/40 text-brand-navy/60 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold border-b border-brand-navy/5">Test Name</th>
                                    <th className="p-4 font-bold border-b border-brand-navy/5">Subject & Class</th>
                                    <th className="p-4 font-bold border-b border-brand-navy/5">Chapter</th>
                                    <th className="p-4 font-bold border-b border-brand-navy/5">Date</th>
                                    <th className="p-4 font-bold border-b border-brand-navy/5">Status</th>
                                    <th className="p-4 font-bold border-b border-brand-navy/5">Marks (Pass/Total)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-navy/5">
                                {recentExams.map(exam => (
                                    <tr key={exam._id} className="hover:bg-brand-cream/20 transition-colors">
                                        <td className="p-4 font-bold text-brand-navy text-sm">{exam.name}</td>
                                        <td className="p-4 text-brand-navy/80 text-sm">{exam.subject} <span className="text-xs text-brand-navy/50 opacity-70 ml-1">({exam.classLevel})</span></td>
                                        <td className="p-4 text-brand-navy/80 text-sm">{exam.chapter}</td>
                                        <td className="p-4 text-brand-navy/80 text-sm">{exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'}</td>
                                        <td className="p-4">
                                            {exam.isGraded ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold border border-green-500/20 uppercase tracking-wider">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    Marks Uploaded
                                                </span>
                                            ) : (
                                                <span className="text-brand-navy/30 text-[10px] font-bold uppercase tracking-wider">Pending</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-brand-navy/80 text-sm font-medium">
                                            <span className="bg-brand-cream/50 px-2 py-1 rounded-md">{exam.passingMarks} / {exam.totalMarks}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Exam Management Section (Only visible if Subject is selected and no exam is selected for marking) */}
            {selectedSubject && !selectedExam && (
                <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-brand-navy/5 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-lg font-bold font-serif text-brand-navy flex items-center gap-2">
                            <Beaker size={20} className="text-brand-gold" />
                            Tests for Subject
                        </h2>
                        <button
                            onClick={() => setShowCreateExam(!showCreateExam)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-navy text-white text-sm font-bold rounded-xl hover:bg-brand-navy/90 active:scale-95 transition-all"
                        >
                            {showCreateExam ? <X size={16} /> : <Plus size={16} />}
                            {showCreateExam ? 'Cancel' : 'Create New Test'}
                        </button>
                    </div>

                    {showCreateExam && (
                        <form onSubmit={handleCreateExam} className="bg-brand-cream/30 p-4 sm:p-5 rounded-2xl border border-brand-navy/10 mb-6 flex flex-col gap-4">
                            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-brand-navy/60 uppercase tracking-wider mb-2">Test Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newExam.name}
                                        onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                                        placeholder="e.g. Midterm Physics"
                                        className="w-full bg-white border border-brand-navy/10 rounded-xl px-4 py-2.5 text-brand-navy text-sm outline-none focus:border-brand-gold transition-colors"
                                    />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-brand-navy/60 uppercase tracking-wider mb-2">Chapter / Topic</label>
                                    <input
                                        type="text"
                                        required
                                        value={newExam.chapter}
                                        onChange={(e) => setNewExam({ ...newExam, chapter: e.target.value })}
                                        placeholder="e.g. Thermodynamics"
                                        className="w-full bg-white border border-brand-navy/10 rounded-xl px-4 py-2.5 text-brand-navy text-sm outline-none focus:border-brand-gold transition-colors"
                                    />
                                </div>
                                <div className="w-full lg:w-48">
                                    <label className="block text-xs font-bold text-brand-navy/60 uppercase tracking-wider mb-2">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newExam.date}
                                        onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                                        className="w-full bg-white border border-brand-navy/10 rounded-xl px-4 py-2.5 text-brand-navy text-sm outline-none focus:border-brand-gold transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                <div className="w-full sm:w-1/3 lg:w-32">
                                    <label className="block text-xs font-bold text-brand-navy/60 uppercase tracking-wider mb-2">Total Marks</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newExam.totalMarks}
                                        onChange={(e) => setNewExam({ ...newExam, totalMarks: e.target.value })}
                                        className="w-full bg-white border border-brand-navy/10 rounded-xl px-4 py-2.5 text-brand-navy text-sm outline-none focus:border-brand-gold transition-colors"
                                    />
                                </div>
                                <div className="w-full sm:w-1/3 lg:w-32">
                                    <label className="block text-xs font-bold text-brand-navy/60 uppercase tracking-wider mb-2">Passing Marks</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={newExam.passingMarks}
                                        onChange={(e) => setNewExam({ ...newExam, passingMarks: e.target.value })}
                                        className="w-full bg-white border border-brand-navy/10 rounded-xl px-4 py-2.5 text-brand-navy text-sm outline-none focus:border-brand-gold transition-colors"
                                    />
                                </div>
                                <div className="w-full sm:w-1/3 lg:w-auto mt-2 sm:mt-0 lg:ml-auto">
                                    <button
                                        type="submit"
                                        disabled={creatingExam}
                                        className="w-full px-8 py-2.5 bg-brand-gold text-brand-navy font-bold rounded-xl hover:bg-[#a67a27] active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {creatingExam ? 'Saving...' : 'Save Test'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {loadingExams ? (
                        <div className="flex justify-center p-12">
                            <div className="w-10 h-10 border-4 border-brand-cream border-t-brand-gold rounded-full animate-spin"></div>
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="text-center p-12 border-2 border-dashed border-brand-navy/10 rounded-2xl bg-brand-cream/10">
                            <Beaker size={32} className="mx-auto text-brand-navy/20 mb-3" />
                            <p className="text-brand-navy/60 font-medium">No tests created yet for this subject.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {exams.map(exam => (
                                <div key={exam._id}
                                    className="p-5 border border-brand-navy/10 rounded-2xl hover:border-brand-gold/50 hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col h-full"
                                    onClick={() => setSelectedExam(exam)}
                                >
                                    <h3 className="font-bold text-brand-navy text-lg mb-1 group-hover:text-brand-gold transition-colors line-clamp-1">{exam.name}</h3>
                                    <p className="text-xs text-brand-navy/60 mb-4 font-medium line-clamp-1">Ch: {exam.chapter}</p>

                                    <div className="mt-auto flex justify-between items-center text-xs text-brand-navy/60 mb-4">
                                        <span className="bg-brand-cream/50 px-2.5 py-1.5 rounded-lg font-medium">{new Date(exam.date).toLocaleDateString()}</span>
                                        <span className="font-bold text-brand-navy/80 bg-brand-navy/5 px-2.5 py-1.5 rounded-lg">Max: {exam.totalMarks}</span>
                                    </div>

                                    <button className="w-full py-2.5 border border-brand-navy/10 rounded-xl text-sm font-bold text-brand-navy group-hover:bg-brand-gold group-hover:border-brand-gold group-hover:shadow-sm transition-all">
                                        Enter Marks &rarr;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Grading View */}
            {selectedExam && (
                <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-brand-navy/5 flex flex-col min-h-[400px] w-full animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-6 border-b border-brand-navy/5">
                        <div className="w-full lg:w-auto">
                            <button
                                onClick={() => setSelectedExam(null)}
                                className="text-xs font-bold text-brand-navy/50 hover:text-brand-navy mb-3 flex items-center gap-1 transition-colors"
                            >
                                &larr; Back to Tests
                            </button>
                            <h2 className="text-xl sm:text-2xl font-bold font-serif text-brand-navy break-words">{selectedExam.name}</h2>
                            <p className="text-brand-navy/60 text-sm mt-1 flex flex-wrap gap-2 items-center">
                                <span className="bg-brand-cream/50 px-2 py-0.5 rounded-md text-xs font-medium">{new Date(selectedExam.date).toLocaleDateString()}</span>
                                <span className="text-brand-navy/30">•</span>
                                <span>Max Marks: <strong className="text-brand-navy bg-brand-gold/10 px-2 py-0.5 rounded-md">{selectedExam.totalMarks}</strong></span>
                            </p>
                        </div>
                    </div>

                    {loadingStudents ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
                            <div className="w-10 h-10 border-4 border-brand-cream border-t-brand-gold rounded-full animate-spin"></div>
                            <p className="text-brand-navy/50 text-sm font-medium animate-pulse">Loading students...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-brand-navy/10 rounded-2xl my-auto">
                            <p className="text-brand-navy/60 text-sm font-medium">There are no continuous enrollments mapping to this subject.</p>
                        </div>
                    ) : (
                        <>
                            {/* MOBILE VIEW: Grading Card Grid (Visible < 1024px) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                                {students.map(student => (
                                    <div key={student._id} className={`bg-white border border-brand-navy/10 rounded-2xl p-4 flex flex-col gap-4 shadow-sm transition-all ${!student.isPresent ? 'bg-red-500/5 opacity-80' : ''}`}>
                                        {/* Profile Info */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {student.profileImage ? (
                                                    <img src={student.profileImage} alt={student.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-brand-navy/5" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-navy/40 font-bold text-sm shrink-0 border border-brand-navy/5">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-brand-navy text-sm truncate">{student.name}</span>
                                                    <div className="text-[11px] text-brand-navy/50 flex items-center gap-1.5 truncate mt-0.5">
                                                        <span className="font-medium text-brand-navy/70">{student.rollNo || 'N/A'}</span>
                                                        <span className="w-1 h-1 rounded-full bg-brand-navy/20"></span>
                                                        <span className="truncate">{student.batchId?.name || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Toggle */}
                                            <button
                                                disabled={isLocked}
                                                onClick={() => {
                                                    const newPres = !student.isPresent;
                                                    handleStudentDataChange(student._id, 'isPresent', newPres);
                                                    if (!newPres) handleStudentDataChange(student._id, 'currentMarks', '');
                                                }}
                                                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all shrink-0 ${student.isPresent
                                                    ? 'bg-green-500/10 border-green-500/20 text-green-600'
                                                    : 'bg-red-500/10 border-red-500/20 text-red-600 shadow-sm'
                                                    } ${isLocked ? 'opacity-60 cursor-not-allowed grayscale-[30%]' : ''}`}
                                            >
                                                {student.isPresent ? 'PRESENT' : 'ABSENT'}
                                            </button>
                                        </div>

                                        {/* Inputs Grid */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-1 flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-brand-navy/50 uppercase">Marks (/{selectedExam.totalMarks})</label>
                                                <input
                                                    type="number"
                                                    disabled={!student.isPresent || isLocked}
                                                    value={student.currentMarks}
                                                    onChange={(e) => handleStudentDataChange(student._id, 'currentMarks', e.target.value)}
                                                    placeholder="-"
                                                    className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold text-center outline-none transition-all ${!student.isPresent || isLocked
                                                        ? 'bg-brand-navy/5 border-transparent text-brand-navy/40 cursor-not-allowed'
                                                        : 'bg-white border-brand-navy/20 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 text-brand-navy shadow-sm'
                                                        }`}
                                                />
                                            </div>
                                            <div className="col-span-2 flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-brand-navy/50 uppercase">Remarks</label>
                                                <input
                                                    type="text"
                                                    value={student.remarks}
                                                    disabled={!student.isPresent || isLocked}
                                                    onChange={(e) => handleStudentDataChange(student._id, 'remarks', e.target.value)}
                                                    placeholder={isLocked ? "" : "Add a note..."}
                                                    className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${!student.isPresent || isLocked
                                                        ? 'bg-brand-navy/5 border-transparent text-brand-navy/40 cursor-not-allowed'
                                                        : 'bg-brand-cream/30 border-brand-navy/10 focus:border-brand-gold focus:bg-white text-brand-navy'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* DESKTOP VIEW: Grading Table (Visible >= 1024px) */}
                            <div className="hidden lg:block flex-1 overflow-x-auto rounded-xl border border-brand-navy/5 pb-2">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="bg-brand-cream/40 text-brand-navy/60 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-bold border-b border-brand-navy/5 w-1/3">Student</th>
                                            <th className="p-4 font-bold border-b border-brand-navy/5 text-center w-28">Status</th>
                                            <th className="p-4 font-bold border-b border-brand-navy/5 w-32 text-center">Marks (/{selectedExam.totalMarks})</th>
                                            <th className="p-4 font-bold border-b border-brand-navy/5 w-1/3">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-navy/5">
                                        {students.map(student => (
                                            <tr key={student._id} className={`hover:bg-brand-cream/20 transition-colors group ${!student.isPresent ? 'bg-red-500/5' : ''}`}>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {student.profileImage ? (
                                                            <img src={student.profileImage} alt={student.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-navy/40 font-bold text-xs shrink-0 group-hover:bg-brand-cream transition-colors">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className={`font-bold text-sm ${!student.isPresent ? 'text-brand-navy/60' : 'text-brand-navy'}`}>{student.name}</span>
                                                            <span className="text-[10px] text-brand-navy/50 flex gap-2 items-center font-medium mt-0.5">
                                                                <span>{student.rollNo || 'N/A'}</span>
                                                                <span className="opacity-50">•</span>
                                                                <span>{student.batchId?.name || 'N/A'}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center align-middle">
                                                    <button
                                                        disabled={isLocked}
                                                        onClick={() => {
                                                            const newPres = !student.isPresent;
                                                            handleStudentDataChange(student._id, 'isPresent', newPres);
                                                            if (!newPres) handleStudentDataChange(student._id, 'currentMarks', '');
                                                        }}
                                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${student.isPresent
                                                            ? 'bg-green-500/10 border-green-500/20 text-green-600 hover:bg-green-500/20'
                                                            : 'bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500/20 shadow-sm'
                                                            } ${isLocked ? 'opacity-60 cursor-not-allowed grayscale-[30%]' : ''}`}
                                                    >
                                                        {student.isPresent ? 'PRESENT' : 'ABSENT'}
                                                    </button>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <input
                                                        type="number"
                                                        disabled={!student.isPresent || isLocked}
                                                        value={student.currentMarks}
                                                        onChange={(e) => handleStudentDataChange(student._id, 'currentMarks', e.target.value)}
                                                        placeholder="-"
                                                        className={`w-full mx-auto block max-w-[100px] border rounded-xl px-3 py-2 text-sm text-center outline-none transition-all
                                                            ${!student.isPresent || isLocked
                                                                ? 'bg-transparent border-transparent text-brand-navy/30 cursor-not-allowed placeholder-brand-navy/20'
                                                                : 'bg-white border-brand-navy/20 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 text-brand-navy font-bold shadow-sm'
                                                            }
                                                        `}
                                                    />
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <input
                                                        type="text"
                                                        value={student.remarks}
                                                        disabled={!student.isPresent || isLocked}
                                                        onChange={(e) => handleStudentDataChange(student._id, 'remarks', e.target.value)}
                                                        placeholder={isLocked ? "" : "Optional Note"}
                                                        className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-all
                                                            ${!student.isPresent || isLocked
                                                                ? 'bg-transparent border-transparent text-brand-navy/30 cursor-not-allowed placeholder-brand-navy/20'
                                                                : 'bg-white border-brand-navy/10 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/10 text-brand-navy shadow-sm'
                                                            }
                                                        `}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Save Action Form Bottom */}
                            <div className={`mt-6 flex flex-col sm:flex-row items-center pt-4 border-t border-brand-navy/5 ${isLocked ? 'justify-between gap-4' : 'justify-end'}`}>
                                {isLocked && (
                                    <div className="flex items-center gap-2 px-4 py-3 bg-brand-navy/5 border border-brand-navy/10 text-brand-navy/60 font-bold text-xs sm:text-sm rounded-xl">
                                        <Check size={18} className="text-brand-navy/40" />
                                        Results have been saved and are now locked.
                                    </div>
                                )}
                                <button
                                    onClick={handleSaveResults}
                                    disabled={savingResults || isLocked}
                                    className={`w-full lg:w-auto flex items-center justify-center gap-2 px-8 py-3 font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 shadow-md ${
                                        isLocked
                                            ? 'bg-brand-navy/10 text-brand-navy/40 cursor-not-allowed shadow-none'
                                            : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20'
                                    }`}
                                >
                                    {savingResults && !isLocked ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {isLocked ? 'Locked' : savingResults ? 'Saving Records...' : 'Save Results'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default ExamManagement;