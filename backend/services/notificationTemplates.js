const announcementLegacyBody = [
    'Hello {{studentName}},',
    '',
    'A new test has been scheduled.',
    'Test: {{examName}}',
    'Subject: {{subject}}',
    'Date: {{date}}',
    'Total Marks: {{totalMarks}}',
    'Passing Marks: {{passingMarks}}',
    '',
    'Please prepare well and review the syllabus in your portal.'
].join('\n');

const testAnnouncement = {
    name: 'Test Announcement',
    eventType: 'testAnnouncement',
    subject: 'New Test Scheduled: {{examName}}',
    body: `<!DOCTYPE html><html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Announcement</title>
    <style>
        body { margin: 0; padding: 24px 12px; font-family: "DM Sans", sans-serif; color: #f9fafb; background: white; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 5px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 14px 30px rgba(234, 88, 12, 0.10); }
        .hero { padding: 28px; background: linear-gradient(135deg, #12449a, #072143); color: #ffffff; }
        .eyebrow { display: inline-block; padding: 5px 10px; border-radius: 999px; background: rgba(255, 255, 255, 0.16); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
        .title { margin: 14px 0 0; font-size: 26px; line-height: 1.2; }
        .subtitle { margin: 8px 0 0; color: #fdba74; font-size: 14px; }
        .content { padding: 28px; }
        .greeting { margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #000; }
        .copy { margin: 0 0 22px; font-size: 15px; line-height: 1.7; color: #334155; }
        .logo-box { padding: 4px; border-radius: 6px; margin-bottom: 16px; display: inline-block; }
        .logo-box img { height: 56px; width: auto; object-fit: contain; }
        .note { margin-top: 18px; font-size: 13px; color: #64748b; }
        .footer { padding: 0 28px 24px; font-size: 12px; color: #94a3b8; }
        .cta { display: inline-block; padding: 13px 20px; border-radius: 999px; background: linear-gradient(135deg, #12449a, #072143); color: #ffffff !important; text-decoration: none; font-weight: 700; }
    </style>
</head>
<body>
    <div class="card">
        <div class="hero">
            <div class="logo-box">
                <img src="https://res.cloudinary.com/dmswb6fya/image/upload/f_auto,q_auto,c_limit,w_240/v1775635083/erp_uploads/fwp2aeerokjfljm2aw2a.png" />
            </div>
            <div class="eyebrow">Upcoming Test</div>
            <h1 class="title">Test Scheduled</h1>
            <p class="subtitle">{{subject}}</p>
        </div>
        <div class="content">
            <p class="greeting">Hello {{studentName}},</p>
            <p class="copy">A new test has been scheduled. Please review the details below and prepare accordingly.</p>
            <div style="background:#fffaf5; border:1px solid #fed7aa; border-radius:16px; padding:20px; margin-bottom:22px;">
                <table width="100%" style="margin-bottom:12px;"><tr><td style="color:#9a3412; font-weight:700;">Test Name</td><td style="color:#0f172a; font-weight:700; text-align:right;">{{examName}}</td></tr></table>
                <table width="100%" style="margin-bottom:12px;"><tr><td style="color:#9a3412; font-weight:700;">Subject</td><td style="color:#0f172a; font-weight:700; text-align:right;">{{subject}}</td></tr></table>
                <table width="100%" style="margin-bottom:12px;"><tr><td style="color:#9a3412; font-weight:700;">Date</td><td style="color:#0f172a; font-weight:700; text-align:right;">{{date}}</td></tr></table>
                <table width="100%" style="margin-bottom:12px;"><tr><td style="color:#9a3412; font-weight:700;">Total Marks</td><td style="color:#ea580c; font-weight:700; text-align:right;">{{totalMarks}}</td></tr></table>
                <table width="100%" style="border-top:1px solid #fed7aa; padding-top:12px;"><tr><td style="color:#9a3412; font-weight:700;">Passing Marks</td><td style="color:#16a34a; font-weight:700; text-align:right;">{{passingMarks}}</td></tr></table>
            </div>
            <a class="cta" href="https://student.Defactoinstitute.in/" target="_blank" rel="noopener noreferrer"> View Full Result In Portal & App</a>
            <p class="note">Please review the syllabus and any latest updates in your portal.</p>
        </div>
        <div class="footer">Sent by {{instituteName}}.</div>
    </div>
</body>
</html>`,
    subjectPush: 'A new test has been announced: {{examName}}',
    bodyPush: 'Check your Defacto ERP app for details.',
    placeholders: ['studentName', 'examName', 'subject', 'date', 'totalMarks', 'passingMarks', 'instituteName', 'portalUrl'],
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
    body: `<!DOCTYPE html><html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exam Result Published</title>
    <style>
        body { margin: 0; padding: 24px 0px; background: #eff6ff; font-family: "DM Sans", sans-serif; color: #f9fafb;  background: white; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 5px; overflow: hidden; border: 1px solid #dbeafe; box-shadow: 0 16px 34px rgba(37, 99, 235, 0.12); }
        .hero { padding: 28px; background: linear-gradient(135deg, #5e118f, #54174f); color: #ffffff; }
        .eyebrow { display: inline-block; padding: 5px 10px; border-radius: 999px; background: rgba(255, 255, 255, 0.16); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
        .title { margin: 14px 0 0; font-size: 26px; line-height: 1.2; }
        .subtitle { margin: 8px 0 0; font-size: 14px; color: #dbeafe; }
        .content { padding: 28px; }
        .greeting { margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #172554; }
        .copy { margin: 0 0 22px; font-size: 15px; line-height: 1.7; color: #334155; }
        .score-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 22px; }
        .score-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: #64748b; }
        .score-value { margin-top: 8px; font-size: 34px; font-weight: 800; color: #2563eb; }
        .score-total { font-size: 18px; color: #94a3b8; font-weight: 600; }
        .status { display: inline-block; margin-top: 16px; padding: 8px 14px; border-radius: 999px; background: #dbeafe; color: #1d4ed8; font-size: 13px; font-weight: 700; }
        .cta { display: inline-block; padding: 13px 20px; border-radius: 999px; background: linear-gradient(135deg, #901dd8, #54174f); color: #ffffff !important; text-decoration: none; font-weight: 700; }
        .footer { padding: 0 28px 24px; font-size: 12px; color: #64748b; }
        .logo-box { padding: 4px; border-radius: 6px; margin-bottom: 16px; display: inline-block; }
        .logo-box img { height: 56px; width: auto; object-fit: contain; }
    </style>
</head>
<body>
    <div class="card">
        <div class="hero">
            <div class="logo-box">
                <img src="https://res.cloudinary.com/dmswb6fya/image/upload/f_auto,q_auto,c_limit,w_240/v1775635083/erp_uploads/fwp2aeerokjfljm2aw2a.png" />
            </div>
            <div class="eyebrow">Exam Result</div>
            <h1 class="title">{{examName}}</h1>
            <p class="subtitle">Published on {{examDate}}</p>
        </div>
        <div class="content">
            <p class="greeting">Hello {{studentName}},</p>
            <p class="copy">Your result has been published. A quick summary is below, and the full breakdown is available in your portal.</p>
            <div class="score-card">
                <div class="score-label">Your Score</div>
                <div class="score-value">{{score}} <span class="score-total">/ {{totalMarks}}</span></div>
                <div class="status">Status: {{passStatus}}</div>
            </div>
            <a class="cta" href="{{portalUrl}}" target="_blank" rel="noopener noreferrer">View Full Result</a>
        </div>
        <div class="footer">Issued by {{instituteName}}.</div>
    </div>
</body>
</html>`,
    subjectPush: 'Exam Result are OUT ! ',
    bodyPush: '{{examName}} result is out—you can check your score.',
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
