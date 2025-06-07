<template>
    <div class="list-wrapper">
        <header class="list-header border-box p16">
            <label class="button-label fsz18"> Enter one or more IPv4 addresses and get their country</label>

            <button class="add-ip-button br5" type="button" @click="addIpInput">
                <img
                    class="button-icon"
                    src="@/assets/icons/plus.svg"
                    alt="Add IP Icon"
                    width="20"
                    height="20"
                />
                <span class="button-text fsz18 ml8">Add</span>
            </button>
        </header>
        <div v-if="ipInputs.length" class="border-box p16">
            <IpLookupRow
                v-for="(input, index) in ipInputs"
                :key="input.id"
                :id="input.id"
                :display-index="index + 1"
                @delete="removeById"
                style="margin-bottom: 8px;"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import IpLookupRow from "@/components/IpLookupRow.vue";

let nextId = 1;

const ipInputs = reactive<{ id: number }[]>([
    { id: nextId++ }
]);

function addIpInput() {
    ipInputs.push({ id: nextId++ });
}

function removeById(idToRemove: number) {
    const idx = ipInputs.findIndex(item => item.id === idToRemove);
    if (idx !== -1) {
        ipInputs.splice(idx, 1);
    }
}
</script>

<style scoped lang="scss">
@use "sass:color";

.list-header {
    border-bottom: 1px solid $gray;
}

.button-label {
    display: block;
    padding-bottom: 16px;
}

.add-ip-button {
    background-color: $mainBlue;
    padding: 8px 16px;
    height: 40px;

    &:hover {
        background-color: color.adjust($mainBlue, $lightness: -10%);
    }
}

.button-icon, .button-text {
    vertical-align: middle;
}

.button-text {
    font-weight: 600;
    color: $white;
}
</style>