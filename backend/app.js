const express = require('express');
const cors = require('cors');

require('./config/loadEnv');

const teacherAuthRoutes = require('./routes/teacherAuthRoutes');
const subjectRoutes = require('./routes/subjectRoutes');

const app = express();

app.use(
    cors({
        origin: function (origin, callback) {
            const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173'];
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app') || origin.endsWith('.defactoinstitute.in')) {
                callback(null, true);
            } else {
                callback(new Error(`Not allowed by CORS: ${origin}`));
            }
        },
        credentials: true
    })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Teacher Portal API is running' });
});

app.use('/api/teacher', teacherAuthRoutes);
app.use('/api/teacher/subjects', subjectRoutes);
app.use('/api/teacher/attendance', require('./routes/attendanceRoutes'));
app.use('/api/teacher/exams', require('./routes/examRoutes'));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: 'Something went wrong on the server.'
    });
});

module.exports = app;
