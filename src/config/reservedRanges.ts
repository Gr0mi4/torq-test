import { ReservedRange } from "@/types";

export const RESERVED_RANGE_MESSAGES = {
    PRIVATE_10: "Private network addresses (10.0.0.0/8) cannot be routed on the public internet",
    PRIVATE_172: "Private network addresses (172.16.0.0/12) cannot be routed on the public internet",
    PRIVATE_192: "Private network addresses (192.168.0.0/16) cannot be routed on the public internet",
    LOOPBACK: "Loopback addresses (127.0.0.0/8) are reserved for internal host communication",
    LINK_LOCAL: "Link-local addresses (169.254.0.0/16) are used for automatic IP addressing when DHCP is unavailable",
    UNSPECIFIED: "IP addresses in the 0.0.0.0/8 range are invalid and cannot be processed",
    BROADCAST: "Broadcast address (255.255.255.255) is used to send data to all hosts on the local network"
};

export const reservedRanges: ReservedRange[] = [
    {
        check: (octets: number[]) => octets[0] === 10,
        message: RESERVED_RANGE_MESSAGES.PRIVATE_10
    },
    {
        check: (octets: number[]) => octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31,
        message: RESERVED_RANGE_MESSAGES.PRIVATE_172
    },
    {
        check: (octets: number[]) => octets[0] === 192 && octets[1] === 168,
        message: RESERVED_RANGE_MESSAGES.PRIVATE_192
    },
    {
        check: (octets: number[]) => octets[0] === 127,
        message: RESERVED_RANGE_MESSAGES.LOOPBACK
    },
    {
        check: (octets: number[]) => octets[0] === 169 && octets[1] === 254,
        message: RESERVED_RANGE_MESSAGES.LINK_LOCAL
    },
    {
        check: (octets: number[]) => octets[0] === 0,
        message: RESERVED_RANGE_MESSAGES.UNSPECIFIED
    },
    {
        check: (octets: number[]) => octets.every(octet => octet === 255),
        message: RESERVED_RANGE_MESSAGES.BROADCAST
    }
];