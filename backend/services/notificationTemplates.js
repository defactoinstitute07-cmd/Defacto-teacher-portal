const { generateEmailLayout } = require('./emailLayout');

const announcementLegacyBody = [
    'Hello {{studentName}},',
    '',
    'A new test has been announced for {{subject}}.',
    'Test Date: {{date}}',
    'Max Marks: {{totalMarks}}',
    '',
    'Please prepare well for the test!'
].join('\n');

const testAnnouncement = {
    name: 'Test Announcement',
    eventType: 'testAnnouncement',
    subject: 'New Test Announced: {{subject}}',
    body: generateEmailLayout({
        eyebrow: 'Announcement',
        title: 'New Test Scheduled',
        subtitle: '{{subject}}',
        messageBody: 'A new test has been scheduled for your batch. Please check the details below and prepare accordingly.',
        rows: [
            { label: 'Subject', value: '{{subject}}' },
            { label: 'Test Date', value: '{{date}}' },
            { label: 'Total Marks', value: '{{totalMarks}}' }
        ],
        ctaText: 'View Syllabus',
        ctaLink: 'https://student.defactoinstitute.in/'
    }),
    subjectPush: 'नई परीक्षा की घोषणा',
    bodyPush: '{{subject}} के लिए परीक्षा {{date}} को निर्धारित की गई है।',
    placeholders: ['studentName', 'subject', 'date', 'totalMarks', 'instituteName', 'portalUrl', 'examName', 'passingMarks'],
    legacyBodies: [announcementLegacyBody]
};

const resultLegacyBody = [
    'Hello {{studentName}},',
    '',
    'The result for {{examName}} held on {{examDate}} has been published.',
    'Your score: {{score}}/{{totalMarks}}',
    'Status: {{passStatus}}',
    '',
    'Please review your detailed result in the portal.'
].join('\n');

const examResult = {
    name: 'Standard Exam Result',
    eventType: 'examResult',
    subject: 'Exam Result Published: {{examName}}',
    body: generateEmailLayout({
        eyebrow: 'Exam Result',
        title: '{{examName}}',
        subtitle: 'Published on {{examDate}}',
        messageBody: 'Your result has been published. A quick summary is below, and the full breakdown is available in your portal.',
        rows: [
            { label: 'Your Score', value: '{{score}} / {{totalMarks}}' },
            { label: 'Status', value: '{{passStatus}}', valueColor: '#2563eb' }
        ],
        ctaText: 'View Full Result',
        ctaLink: 'https://student.defactoinstitute.in/'
    }),
    subjectPush: 'परीक्षा परिणाम घोषित ! ',
    bodyPush: '{{examName}} का परिणाम घोषित हो गया है—आप अपना स्कोर देख सकते हैं।',
    placeholders: ['studentName', 'examName', 'examDate', 'score', 'totalMarks', 'passStatus', 'instituteName', 'portalUrl'],
    legacyBodies: [resultLegacyBody]
};

const templates = {
    testAnnouncement,
    examResult
};

// Utility to replace placeholders
const hydrateTemplate = (templateString, data) => {
    let result = templateString;
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
};

module.exports = {
    templates,
    hydrateTemplate
};
