const mongoose = require('mongoose');

let cachedConnectionPromise = null;

async function connectDb() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error('MONGODB_URI is not set. Add it to your backend environment variables.');
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!cachedConnectionPromise) {
        cachedConnectionPromise = mongoose
            .connect(mongoUri, {
                bufferCommands: false
            })
            .then((connection) => {
                console.log('MongoDB connected successfully');
                return connection.connection;
            })
            .catch((error) => {
                cachedConnectionPromise = null;
                console.error('MongoDB connection failed:', error.message);
                throw error;
            });
    }

    return cachedConnectionPromise;
}

module.exports = connectDb;
