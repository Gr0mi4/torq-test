import { describe, it, expect, vi } from "vitest"
import { validateIPv4 } from "@/utils/validation"
import type { ValidationResult } from "@/types/index"
import { VALIDATION_ERRS_TEXT } from "@/utils/validation";
import { RESERVED_RANGE_MESSAGES } from "@/config/reservedRanges";

vi.mock("@/utils/reservedRanges", () => ({
    reservedRanges: [
        {
            check: (octets: number[]) => octets[0] === 10,
            message: RESERVED_RANGE_MESSAGES.PRIVATE_10,
        },
        {
            check: (octets: number[]) => octets[0] === 192 && octets[1] === 168,
            message: RESERVED_RANGE_MESSAGES.PRIVATE_192,
        },
    ],
}))

describe("validateIPv4", () => {
    it("returns an error if ip is not a non-empty string", () => {
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

        const result3 = validateIPv4("")
        expect(result3).toEqual<ValidationResult>({
            isValid: false,
            message: VALIDATION_ERRS_TEXT.EMPTY,
        })
    })

    it("returns an error for invalid format (not four octets separated by dots)", () => {
        const invalidFormats = ["123", "1.2.3", "1.2.3.4.5", "abcd.ef.gh.ij", "256.256.256.256.256"]
        invalidFormats.forEach((ip) => {
            const res = validateIPv4(ip)
            expect(res).toEqual<ValidationResult>({
                isValid: false,
                message: VALIDATION_ERRS_TEXT.INVALID,
            })
        })
    })

    it("returns an error when one or more octets are outside the 0–255 range", () => {
        const r1 = validateIPv4("300.1.2.3")
        expect(r1).toEqual<ValidationResult>({
            isValid: false,
            message: VALIDATION_ERRS_TEXT.INVALID_OCTETS + "1",
        })

        const r2 = validateIPv4("1.2.3.555")
        expect(r2).toEqual<ValidationResult>({
            isValid: false,
            message: VALIDATION_ERRS_TEXT.INVALID_OCTETS + "4",
        })

        const r3 = validateIPv4("256.999.10.20")
        expect(r3).toEqual<ValidationResult>({
            isValid: false,
            message: VALIDATION_ERRS_TEXT.INVALID_OCTETS + "1, 2",
        })
    })

    it("returns an error for reserved ranges (using mocked reservedRanges)", () => {
        const reserved1 = validateIPv4("10.0.0.1")
        expect(reserved1).toEqual<ValidationResult>({
            isValid: false,
            message: RESERVED_RANGE_MESSAGES.PRIVATE_10,
        })

        const reserved2 = validateIPv4("192.168.5.5")
        expect(reserved2).toEqual<ValidationResult>({
            isValid: false,
            message: RESERVED_RANGE_MESSAGES.PRIVATE_192,
        })
    })

    it("returns isValid: true for valid, non-reserved IPs", () => {
        const valid1 = validateIPv4("8.8.8.8")
        expect(valid1).toEqual<ValidationResult>({
            isValid: true,
            message: VALIDATION_ERRS_TEXT.VALID,
        })

        const valid2 = validateIPv4("123.45.67.89")
        expect(valid2).toEqual<ValidationResult>({
            isValid: true,
            message: VALIDATION_ERRS_TEXT.VALID,
        })
    })
})