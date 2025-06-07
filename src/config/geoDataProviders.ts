import { GeoProvider } from "@/types"

export const GEO_PROVIDERS: GeoProvider[] = [
    {
        name: "ipinfo",
        buildUrl: (ip: string) => `https://ipinfo.io/${ip}/json`,
        validateResponse: (response) => {
            return response.status === 200 && !response.data.bogon;
        },
        extractData: (response) => ({
            countryCode: response.data.country,
            timezone: response.data.timezone,
        }),
        handleError: (error) => {
            if (error.response?.data?.bogon) {
                return "IP address is private or reserved";
            }
            return `IP lookup failed: ${error.response?.data?.reason || "Unknown error"}`;
        }
    },
    {
        name: "ipapi",
        buildUrl: (ip: string) => `https://ipapi.co/${ip}/json/`,
        validateResponse: (response) => {
            return response.status === 200 && !response.data.error;
        },
        extractData: (response) => ({
            countryCode: response.data.country_code,
            timezone: response.data.timezone,
        }),
        handleError: (error) => {
            return `IPAPI error: ${error.response?.data?.reason || "Service error"}`;
        }
    }
];

