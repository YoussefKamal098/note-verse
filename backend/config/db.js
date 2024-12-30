const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri, {
            maxPoolSize: config.dbPoolSize.max,
            minPoolSize: config.dbPoolSize.min,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            autoIndex: false,
            directConnection: false
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        throw new Error('Database connection failed. Terminating the application.');
    }
};

module.exports = connectDB;
