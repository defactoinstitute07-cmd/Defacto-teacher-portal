const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, index: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    profileImage: { type: String },
    regNo: { type: String, trim: true, sparse: true, index: true, unique: true },
    joiningDate: { type: Date },
    password: { type: String },
    systemRole: { type: String, enum: ['Teacher', 'Admin'], default: 'Teacher' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    createdAt: { type: Date, default: Date.now }
});

teacherSchema.pre('save', async function () {
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

teacherSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    if (!this.password) {
        return false;
    }

    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);

