/**
 * @typedef {Object} LogMetadata
 * @property {string} [requestId] - A unique identifier (e.g. UUID) for correlating logs with a specific request.
 * @property {string} [userId] - The identifier of the user associated with the log entry.
 * @property {string} [module] - The module or component name from which the log originates.
 * @property {string} [stack] - The error stack trace if the log entry pertains to an error.
 * @property {any} [extra] - Any additional custom metadata that should be logged.
 */

/**
 * @typedef {Object} LoggerFormatOptions
 * @property {string} [timestampFormat="YYYY-MM-DD HH:mm:ss"] - The format for timestamps in log entries (uses moment-style formatting).
 * @property {Function} [formatter] - A custom formatter function to format log entries.
 * The function receives an object with the following properties:
 *   - {@type string} timestamp - The timestamp of the log entry.
 *   - {@type string} level - The log level (e.g. 'info', 'error').
 *   - {@type string} message - The main log message.
 *   - {@type Object} meta - Any additional metadata provided.
 * The function should return a formatted string representing the log entry.
 */

/**
 * @typedef {Object} TransportOptions
 * @property {string} [datePattern="YYYY-MM-DD"] - The date pattern for log file rotation.
 * @property {boolean} [zippedArchive=true] - Whether to compress (gzip) rotated log files.
 * @property {string} [maxSize="20m"] - The maximum size of a log file before rotation occurs (e.g. '20m' for 20 megabytes).
 * @property {string} [maxFiles="14d"] - The maximum number of rotated log files or days to retain logs.
 * @property {boolean} [enableConsole=true] - Whether console logging is enabled.
 */

/**
 * @typedef {Object} LoggerServiceConstructorOptions
 * @property {string} [dir] - The directory where log files will be stored.
 * Defaults to `./logs` if not provided.
 * @property {TransportOptions} [transportOptions] - Options for configuring the file transports.
 * @property {LoggerFormatOptions} [formatOptions] - Options for customizing the log entry format.
 */
