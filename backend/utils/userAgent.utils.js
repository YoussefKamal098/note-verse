const UAParser = require('ua-parser-js');

/**
 * Parses a User-Agent string
 * and returns an object containing both detailed parsed information and a human-readable summary.
 *
 * @param {string} userAgent - The raw User-Agent string.
 * @returns {{
 *   info: {
 *     browser: {
 *       name: string,
 *       version: string,
 *       major: string,
 *       type: string
 *     },
 *     os: {
 *       name: string,
 *       version: string
 *     },
 *     device: {
 *       type: string,
 *       model: string,
 *       vendor: string
 *     },
 *     engine: {
 *       name: string,
 *       version: string
 *     }
 *   },
 *   readable: string
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

    // Build the detailed info object.
    const info = {
        browser: {
            name: result.browser.name || 'Unknown Browser',
            version: result.browser.version || 'Unknown',
            major: result.browser.major || 'Unknown',
            type: result.browser.type || 'unknown'
        },
        os: {
            name: result.os.name || 'Unknown OS',
            version: result.os.version || 'Unknown'
        },
        device: {
            type: result.device.type || 'Desktop',
            model: result.device.model || 'Unknown',
            vendor: result.device.vendor || 'Unknown'
        },
        engine: {
            name: result.engine.name || 'Unknown',
            version: result.engine.version || 'Unknown'
        }
    };

    // Build a readable summary.
    const browserName = info.browser.name;
    const browserMajorVersion = info.browser.version ? info.browser.version.split('.')[0] : 'Unknown';
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
