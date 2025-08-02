const mongoose = require('mongoose');
const config = require('../config/config');

// Prevent multiple simultaneous connection attempts
let isConnecting = false;

// Function to connect to DB
const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        console.log('MongoDB is already connected');
        return;
    }

    if (isConnecting) {
        console.log('MongoDB connection is already in progress');
        return;
    }
    
    try {
        isConnecting = true;

        await mongoose.connect(config.mongoUri, {
            maxPoolSize: config.dbPoolSize.max,
            minPoolSize: config.dbPoolSize.min,
            serverSelectionTimeoutMS: 30000, // 30 seconds in milliseconds
            socketTimeoutMS: 45000, // 45 seconds in milliseconds
            autoIndex: false,
            directConnection: false
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        throw new Error('Database connection failed. Terminating the application.');
    }
};

// Function to disconnect from DB
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('MongoDB disconnected successfully');
    } catch (error) {
        console.error('MongoDB disconnection failed:', error.message);
        throw new Error('Database disconnection failed.');
    }
};

// Function to check if DB is already connected
const isDBConnected = async () => {
    return mongoose.connection.readyState === 1;
};

module.exports = {connectDB, disconnectDB, isDBConnected};
