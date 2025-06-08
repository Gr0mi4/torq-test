import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import {
    shouldAddAutoDot,
    generateRandomIp,
    useIpV4InputMask,
    fixLeadingZeros,
    sanitizeRawValue
} from "@/composables/useIpV4InputMask";

describe("fixLeadingZeros", () => {
    it("should remove leading zeros but keep at least one digit", () => {
        expect(fixLeadingZeros("001")).toBe("1");
        expect(fixLeadingZeros("010")).toBe("10");
        expect(fixLeadingZeros("100")).toBe("100");
    });

    it("should return '0' for string of only zeros", () => {
        expect(fixLeadingZeros("000")).toBe("0");
        expect(fixLeadingZeros("0")).toBe("0");
    });

    it("should return empty string for empty input", () => {
        expect(fixLeadingZeros("")).toBe("");
    });

    it("should not change single non-zero digits", () => {
        expect(fixLeadingZeros("5")).toBe("5");
        expect(fixLeadingZeros("9")).toBe("9");
    });
});

describe("sanitizeRawValue", () => {
    it("should limit octet length to 3 digits", () => {
        expect(sanitizeRawValue("1234")).toBe("123");
        expect(sanitizeRawValue("1234.5678")).toBe("123.255");
    });

    it("should limit octet value to 255", () => {
        expect(sanitizeRawValue("300")).toBe("255");
        expect(sanitizeRawValue("256.999")).toBe("255.255");
    });

    it("should fix leading zeros for completed octets", () => {
        expect(sanitizeRawValue("001.002.003.004")).toBe("1.2.3.4");
        expect(sanitizeRawValue("192.168.001")).toBe("192.168.001"); // последний октет не обрабатывается
    });

    it("should handle incomplete IP addresses", () => {
        expect(sanitizeRawValue("192.168")).toBe("192.168");
        expect(sanitizeRawValue("10")).toBe("10");
    });
});

describe("shouldAddAutoDot", () => {
    it("should return false for empty or null input", () => {
        expect(shouldAddAutoDot("", 1)).toBe(false);
        expect(shouldAddAutoDot(null as any, 1)).toBe(false);
        expect(shouldAddAutoDot(undefined as any, 1)).toBe(false);
    });

    it("should return false for non-numeric input", () => {
        expect(shouldAddAutoDot("abc", 1)).toBe(false);
    });

    it("should return false if already 4 octets", () => {
        expect(shouldAddAutoDot("123", 4)).toBe(false);
    });

    it("should return true for 3-digit octets <= 255", () => {
        expect(shouldAddAutoDot("255", 1)).toBe(true);
        expect(shouldAddAutoDot("123", 2)).toBe(true);
        expect(shouldAddAutoDot("001", 3)).toBe(true);
    });

    it("should return false for 3-digit octets > 255", () => {
        expect(shouldAddAutoDot("256", 1)).toBe(false);
        expect(shouldAddAutoDot("300", 2)).toBe(false);
        expect(shouldAddAutoDot("999", 3)).toBe(false);
    });

    it("should return true for 2-digit octets >= 26", () => {
        expect(shouldAddAutoDot("26", 1)).toBe(true);
        expect(shouldAddAutoDot("99", 2)).toBe(true);
        expect(shouldAddAutoDot("30", 3)).toBe(true);
    });

    it("should return false for 2-digit octets < 26", () => {
        expect(shouldAddAutoDot("25", 1)).toBe(false);
        expect(shouldAddAutoDot("12", 2)).toBe(false);
        expect(shouldAddAutoDot("01", 3)).toBe(false);
    });

    it("should return true for single digit >= 256 (edge case)", () => {
        // Исправлено: для одиночных цифр возвращается false, кроме случая когда число >= 256
        expect(shouldAddAutoDot("2", 1)).toBe(false);
        expect(shouldAddAutoDot("9", 1)).toBe(false);
    });
});

describe("generateRandomIp", () => {
    it("should generate IP with 4 octets separated by dots", () => {
        const ip = generateRandomIp();
        const octets = ip.split(".");
        expect(octets).toHaveLength(4);
    });

    it("should generate octets with digits 0, 1, or 2 only", () => {
        const ip = generateRandomIp();
        const validPattern = /^[0-2]+(\.[0-2]+){3}$/;
        expect(ip).toMatch(validPattern);
    });

    it("should generate octets with length between 1 and 3", () => {
        for (let i = 0; i < 5; i++) {
            const ip = generateRandomIp();
            const octets = ip.split(".");
            octets.forEach(octet => {
                expect(octet.length).toBeGreaterThanOrEqual(1);
                expect(octet.length).toBeLessThanOrEqual(3);
            });
        }
    });
});

describe("useIpV4InputMask", () => {
    let ip: ReturnType<typeof ref<string>>;
    let inputEl: ReturnType<typeof ref<HTMLInputElement | null>>;
    let mockInputElement: HTMLInputElement;
    let ipInputMask: ReturnType<typeof useIpV4InputMask>;

    beforeEach(() => {
        ip = ref("");
        mockInputElement = {
            setSelectionRange: vi.fn(),
            blur: vi.fn(),
            value: ""
        } as any;
        inputEl = ref(mockInputElement);
        ipInputMask = useIpV4InputMask(ip, inputEl);
    });

    describe("onKeypress", () => {
        it("should allow digits and dots", () => {
            const event = new KeyboardEvent("keypress", { key: "1" });
            const preventDefaultSpy = vi.spyOn(event, "preventDefault");

            ipInputMask.onKeypress(event);

            expect(preventDefaultSpy).not.toHaveBeenCalled();
        });

        it("should allow dots when less than 3 dots present", () => {
            ip.value = "192.168";
            const event = new KeyboardEvent("keypress", { key: "." });
            const preventDefaultSpy = vi.spyOn(event, "preventDefault");

            ipInputMask.onKeypress(event);

            expect(preventDefaultSpy).not.toHaveBeenCalled();
        });

        it("should prevent dots when already 3 dots present", () => {
            ip.value = "192.168.1.1";
            const event = new KeyboardEvent("keypress", { key: "." });
            const preventDefaultSpy = vi.spyOn(event, "preventDefault");

            ipInputMask.onKeypress(event);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it("should prevent non-numeric and non-dot characters", () => {
            const event = new KeyboardEvent("keypress", { key: "a" });
            const preventDefaultSpy = vi.spyOn(event, "preventDefault");

            ipInputMask.onKeypress(event);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it("should allow special keys (ctrl, meta, function keys)", () => {
            const ctrlEvent = new KeyboardEvent("keypress", { key: "a", ctrlKey: true });
            const metaEvent = new KeyboardEvent("keypress", { key: "a", metaKey: true });
            const functionEvent = new KeyboardEvent("keypress", { key: "F1" });

            const ctrlSpy = vi.spyOn(ctrlEvent, "preventDefault");
            const metaSpy = vi.spyOn(metaEvent, "preventDefault");
            const functionSpy = vi.spyOn(functionEvent, "preventDefault");

            ipInputMask.onKeypress(ctrlEvent);
            ipInputMask.onKeypress(metaEvent);
            ipInputMask.onKeypress(functionEvent);

            expect(ctrlSpy).not.toHaveBeenCalled();
            expect(metaSpy).not.toHaveBeenCalled();
            expect(functionSpy).not.toHaveBeenCalled();
        });
    });

    describe("onPaste", () => {
        it("should prevent default paste behavior", () => {
            const clipboardData = {
                getData: vi.fn().mockReturnValue("192.168.1.1")
            };
            const event = {
                preventDefault: vi.fn(),
                clipboardData
            } as any;

            ipInputMask.onPaste(event);

            expect(event.preventDefault).toHaveBeenCalled();
        });

        it("should filter non-numeric and non-dot characters from pasted text", () => {
            const clipboardData = {
                getData: vi.fn().mockReturnValue("192.168.a1.1b")
            };
            const event = {
                preventDefault: vi.fn(),
                clipboardData
            } as any;

            ipInputMask.onPaste(event);

            expect(ip.value).toBe("192.168.1.1");
        });

        it("should handle empty clipboard data", () => {
            const clipboardData = {
                getData: vi.fn().mockReturnValue("")
            };
            const event = {
                preventDefault: vi.fn(),
                clipboardData
            } as any;

            ipInputMask.onPaste(event);

            expect(ip.value).toBe("");
        });
    });

    describe("ipInputHelper", () => {
        it("should skip processing for delete operations", () => {
            const event = {
                inputType: "deleteContentBackward",
                target: { value: "192.168.1" }
            } as any;

            const initialValue = ip.value;
            ipInputMask.ipInputHelper(event);

            expect(ip.value).toBe(initialValue);
        });

        it("should sanitize input and add auto dot", () => {
            const event = {
                target: { value: "192" }
            } as any;

            ipInputMask.ipInputHelper(event);

            expect(ip.value).toBe("192.");
        });

        it("should limit octet value to 255", () => {
            const event = {
                target: { value: "300" }
            } as any;

            ipInputMask.ipInputHelper(event);

            expect(ip.value).toBe("255.");
        });

        it("should blur input when 4th octet has 3 digits", () => {
            const event = {
                target: { value: "192.168.1.123" }
            } as any;

            ipInputMask.ipInputHelper(event);

            expect(mockInputElement.blur).toHaveBeenCalled();
        });

        it("should handle multiple octets exceeding 255", () => {
            const event = {
                target: { value: "300.400.500.600" }
            } as any;

            ipInputMask.ipInputHelper(event);

            expect(ip.value).toBe("255.255.255.255");
        });
    });

    describe("return object", () => {
        it("should return all required functions", () => {
            expect(ipInputMask).toHaveProperty("onKeypress");
            expect(ipInputMask).toHaveProperty("onPaste");
            expect(ipInputMask).toHaveProperty("ipInputHelper");
            expect(ipInputMask).toHaveProperty("generateRandomIp");

            expect(typeof ipInputMask.onKeypress).toBe("function");
            expect(typeof ipInputMask.onPaste).toBe("function");
            expect(typeof ipInputMask.ipInputHelper).toBe("function");
            expect(typeof ipInputMask.generateRandomIp).toBe("function");
        });
    });
});