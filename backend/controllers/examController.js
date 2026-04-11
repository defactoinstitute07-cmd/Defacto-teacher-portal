const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const Student = require('../models/Student');
const { sendExamNotification } = require('../services/notificationService');

async function createExam(req, res) {
    try {
        const teacherId = req.user.sub;
        const { name, subjectId, batchId, chapter, date, totalMarks, passingMarks } = req.body;

        if (!name || !subjectId || !chapter || !date || !totalMarks || !passingMarks || !batchId) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const subject = await Subject.findOne({ _id: subjectId, teacherId });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found or unauthorized.' });
        }

        const newExam = new Exam({
            name,
            classLevel: subject.classLevel || 'General',
            subject: subject.name,
            subjectId,
            chapter,
            batchId,
            linkedBatchCount: Array.isArray(subject.batchIds) ? subject.batchIds.length : 1,
            date: new Date(date),
            totalMarks,
            passingMarks,
            uploadedBy: teacherId
        });

        await newExam.save();

        // --- Async Notification Trigger ---
        Student.find({ batchId: { $in: subject.batchIds }, status: 'active' })
            .select('name email deviceTokens')
            .lean()
            .then(students => {
                const dynamicData = {
                    examName: newExam.name,
                    subject: newExam.subject,
                    date: newExam.date ? new Date(newExam.date).toLocaleDateString() : 'TBD',
                    totalMarks: newExam.totalMarks,
                    passingMarks: newExam.passingMarks
                };
                students.forEach(student => {
                    sendExamNotification('testAnnouncement', student, dynamicData);
                });
            })
            .catch(err => console.error('Error dispatching test announcement notifications:', err));

        res.status(201).json({ message: 'Exam created successfully', exam: newExam });
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getExams(req, res) {
    try {
        const teacherId = req.user.sub;
        const { subjectId } = req.query;

        let exams = [];
        if (!subjectId) {
            const teacherSubjects = await Subject.find({ teacherId }).select('_id').lean();
            const subjectIds = teacherSubjects.map(s => s._id);
            exams = await Exam.find({
                $or: [
                    { subjectId: { $in: subjectIds } },
                    { uploadedBy: teacherId }
                ]
            }).sort({ date: -1 }).limit(20).lean();
        } else {
            const subject = await Subject.findOne({ _id: subjectId, teacherId }).lean();
            if (!subject) {
                return res.status(403).json({ message: 'Unauthorized access to this subject.' });
            }
            exams = await Exam.find({ subjectId }).sort({ date: -1 }).lean();
        }

        // --- Add isGraded flag to each exam ---
        const examsWithStatus = await Promise.all(exams.map(async (exam) => {
            const hasResults = await ExamResult.exists({ examId: exam._id });
            return { ...exam, isGraded: !!hasResults };
        }));

        res.json({ message: 'Exams retrieved successfully', exams: examsWithStatus });
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getExamStudents(req, res) {
    try {
        const teacherId = req.user.sub;
        const { examId } = req.params;

        const exam = await Exam.findById(examId).lean();
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        const subject = await Subject.findOne({ _id: exam.subjectId, teacherId }).lean();
        if (!subject) {
            return res.status(403).json({ message: 'Unauthorized access to this exam.' });
        }

        // Fetch ALL students enrolled in any batch linked to the subject
        const students = await Student.find({ batchId: { $in: subject.batchIds }, status: 'active' })
            .populate('batchId', 'name')
            .select('name rollNo profileImage batchId')
            .lean();

        // Fetch existing exam results
        const results = await ExamResult.find({ examId }).lean();
        const resultsMap = {};
        results.forEach(r => {
            resultsMap[r.studentId.toString()] = r;
        });

        const data = students.map(student => {
            const studentIdStr = student._id.toString();
            const result = resultsMap[studentIdStr];
            return {
                ...student,
                result: result || null
            };
        });

        res.json({ message: 'Students retrieved successfully', data, exam });
    } catch (error) {
        console.error('Error fetching exam students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function saveResults(req, res) {
    try {
        const teacherId = req.user.sub;
        const { examId } = req.params;
        const { resultsData } = req.body; 
        // resultsData -> array of { studentId, marksObtained, isPresent, remarks }

        if (!Array.isArray(resultsData)) {
            return res.status(400).json({ message: 'Invalid payload.' });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        const subject = await Subject.findOne({ _id: exam.subjectId, teacherId }).lean();
        if (!subject) {
            return res.status(403).json({ message: 'Unauthorized access to this exam.' });
        }

        const bulkOps = resultsData.map(record => {
            const isPresent = record.isPresent !== undefined ? record.isPresent : true;
            let marks = isPresent ? record.marksObtained : 0;
            if (typeof marks !== 'number' || isNaN(marks)) {
                marks = 0; // Default to 0 instead of null because schema requires it
            }

            return {
                updateOne: {
                    filter: { examId, studentId: record.studentId },
                    update: {
                        $set: {
                            batchId: record.batchId,
                            marksObtained: marks,
                            isPresent: isPresent,
                            remarks: record.remarks || '',
                            uploadedBy: teacherId,
                            uploadedAt: new Date()
                        }
                    },
                    upsert: true
                }
            };
        });

        if (bulkOps.length > 0) {
            await ExamResult.bulkWrite(bulkOps);
        }

        // --- Async Notification Trigger ---
        const studentIds = resultsData.map(r => r.studentId);
        Student.find({ _id: { $in: studentIds }, status: 'active' })
            .select('name email deviceTokens')
            .lean()
            .then(students => {
                const resultsMap = {};
                resultsData.forEach(r => resultsMap[r.studentId] = r);
                
                students.forEach(student => {
                    const result = resultsMap[student._id.toString()];
                    if (!result || !result.isPresent) return; // Skip absentees

                    const dynamicData = {
                        examName: exam.name,
                        examDate: exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A',
                        score: result.marksObtained,
                        totalMarks: exam.totalMarks,
                        passStatus: result.marksObtained >= exam.passingMarks ? 'PASSED' : 'FAILED'
                    };

                    sendExamNotification('examResult', student, dynamicData);
                });
            })
            .catch(err => console.error('Error dispatching exam result notifications:', err));

        res.json({ message: 'Results saved successfully.' });
    } catch (error) {
        console.error('Error saving exam results:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createExam,
    getExams,
    getExamStudents,
    saveResults
};
