const express = require('express');
const multer = require('multer');

const { requireAuth } = require('../middleware/authMiddleware');
const { loginTeacher, resetPassword, changePassword, uploadProfileImage } = require('../controllers/teacherAuthController');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/login', loginTeacher);
router.post('/reset-password', resetPassword);
router.post('/change-password', requireAuth, changePassword);
router.post('/upload-profile-image/:id', upload.single('profileImage'), uploadProfileImage);

module.exports = router;

