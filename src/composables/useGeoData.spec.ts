import { describe, it, expect, vi, beforeEach } from "vitest"
import { IP_SERVICE_URL } from "@/composables/useGeoData";

describe("getGeoData", () => {
    let axiosMock: { get: ReturnType<typeof vi.fn> }
    let getGeoData: (ip: string) => Promise<{ countryCode: string; timezone: string }>

    beforeEach(async () => {
        vi.resetModules()

        axiosMock = { get: vi.fn() }

        vi.doMock("axios", () => ({ default: axiosMock }))

        const module = await import("@/composables/useGeoData")
        getGeoData = module.getGeoData
    })

    it("fetches data successfully, and using cache correctly", async () => {
        const rawSuccess = {
            country: "TL",
            timezone: "Test/Zone"
        }
        axiosMock.get.mockResolvedValue({ data: rawSuccess, status: 200 })

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
        axiosMock.get.mockRejectedValue(new Error("Network failure"))

        await expect(getGeoData("2.2.2.2")).rejects.toThrow("Network failure")
        expect(axiosMock.get).toHaveBeenCalledOnce()
        expect(axiosMock.get).toHaveBeenCalledWith(`${IP_SERVICE_URL}/2.2.2.2/json`)
    })

    it("throws 'IP lookup failed <message>' when status !== 200", async () => {
        const rawFail = {
            reason: "Invalid IP"
        }
        axiosMock.get.mockResolvedValue({ data: rawFail, status: 400 })

        await expect(getGeoData("3.3.3.3")).rejects.toThrow("IP lookup failed: Invalid IP")
        expect(axiosMock.get).toHaveBeenCalledOnce()
        expect(axiosMock.get).toHaveBeenCalledWith(`${IP_SERVICE_URL}/3.3.3.3/json`)
    })

    it("throws 'Ip address private or reserved' when bogon is true", async () => {
        const rawBogon = {
            bogon: true
        }
        axiosMock.get.mockResolvedValue({ data: rawBogon, status: 200 })

        await expect(getGeoData("192.168.1.1")).rejects.toThrow("Ip address private or reserved")
        expect(axiosMock.get).toHaveBeenCalledOnce()
        expect(axiosMock.get).toHaveBeenCalledWith(`${IP_SERVICE_URL}/192.168.1.1/json`)
    })
})