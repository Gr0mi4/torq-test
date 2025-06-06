import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import StatusIcon from "@/components/StatusIcon.vue"
import { RequestStatus } from "@/types"
import loaderIcon from "@/assets/icons/loader.svg"
import errorIcon from "@/assets/icons/error-circle.svg"
import successIcon from "@/assets/icons/success-circle.svg"

describe("StatusIcon.vue", () => {
    it("does not render an <img> when status is Idle", () => {
        const wrapper = mount(StatusIcon, {
            props: { status: RequestStatus.Idle }
        })
        expect(wrapper.find("img").exists()).toBe(false)
    })

    it("renders the loader icon when status is Loading", () => {
        const wrapper = mount(StatusIcon, {
            props: { status: RequestStatus.Loading }
        })
        const img = wrapper.find("img")
        expect(img.exists()).toBe(true)

        expect(img.attributes("src")).toBe(loaderIcon)
        expect(img.attributes("alt")).toBe("Loading Spinner")
        // It should always have the base "icon" class


        expect(img.classes()).toContain("spinner")

        expect(img.classes()).not.toContain("error-icon")
        expect(img.classes()).not.toContain("success-icon")
    })

    it("renders the error icon when status is Error", () => {
        const wrapper = mount(StatusIcon, {
            props: { status: RequestStatus.Error }
        })
        const img = wrapper.find("img")
        expect(img.exists()).toBe(true)
        expect(img.attributes("src")).toBe(errorIcon)
        expect(img.attributes("alt")).toBe("Error Icon")
        expect(img.classes()).toContain("icon")
        expect(img.classes()).toContain("error-icon")
        expect(img.classes()).not.toContain("spinner")
        expect(img.classes()).not.toContain("success-icon")
    })

    it("renders the success icon when status is Success", () => {
        const wrapper = mount(StatusIcon, {
            props: { status: RequestStatus.Success }
        })
        const img = wrapper.find("img")
        expect(img.exists()).toBe(true)
        expect(img.attributes("src")).toBe(successIcon)
        expect(img.attributes("alt")).toBe("Success Icon")
        expect(img.classes()).toContain("icon")
        expect(img.classes()).toContain("success-icon")
        expect(img.classes()).not.toContain("spinner")
        expect(img.classes()).not.toContain("error-icon")
    })

    it("renders nothing if an unknown string status is passed", () => {
        const wrapper = mount(StatusIcon, {
            props: { status: "UNKNOWN_STATUS" }
        })
        expect(wrapper.find("img").exists()).toBe(false)
    })
})
