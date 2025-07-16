import axios from 'axios';

export const parseIp = (ipString) => {
    if (typeof ipString !== 'string') {
        return {ip: null, version: null};
    }

    // Simple IPv4 regex
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // Simple IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    // Local ips
    const localIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'];

    if (localIps.includes(ipString)) {
        return {ip: 'local', version: ipv4Regex.test(ipString) ? 'IPv4' : 'IPv6'};
    }

    if (ipv4Regex.test(ipString)) {
        return {ip: ipString, version: 'IPv4'};
    }

    // Handle IPv6-mapped IPv4 addresses (::ffff:192.168.1.1)
    if (ipString.startsWith('::ffff:')) {
        const ipv4Part = ipString.substring(7);
        if (ipv4Regex.test(ipv4Part)) {
            return {ip: ipv4Part, version: 'IPv4'};
        }
    }

    if (ipv6Regex.test(ipString)) {
        return {ip: ipString, version: 'IPv6'};
    }

    return {ip: null, version: null};
};

export const fetchLocationData = async (ip) => {
    const {ip: parsedIp, version} = parseIp(ip);
    if (!parsedIp || version === 'local') {
        return {
            continent: null,
            city: 'Localhost',
            country: 'Development Network',
            region: '',
            ipVersion: version
        };
    }

    try {
        const response = await axios.get(`https://ipwho.is/${parsedIp}`);

        if (!response.data.success) {
            return {
                continent: null,
                city: null,
                country: null,
                region: null,
                ipVersion: version
            };
        }

        return {
            continent: response.data.continent,
            city: response.data.city,
            country: response.data.country,
            region: response.data.region,
            ipVersion: version
        };
    } catch (error) {
        console.error('Error fetching location data:', error);
        return {
            continent: null,
            city: null,
            country: null,
            region: null,
            ipVersion: version
        };
    }
};
