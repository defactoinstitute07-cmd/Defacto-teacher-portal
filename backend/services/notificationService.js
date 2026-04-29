const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { templates, hydrateTemplate } = require('./notificationTemplates');

// Initialize Firebase Admin (Only if credentials exist)
const fbProjectId = process.env.FIREBASE_PROJECT_ID;
const fbClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let fbPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

if (fbProjectId && fbClientEmail && fbPrivateKey) {
    try {
        // Robust private key parsing: handle literal \n and surrounding quotes
        const formattedKey = fbPrivateKey.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
        
        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: fbProjectId,
                    clientEmail: fbClientEmail,
                    privateKey: formattedKey,
                }),
            });
            console.log('✅ Firebase Admin initialized successfully.');
        }
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error.message);
    }
} else {
    console.warn('⚠️ Firebase Admin credentials missing. Push notifications will be skipped.');
}

// Initialize Nodemailer Transport
let transporter = null;
if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS, // This should be an App Password
            },
        });
        console.log('✅ Nodemailer (Gmail) transport initialized.');
    } catch (error) {
        console.error('❌ Failed to initialize Nodemailer:', error.message);
    }
} else {
    console.warn('⚠️ Gmail credentials missing. Email notifications will be skipped.');
}


/**
 * Send email notification
 */
async function sendEmail(studentEmail, subject, htmlBody) {
    if (!transporter) {
        console.warn('⏩ Skipping email (transporter not initialized):', studentEmail);
        return;
    }
    try {
        const mailOptions = {
            from: `"Defacto Institute" <${process.env.GMAIL_USER}>`,
            to: studentEmail,
            subject: subject,
            html: htmlBody,
        };
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent successfully to: ${studentEmail}`);
    } catch (error) {
        console.error(`❌ Error sending email to ${studentEmail}:`, error.message);
    }
}

/**
 * Send push notification via Firebase (FCM)
 */
async function sendPushNotification(deviceTokens, title, body) {
    if (!admin.apps.length) {
        console.warn('⏩ Skipping push (Firebase not initialized)');
        return;
    }
    if (!deviceTokens || deviceTokens.length === 0) {
        return;
    }
    try {
        const message = {
            notification: {
                title: title,
                body: body,
            },
            tokens: deviceTokens,
        };
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`📱 Push notification sent. Success: ${response.successCount}, Failed: ${response.failureCount}`);
        
        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.log(`   └─ ❌ Token failed: ${deviceTokens[idx].substring(0, 10)}... - Error: ${resp.error.message}`);
                }
            });
        }
    } catch (error) {
        console.error('❌ Error sending push notification:', error.message);
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
            console.error(`❌ Invalid notification type requested: ${type}`);
            return;
        }

        // Base context for placeholder interpolation
        const dataContext = {
            studentName: student.name || 'Student',
            instituteName: 'Defacto Institute',
            portalUrl: 'https://student.defactoinstitute.in/', 
            ...dynamicData
        };

        const emailHtml = hydrateTemplate(templateConfig.body, dataContext);
        const emailSubject = hydrateTemplate(templateConfig.subject, dataContext);
        const pushSubject = hydrateTemplate(templateConfig.subjectPush, dataContext);
        const pushBody = hydrateTemplate(templateConfig.bodyPush, dataContext);

        const hasEmail = !!student.email;
        const hasPush = student.deviceTokens && student.deviceTokens.length > 0;

        if (!hasEmail && !hasPush) {
            console.warn(`⚠️ No contact methods found for student: ${student.name || student._id}`);
            return;
        }

        console.log(`🚀 Dispatching '${type}' notification to ${student.name} (${hasEmail ? 'Email' : ''}${hasEmail && hasPush ? '+' : ''}${hasPush ? 'Push' : ''})`);

        await Promise.allSettled([
            hasEmail ? sendEmail(student.email, emailSubject, emailHtml) : Promise.resolve(),
            hasPush ? sendPushNotification(student.deviceTokens, pushSubject, pushBody) : Promise.resolve()
        ]);

    } catch (error) {
        console.error('❌ Failed to execute sendExamNotification:', error);
    }
}

module.exports = {
    sendExamNotification
};
