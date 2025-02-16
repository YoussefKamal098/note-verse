const net = require('net');

/**
 * Parses an IP string and returns a normalized version along with its version.
 *
 * @param {string} ipString - The IP address string (maybe in IPv6-mapped IPv4 format).
 * @returns {object} An object containing:
 *   - ip: The normalized IP address (e.g., "127.0.0.1" instead of "::ffff:127.0.0.1").Returns 'unknown' if invalid.
 *   - version: A string indicating the IP version ("IPv4" or "IPv6"), or 'unknown' if invalid.
 */
function parseIp(ipString) {
    if (typeof ipString !== 'string') {
        return {ip: 'unknown', version: 'unknown'};
    }

    // Validate the IP string using Node's built-in net.isIP()
    let valid = net.isIP(ipString);
    if (!valid) {
        return {ip: 'unknown', version: 'unknown'};
    }

    // Handle IPv6-mapped IPv4 addresses.
    if (ipString.startsWith('::ffff:')) {
        const normalizedIp = ipString.substring(7);
        // Validate that the extracted IP is a valid IPv4 address.
        if (net.isIP(normalizedIp) === 4) {
            return {ip: normalizedIp, version: 'IPv4'};
        } else {
            return {ip: 'unknown', version: 'unknown'};
        }
    }

    // Otherwise, return the IP as-is with its detected version.
    if (valid === 4) {
        return {ip: ipString, version: 'IPv4'};
    } else if (valid === 6) {
        return {ip: ipString, version: 'IPv6'};
    }

    return {ip: 'unknown', version: 'unknown'};
}

module.exports = {parseIp};
