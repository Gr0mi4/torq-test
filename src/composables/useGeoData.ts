import axios from "axios";
import { GeoData } from "@/types";

const geoCache = new Map<string, GeoData>();

export const IP_SERVICE_URL = 'https://ipinfo.io';

/**
 * Fetches geographical data for a given IP address using the ipinfo.co service, with caching.
 */
export async function getGeoData(ip: string): Promise<GeoData> {
    const cached = geoCache.get(ip);
    if (cached) return cached;

    try {
        const { data, status } = await axios.get(`${IP_SERVICE_URL}/${ip}/json`);

        if (status !== 200 || data.bogon) {
            let message = `IP lookup failed: ${data.reason || 'Unknown error'}`;
            if (data.bogon) {
                message = 'Ip address private or reserved';
            }
            throw new Error(message);
        }

        const result: GeoData = {
            countryCode: data.country,
            timezone: data.timezone,
        };

        geoCache.set(ip, result);
        return result;

    } catch (err: any) {
        throw new Error(err.message || "Network error or CORS issue");
    }
}