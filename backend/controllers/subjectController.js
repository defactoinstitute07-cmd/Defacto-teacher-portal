const Subject = require('../models/Subject');
require('../models/Batch'); // Ensure Batch model is registered for populate

async function getAssignedSubjects(req, res) {
    try {
        const teacherId = req.user.sub;

        if (!teacherId) {
            return res.status(400).json({ message: 'Teacher ID is missing from token.' });
        }

        const subjects = await Subject.find({ teacherId: teacherId })
            .populate('batchIds')
            .select('-__v')
            .sort({ classLevel: 1, name: 1 })
            .lean();

        return res.json({
            message: 'Subjects retrieved successfully.',
            subjects
        });
    } catch (error) {
        console.error('Error fetching assigned subjects:', error);
        return res.status(500).json({ message: 'Unable to fetch subjects right now. Please try again.' });
    }
}

async function updateChapterStatus(req, res) {
    try {
        const teacherId = req.user.sub;
        const { subjectId, chapterId } = req.params;
        const { status } = req.body; // e.g. 'ongoing' or 'completed'

        if (!teacherId) {
            return res.status(400).json({ message: 'Teacher ID is missing from token.' });
        }

        const validStatuses = ['upcoming', 'ongoing', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const subject = await Subject.findOne({ _id: subjectId, teacherId: teacherId });
        
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found or you are not authorized to edit it.' });
        }

        const chapter = subject.chapters.id(chapterId);
        
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found within this subject.' });
        }

        chapter.status = status;
        
        if (status === 'completed') {
            chapter.completedAt = new Date();
        } else {
            chapter.completedAt = null;
        }

        await subject.save();

        return res.json({
            message: 'Chapter status updated successfully.',
            chapter
        });
    } catch (error) {
        console.error('Error updating chapter status:', error);
        return res.status(500).json({ message: 'Unable to update chapter status right now.' });
    }
}

module.exports = {
    getAssignedSubjects,
    updateChapterStatus
};
