const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

async function getStudentsBySubjectAndDate(req, res) {
    try {
        const teacherId = req.user.sub;
        const { subjectId, date } = req.query;

        if (!teacherId || !subjectId || !date) {
            return res.status(400).json({ message: 'Missing subjectId or date.' });
        }

        // Verify teacher owns the subject
        const subject = await Subject.findOne({ _id: subjectId, teacherId: teacherId });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found or unauthorized.' });
        }

        // Parse date to start of day UTC
        const queryDate = new Date(date);
        queryDate.setUTCHours(0, 0, 0, 0);

        // Find students enrolled in the batches associated with the subject
        const students = await Student.find({ batchId: { $in: subject.batchIds }, status: 'active' })
            .populate('batchId', 'name')
            .select('name rollNo profileImage batchId')
            .lean();

        // Get existing attendance for this subject and date
        const attendanceRecords = await Attendance.find({
            subjectId,
            attendanceDate: queryDate
        }).lean();

        const attendanceMap = {};
        attendanceRecords.forEach(record => {
            attendanceMap[record.studentId.toString()] = record;
        });

        // Merge student data with attendance data
        const result = students.map(student => ({
            _id: student._id,
            name: student.name,
            rollNo: student.rollNo,
            profileImage: student.profileImage,
            batchId: student.batchId,
            attendance: attendanceMap[student._id.toString()] || null
        }));

        res.json({ message: 'Students retrieved successfully', data: result });
    } catch (error) {
        console.error('Error fetching students for attendance:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

async function markAttendance(req, res) {
    try {
        const teacherId = req.user.sub;
        const { subjectId, date, attendanceData } = req.body; 
        // attendanceData is an array of { studentId, batchId, status, notes }

        if (!teacherId || !subjectId || !date || !attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({ message: 'Invalid payload.' });
        }

        const subject = await Subject.findOne({ _id: subjectId, teacherId: teacherId });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found or unauthorized.' });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setUTCHours(0, 0, 0, 0);

        const bulkOps = attendanceData.map(record => {
            return {
                updateOne: {
                    filter: {
                        studentId: record.studentId,
                        subjectId: subjectId,
                        batchId: record.batchId,
                        attendanceDate: attendanceDate
                    },
                    update: {
                        $set: {
                            status: record.status || 'Present',
                            notes: record.notes || '',
                            markedBy: teacherId,
                            markedByModel: 'Teacher',
                            markedByRole: 'teacher',
                            updatedAt: new Date()
                        },
                        $setOnInsert: {
                            date: attendanceDate,
                            createdAt: new Date()
                        }
                    },
                    upsert: true
                }
            };
        });

        if (bulkOps.length > 0) {
            await Attendance.bulkWrite(bulkOps);
        }

        res.json({ message: 'Attendance marked successfully.' });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports = {
    getStudentsBySubjectAndDate,
    markAttendance
};
