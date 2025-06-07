import { describe, it, expect, vi, beforeEach } from "vitest"
import { GeoData } from "@/types"

describe("getGeoData", () => {
    let axiosMock: { get: ReturnType<typeof vi.fn> }
    let getGeoData: (ip: string) => Promise<GeoData>
    let mockProviders: any[]

    const mockGeoData: GeoData = {
        countryCode: "TL",
        timezone: "Test/Zone"
    }

    beforeEach(async () => {
        vi.resetModules()

        axiosMock = { get: vi.fn() }

        mockProviders = [
            {
                name: "provider1",
                buildUrl: vi.fn((ip: string) => `https://provider1.com/${ip}`),
                validateResponse: vi.fn(() => true),
                extractData: vi.fn(() => mockGeoData),
                handleError: vi.fn((error: any) => error.message)
            },
            {
                name: "provider2",
                buildUrl: vi.fn((ip: string) => `https://provider2.com/${ip}`),
                validateResponse: vi.fn(() => true),
                extractData: vi.fn(() => mockGeoData),
                handleError: vi.fn((error: any) => error.message)
            }
        ]

        vi.doMock("axios", () => ({ default: axiosMock }))
        vi.doMock("@/config/geoDataProviders", () => ({
            GEO_PROVIDERS: mockProviders
        }))

        const module = await import("@/composables/useGeoData")
        getGeoData = module.getGeoData
    })

    it("fetches data successfully from first provider and uses cache", async () => {
        axiosMock.get.mockResolvedValue({ data: { country: "TL" }, status: 200 })

        const result1 = await getGeoData("1.2.3.4")

        expect(result1).toEqual(mockGeoData)
        expect(mockProviders[0].buildUrl).toHaveBeenCalledWith("1.2.3.4")
        expect(mockProviders[0].validateResponse).toHaveBeenCalled()
        expect(mockProviders[0].extractData).toHaveBeenCalled()
        expect(axiosMock.get).toHaveBeenCalledTimes(1)

        // Проверяем кеширование
        const result2 = await getGeoData("1.2.3.4")
        expect(result2).toBe(result1)
        expect(axiosMock.get).toHaveBeenCalledTimes(1) // Не должно быть повторных запросов
    })

    it("falls back to second provider when first fails", async () => {
        axiosMock.get
            .mockRejectedValueOnce(new Error("Provider 1 failed"))
            .mockResolvedValueOnce({ data: { country: "TL" }, status: 200 })

        const result = await getGeoData("2.2.2.2")

        expect(result).toEqual(mockGeoData)
        expect(mockProviders[0].buildUrl).toHaveBeenCalledWith("2.2.2.2")
        expect(mockProviders[1].buildUrl).toHaveBeenCalledWith("2.2.2.2")
        expect(axiosMock.get).toHaveBeenCalledTimes(2)
        expect(mockProviders[0].handleError).toHaveBeenCalled()
    })

    it("falls back when first provider validation fails", async () => {
        axiosMock.get.mockResolvedValue({ data: { country: "TL" }, status: 200 })

        mockProviders[0].validateResponse.mockReturnValue(false)

        const result = await getGeoData("3.3.3.3")

        expect(result).toEqual(mockGeoData)
        expect(mockProviders[0].validateResponse).toHaveBeenCalled()
        expect(mockProviders[1].validateResponse).toHaveBeenCalled()
        expect(axiosMock.get).toHaveBeenCalledTimes(2)
    })

    it("throws error when all providers fail", async () => {
        axiosMock.get.mockRejectedValue(new Error("Network failure"))

        await expect(getGeoData("4.4.4.4")).rejects.toThrow("Unable to retrieve geo Data from any source")

        expect(axiosMock.get).toHaveBeenCalledTimes(2) // Оба провайдера попробованы
        expect(mockProviders[0].handleError).toHaveBeenCalled()
        expect(mockProviders[1].handleError).toHaveBeenCalled()
    })

    it("skips to next provider when validation fails but doesn't call handleError", async () => {
        axiosMock.get.mockResolvedValue({ data: { invalid: "data" }, status: 200 })

        mockProviders[0].validateResponse.mockReturnValue(false)
        mockProviders[1].validateResponse.mockReturnValue(true)

        const result = await getGeoData("5.5.5.5")

        expect(result).toEqual(mockGeoData)
        expect(mockProviders[0].handleError).not.toHaveBeenCalled()
        expect(mockProviders[1].extractData).toHaveBeenCalled()
    })

    it("caches data per IP address independently", async () => {
        axiosMock.get.mockResolvedValue({ data: { country: "TL" }, status: 200 })

        const result1 = await getGeoData("6.6.6.6")
        const result2 = await getGeoData("7.7.7.7")
        const result3 = await getGeoData("6.6.6.6")

        expect(result1).toEqual(mockGeoData)
        expect(result2).toEqual(mockGeoData)
        expect(result3).toBe(result1)
        expect(axiosMock.get).toHaveBeenCalledTimes(2)
    })
})