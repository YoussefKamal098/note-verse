/**
 * Gracefully shuts down the application by executing a custom function and then closing the system.
 * @param {Function} func - The custom function to execute before shutting down (e.g., closing database connections).
 */
async function gracefulShutdown(func) {
    try {
        // Execute custom shutdown function
        if (func && typeof func === 'function') {
            await func();
            console.log('Custom shutdown function executed successfully.');
        }

        // Gracefully shut down the system
        console.log('Shutting down the application...');
        process.exit(0);  // Exit with success status
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);  // Exit with failure status
    }
}

module.exports = {gracefulShutdown};
