import { ReservedRange } from "@/types";

export const reservedRanges: ReservedRange[] = [
    {
        check: (octets: number[]) => octets[0] === 10,
        message: 'Private network addresses (10.0.0.0/8) cannot be routed on the public internet'
    },
    {
        check: (octets: number[]) => octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31,
        message: 'Private network addresses (172.16.0.0/12) cannot be routed on the public internet'
    },
    {
        check: (octets: number[]) => octets[0] === 192 && octets[1] === 168,
        message: 'Private network addresses (192.168.0.0/16) cannot be routed on the public internet'
    },
    {
        check: (octets: number[]) => octets[0] === 127,
        message: 'Loopback addresses (127.0.0.0/8) are reserved for internal host communication'
    },
    {
        check: (octets: number[]) => octets[0] === 169 && octets[1] === 254,
        message: 'Link-local addresses (169.254.0.0/16) are used for automatic IP addressing when DHCP is unavailable'
    },
    {
        check: (octets: number[]) => octets[0] === 0,
        message: 'Unspecified addresses (0.0.0.0/8) represent invalid or unspecified addresses'
    },
    {
        check: (octets: number[]) => octets.every(octet => octet === 255),
        message: 'Broadcast address (255.255.255.255) is used to send data to all hosts on the local network'
    }
];