const path = require('path');
const dotenv = require('dotenv');

try {
    // Only attempt to load .env if not running in Vercel
    if (!process.env.VERCEL) {
        dotenv.config({
            path: path.resolve(__dirname, '../.env')
        });
    }
} catch (error) {
    console.warn('.env file not found, skipping local environment load.');
}

