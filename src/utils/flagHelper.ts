/**
 * Returns the SVG flag URL for a given country code.
 * Uses flagcdn.com as the primary source and falls back to flagsapi.com
 *
 * @param countryCode Two-letter country code (ISO 3166-1), e.g. "US", "ru", "DE".
 * @returns A Promise that resolves to the correct URL string.
 */
export async function getFlagUrl(countryCode: string): Promise<string> {
    const primaryUrl = `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
    const fallbackUrl = `https://flagsapi.com/${countryCode}/flat/64.png`;

    try {
        // Perform a HEAD request to primaryUrl to check if the file is available
        const res = await fetch(primaryUrl, { method: "HEAD" });
        if (res.ok) {
            return primaryUrl;
        } else {
            return fallbackUrl;
        }
    } catch {
        return fallbackUrl;
    }
}
