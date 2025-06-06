import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getFlagUrl } from '@/utils/flagHelper'

describe('getFlagUrl', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('returns the primary URL when fetch HEAD returns ok', async () => {
        // Mock fetch to resolve with ok: true
        const mockFetch = vi.fn().mockResolvedValue({ ok: true })
        vi.stubGlobal('fetch', mockFetch)

        const result = await getFlagUrl('US')
        // Primary URL should be lowercased
        expect(mockFetch).toHaveBeenCalledWith('https://flagcdn.com/us.svg', { method: 'HEAD' })
        expect(result).toBe('https://flagcdn.com/us.svg')
    })

    it('returns the fallback URL when fetch HEAD returns not ok', async () => {
        // Mock fetch to resolve with ok: false (e.g., 404)
        const mockFetch = vi.fn().mockResolvedValue({ ok: false })
        vi.stubGlobal('fetch', mockFetch)

        const result = await getFlagUrl('GB')
        expect(mockFetch).toHaveBeenCalledWith('https://flagcdn.com/gb.svg', { method: 'HEAD' })
        // Fallback uses the original countryCode string unchanged
        expect(result).toBe('https://flagsapi.com/GB/flat/64.png')
    })

    it('returns the fallback URL when fetch throws an error', async () => {
        // Mock fetch to throw (e.g., network error)
        const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
        vi.stubGlobal('fetch', mockFetch)

        const result = await getFlagUrl('RU')
        expect(mockFetch).toHaveBeenCalledWith('https://flagcdn.com/ru.svg', { method: 'HEAD' })
        expect(result).toBe('https://flagsapi.com/RU/flat/64.png')
    })

    it('lowercases primary URL but preserves original case for fallback URL', async () => {
        // Mock fetch to return not ok so fallback is used
        const mockFetch = vi.fn().mockResolvedValue({ ok: false })
        vi.stubGlobal('fetch', mockFetch)

        // Use a mixed-case country code
        const mixedCode = 'dE'
        const result = await getFlagUrl(mixedCode)
        // Primary should be lowercased
        expect(mockFetch).toHaveBeenCalledWith('https://flagcdn.com/de.svg', { method: 'HEAD' })
        expect(result).toBe('https://flagsapi.com/dE/flat/64.png')
    })
})
