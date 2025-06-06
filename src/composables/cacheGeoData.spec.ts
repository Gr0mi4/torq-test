import { describe, it, expect, vi, beforeEach } from "vitest"

describe("getGeoData", () => {
    beforeEach(() => {
        vi.resetModules()
    })

    it("fetches data successfully and caches the result", async () => {
        const axiosMock = {
            get: vi.fn()
        }
        const rawSuccess = {
            status: "success",
            country: "Testland",
            countryCode: "TL",
            timezone: "Test/Zone"
        }
        axiosMock.get.mockResolvedValue({ data: rawSuccess })

        vi.doMock("axios", () => ({ default: axiosMock }))

        const { getGeoData } = await import("@/composables/cacheGeoData")

        const result1 = await getGeoData("1.2.3.4")
        expect(result1).toEqual({
            country: "Testland",
            countryCode: "TL",
            timezone: "Test/Zone"
        })
        expect(axiosMock.get).toHaveBeenCalledTimes(1)
        expect(axiosMock.get).toHaveBeenCalledWith("http://ip-api.com/json/1.2.3.4")

        // Caching check
        const result2 = await getGeoData("1.2.3.4")
        expect(result2).toBe(result1)
        expect(axiosMock.get).toHaveBeenCalledTimes(1)
    })

    it("throws 'Network error or CORS issue' when axios.get rejects", async () => {
        const axiosMock = {
            get: vi.fn()
        }
        axiosMock.get.mockRejectedValue(new Error("Network failure"))

        vi.doMock("axios", () => ({ default: axiosMock }))
        const { getGeoData } = await import("@/composables/cacheGeoData")

        await expect(getGeoData("2.2.2.2")).rejects.toThrow("Network error or CORS issue")
        expect(axiosMock.get).toHaveBeenCalledOnce()
        expect(axiosMock.get).toHaveBeenCalledWith("http://ip-api.com/json/2.2.2.2")
    })

    it("throws 'IP lookup failed <message>' when status !== 'success'", async () => {
        const axiosMock = {
            get: vi.fn()
        }
        const rawFail = {
            status: "fail",
            message: "Invalid IP"
        }
        axiosMock.get.mockResolvedValue({ data: rawFail })

        vi.doMock("axios", () => ({ default: axiosMock }))
        const { getGeoData } = await import("@/composables/cacheGeoData")

        await expect(getGeoData("3.3.3.3")).rejects.toThrow("IP lookup failed Invalid IP")
        expect(axiosMock.get).toHaveBeenCalledOnce()
        expect(axiosMock.get).toHaveBeenCalledWith("http://ip-api.com/json/3.3.3.3")
    })
})
