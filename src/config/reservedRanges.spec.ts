import { describe, it, expect } from "vitest";
import { reservedRanges, RESERVED_RANGE_MESSAGES } from "./reservedRanges";

describe("reservedRanges", () => {
    describe("Private network 10.0.0.0/8", () => {
        it("should identify 10.x.x.x addresses as private", () => {
            const range = reservedRanges[0];

            expect(range.check([10, 0, 0, 1])).toBe(true);
            expect(range.check([10, 255, 255, 255])).toBe(true);
            expect(range.check([10, 100, 50, 25])).toBe(true);
            expect(range.message).toBe(RESERVED_RANGE_MESSAGES.PRIVATE_10);
        });

        it("should not identify non-10.x.x.x addresses as private 10 range", () => {
            const range = reservedRanges[0];

            expect(range.check([11, 0, 0, 1])).toBe(false);
            expect(range.check([172, 16, 0, 1])).toBe(false);
            expect(range.check([192, 168, 1, 1])).toBe(false);
        });
    });

    describe("Private network 172.16.0.0/12", () => {
        it("should identify 172.16-31.x.x addresses as private", () => {
            const range = reservedRanges[1];

            expect(range.check([172, 16, 0, 1])).toBe(true);
            expect(range.check([172, 31, 255, 255])).toBe(true);
            expect(range.check([172, 20, 10, 5])).toBe(true);
            expect(range.message).toBe(RESERVED_RANGE_MESSAGES.PRIVATE_172);
        });

        it("should not identify addresses outside 172.16-31 range as private 172 range", () => {
            const range = reservedRanges[1];

            expect(range.check([172, 15, 0, 1])).toBe(false);
            expect(range.check([172, 32, 0, 1])).toBe(false);
            expect(range.check([173, 20, 0, 1])).toBe(false);
            expect(range.check([10, 0, 0, 1])).toBe(false);
        });
    });

    describe("Private network 192.168.0.0/16", () => {
        it("should identify 192.168.x.x addresses as private", () => {
            const range = reservedRanges[2];

            expect(range.check([192, 168, 0, 1])).toBe(true);
            expect(range.check([192, 168, 255, 255])).toBe(true);
            expect(range.check([192, 168, 1, 100])).toBe(true);
            expect(range.message).toBe(RESERVED_RANGE_MESSAGES.PRIVATE_192);
        });

        it("should not identify non-192.168.x.x addresses as private 192 range", () => {
            const range = reservedRanges[2];

            expect(range.check([192, 167, 0, 1])).toBe(false);
            expect(range.check([192, 169, 0, 1])).toBe(false);
            expect(range.check([193, 168, 0, 1])).toBe(false);
        });
    });

    describe("Loopback addresses 127.0.0.0/8", () => {
        it("should identify 127.x.x.x addresses as loopback", () => {
            const range = reservedRanges[3];

            expect(range.check([127, 0, 0, 1])).toBe(true);
            expect(range.check([127, 255, 255, 255])).toBe(true);
            expect(range.check([127, 100, 50, 25])).toBe(true);
            expect(range.message).toBe(RESERVED_RANGE_MESSAGES.LOOPBACK);
        });

        it("should not identify non-127.x.x.x addresses as loopback", () => {
            const range = reservedRanges[3];

            expect(range.check([126, 0, 0, 1])).toBe(false);
            expect(range.check([128, 0, 0, 1])).toBe(false);
            expect(range.check([10, 0, 0, 1])).toBe(false);
        });
    });

    describe("Link-local addresses 169.254.0.0/16", () => {
        it("should identify 169.254.x.x addresses as link-local", () => {
            const range = reservedRanges[4];

            expect(range.check([169, 254, 0, 1])).toBe(true);
            expect(range.check([169, 254, 255, 255])).toBe(true);
            expect(range.check([169, 254, 100, 50])).toBe(true);
            expect(range.message).toBe(RESERVED_RANGE_MESSAGES.LINK_LOCAL);
        });

        it("should not identify non-169.254.x.x addresses as link-local", () => {
            const range = reservedRanges[4];

            expect(range.check([169, 253, 0, 1])).toBe(false);
            expect(range.check([169, 255, 0, 1])).toBe(false);
            expect(range.check([170, 254, 0, 1])).toBe(false);
        });
    });

    describe("Unspecified addresses 0.0.0.0/8", () => {
        it("should identify 0.x.x.x addresses as unspecified", () => {
            const range = reservedRanges[5];

            expect(range.check([0, 0, 0, 0])).toBe(true);
            expect(range.check([0, 255, 255, 255])).toBe(true);
            expect(range.check([0, 100, 50, 25])).toBe(true);
            expect(range.message).toBe(RESERVED_RANGE_MESSAGES.UNSPECIFIED);
        });

        it("should not identify non-0.x.x.x addresses as unspecified", () => {
            const range = reservedRanges[5];

            expect(range.check([1, 0, 0, 0])).toBe(false);
            expect(range.check([10, 0, 0, 1])).toBe(false);
        });
    });

    describe("Broadcast address 255.255.255.255", () => {
        it("should identify 255.255.255.255 as broadcast", () => {
            const range = reservedRanges[6];

            expect(range.check([255, 255, 255, 255])).toBe(true);
            expect(range.message).toBe(RESERVED_RANGE_MESSAGES.BROADCAST);
        });

        it("should not identify partial 255 addresses as broadcast", () => {
            const range = reservedRanges[6];

            expect(range.check([255, 255, 255, 254])).toBe(false);
            expect(range.check([255, 255, 254, 255])).toBe(false);
            expect(range.check([255, 254, 255, 255])).toBe(false);
            expect(range.check([254, 255, 255, 255])).toBe(false);
        });
    });

    describe("Array structure", () => {
        it("should have correct number of ranges", () => {
            expect(reservedRanges).toHaveLength(7);
        });

        it("should have all ranges with check function and message", () => {
            reservedRanges.forEach((range) => {
                expect(typeof range.check).toBe("function");
                expect(typeof range.message).toBe("string");
                expect(range.message.length).toBeGreaterThan(0);
            });
        });
    });

    describe("Edge cases", () => {
        it("should handle empty arrays gracefully", () => {
            reservedRanges.forEach(range => {
                expect(() => range.check([])).not.toThrow();
            });
        });

        it("should handle arrays with fewer than 4 octets", () => {
            reservedRanges.forEach(range => {
                expect(() => range.check([10])).not.toThrow();
                expect(() => range.check([10, 0])).not.toThrow();
                expect(() => range.check([10, 0, 0])).not.toThrow();
            });
        });
    });
});