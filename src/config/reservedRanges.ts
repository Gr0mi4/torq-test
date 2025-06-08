import { ReservedRange } from "@/types";

export const RESERVED_RANGE_MESSAGES = {
    PRIVATE_10: "IP with first octet = 10 is a private network cannot be routed on the public internet",
    PRIVATE_172: "Private network addresses with first octets 172.16. cannot be routed on the public internet",
    PRIVATE_192: "With first 2 octets = 192.168 is a private network addresses and cannot be routed on the public internet",
    LOOPBACK: "Loopback addresses with first octet 127 are reserved for internal host communication",
    LINK_LOCAL: "Link-local addresses with first octets 169.254 are used for automatic IP addressing when DHCP is unavailable",
    UNSPECIFIED: "IP addresses in range the with 0 as first octet are reserved, and can't be processed",
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