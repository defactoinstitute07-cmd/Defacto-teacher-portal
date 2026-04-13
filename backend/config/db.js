const mongoose = require('mongoose');

async function connectDb() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error('MONGODB_URI is not set. Add it to your backend environment variables.');
    }

    try {
        await mongoose.connect(mongoUri, {
            bufferCommands: false,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        throw error;
    }
}

module.exports = connectDb;

