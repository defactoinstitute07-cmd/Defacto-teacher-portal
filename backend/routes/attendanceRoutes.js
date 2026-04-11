const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { getStudentsBySubjectAndDate, markAttendance } = require('../controllers/attendanceController');

const router = express.Router();

router.get('/students', requireAuth, getStudentsBySubjectAndDate);
router.post('/mark', requireAuth, markAttendance);

module.exports = router;
