import { describe, it, expect } from "vitest"
import { GEO_PROVIDERS } from "@/config/geoDataProviders"

const [ipinfoProvider, ipapiProvider] = GEO_PROVIDERS

describe("ipinfo provider", () => {
    describe("buildUrl", () => {
        it("builds correct URL for IP", () => {
            const url = ipinfoProvider.buildUrl("1.2.3.4")
            expect(url).toBe("https://ipinfo.io/1.2.3.4/json")
        })

        it("handles different IP formats", () => {
            expect(ipinfoProvider.buildUrl("192.168.1.1")).toBe("https://ipinfo.io/192.168.1.1/json")
            expect(ipinfoProvider.buildUrl("8.8.8.8")).toBe("https://ipinfo.io/8.8.8.8/json")
        })
    })

    describe("validateResponse", () => {
        it("returns true for successful response", () => {
            const response = {
                status: 200,
                data: {
                    country: "US",
                    timezone: "America/New_York",
                    city: "New York"
                }
            }
            expect(ipinfoProvider.validateResponse(response)).toBe(true)
        })

        it("returns false for non-200 status", () => {
            const response = {
                status: 400,
                data: { country: "US" }
            }
            expect(ipinfoProvider.validateResponse(response)).toBe(false)
        })

        it("returns false when bogon is true", () => {
            const response = {
                status: 200,
                data: {
                    bogon: true,
                    country: "US"
                }
            }
            expect(ipinfoProvider.validateResponse(response)).toBe(false)
        })


        it("returns true when bogon is undefined", () => {
            const response = {
                status: 200,
                data: {
                    country: "US",
                    timezone: "America/New_York"
                }
            }
            expect(ipinfoProvider.validateResponse(response)).toBe(true)
        })
    })

    describe("extractData", () => {
        it("extracts data correctly", () => {
            const response = {
                status: 200,
                data: {
                    country: "US",
                    timezone: "America/New_York",
                    city: "New York"
                }
            }

            const result = ipinfoProvider.extractData(response)

            expect(result).toEqual({
                countryCode: "US",
                timezone: "America/New_York"
            })
        })

        it("handles missing optional fields", () => {
            const response = {
                status: 200,
                data: {
                    country: "GB"
                }
            }

            const result = ipinfoProvider.extractData(response)

            expect(result).toEqual({
                countryCode: "GB",
                timezone: undefined
            })
        })
    })

    describe("handleError", () => {
        it("handles bogon error specifically", () => {
            const error = {
                response: {
                    data: { bogon: true }
                }
            }
            const message = ipinfoProvider.handleError(error)
            expect(message).toBe("IP address is private or reserved")
        })

        it("handles error with reason", () => {
            const error = {
                response: {
                    data: { reason: "Invalid IP address" }
                }
            }
            const message = ipinfoProvider.handleError(error)
            expect(message).toBe("IP lookup failed: Invalid IP address")
        })

        it("handles error without reason", () => {
            const error = {
                response: {
                    data: {}
                }
            }
            const message = ipinfoProvider.handleError(error)
            expect(message).toBe("IP lookup failed: Unknown error")
        })

        it("handles error without response", () => {
            const error = {
                message: "Network Error"
            }
            const message = ipinfoProvider.handleError(error)
            expect(message).toBe("IP lookup failed: Unknown error")
        })

        it("prioritizes bogon over reason", () => {
            const error = {
                response: {
                    data: {
                        bogon: true,
                        reason: "Some other error"
                    }
                }
            }
            const message = ipinfoProvider.handleError(error)
            expect(message).toBe("IP address is private or reserved")
        })
    })
})

describe("ipapi provider", () => {
    describe("buildUrl", () => {
        it("builds correct URL for IP", () => {
            const url = ipapiProvider.buildUrl("1.2.3.4")
            expect(url).toBe("https://ipapi.co/1.2.3.4/json/")
        })

        it("handles different IP formats", () => {
            expect(ipapiProvider.buildUrl("192.168.1.1")).toBe("https://ipapi.co/192.168.1.1/json/")
            expect(ipapiProvider.buildUrl("8.8.8.8")).toBe("https://ipapi.co/8.8.8.8/json/")
        })
    })

    describe("validateResponse", () => {
        it("returns true for successful response", () => {
            const response = {
                status: 200,
                data: {
                    country_code: "US",
                    timezone: "America/New_York",
                    city: "New York"
                }
            }
            expect(ipapiProvider.validateResponse(response)).toBe(true)
        })

        it("returns false for non-200 status", () => {
            const response = {
                status: 500,
                data: { country_code: "US" }
            }
            expect(ipapiProvider.validateResponse(response)).toBe(false)
        })

        it("returns false when error field exists", () => {
            const response = {
                status: 200,
                data: {
                    error: true,
                    reason: "Reserved IP"
                }
            }
            expect(ipapiProvider.validateResponse(response)).toBe(false)
        })

        it("returns false when error is truthy string", () => {
            const response = {
                status: 200,
                data: {
                    error: "Invalid IP",
                    country_code: "US"
                }
            }
            expect(ipapiProvider.validateResponse(response)).toBe(false)
        })

        it("returns true when error is false", () => {
            const response = {
                status: 200,
                data: {
                    error: false,
                    country_code: "US",
                    timezone: "America/New_York"
                }
            }
            expect(ipapiProvider.validateResponse(response)).toBe(true)
        })

        it("returns true when error is undefined", () => {
            const response = {
                status: 200,
                data: {
                    country_code: "US",
                    timezone: "America/New_York"
                }
            }
            expect(ipapiProvider.validateResponse(response)).toBe(true)
        })
    })

    describe("extractData", () => {
        it("extracts data correctly", () => {
            const response = {
                status: 200,
                data: {
                    country_code: "US",
                    timezone: "America/New_York",
                    city: "New York"
                }
            }

            const result = ipapiProvider.extractData(response)

            expect(result).toEqual({
                countryCode: "US",
                timezone: "America/New_York"
            })
        })

        it("handles missing optional fields", () => {
            const response = {
                status: 200,
                data: {
                    country_code: "GB"
                }
            }

            const result = ipapiProvider.extractData(response)

            expect(result).toEqual({
                countryCode: "GB",
                timezone: undefined
            })
        })

        it("handles different country code formats", () => {
            const response = {
                status: 200,
                data: {
                    country_code: "gb",
                    timezone: "Europe/London"
                }
            }

            const result = ipapiProvider.extractData(response)

            expect(result).toEqual({
                countryCode: "gb",
                timezone: "Europe/London"
            })
        })
    })

    describe("handleError", () => {
        it("handles error with reason", () => {
            const error = {
                response: {
                    data: { reason: "Rate limit exceeded" }
                }
            }
            const message = ipapiProvider.handleError(error)
            expect(message).toBe("IPAPI error: Rate limit exceeded")
        })

        it("handles error without reason", () => {
            const error = {
                response: {
                    data: {}
                }
            }
            const message = ipapiProvider.handleError(error)
            expect(message).toBe("IPAPI error: Service error")
        })

        it("handles error without response", () => {
            const error = {
                message: "Network Error"
            }
            const message = ipapiProvider.handleError(error)
            expect(message).toBe("IPAPI error: Service error")
        })

        it("handles error with different error structures", () => {
            const error = {
                response: {
                    data: {
                        error: "Invalid request",
                        reason: "IP not found"
                    }
                }
            }
            const message = ipapiProvider.handleError(error)
            expect(message).toBe("IPAPI error: IP not found")
        })
    })
})

describe("GEO_PROVIDERS array", () => {
    it("contains both providers in correct order", () => {
        expect(GEO_PROVIDERS).toHaveLength(2)
        expect(GEO_PROVIDERS[0].name).toBe("ipinfo")
        expect(GEO_PROVIDERS[1].name).toBe("ipapi")
    })

    it("all providers have required methods", () => {
        GEO_PROVIDERS.forEach(provider => {
            expect(provider).toHaveProperty("name")
            expect(provider).toHaveProperty("buildUrl")
            expect(provider).toHaveProperty("validateResponse")
            expect(provider).toHaveProperty("extractData")
            expect(provider).toHaveProperty("handleError")

            expect(typeof provider.buildUrl).toBe("function")
            expect(typeof provider.validateResponse).toBe("function")
            expect(typeof provider.extractData).toBe("function")
            expect(typeof provider.handleError).toBe("function")
        })
    })
})