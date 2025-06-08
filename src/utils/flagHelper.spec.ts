import { describe, it, expect, vi, beforeEach } from "vitest"
import { getFlagUrl } from "@/utils/flagHelper"

vi.mock("@/config/flagProviders", () => ({
    FLAG_PROVIDERS: [
        {
            name: "flagcdn",
            buildUrl: (countryCode: string) => `https://flagcdn.com/${countryCode.toLowerCase()}.svg`
        },
        {
            name: "flagsapi",
            buildUrl: (countryCode: string) => `https://flagsapi.com/${countryCode}/flat/64.png`
        }
    ]
}))

describe("getFlagUrl", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it("returns the primary URL when fetch HEAD returns ok", async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true })
        vi.stubGlobal("fetch", mockFetch)

        const result = await getFlagUrl("US")

        expect(mockFetch).toHaveBeenCalledWith("https://flagcdn.com/us.svg", { method: "HEAD" })
        expect(result).toBe("https://flagcdn.com/us.svg")
    })

    it("returns the fallback URL when fetch HEAD returns not ok", async () => {
        const mockFetch = vi.fn()
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: true })
        vi.stubGlobal("fetch", mockFetch)

        const result = await getFlagUrl("GB")
        expect(mockFetch).toHaveBeenCalledWith("https://flagcdn.com/gb.svg", { method: "HEAD" })
        expect(result).toBe("https://flagsapi.com/GB/flat/64.png")
    })

    it("returns the fallback URL when fetch throws an error", async () => {
        const mockFetch = vi.fn()
            .mockRejectedValueOnce(new Error("Network error"))
            .mockResolvedValueOnce({ ok: true })
        vi.stubGlobal("fetch", mockFetch)

        const result = await getFlagUrl("RU")
        expect(mockFetch).toHaveBeenCalledWith("https://flagcdn.com/ru.svg", { method: "HEAD" })
        expect(result).toBe("https://flagsapi.com/RU/flat/64.png")
    })

    it("lowercases primary URL but preserves original case for fallback URL", async () => {
        // Mock fetch to return not ok so fallback is used
        const mockFetch = vi.fn()
            .mockResolvedValueOnce({ ok: false })
            .mockResolvedValueOnce({ ok: true })
        vi.stubGlobal("fetch", mockFetch)


        const mixedCode = "dE"
        const result = await getFlagUrl(mixedCode)

        expect(mockFetch).toHaveBeenCalledWith("https://flagcdn.com/de.svg", { method: "HEAD" })
        expect(result).toBe("https://flagsapi.com/dE/flat/64.png")
    })
})