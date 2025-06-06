import { describe, it, expect, vi, beforeEach } from "vitest"
import { IP_SERVICE_URL } from "@/composables/cacheGeoData";

describe("getGeoData", () => {
    beforeEach(() => {
        vi.resetModules()
    })

    it("fetches data successfully and caches the result", async () => {
        const axiosMock = {
            get: vi.fn()
        }
        const rawSuccess = {
            country: "TL",
            timezone: "Test/Zone"
        }
        axiosMock.get.mockResolvedValue({ data: rawSuccess, status: 200 })

        vi.doMock("axios", () => ({ default: axiosMock }))

        const { getGeoData } = await import("@/composables/cacheGeoData")

        const result1 = await getGeoData("1.2.3.4")
        expect(result1).toEqual({
            countryCode: "TL",
            timezone: "Test/Zone"
        })
        expect(axiosMock.get).toHaveBeenCalledTimes(1)
        expect(axiosMock.get).toHaveBeenCalledWith(`${IP_SERVICE_URL}/1.2.3.4/json`)

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

        await expect(getGeoData("2.2.2.2")).rejects.toThrow("Network failure")
        expect(axiosMock.get).toHaveBeenCalledOnce()
        expect(axiosMock.get).toHaveBeenCalledWith(`${IP_SERVICE_URL}/2.2.2.2/json`)
    })

    it("throws 'IP lookup failed <message>' when status !== 200", async () => {
        const axiosMock = {
            get: vi.fn()
        }
        const rawFail = {
            reason: "Invalid IP"
        }
        axiosMock.get.mockResolvedValue({ data: rawFail, status: 400 })

        vi.doMock("axios", () => ({ default: axiosMock }))
        const { getGeoData } = await import("@/composables/cacheGeoData")

        await expect(getGeoData("3.3.3.3")).rejects.toThrow("IP lookup failed: Invalid IP")
        expect(axiosMock.get).toHaveBeenCalledOnce()
        expect(axiosMock.get).toHaveBeenCalledWith(`${IP_SERVICE_URL}/3.3.3.3/json`)
    })

    it("throws 'Ip address private or reserved' when bogon is true", async () => {
        const axiosMock = {
            get: vi.fn()
        }
        const rawBogon = {
            bogon: true
        }
        axiosMock.get.mockResolvedValue({ data: rawBogon, status: 200 })

        vi.doMock("axios", () => ({ default: axiosMock }))
        const { getGeoData } = await import("@/composables/cacheGeoData")

        await expect(getGeoData("192.168.1.1")).rejects.toThrow("Ip address private or reserved")
        expect(axiosMock.get).toHaveBeenCalledOnce()
        expect(axiosMock.get).toHaveBeenCalledWith(`${IP_SERVICE_URL}/192.168.1.1/json`)
    })
})