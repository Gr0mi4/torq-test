import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import { defineComponent, nextTick } from "vue"
import { useClock } from "@/composables/useCommonClock"

describe("useClock", () => {
    beforeEach(() => {
        vi.useFakeTimers()

        vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("initializes now and updates it every second after mount", async () => {
        const TestComponent = defineComponent({
            template: "<div></div>",
            setup() {
                return useClock()
            },
        })

        const wrapper = mount(TestComponent)

        const initialTime = (wrapper.vm as any).now.getTime()

        vi.advanceTimersByTime(1000)
        await nextTick()

        const updatedTime = (wrapper.vm as any).now.getTime()
        expect(updatedTime - initialTime).toBeGreaterThanOrEqual(1000)

        vi.advanceTimersByTime(2000)
        await nextTick()

        const laterTime = (wrapper.vm as any).now.getTime()
        expect(laterTime - updatedTime).toBeGreaterThanOrEqual(2000)

        wrapper.unmount()
    })

    it("stops updating now after unmount", async () => {
        const TestComponent = defineComponent({
            template: "<div></div>",
            setup() {
                return useClock()
            },
        })

        const wrapper = mount(TestComponent)
        const beforeUnmountTime = (wrapper.vm as any).now.getTime()

        vi.advanceTimersByTime(1000)
        await nextTick()
        const midTime = (wrapper.vm as any).now.getTime()
        expect(midTime - beforeUnmountTime).toBeGreaterThanOrEqual(1000)

        wrapper.unmount()

        const timeAtUnmount = midTime

        vi.advanceTimersByTime(5000)
        await nextTick()

        const finalTime = (wrapper.vm as any).now.getTime()
        expect(finalTime).toBe(timeAtUnmount)
    })
})
