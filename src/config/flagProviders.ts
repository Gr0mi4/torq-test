import { FlagProvider } from "@/types";

export const FLAG_PROVIDERS: FlagProvider[] = [
    {
        name: "flagcdn",
        buildUrl: (countryCode: string) => `https://flagcdn.com/${countryCode.toLowerCase()}.svg`,
    },
    {
        name: 'flagIcons.lipis.dev',
        buildUrl: (countryCode: string) => `https://flagicons.lipis.dev/flags/4x3/${countryCode.toLowerCase()}.svg`
    }
];
