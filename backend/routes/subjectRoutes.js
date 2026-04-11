const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { getAssignedSubjects, updateChapterStatus } = require('../controllers/subjectController');

const router = express.Router();

// Fetch subjects for the logged-in teacher
// GET /api/teacher/subjects
router.get('/', requireAuth, getAssignedSubjects);

// Update chapter status (upcoming -> ongoing -> completed)
// PATCH /api/teacher/subjects/:subjectId/chapters/:chapterId/status
router.patch('/:subjectId/chapters/:chapterId/status', requireAuth, updateChapterStatus);

module.exports = router;
