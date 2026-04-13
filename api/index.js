const app = require('../backend/app');
const connectDb = require('../backend/config/db');

module.exports = async (req, res) => {
    try {
        await connectDb();
        return app(req, res);
    } catch (error) {
        console.error('CRITICAL: Failed to connect to DB in serverless handler:', error);
        
        res.status(500).json({
            message: 'Database connection failed. Please check MONGODB_URI environment variable.',
            error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message
        });
    }
};
