const UAParser = require('ua-parser-js');

/**
 * Parses a User-Agent string
 * and returns an object containing both detailed parsed information and a human-readable summary.
 *
 * @param {string} userAgent - The raw User-Agent string.
 *  @returns {{
 *     info: {
 *       browser: {
 *         name: string | null,
 *         version: string | null,
 *         major: string | null,
 *         type: string | null
 *       },
 *       os: {
 *         name: string | null,
 *         version: string | null
 *       },
 *       device: {
 *         type: string,
 *         model: string | null,
 *         vendor: string | null
 *       },
 *       engine: {
 *         name: string | null,
 *         version: string | null
 *       }
 *     },
 *     readable: string
 * } | null} An object with:
 *   - **info:** Detailed parsed information including:
 *       - **browser:** An object with the browser's `name`, full `version`, `major` version (the first number of the version), and `type`.
 *       - **os:** An object with the operating system's `name` and `version`.
 *       - **device:** An object containing the device `type` (e.g., "Desktop" or "Mobile"), `model`, and `vendor`.
 *       - **engine:** An object with the rendering engine's `name` and `version`.
 *   - **readable:** A concise, human-readable summary (e.g., "Firefox 135 on Ubuntu 20.04 (Desktop)").
 *
 * Returns **null** if the provided userAgent is invalid (e.g., missing, not a string, or only whitespace).
 */
function parseUserAgent(userAgent) {
    // Check if userAgent is provided, is a string, and is not just whitespace.
    if (!userAgent || typeof userAgent !== 'string' || !userAgent.trim()) {
        return null;
    }

    // Create a UAParser instance and set the user agent.
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Build the detailed info object, using null for missing data.
    const info = {
        browser: {
            name: result.browser.name || null,
            version: result.browser.version || null,
            major: result.browser.major || null,
            type: result.browser.type || null
        },
        os: {
            name: result.os.name || null,
            version: result.os.version || null
        },
        device: {
            type: result.device.type || 'Desktop', // Default remains 'Desktop'
            model: result.device.model || null,
            vendor: result.device.vendor || null
        },
        engine: {
            name: result.engine.name || null,
            version: result.engine.version || null
        }
    };

    // Helper to convert null or missing values to "Unknown" for display.
    const displayValue = (value, defaultValue = 'Unknown') => (value == null ? defaultValue : value);

    // Build a readable summary.
    const browserName = displayValue(info.browser.name);
    const browserMajorVersion = displayValue(info.browser.version) !== 'Unknown'
        ? displayValue(info.browser.version).split('.')[0]
        : 'Unknown';
    const osName = displayValue(info.os.name);
    const osVersion = displayValue(info.os.version);
    const deviceModel = displayValue(info.device.model);
    const deviceType = displayValue(info.device.type, 'Desktop');

    let osDisplay = osName;
    if (osVersion !== 'Unknown') {
        osDisplay += ` ${osVersion}`;
    }
    if (deviceModel !== 'Unknown') {
        osDisplay += ` ${deviceModel}`;
    }

    const readable = `${browserName} ${browserMajorVersion} on ${osDisplay} (${deviceType})`;
    return {info, readable};
}

module.exports = {parseUserAgent};
