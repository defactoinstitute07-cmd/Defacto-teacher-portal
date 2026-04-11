require('./config/loadEnv');

const connectDb = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectDb();

    app.listen(PORT, () => {
        console.log(`Teacher Portal backend running on port ${PORT}`);
    });
}

startServer();
