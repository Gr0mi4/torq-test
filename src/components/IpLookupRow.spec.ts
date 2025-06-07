import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import IpLookupRow from "@/components/IpLookupRow.vue"
import { RequestStatus } from "@/types"

vi.mock("@/utils/validation", () => ({
    fixLeadingZeros: vi.fn((v: string) => v),
    validateIPv4: vi.fn()
}))

vi.mock("@/utils/flagHelper", () => ({
    getFlagUrl: vi.fn()
}))

vi.mock("@/composables/useIpInputMask", () => ({
    useIpInputMask: vi.fn(() => ({
        onKeypress: () => {
        },
        onPaste: () => {
        },
        ipInputHelper: () => {
        }
    })),
    generateRandomIp: vi.fn()
}))

vi.mock("@/composables/useGeoData", () => ({
    getGeoData: vi.fn()
}))

vi.mock("@/composables/useCommonClock", () => ({
    useClock: vi.fn(() => ({
        now: { value: new Date("2025-01-01T12:00:00Z") }
    }))
}))

import { validateIPv4 } from "@/utils/validation"
import { getFlagUrl } from "@/utils/flagHelper"
import { generateRandomIp } from "@/composables/useIpInputMask"
import { getGeoData } from "@/composables/useGeoData"

describe("IpLookupRow.vue", () => {
    const ROW_ID = 42
    const DISPLAY_INDEX = 3

    beforeEach(() => {
        vi.useFakeTimers()
        vi.resetAllMocks()
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it("renders index and input, with StatusIcon stubbed", () => {
        const wrapper = mount(IpLookupRow, {
            props: { id: ROW_ID, displayIndex: DISPLAY_INDEX },
            global: {
                components: {
                    StatusIcon: {
                        props: ["status"],
                        template: `
                            <div class="status-icon-stub"></div>`
                    }
                }
            }
        })

        // The index should display the passed displayIndex prop
        expect(wrapper.find(".index").text()).toBe(String(DISPLAY_INDEX))

        // The input should exist and not be disabled initially
        const input = wrapper.find("input.ip-input")
        expect(input.exists()).toBe(true)
        expect(input.attributes("disabled")).toBeUndefined()

        // No error text or flag is displayed initially
        expect(wrapper.find(".error-text").exists()).toBe(false)
        expect(wrapper.find("img.country-flag").exists()).toBe(false)
        expect(wrapper.find(".local-time").exists()).toBe(false)
    })

    it("shows error state when validateIPv4 returns invalid", async () => {
        ;(validateIPv4 as any).mockReturnValue({ isValid: false, message: "Invalid IP format" })

        const wrapper = mount(IpLookupRow, {
            props: { id: ROW_ID, displayIndex: DISPLAY_INDEX },
            global: {
                components: {
                    StatusIcon: {
                        props: ["status"],
                        template: `
                            <div></div>`
                    }
                }
            }
        })

        const input = wrapper.find("input.ip-input")
        await input.setValue("invalid.ip")
        await input.trigger("blur")

        // Status should become Error and errorText should display
        expect((wrapper.vm as any).status).toBe(RequestStatus.Error)
        const errorSpan = wrapper.find(".error-text")
        expect(errorSpan.exists()).toBe(true)
        expect(errorSpan.text()).toBe("Invalid IP format")
    })

    it("fetches geo data and displays flag and local time on valid IP", async () => {
        ;(validateIPv4 as any).mockReturnValue({ isValid: true, message: "" })

        let resolveGeo: (val: any) => void
        const geoPromise = new Promise<any>(r => {
                resolveGeo = r
            })
        ;(getGeoData as any).mockReturnValue(geoPromise)

        ;(getFlagUrl as any).mockImplementation(() =>
            new Promise<string>(r => setTimeout(
                () => r("https://flags.example/sl.svg"
                ), 100))
        )

        const wrapper = mount(IpLookupRow, {
            props: { id: ROW_ID, displayIndex: DISPLAY_INDEX },
            global: {
                components: {
                    StatusIcon: {
                        props: ["status"],
                        template: `
                            <div></div>`
                    }
                }
            }
        })

        const input = wrapper.find("input.ip-input")
        await input.setValue("123.45.67.89")
        await input.trigger("blur")

        expect((wrapper.vm as any).status).toBe(RequestStatus.Loading)

        resolveGeo({ countryCode: "SL", timezone: "UTC" })

        await vi.advanceTimersByTimeAsync(100)
        await wrapper.vm.$nextTick()

        expect((wrapper.vm as any).status).toBe(RequestStatus.Success)
        expect(wrapper.find("img.country-flag").exists()).toBe(true)

        // Flag image should render with correct src and alt
        const flagImg = wrapper.find("img.country-flag")
        expect(flagImg.exists()).toBe(true)
        expect(flagImg.attributes("src")).toBe("https://flags.example/sl.svg")
        expect(flagImg.attributes("alt")).toBe("Country Flag")

        // Local time should render based on mocked clock (12:00:00 UTC)
        const timeSpan = wrapper.find(".local-time")
        expect(timeSpan.exists()).toBe(true)
        expect(timeSpan.text()).toBe("12:00:00")

        // Input and random button should be again available
        expect(input.attributes("disabled")).toBeUndefined()
        expect(wrapper.find(".generate-random-btn").attributes("disabled")).toBeUndefined()
    })

    it("clicking random button generates an IP and transitions from Loading to Success", async () => {
        vi.useFakeTimers()

        ;(generateRandomIp as any).mockReturnValue("8.8.8.8")
        ;(validateIPv4 as any).mockReturnValue({ isValid: true, message: "" })

        let resolveGeo: (val: any) => void
        const geoPromise = new Promise<any>(r => {
                resolveGeo = r
            })
        ;(getGeoData as any).mockReturnValue(geoPromise)

        ;(getFlagUrl as any).mockImplementation(() =>
            new Promise<string>(r => setTimeout(() => r("https://flags.example/rl.svg"), 100))
        )

        const wrapper = mount(IpLookupRow, {
            props: { id: ROW_ID, displayIndex: DISPLAY_INDEX },
            global: {
                components: {
                    StatusIcon: {
                        props: ["status"],
                        template: `
                            <div></div>`
                    }
                }
            }
        })

        const randomBtn = wrapper.find(".generate-random-btn")

        await randomBtn.trigger("click")

        // Immediately after click, ipInput is set and status is Loading
        expect((wrapper.vm as any).ipInput).toBe("8.8.8.8")
        expect((wrapper.vm as any).status).toBe(RequestStatus.Loading)

        resolveGeo({ countryCode: "RL", timezone: "UTC" })
        await wrapper.vm.$nextTick()

        // Advance timers for getFlagUrl
        await vi.advanceTimersByTimeAsync(100)
        await wrapper.vm.$nextTick()

        expect((wrapper.vm as any).status).toBe(RequestStatus.Success)
        const flagImg = wrapper.find("img.country-flag")
        expect(flagImg.exists()).toBe(true)
        expect(flagImg.attributes("src")).toBe("https://flags.example/rl.svg")

        vi.useRealTimers()
    })

    it("emits 'delete' event with its id when delete button is clicked", async () => {
        const wrapper = mount(IpLookupRow, {
            props: { id: ROW_ID, displayIndex: DISPLAY_INDEX },
            global: {
                components: {
                    StatusIcon: {
                        props: ["status"],
                        template: `
                            <div></div>`
                    }
                }
            }
        })

        await wrapper.find(".delete-row-btn").trigger("click")
        expect(wrapper.emitted()).toHaveProperty("delete")
        const calls = wrapper.emitted("delete")!
        expect(calls.length).toBe(1)
        expect(calls[0]).toEqual([ROW_ID])
    })
})
