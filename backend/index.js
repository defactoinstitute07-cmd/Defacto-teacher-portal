const app = require('./app');
const connectDb = require('./config/db');

// In a serverless environment, we need to ensure the DB is connected
// for every function execution, but reuse the connection if it exists.
let isConnected = false;

const handler = async (req, res) => {
    try {
        if (!isConnected) {
            await connectDb();
            isConnected = true;
        }
        return app(req, res);
    } catch (error) {
        console.error('CRITICAL: Failed to connect to DB in serverless handler:', error);
        
        // Return a clear JSON error to the client instead of hanging or generic crash
        res.status(500).json({
            message: 'Database connection failed. Please check MONGODB_URI environment variable.',
            error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message
        });
    }
};

module.exports = handler;
