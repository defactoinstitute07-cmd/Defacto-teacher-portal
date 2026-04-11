const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { createExam, getExams, getExamStudents, saveResults } = require('../controllers/examController');

const router = express.Router();

router.post('/', requireAuth, createExam);
router.get('/', requireAuth, getExams);
router.get('/:examId/students', requireAuth, getExamStudents);
router.post('/:examId/results', requireAuth, saveResults);

module.exports = router;
