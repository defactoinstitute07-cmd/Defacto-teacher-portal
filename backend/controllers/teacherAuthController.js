const jwt = require('jsonwebtoken');

const Teacher = require('../models/Teacher');

function sanitizeTeacher(teacher) {
    return {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        regNo: teacher.regNo,
        profileImage: teacher.profileImage,
        dob: teacher.dob,
        systemRole: teacher.systemRole,
        status: teacher.status
    };
}

async function loginTeacher(req, res) {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                message: 'Email or registration number and password are required.'
            });
        }

        const trimmedIdentifier = identifier.trim();
        const normalizedEmail = trimmedIdentifier.toLowerCase();

        const teacher = await Teacher.findOne({
            $or: [{ email: normalizedEmail }, { regNo: trimmedIdentifier }]
        });

        if (!teacher) {
            return res.status(401).json({
                message: 'Invalid login credentials.'
            });
        }

        if (teacher.status !== 'active') {
            return res.status(403).json({
                message: 'Your account is inactive. Please contact the administrator.'
            });
        }

        const isPasswordValid = await teacher.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid login credentials.'
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: 'JWT_SECRET is not configured on the server.'
            });
        }

        const token = jwt.sign(
            {
                sub: teacher._id.toString(),
                role: teacher.systemRole,
                email: teacher.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1d'
            }
        );

        return res.json({
            message: 'Login successful.',
            token,
            teacher: sanitizeTeacher(teacher)
        });
    } catch (error) {
        console.error('Teacher login failed:', error);
        return res.status(500).json({
            message: 'Unable to login right now. Please try again.',
            error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message
        });
    }
}

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
}

async function resetPassword(req, res) {
    try {
        const { email, regNo, newPassword } = req.body;

        if (!email || !regNo || !newPassword) {
            return res.status(400).json({ message: 'Email, registration number, and new password are required.' });
        }

        const teacher = await Teacher.findOne({ 
            email: email.trim().toLowerCase(), 
            regNo: regNo.trim() 
        });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found with the provided details.' });
        }

        teacher.password = newPassword;
        await teacher.save();

        return res.json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        console.error('Password reset failed:', error);
        return res.status(500).json({ message: 'Unable to reset password.' });
    }
}

async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;
        const teacherId = req.user.sub;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Both current and new passwords are required.' 
            });
        }

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }

        const isMatch = await teacher.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'The current password you entered is incorrect.' 
            });
        }

        // Update password (pre-save hook in model will handle hashing)
        teacher.password = newPassword;
        await teacher.save();

        return res.json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Change password failed:', error);
        return res.status(500).json({ message: 'Unable to update password. Please try again later.' });
    }
}

async function uploadProfileImage(req, res) {
    try {
        const { id } = req.params;
        const teacher = await Teacher.findById(id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided.' });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'teacher_profiles' },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ message: `Cloudinary error: ${error.message}` });
                }

                teacher.profileImage = result.secure_url;
                await teacher.save();

                return res.json({
                    message: 'Profile image uploaded successfully.',
                    profileImage: teacher.profileImage
                });
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
        console.error('Profile image upload failed:', error);
        return res.status(500).json({ message: 'Unable to upload profile image.' });
    }
}

module.exports = {
    loginTeacher,
    resetPassword,
    changePassword,
    uploadProfileImage
};

