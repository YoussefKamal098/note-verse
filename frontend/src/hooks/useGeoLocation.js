import {useEffect, useState} from 'react';
import {fetchLocationData} from '@/utils/ipUtils';

/**
 * Custom hook to fetch geolocation info from IP.
 * @param {string} ip - The IP address to look up.
 * @returns {{ location: { city: string, country: string, region: string } | null, loading: boolean }}
 */
export const useGeoLocation = (ip) => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ip) return;

        const fetchLocation = async () => {
            try {
                const locationData = await fetchLocationData(ip);
                setLocation({
                    city: locationData.city || 'Unknown City',
                    country: locationData.country || 'Unknown Country',
                    region: locationData.region || 'Unknown Region'
                });
            } catch (error) {
                setLocation({
                    city: 'Unknown City',
                    country: 'Unknown Country',
                    region: 'Unknown Region'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchLocation();
    }, [ip]);

    return {location, loading};
};
