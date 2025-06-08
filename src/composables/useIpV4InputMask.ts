import { Ref } from "vue";

enum IPv4Constants {
    MAX_OCTET_LENGTH = 3,
    MAX_OCTETS_COUNT = 4,
    LAST_OCTET_INDEX = 3,
    MAX_OCTET_NUM = 255,
    MAX_DOTS_COUNT = 3,
}

/**
 * Fixes leading zeros for octet
 * @param octet
 */
export function fixLeadingZeros(octet: string): string {
    return octet.replace(/^0+(\d)/, "$1") || (octet === "" ? "" : "0");
}

/**
 * Sanitizes IP octets by limiting length and value, and fixing leading zeros
 * @param rawValue
 */
export function sanitizeRawValue(rawValue: string): string {
    const octets: string[] = rawValue.split(".");
    const sanitizedOctets = octets.map((oct, index) => {
        // Limit max octet length
        if (oct.length > IPv4Constants.MAX_OCTET_LENGTH) {
            oct = oct.slice(0, IPv4Constants.MAX_OCTET_LENGTH);
        }

        const num = parseInt(oct, 10);
        if (num > IPv4Constants.MAX_OCTET_NUM) {
            return `${IPv4Constants.MAX_OCTET_NUM}`;
        }

        // Remove leading zeros AFTER user finished it, or if it's last octet
        if (index < octets.length - 1 || index === IPv4Constants.LAST_OCTET_INDEX) {
            oct = fixLeadingZeros(oct)
        }

        return oct;
    });

    return sanitizedOctets.join(".");
}

/**
 * Function decides whether to add a dot after an octet in an IP address input.
 * Part of input helper function
 * @param octet
 * @param currentOctetsCount
 */
export function shouldAddAutoDot(octet: string, currentOctetsCount: number): boolean {
    if (currentOctetsCount >= IPv4Constants.MAX_OCTETS_COUNT) return false;

    if (!octet || octet.length === 0) return false;

    const num = parseInt(octet);
    if (isNaN(num)) return false;

    if (octet.length === IPv4Constants.MAX_OCTET_LENGTH) {
        return num <= IPv4Constants.MAX_OCTET_NUM;
    }

    if (octet.length === 2 && num >= 26) return true;

    return num >= 256;
}

/**
 * Generates a random IP address with octets of 1 to 3 digits, each digit being 0, 1, or 2.
 */
export function generateRandomIp(): string {
    const generateRandomOctet = (): string => {
        const MIN_OCTET_LENGTH = 1;
        const MAX_AMOUNT_OF_HUNDREDS = 3;
        const length = Math.floor(Math.random() * IPv4Constants.MAX_OCTET_LENGTH) + MIN_OCTET_LENGTH;
        let octet = "";

        for (let i = 0; i < length; i++) {
            octet += String(Math.floor(Math.random() * MAX_AMOUNT_OF_HUNDREDS));
        }

        return octet;
    }

    const octets: string[] = [];

    for (let i = 0; i < IPv4Constants.MAX_OCTETS_COUNT; i++) {
        octets.push(fixLeadingZeros(generateRandomOctet()));
    }

    return octets.join(".");
}

/**
 * Applies an input masking behavior to an HTML input element for IP address entry.
 * The method facilitates handling of keyboard inputs, paste events, and helps format the IP address.
 *
 * @param {Ref<string>} ip - A reactive reference for the IP address string being edited.
 * @param {Ref<HTMLInputElement | null>} inputEl - A reactive reference to the HTML input element
 * @return {Object} An object containing functions to handle keypress events, paste events, and IP input formatting.
 */
export function useIpV4InputMask(ip: Ref<string>, inputEl: Ref<HTMLInputElement | null>) {
    function onKeypress(event: KeyboardEvent) {
        if (event.key.length > 1 || event.ctrlKey || event.metaKey) return;

        if (event.key === ".") {
            const currentDots = (ip.value.match(/\./g) || []).length;
            if (currentDots >= IPv4Constants.MAX_DOTS_COUNT) {
                event.preventDefault();
                return;
            }
        }

        // Allow only digits and dots
        if (!/[\d.]/.test(event.key)) {
            event.preventDefault();
        }
    }

    function onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const rawValue = event.clipboardData?.getData("text") || "";

        ip.value = rawValue.replace(/[^0-9.]/g, "");
    }

    function ipInputHelper(event: Event) {
        const inputEvent = event as InputEvent;
        // Avoid undeletable dots
        if (inputEvent.inputType?.startsWith("delete")) {
            return;
        }

        const rawValue: string = (event.target as HTMLInputElement).value;
        ip.value = sanitizeRawValue(rawValue);

        const octets = ip.value.split(".");
        const lastOctet = octets[octets.length - 1];

        if (shouldAddAutoDot(lastOctet, octets.length)) {
            ip.value = ip.value + ".";
        }
        if (octets.length === IPv4Constants.MAX_OCTETS_COUNT && lastOctet.length === IPv4Constants.MAX_OCTET_LENGTH) {
            inputEl.value?.blur();
        }
    }

    return { onKeypress, onPaste, ipInputHelper, generateRandomIp };
}
