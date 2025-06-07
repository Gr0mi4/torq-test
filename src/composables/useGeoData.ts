import axios from "axios";
import { GeoData } from "@/types";

const geoCache = new Map<string, GeoData>();

/**
 * Fetches geographical data with caching and number of fallbacks
 */
import { GEO_PROVIDERS } from "@/config/geoDataProviders";

export async function getGeoData(ip: string): Promise<GeoData> {
    const cached = geoCache.get(ip);
    if (cached) return cached;

    for (const provider of GEO_PROVIDERS) {
        try {
            const url = provider.buildUrl(ip);
            const response = await axios.get(url);

            if (!provider.validateResponse(response)) {
                continue;
            }

            const result = provider.extractData(response);

            geoCache.set(ip, result);

            return result;

        } catch (error: any) {
            const errorMessage = provider.handleError?.(error);
            console.warn(`Provider ${provider.name} failed:`, errorMessage);
        }
    }

    throw new Error(`Unable to retrieve geo Data from any source`);
}
