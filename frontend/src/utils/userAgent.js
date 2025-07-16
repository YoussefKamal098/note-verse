const UAParser = require('ua-parser-js');

export const parseUserAgent = (userAgent) => {
    if (!userAgent || typeof userAgent !== 'string' || !userAgent.trim()) {
        return null;
    }

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
        info: {
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
                type: result.device.type || 'Desktop',
                model: result.device.model || null,
                vendor: result.device.vendor || null
            },
            engine: {
                name: result.engine.name || null,
                version: result.engine.version || null
            }
        },
        readable: generateReadableSummary(result)
    };
};

function generateReadableSummary(result) {
    const displayValue = (value, defaultValue = 'Unknown') =>
        (value == null ? defaultValue : value);

    const browserName = displayValue(result.browser.name);
    const browserVersion = displayValue(result.browser.version);
    const osName = displayValue(result.os.name);
    const osVersion = displayValue(result.os.version);
    const deviceType = displayValue(result.device.type, 'Desktop');

    return `${browserName} ${browserVersion} on ${osName} ${osVersion} (${deviceType})`;
}
