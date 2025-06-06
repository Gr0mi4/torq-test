import { nextTick, Ref } from "vue";

/**
 * Function decides whether to add a dot after an octet in an IP address input.
 * Part of input helper function
 * @param octet
 */
export function shouldAddAutoDot(octet: string): boolean {
    if (!octet || octet.length === 0) return false;

    const num = parseInt(octet);
    if (isNaN(num)) return false;

    if (octet.length === 3) {
        return num <= 255;
    }

    if (octet.length === 2 && num >= 26) return true;

    return num >= 256;
}

/**
 * Generates a random IP address with octets of 1 to 3 digits, each digit being 0, 1, or 2.
 */
export function generateRandomIp(): string {
    const octets = [];
    for (let i = 0; i < 4; i++) {
        const len = Math.floor(Math.random() * 3) + 1;
        let octet = '';
        for (let j = 0; j < len; j++) {
            octet += String(Math.floor(Math.random() * 3));
        }
        octets.push(octet);
    }
    return octets.join('.');
}

/**
 * Adds a dot at the end of the input value and moves the cursor to the end.
 * @param inputRef
 * @param inputElRef
 * @param baseValue
 */
function addAutoDot(
    inputRef: { value: string },
    inputElRef: { value: HTMLInputElement | null },
    baseValue: string
) {
    const newValue = baseValue + '.';

    inputRef.value = newValue;

    // Moving cursor after dot
    nextTick(() => {
        if (inputElRef.value) {
            inputElRef.value.setSelectionRange(newValue.length, newValue.length);
        }
    });
}

/**
 * Applies an input masking behavior to an HTML input element for IP address entry.
 * The method facilitates handling of keyboard inputs, paste events, and helps format the IP address.
 *
 * @param {Ref<string>} ip - A reactive reference for the IP address string being edited.
 * @param {Ref<HTMLInputElement | null>} inputEl - A reactive reference to the HTML input element
 * @return {Object} An object containing functions to handle keypress events, paste events, and IP input formatting.
 */
export function useIpInputMask(
    ip: Ref<string>,
    inputEl: Ref<HTMLInputElement | null>
) {

    function onKeypress(event: KeyboardEvent) {
        if (event.key.length > 1 || event.ctrlKey || event.metaKey) return;

        // Regular expression to allow only digits and dots
        if (!/[\d.]/.test(event.key)) {
            event.preventDefault();
        }
    }

    function onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const raw = event.clipboardData?.getData('text') || '';

        ip.value = raw.replace(/[^0-9.]/g, '');
    }

    function ipInputHelper(event: Event) {
        const inputEvent = event as InputEvent;
        // Make sure we avoid undeletable dots
        if (inputEvent.inputType && inputEvent.inputType.startsWith('delete')) {
            return;
        }

        const raw: string = (event.target as HTMLInputElement).value;

        let octets: string[] = raw.split('.');

        // Sanitize octets: limit length to 3 digits, and ensure each octet is within 0-255
        const sanitizedOctets = octets.map(oct => {
            if (oct.length > 3) {
                oct = oct.slice(0, 3);
            }
            const num = parseInt(oct, 10);
            // Octets more then 255 will be replaced with '255',
            if (num > 255) {
                return '255';
            }
            return oct;
        });

        const sanitizedValue = sanitizedOctets.join('.');
        if (sanitizedValue !== raw) {
            ip.value = sanitizedValue;
            octets = sanitizedValue.split('.');
        }

        const lastOctet = octets[octets.length - 1];
        const octetsCount = octets.length;

        if (shouldAddAutoDot(lastOctet) && octetsCount < 4) {
            addAutoDot(ip, inputEl, sanitizedValue);
            return;
        } else if (octetsCount === 4) {
            console.log(ip.value, 'ip value')
            if (lastOctet.length === 3) {
                inputEl.value?.blur();
            }
        }
    }

    return { onKeypress, onPaste, ipInputHelper, generateRandomIp };
}
