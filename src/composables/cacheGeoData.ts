import axios from "axios";
import { GeoData, RawGeoResponse } from "@/types";

const geoCache = new Map<string, GeoData>();

/**
 * Fetches geographical data for a given IP address using the ip-api.com service, with caching.
 */
export async function getGeoData(ip: string): Promise<GeoData> {
    const cached = geoCache.get(ip);
    if (cached) return cached;

    try {
        const { data, status } = await axios.get(`https://ipapi.co/${ip}/json`);

        if (status !== 200 || data.error) {
            throw new Error(`IP lookup failed: ${data.reason || 'Unknown error'}`);
        }

        const result: GeoData = {
            country: data.country,
            countryCode: data.country_code,
            timezone: data.timezone,
        };

        geoCache.set(ip, result);
        return result;

    } catch (err: any) {
        throw new Error("Failed to fetch geolocation data");
    }
}