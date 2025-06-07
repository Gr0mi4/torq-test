import { ValidationResult } from '@/types/index';
import { reservedRanges } from "@/utils/reservedRanges";

export const VALIDATION_ERRS_TEXT = {
    EMPTY: 'IP should not be blank',
    INVALID: 'IP address is not valid',
    VALID: 'Valid IPv4 address',
    INVALID_OCTETS: 'Invalid octet(s) at position(s): '
}

export function validateIPv4(ip: string): ValidationResult {
    if (!ip || typeof ip !== 'string') {
        return { isValid: false, message: VALIDATION_ERRS_TEXT.EMPTY };
    }

    // Basic format check
    const ipv4FormatRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4FormatRegex.test(ip)) {
        return { isValid: false, message: VALIDATION_ERRS_TEXT.INVALID };
    }

    // Split the IP into octets and validate each one, ensuring they are in the range 0-255
    const octets: number[] = ip.split('.').map(Number);
    const invalidIndices: number[] = [];

    octets.forEach((octet, index) => {
        if (octet < 0 || octet > 255) {
            invalidIndices.push(index + 1);
        }
    });

    if (invalidIndices.length > 0) {
        return {
            isValid: false,
            message: VALIDATION_ERRS_TEXT.INVALID_OCTETS + invalidIndices.join(', ')
        };
    }

    // Check if the IP address is in a reserved range
    const reservedError = checkReservedRanges(ip);
    if (reservedError) {
        return { isValid: false, message: reservedError };
    }

    return { isValid: true, message: 'Valid IPv4 address' };
}

/**
 * Checks if the IP address is in a reserved range.
 * @param ip
 */
function checkReservedRanges(ip: string): string | null {
    const octets = ip.split('.').map(Number);

    for (const range of reservedRanges) {
        if (range.check(octets)) {
            return range.message;
        }
    }

    return null;
}

/**
 * Fixes leading zeros and empty octets on input
 * @param value
 */
export function fixLeadingZeros(value: string): string {
    return value.split('.')
        .map(octet => {
            return octet.replace(/^0+(\d)/, '$1') || (octet === '' ? '' : '0');
        })
        .join('.');
}