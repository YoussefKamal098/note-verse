const fs = require('fs');
const path = require('path');
const {createLogger, format, transports} = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const config = require('../config/config');

/**
 * LoggerService
 *
 * Encapsulates the Winston logger configuration with daily rotating file transports.
 * Exposes a clean interface to log messages at various levels (debug, info, warn, error)
 * and provides a generalized stream interface for any component that expects a stream-like object.
 *
 * The log format is fully configurable via the `formatOptions` parameter.
 *
 * @param {LoggerServiceConstructorOptions} [options] - Configuration options for the logger.
 */
class LoggerService {
    /**
     * The directory where log files will be stored.
     * @type {string}
     * @private
     */
    #logDir;

    /**
     * Private Winston logger instance.
     * @type {import('winston').Logger}
     * @private
     */
    #logger;

    /**
     * Creates an instance of LoggerService.
     * @param {LoggerServiceConstructorOptions} [options={}] - Configuration options for the logger.
     */
    constructor({
                    dir = "./logs",
                    transportOptions: {
                        datePattern = 'YYYY-MM-DD',
                        zippedArchive = true,
                        maxSize = '20m',
                        maxFiles = '14d',
                        enableConsole = true,
                    } = {},
                    formatOptions = {timestampFormat: 'YYYY-MM-DD HH:mm:ss'},
                } = {}) {
        this.#logDir = dir;

        // Ensure the log directory exists.
        this.#ensureLogDirectoryExists();
        // Create the custom format using provided options (or default if not provided).
        const customFormat = this.#createCustomFormat(formatOptions);

        try {
            this.transports = this.#createTransports({
                datePattern,
                zippedArchive,
                maxSize,
                maxFiles,
                enableConsole,
            });
        } catch (err) {
            console.error('Error creating logger transports:', err);
            throw err;
        }

        try {
            this.#logger = createLogger({
                format: customFormat,
                transports: this.transports,
                exitOnError: false,
            });
        } catch (err) {
            console.error('Error creating Winston logger:', err);
            throw err;
        }

        // Setup a default stream for general logging integration.
        this.#logger.stream = {
            write: (message) => this.info(message.trim()),
        };
    }

    /**
     * Provides a generalized stream interface for logging.
     *
     * This stream object implements a `write` method that accepts a message and logs it at the info level.
     * It can be used with any component that expects a stream-like object.
     *
     * @example
     * const logger = require('./services/logger.service');
     * app.use(morgan('combined', { stream: logger.stream }));
     *
     * @returns {object} An object with a `write` method for logging messages.
     */
    get stream() {
        return this.#logger.stream;
    }

    /**
     * Ensures that the log directory exists. Creates the directory recursively if it does not.
     * @private
     */
    #ensureLogDirectoryExists() {
        if (!fs.existsSync(this.#logDir)) {
            try {
                fs.mkdirSync(this.#logDir, {recursive: true});
            } catch (err) {
                console.error(`Failed to create log directory ${this.#logDir}:`, err);
                throw err;
            }
        }
    }

    /**
     * Creates and returns a custom log format based on the provided format options.
     *
     * @param {LoggerFormatOptions} formatOptions - Options for customizing the log format.
     * @returns {import('logform').Format} The combined log format.
     * @private
     */
    #createCustomFormat({timestampFormat, formatter} = {}) {
        // If a custom formatter function is provided, use it.
        if (formatter && typeof formatter === 'function') {
            return format.combine(
                format.timestamp({format: timestampFormat}),
                format.printf(({timestamp, level, message, ...meta}) => {
                    return formatter({timestamp, level, message, meta});
                })
            );
        }
        // Otherwise, use the default formatting.
        return format.combine(
            format.timestamp({format: timestampFormat}),
            format.printf(({timestamp, level, message, ...meta}) => {
                const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
                return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
            })
        );
    }

    /**
     * Creates and returns an array of Winston transports.
     * Includes daily rotating file transports for error, warn, and info levels,
     * plus a console transport for development if enabled.
     *
     * @param {TransportOptions} transportOptions - Options for configuring transports.
     * @returns {Array} Array of Winston transports.
     * @private
     */
    #createTransports(transportOptions) {
        const {datePattern, zippedArchive, maxSize, maxFiles, enableConsole} = transportOptions;

        // Transport for error-level logs.
        const errorTransport = new DailyRotateFile({
            level: 'error',
            filename: path.join(this.#logDir, 'error-%DATE%.log'),
            datePattern,
            zippedArchive,
            maxSize,
            maxFiles,
        });

        // Transport for warn-level logs.
        const warnTransport = new DailyRotateFile({
            level: 'warn',
            filename: path.join(this.#logDir, 'warn-%DATE%.log'),
            datePattern,
            zippedArchive,
            maxSize,
            maxFiles,
        });

        // Transport for info-level logs.
        const infoTransport = new DailyRotateFile({
            level: 'info',
            filename: path.join(this.#logDir, 'info-%DATE%.log'),
            datePattern,
            zippedArchive,
            maxSize,
            maxFiles,
        });

        // Console transport for development.
        const consoleTransport = new transports.Console({
            level: 'debug',
        });

        return [errorTransport, warnTransport, infoTransport, ...(enableConsole ? [consoleTransport] : [])];
    }

    /**
     * Logs a message at the debug level.
     * @param {string} message - The log message.
     * @param {LogMetadata} [meta={}] - Additional metadata for the log.
     */
    debug(message, meta = {}) {
        this.#logger.debug(message, meta);
    }

    /**
     * Logs a message at the info level.
     * @param {string} message - The log message.
     * @param {LogMetadata} [meta={}] - Additional metadata for the log.
     */
    info(message, meta = {}) {
        this.#logger.info(message, meta);
    }

    /**
     * Logs a message at the warned level.
     * @param {string} message - The log message.
     * @param {LogMetadata} [meta={}] - Additional metadata for the log.
     */
    warn(message, meta = {}) {
        this.#logger.warn(message, meta);
    }

    /**
     * Logs a message at the error level.
     * @param {string} message - The log message.
     * @param {LogMetadata} [meta={}] - Additional metadata for the log.
     */
    error(message, meta = {}) {
        this.#logger.error(message, meta);
    }
}

module.exports = new LoggerService({dir: config.logsDir});
