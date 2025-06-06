import axios from "axios";
import { GeoData, RawGeoResponse } from "@/types";

const geoCache = new Map<string, GeoData>();

/**
 * Fetches geographical data for a given IP address using the ip-api.com service, with caching.
 */
export async function getGeoData(ip: string): Promise<GeoData> {
    if (geoCache.has(ip)) {
        return geoCache.get(ip)!;
    }

    let raw: RawGeoResponse;
    try {
        const response = await axios.get<RawGeoResponse>(`http://ip-api.com/json/${ip}`);
        raw = response.data;
    } catch (err: any) {
        throw new Error("Network error or CORS issue");
    }

    if (raw.status !== "success") {
        throw new Error("IP lookup failed " + raw.message);
    }

    const result: GeoData = {
        country: raw.country,
        countryCode: raw.countryCode,
        timezone: raw.timezone,
    };

    geoCache.set(ip, result);
    return result;
}