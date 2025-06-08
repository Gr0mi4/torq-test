import { FLAG_PROVIDERS } from "@/config/flagProviders";

/**
 * Returns the flag URL for a given country code.
 * Uses multiple providers with fallback mechanism.
 *
 * @param countryCode Two-letter country code (ISO 3166-1), e.g. "US", "ru", "DE".
 * @returns A Promise that resolves to the correct URL string.
 */
export async function getFlagUrl(countryCode: string): Promise<string> {
    for (const provider of FLAG_PROVIDERS) {
        try {
            const url = provider.buildUrl(countryCode);

            const response = await fetch(url, { method: "HEAD" });
            if (response.ok) {
                return url;
            }

        } catch (error: any) {
            console.error(error)
            console.warn(`Flag provider ${provider.name} failed:`, error.message);
        }
    }

    throw new Error(`Unable to retrieve flag URL from any source`);
}

