export interface GeoData {
    countryCode: string;
    timezone: string;
}

export enum RequestStatus {
    Idle = "idle",
    Loading = "loading",
    Success = "success",
    Error = "error",
}

export interface ValidationResult {
    isValid: boolean;
    message: string;
}

export interface ReservedRange {
    check: (octets: number[]) => boolean;
    message: string;
}

export interface RawGeoResponse {
    status: string;
    country: string;
    countryCode: string;
    timezone: string;
    message?: string;
}

export interface GeoProvider {
    name: string;
    buildUrl: (ip: string) => string;
    validateResponse: (response: any) => boolean;
    extractData: (response: any) => GeoData;
    handleError?: (error: any) => string;
}
