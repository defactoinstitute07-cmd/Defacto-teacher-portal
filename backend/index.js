const app = require('./app');
const connectDb = require('./config/db');

// In a serverless environment, we need to ensure the DB is connected
// for every function execution, but reuse the connection if it exists.
let isConnected = false;

const handler = async (req, res) => {
    if (!isConnected) {
        try {
            await connectDb();
            isConnected = true;
        } catch (error) {
            console.error('Failed to connect to DB in serverless handler:', error);
            // We still proceed, but the app might fail on DB queries
        }
    }
    return app(req, res);
};

module.exports = handler;
