const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { templates, hydrateTemplate } = require('./notificationTemplates');

// Initialize Firebase Admin (Only if credentials exist)
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Handle newlines in private key securely
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
    }
} else {
    console.warn('Firebase Admin credentials missing from .env. Push notifications will be skipped.');
}

// Initialize Nodemailer Transport
let transporter = null;
if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS, // This should be an App Password
        },
    });
    console.log('Nodemailer transporter initialized.');
} else {
    console.warn('Gmail credentials missing from .env. Email notifications will be skipped.');
}

/**
 * Send email notification
 */
async function sendEmail(studentEmail, subject, htmlBody) {
    if (!transporter) return;
    try {
        const mailOptions = {
            from: `"Defacto Institute" <${process.env.GMAIL_USER}>`,
            to: studentEmail,
            subject: subject,
            html: htmlBody,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${studentEmail}`);
    } catch (error) {
        console.error(`Error sending email to ${studentEmail}:`, error);
    }
}

/**
 * Send push notification via Firebase (FCM)
 */
async function sendPushNotification(deviceTokens, title, body) {
    if (!admin.apps.length || !deviceTokens || deviceTokens.length === 0) return;
    try {
        const message = {
            notification: {
                title: title,
                body: body,
            },
            tokens: deviceTokens,
        };
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Push notification sent. Success: ${response.successCount}, Failed: ${response.failureCount}`);
        
        // Optional: Handle failed tokens (e.g., remove from DB) if needed
        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.log(`Token failed: ${deviceTokens[idx]} - Error: ${resp.error.message}`);
                }
            });
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}

/**
 * Main wrapper to dispatch both Email and Push 
 * @param {string} type - 'testAnnouncement' or 'examResult'
 * @param {Object} student - Student database object (needs name, email, deviceTokens)
 * @param {Object} dynamicData - Data specific to the notification (examName, etc.)
 */
async function sendExamNotification(type, student, dynamicData) {
    try {
        const templateConfig = templates[type];
        if (!templateConfig) {
            throw new Error(`Invalid notification type: ${type}`);
        }

        // Base context for placeholder interpolation
        const dataContext = {
            studentName: student.name,
            instituteName: 'Defacto Institute',
            portalUrl: 'https://student.defactoinstitute.in/', 
            ...dynamicData
        };

        // Hydrate specific strings
        const emailHtml = hydrateTemplate(templateConfig.body, dataContext);
        const emailSubject = hydrateTemplate(templateConfig.subject, dataContext);
        const pushSubject = hydrateTemplate(templateConfig.subjectPush, dataContext);
        const pushBody = hydrateTemplate(templateConfig.bodyPush, dataContext);

        // Dispatch simultaneously without blocking each other
        await Promise.allSettled([
            student.email ? sendEmail(student.email, emailSubject, emailHtml) : Promise.resolve(),
            (student.deviceTokens && student.deviceTokens.length > 0) ? sendPushNotification(student.deviceTokens, pushSubject, pushBody) : Promise.resolve()
        ]);

    } catch (error) {
        console.error('Failed to execute sendExamNotification:', error);
    }
}

module.exports = {
    sendExamNotification
};
