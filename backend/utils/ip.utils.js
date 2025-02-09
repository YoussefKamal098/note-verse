/**
 * Parses an IP string and returns a normalized version along with its version.
 *
 * @param {string} ipString - The IP address string (maybe in IPv6-mapped IPv4 format).
 * @returns {object} An object containing:
 *   - ip: The normalized IP address (e.g., "127.0.0.1" instead of "::ffff:127.0.0.1").
 *   - version: A string indicating the IP version ("IPv4" or "IPv6").
 */
function parseIp(ipString) {
    if (typeof ipString !== 'string') {
        return {ip: 'unknown', version: 'unknown'};
    }

    let version;
    let normalizedIp = ipString;

    // Check for IPv6-mapped IPv4 address.
    if (ipString.startsWith('::ffff:')) {
        version = 'IPv4';
        normalizedIp = ipString.substring(7); // remove the "::ffff:" prefix
    } else if (ipString.includes(':')) {
        // Contains colon but not the IPv6-mapped IPv4 prefix
        version = 'IPv6';
    } else {
        version = 'IPv4';
    }

    return {ip: normalizedIp, version};
}

module.exports = {parseIp};
