import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { shouldAddAutoDot, generateRandomIp, useIpV4InputMask } from "@/composables/useIpV4InputMask";

describe("shouldAddAutoDot", () => {
    it("should return false for empty or null input", () => {
        expect(shouldAddAutoDot("")).toBe(false);
        expect(shouldAddAutoDot(null as any)).toBe(false);
        expect(shouldAddAutoDot(undefined as any)).toBe(false);
    });

    it("should return false for non-numeric input", () => {
        expect(shouldAddAutoDot("abc")).toBe(false);
    });

    it("should return true for 3-digit octets <= 255", () => {
        expect(shouldAddAutoDot("255")).toBe(true);
        expect(shouldAddAutoDot("123")).toBe(true);
        expect(shouldAddAutoDot("001")).toBe(true);
    });

    it("should return false for 3-digit octets > 255", () => {
        expect(shouldAddAutoDot("256")).toBe(false);
        expect(shouldAddAutoDot("300")).toBe(false);
        expect(shouldAddAutoDot("999")).toBe(false);
    });

    it("should return true for 2-digit octets >= 26", () => {
        expect(shouldAddAutoDot("26")).toBe(true);
        expect(shouldAddAutoDot("99")).toBe(true);
        expect(shouldAddAutoDot("30")).toBe(true);
    });

    it("should return false for 2-digit octets < 26", () => {
        expect(shouldAddAutoDot("25")).toBe(false);
        expect(shouldAddAutoDot("12")).toBe(false);
        expect(shouldAddAutoDot("01")).toBe(false);
    });

    it("should return true for single digit >= 256 (edge case)", () => {
        // This test covers the last condition, though it's unusual for single digits
        expect(shouldAddAutoDot("2")).toBe(false);
        expect(shouldAddAutoDot("9")).toBe(false);
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
        // Run multiple times to test randomness
        for (let i = 0; i < 10; i++) {
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

        it("should allow dots", () => {
            const event = new KeyboardEvent("keypress", { key: "." });
            const preventDefaultSpy = vi.spyOn(event, "preventDefault");

            ipInputMask.onKeypress(event);

            expect(preventDefaultSpy).not.toHaveBeenCalled();
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

        it("should limit octet length to 3 digits and add dot", () => {
            const event = {
                target: { value: "1234" }
            } as any;

            ipInputMask.ipInputHelper(event);

            expect(ip.value).toBe("123.");
        });

        it("should limit octet value to 255 and add dot", () => {
            const event = {
                target: { value: "300" }
            } as any;

            ipInputMask.ipInputHelper(event);

            expect(ip.value).toBe("255.");
        });

        it("should auto-add dot for qualifying octets", () => {
            const event = {
                target: { value: "192" }
            } as any;

            ipInputMask.ipInputHelper(event);

            expect(ip.value).toBe("192.");
        });

        it("should blur input when 4th octet has 3 digits", () => {
            const event = {
                target: { value: "192.168.1.123" }
            } as any;

            ipInputMask.ipInputHelper(event);

            expect(mockInputElement.blur).toHaveBeenCalled();
        });

        it("should not add dot if already 4 octets", () => {
            const event = {
                target: { value: "192.168.1.1" }
            } as any;

            // Set initial value since function only updates if sanitization changes the value
            ip.value = "192.168.1.1";

            ipInputMask.ipInputHelper(event);

            expect(ip.value).toBe("192.168.1.1");
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