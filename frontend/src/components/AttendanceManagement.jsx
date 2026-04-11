import React, { useState, useEffect } from 'react';
import { Search, Save, Calendar, Users, ClipboardCheck, AlertCircle, ArrowDownAZ, ArrowUpZA } from 'lucide-react';

function AttendanceManagement({ session }) {
    const [subjects, setSubjects] = useState([]);
    const [classLevels, setClassLevels] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    const [students, setStudents] = useState([]);
    const [sortOrder, setSortOrder] = useState('asc'); // New state for sorting
    const [isLocked, setIsLocked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const token = session?.token;

    useEffect(() => {
        fetchSubjects();
    }, [token]);

    useEffect(() => {
        if (selectedSubject && selectedDate) {
            fetchStudents();
        } else {
            setStudents([]);
        }
    }, [selectedSubject, selectedDate]);

    const fetchSubjects = async () => {
        try {
            setError(null);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/subjects`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch subjects');

            const data = await response.json();
            const subjectList = data.subjects || [];
            setSubjects(subjectList);

            const levels = [...new Set(subjectList.map(s => s.classLevel).filter(Boolean))];
            setClassLevels(levels);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchStudents = async () => {
        if (!selectedSubject || !selectedDate) return;

        try {
            setLoading(true);
            setIsLocked(false);
            setError(null);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/attendance/students?subjectId=${selectedSubject}&date=${selectedDate}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch students');

            const data = await response.json();

            const mappedStudents = (data.data || []).map(student => ({
                ...student,
                currentStatus: student.attendance?.status || null,
                currentNotes: student.attendance?.notes || ''
            }));

            const hasExisting = mappedStudents.some(s => s.attendance);
            setIsLocked(hasExisting);

            setStudents(mappedStudents);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setStudents(prev => prev.map(s =>
            s._id === studentId ? { ...s, currentStatus: status } : s
        ));
    };

    const handleFieldChange = (studentId, field, value) => {
        setStudents(prev => prev.map(s =>
            s._id === studentId ? { ...s, [field]: value } : s
        ));
    };

    const handleMarkAll = (status) => {
        setStudents(prev => prev.map(s => ({ ...s, currentStatus: status })));
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleSaveAttendance = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccessMessage('');

            const attendanceData = students
                .filter(s => s.currentStatus)
                .map(s => ({
                    studentId: s._id,
                    batchId: s.batchId?._id || s.batchId,
                    status: s.currentStatus,
                    notes: s.currentNotes || ''
                }));

            if (attendanceData.length === 0) {
                throw new Error("No attendance marks selected.");
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/teacher/attendance/mark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subjectId: selectedSubject,
                    date: selectedDate,
                    attendanceData
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to save attendance');
            }

            setSuccessMessage('Attendance saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);

            await fetchStudents();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredSubjects = subjects.filter(s => s.classLevel === selectedClass);

    // Derived state for sorted students
    const sortedStudents = [...students].sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.name.localeCompare(b.name);
        } else {
            return b.name.localeCompare(a.name);
        }
    });

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header Area */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-brand-navy flex items-center gap-2">
                        <ClipboardCheck size={28} className="text-brand-gold" />
                        Attendance
                    </h1>
                    <p className="text-brand-navy/60 text-sm mt-1">
                        Select a class and subject to view students.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-navy/40" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full md:w-auto pl-10 pr-4 py-2.5 rounded-xl border border-brand-navy/10 outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 text-sm font-medium text-brand-navy bg-white shadow-sm transition-all"
                        />
                    </div>
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
                    <ClipboardCheck size={18} />
                    {successMessage}
                </div>
            )}

            {/* Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-brand-navy/5">
                <div>
                    <label className="block text-xs font-bold text-brand-navy/60 uppercase tracking-wider mb-2">Class Level</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => {
                            setSelectedClass(e.target.value);
                            setSelectedSubject('');
                        }}
                        className="w-full bg-brand-cream/30 border border-brand-navy/10 rounded-xl px-4 py-3 text-brand-navy font-medium outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all cursor-pointer appearance-none"
                    >
                        <option value="">Select Class</option>
                        {classLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-brand-navy/60 uppercase tracking-wider mb-2">Subject</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        disabled={!selectedClass}
                        className="w-full bg-brand-cream/30 border border-brand-navy/10 rounded-xl px-4 py-3 text-brand-navy font-medium outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer appearance-none"
                    >
                        <option value="">Select Subject</option>
                        {filteredSubjects.map(subject => (
                            <option key={subject._id} value={subject._id}>{subject.name} {subject.code ? `(${subject.code})` : ''}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            {selectedSubject && selectedDate && (
                <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-brand-navy/5 flex flex-col min-h-[400px] w-full">

                    {/* List Header & Global Actions */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <h2 className="text-lg font-bold font-serif text-brand-navy flex items-center gap-2">
                            <Users size={20} className="text-brand-gold" />
                            Enrolled Students ({students.length})
                        </h2>

                        {students.length > 0 && (
                            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto">
                                <button
                                    onClick={toggleSortOrder}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-brand-cream/50 text-brand-navy/70 hover:bg-brand-navy/5 hover:text-brand-navy active:scale-95 transition-all"
                                    title={`Sort ${sortOrder === 'asc' ? 'Z-A' : 'A-Z'}`}
                                >
                                    {sortOrder === 'asc' ? <ArrowDownAZ size={16} /> : <ArrowUpZA size={16} />}
                                    <span className="hidden sm:inline">Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
                                </button>
                                {!isLocked && (
                                    <>
                                        <div className="w-px h-6 bg-brand-navy/10 hidden lg:block mx-1"></div>
                                        <button
                                            onClick={() => handleMarkAll('Present')}
                                            className="flex-1 lg:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500/20 active:scale-95 transition-all whitespace-nowrap text-center"
                                        >
                                            Mark All Present
                                        </button>
                                        <button
                                            onClick={() => handleMarkAll('Absent')}
                                            className="flex-1 lg:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 active:scale-95 transition-all whitespace-nowrap text-center"
                                        >
                                            Mark All Absent
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
                            <div className="w-10 h-10 border-4 border-brand-cream border-t-brand-gold rounded-full animate-spin"></div>
                            <p className="text-brand-navy/50 text-sm font-medium animate-pulse">Loading students...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-brand-navy/10 rounded-2xl my-auto">
                            <div className="w-16 h-16 bg-brand-cream/50 rounded-full flex items-center justify-center mb-4">
                                <Users size={32} className="text-brand-navy/30" />
                            </div>
                            <h3 className="text-brand-navy font-bold mb-1">No Students Found</h3>
                            <p className="text-brand-navy/60 text-sm">There are no active students enrolled in this subject's batches.</p>
                        </div>
                    ) : (
                        <>
                            {/* MOBILE VIEW: Card Grid (Visible < 1024px) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                                {sortedStudents.map(student => (
                                    <div key={student._id} className="bg-white border border-brand-navy/10 rounded-2xl p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                                        {/* Profile Row */}
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
                                                    <span className="truncate text-blue-600 font-semibold">
                                                        {student.batchId?.name || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Attendance Buttons Grid */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Present', 'Absent', 'Late'].map((status) => {
                                                const colors = {
                                                    Present: 'bg-green-500 text-white',
                                                    Absent: 'bg-red-500 text-white',
                                                    Late: 'bg-amber-500 text-white',
                                                    default: 'bg-brand-cream/50 text-brand-navy/60 hover:bg-brand-navy/5'
                                                };
                                                const isActive = student.currentStatus === status;
                                                return (
                                                    <button
                                                        key={status}
                                                        disabled={isLocked}
                                                        onClick={() => handleStatusChange(student._id, status)}
                                                        className={`py-2 text-[11px] font-bold rounded-lg transition-all ${isActive ? colors[status] + ' shadow-md' : colors.default} ${isLocked ? 'opacity-60 cursor-not-allowed grayscale-[30%]' : ''}`}
                                                    >
                                                        {status}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Notes Input */}
                                        <div>
                                            <input
                                                type="text"
                                                disabled={isLocked}
                                                value={student.currentNotes || ''}
                                                onChange={(e) => handleFieldChange(student._id, 'currentNotes', e.target.value)}
                                                placeholder={isLocked ? "" : "Add a note (optional)..."}
                                                className={`w-full bg-brand-cream/20 border border-brand-navy/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-gold focus:bg-white transition-all ${isLocked ? 'opacity-60 cursor-not-allowed bg-brand-navy/5' : ''}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* DESKTOP VIEW: Data Table (Visible >= 1024px) */}
                            <div className="hidden lg:block flex-1 overflow-x-auto rounded-xl border border-brand-navy/5 pb-2">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="bg-brand-cream/40 text-brand-navy/60 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-bold border-b border-brand-navy/5 w-1/3">Student</th>
                                            <th className="p-4 font-bold border-b border-brand-navy/5 w-1/5">Roll No & Batch</th>
                                            <th className="p-4 font-bold border-b border-brand-navy/5 text-center w-[280px]">Attendance</th>
                                            <th className="p-4 font-bold border-b border-brand-navy/5 w-1/4">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-navy/5">
                                        {sortedStudents.map(student => (
                                            <tr key={student._id} className="hover:bg-brand-cream/20 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {student.profileImage ? (
                                                            <img src={student.profileImage} alt={student.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-navy/40 font-bold text-xs shrink-0 group-hover:bg-brand-cream transition-colors">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <span className="font-bold text-brand-navy text-sm">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-brand-navy font-medium">{student.rollNo || 'N/A'}</div>
                                                    <div className="text-[10px] font-bold mt-0.5 text-brand-navy/40 uppercase tracking-widest">{student.batchId?.name || 'N/A'}</div>
                                                </td>
                                                <td className="p-4 text-center align-middle">
                                                    <div className="inline-flex rounded-lg border border-brand-navy/10 p-1 bg-white">
                                                        <button
                                                            disabled={isLocked}
                                                            onClick={() => handleStatusChange(student._id, 'Present')}
                                                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${student.currentStatus === 'Present' ? 'bg-green-500 text-white shadow-sm' : 'text-brand-navy/50 hover:bg-brand-cream'} ${isLocked ? 'opacity-60 cursor-not-allowed grayscale-[30%]' : ''}`}
                                                        >
                                                            Present
                                                        </button>
                                                        <button
                                                            disabled={isLocked}
                                                            onClick={() => handleStatusChange(student._id, 'Absent')}
                                                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${student.currentStatus === 'Absent' ? 'bg-red-500 text-white shadow-sm' : 'text-brand-navy/50 hover:bg-brand-cream'} ${isLocked ? 'opacity-60 cursor-not-allowed grayscale-[30%]' : ''}`}
                                                        >
                                                            Absent
                                                        </button>
                                                        <button
                                                            disabled={isLocked}
                                                            onClick={() => handleStatusChange(student._id, 'Late')}
                                                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${student.currentStatus === 'Late' ? 'bg-amber-500 text-white shadow-sm' : 'text-brand-navy/50 hover:bg-brand-cream'} ${isLocked ? 'opacity-60 cursor-not-allowed grayscale-[30%]' : ''}`}
                                                        >
                                                            Late
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <input
                                                        type="text"
                                                        disabled={isLocked}
                                                        value={student.currentNotes || ''}
                                                        onChange={(e) => handleFieldChange(student._id, 'currentNotes', e.target.value)}
                                                        placeholder={isLocked ? "" : "Add note..."}
                                                        className={`w-full bg-white border border-brand-navy/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/10 transition-all ${isLocked ? 'opacity-60 cursor-not-allowed bg-brand-navy/5' : ''}`}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Save Action */}
                            <div className={`mt-6 flex flex-col sm:flex-row items-center pt-4 border-t border-brand-navy/5 ${isLocked ? 'justify-between gap-4' : 'justify-end'}`}>
                                {isLocked && (
                                    <div className="flex items-center gap-2 px-4 py-3 bg-brand-navy/5 border border-brand-navy/10 text-brand-navy/60 font-bold text-xs sm:text-sm rounded-xl">
                                        <ClipboardCheck size={18} className="text-brand-navy/40" />
                                        Attendance has been submitted for this date and is locked.
                                    </div>
                                )}
                                <button
                                    onClick={handleSaveAttendance}
                                    disabled={saving || isLocked}
                                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 font-bold rounded-xl transition-all ${
                                        isLocked 
                                            ? 'bg-brand-navy/10 text-brand-navy/40 cursor-not-allowed' 
                                            : 'bg-brand-gold text-brand-navy hover:bg-[#a67a27] active:scale-95 hover:shadow-lg disabled:opacity-50'
                                    }`}
                                >
                                    {saving && !isLocked ? (
                                        <div className="w-5 h-5 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin"></div>
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {isLocked ? 'Locked' : saving ? 'Saving Records...' : 'Save Attendance'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default AttendanceManagement;