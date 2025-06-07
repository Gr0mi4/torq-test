import { describe, it, expect, vi } from 'vitest'
import { validateIPv4, fixLeadingZeros } from '@/utils/validation'
import type { ValidationResult } from '@/types/index'
import { VALIDATION_ERRS_TEXT } from "@/utils/validation";

vi.mock('@/utils/reservedRanges', () => ({
    reservedRanges: [
        {
            // Treat any IP with first octet === 10 as reserved
            check: (octets: number[]) => octets[0] === 10,
            message: 'Reserved range: 10.x.x.x',
        },
        {
            // Treat any IP in 192.168.x.x as reserved
            check: (octets: number[]) => octets[0] === 192 && octets[1] === 168,
            message: 'Reserved range: 192.168.x.x',
        },
    ],
}))

describe('validateIPv4', () => {
    it('returns an error if ip is not a non-empty string', () => {
        const result1 = validateIPv4(null)
        expect(result1).toEqual<ValidationResult>({
            isValid: false,
            message: VALIDATION_ERRS_TEXT.EMPTY,
        })

        const result2 = validateIPv4(undefined)
        expect(result2).toEqual<ValidationResult>({
            isValid: false,
            message: VALIDATION_ERRS_TEXT.EMPTY,
        })

        const result3 = validateIPv4('')
        expect(result3).toEqual<ValidationResult>({
            isValid: false,
            message: VALIDATION_ERRS_TEXT.EMPTY,
        })
    })

    it('returns an error for invalid format (not four octets separated by dots)', () => {
        const invalidFormats = ['123', '1.2.3', '1.2.3.4.5', 'abcd.ef.gh.ij', '256.256.256.256.256']
        invalidFormats.forEach((ip) => {
            const res = validateIPv4(ip)
            expect(res).toEqual<ValidationResult>({
                isValid: false,
                message: VALIDATION_ERRS_TEXT.INVALID,
            })
        })
    })

    it('returns an error when one or more octets are outside the 0–255 range', () => {
        const r1 = validateIPv4('300.1.2.3')
        expect(r1).toEqual<ValidationResult>({
            isValid: false,
            message: VALIDATION_ERRS_TEXT.INVALID_OCTETS + '1',
        })

        const r2 = validateIPv4('1.2.3.555')
        expect(r2).toEqual<ValidationResult>({
            isValid: false,
            message: VALIDATION_ERRS_TEXT.INVALID_OCTETS + '4',
        })

        const r3 = validateIPv4('256.999.10.20')
        expect(r3).toEqual<ValidationResult>({
            isValid: false,
            message: VALIDATION_ERRS_TEXT.INVALID_OCTETS + '1, 2',
        })
    })

    it('returns an error for reserved ranges (using mocked reservedRanges)', () => {
        // First octet 10 should be caught by first mock
        const reserved1 = validateIPv4('10.0.0.1')
        expect(reserved1).toEqual<ValidationResult>({
            isValid: false,
            message: 'Reserved range: 10.x.x.x',
        })

        // 192.168.x.x should be caught by second mock
        const reserved2 = validateIPv4('192.168.5.5')
        expect(reserved2).toEqual<ValidationResult>({
            isValid: false,
            message: 'Reserved range: 192.168.x.x',
        })
    })

    it('returns isValid: true for valid, non-reserved IPs', () => {
        const valid1 = validateIPv4('8.8.8.8')
        expect(valid1).toEqual<ValidationResult>({
            isValid: true,
            message: VALIDATION_ERRS_TEXT.VALID,
        })

        const valid2 = validateIPv4('123.45.67.89')
        expect(valid2).toEqual<ValidationResult>({
            isValid: true,
            message: VALIDATION_ERRS_TEXT.VALID,
        })
    })
})

describe('fixLeadingZeros', () => {
    it('removes leading zeros from each octet, keeping "0" if it is the only digit', () => {
        const cases: Array<{ input: string; expected: string }> = [
            { input: '001.002.003.004', expected: '1.2.3.4' },
            { input: '192.168.001.001', expected: '192.168.1.1' },
            { input: '000.010.020.030', expected: '0.10.20.30' },
            { input: '0.0.0.0', expected: '0.0.0.0' },
            { input: '00.00.00.00', expected: '0.0.0.0' },
        ]

        cases.forEach(({ input, expected }) => {
            expect(fixLeadingZeros(input)).toBe(expected)
        })
    })

    it('preserves empty octets (consecutive dots produce empty segments)', () => {
        // For input ".1.02..003.", segments are ['', '1', '02', '', '003', '']
        // '' → '' (no digits)
        // '1' → '1'
        // '02' → '2'
        // '' → ''
        // '003' → '3'
        // '' → ''
        const input = '.1.02..003.'
        expect(fixLeadingZeros(input)).toBe('.1.2..3.')
    })

    it('leaves a single "0" unchanged', () => {
        const input = '0.10.0.5'
        expect(fixLeadingZeros(input)).toBe('0.10.0.5')
    })
})
