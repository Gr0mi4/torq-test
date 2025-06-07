import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import IpLookupList from "@/components/IpLookupList.vue"

const IpLookupRowStub = {
    props: ["id", "displayIndex"],
    template: `
        <div class="row-stub">
            <button class="delete-btn" @click="$emit('delete', id)"/>
        </div>`,
}

describe("IpLookupList.vue", () => {
    it("renders one IpLookupRow by default", () => {
        const wrapper = mount(IpLookupList, {
            global: {
                stubs: {
                    IpLookupRow: IpLookupRowStub,
                },
            },
        })
        const rows = wrapper.findAll(".row-stub")
        expect(rows).toHaveLength(1)
    })

    it("adds a new IpLookupRow when 'Add' button is clicked", async () => {
        const wrapper = mount(IpLookupList, {
            global: {
                stubs: {
                    IpLookupRow: IpLookupRowStub,
                },
            },
        })

        expect(wrapper.findAll(".row-stub")).toHaveLength(1)

        const addButton = wrapper.find(".add-ip-button")
        await addButton.trigger("click")
        expect(wrapper.findAll(".row-stub")).toHaveLength(2)

        await addButton.trigger("click")
        expect(wrapper.findAll(".row-stub")).toHaveLength(3)
    })

    it("removes the correct IpLookupRow when a child emits 'delete'", async () => {
        const wrapper = mount(IpLookupList, {
            global: {
                stubs: {
                    IpLookupRow: IpLookupRowStub,
                },
            },
        })

        const addButton = wrapper.find(".add-ip-button")
        await addButton.trigger("click")
        await addButton.trigger("click")
        expect(wrapper.findAll(".row-stub")).toHaveLength(3)

        // Delete the second row
        const secondRow = wrapper.findAll(".row-stub")[1]
        const deleteBtn = secondRow.find(".delete-btn")
        const rowId = wrapper.vm.ipInputs[1].id

        await deleteBtn.trigger("click")
        // After deletion, there should be 2 rows left
        expect(wrapper.findAll(".row-stub")).toHaveLength(2)

        // Make sure the remaining ids do not include the deleted
        const remainingIds = (wrapper.vm.ipInputs as Array<{ id: number }>).map(item => item.id)
        expect(remainingIds).not.toContain(rowId)
    })
})
