const UAParser = require('ua-parser-js');

/**
 * Parses a User-Agent string and returns both detailed info and a readable summary.
 *
 * @param {string} userAgent - The raw User-Agent string.
 * @returns {object} An object containing:
 *   - info: An object with detailed parsed information (browser, os, device, engine).
 *   - readable: A concise, human-readable summary (e.g., "Firefox 135 on Ubuntu 20.04 (Desktop)").
 */
function parseUserAgent(userAgent) {
    if (!userAgent || typeof userAgent !== 'string') {
        return {
            info: {},
            readable: 'Unknown'
        };
    }

    // Create a UAParser instance and set the user agent.
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Build the detailed info object.
    const info = {
        browser: {
            name: result.browser.name || 'Unknown Browser',
            version: result.browser.version || ''
        },
        os: {
            name: result.os.name || 'Unknown OS',
            version: result.os.version || ''
        },
        device: result.device.model || 'Desktop',
        engine: {
            name: result.engine.name || '',
            version: result.engine.version || ''
        }
    };

    // Build a readable summary.
    const browserName = info.browser.name;
    const browserMajorVersion = info.browser.version ? info.browser.version.split('.')[0] : '';
    const osName = info.os.name;
    const osVersion = info.os.version;
    const deviceType = info.device;

    // If the OS is Ubuntu and a version is available, include the version.
    let osDisplay = osName;
    if (osName.toLowerCase() === 'ubuntu' && osVersion) {
        osDisplay += ` ${osVersion}`;
    }

    const readable = `${browserName} ${browserMajorVersion} on ${osDisplay} (${deviceType})`;

    return {info, readable};
}

module.exports = {parseUserAgent};
