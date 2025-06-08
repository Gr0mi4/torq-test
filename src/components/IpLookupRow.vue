<template>
    <div>
        <div class="row-wrapper">
            <span class="index">{{ displayIndex }}</span>
            <input
                type="text"
                class="ip-input fsz18 br5"
                :class="{ 'error' : status === RequestStatus.Error }"
                ref="inputEl"
                :disabled="status === RequestStatus.Loading"
                placeholder="ex 132.45.0.12"
                maxlength="15"
                @blur="processInput"
                @keyup.enter="processInput"
                @input="ipInputHelper"
                @keydown="onKeypress"
                @paste="onPaste"
                v-model="ipInput"
            />
            <div v-if="status === RequestStatus.Success">
                <img
                    v-if="countryData.countryCode"
                    :src="flagUrl"
                    class="country-flag"
                    width="30"
                    alt="Country Flag"
                >
                <span class="local-time ml8">{{ localTime }}</span>
            </div>
            <status-icon :status="status"/>
            <row-actions
                @random="handleRandomClick"
                @delete="deleteInput"
                :disabled="status === RequestStatus.Loading"
            />
        </div>
        <span v-if="status === RequestStatus.Error" class="error-text">{{ errorText }}</span>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from "vue";
import { validateIPv4 } from "@/utils/validation";
import { getFlagUrl } from "@/utils/flagHelper";
import StatusIcon from "@/components/StatusIcon.vue";
import { GeoData, RequestStatus } from "@/types";
import { generateRandomIp, useIpV4InputMask } from "@/composables/useIpV4InputMask";
import { getGeoData } from "@/composables/useGeoData";
import { useClock } from "@/composables/useCommonClock";
import RowActions from "@/components/RowActions.vue";

const props = defineProps({
    displayIndex: {
        type: Number,
        required: true,
    },
    id: {
        type: Number,
        required: true,
    }
});
const emit = defineEmits(["delete"]);

const inputEl = ref<HTMLInputElement | null>(null);
onMounted(() => {
    if (inputEl) {
        inputEl.value?.focus();
    }
});

const status = ref<RequestStatus>(RequestStatus.Idle);
const ipInput = ref<string>("");
const errorText = ref<string>("");

const countryData = reactive<GeoData>({
    countryCode: "",
    timezone: "",
})
const flagUrl = ref<string>("");


function clearCountryData() {
    countryData.countryCode = "";
    countryData.timezone = "";
    flagUrl.value = "";
    errorText.value = "";
}

const { onKeypress, onPaste, ipInputHelper } = useIpV4InputMask(ipInput, inputEl);
const { now } = useClock();

const localTime = computed(() => {
    if (!countryData.timezone) return "";
    return new Intl.DateTimeFormat("default", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: countryData.timezone
    }).format(now.value);
});

const processInput = async () => {
    ipInput.value = ipInput.value.trim();
    const { isValid, message } = validateIPv4(ipInput.value);
    if (!isValid) {
        status.value = RequestStatus.Error;
        errorText.value = message;
        return;
    }
    clearCountryData();
    status.value = RequestStatus.Loading;
    try {
        const { countryCode, timezone } = await getGeoData(ipInput.value);
        Object.assign(countryData, { countryCode, timezone });

        flagUrl.value = await getFlagUrl(countryCode);
        status.value = RequestStatus.Success;
    } catch (e) {
        status.value = RequestStatus.Error;
        errorText.value = e;
    }
}

function handleRandomClick() {
    if (status.value !== RequestStatus.Loading) {
        ipInput.value = generateRandomIp();
        processInput();
    }
}

function deleteInput() {
    emit("delete", props.id);
}

</script>

<style scoped lang="scss">
.row-wrapper {
    display: flex;
    height: 40px;
    align-items: center;
    gap: 8px;
    user-select: none;
    position: relative;
}

.index {
    width: 16px;
    height: 16px;
    padding: 8px;
    flex-shrink: 0;
    text-align: center;
    line-height: 16px;
    background-color: $gray;
    border-radius: 50%;
}

.ip-input {
    border: 2px solid $gray;
    padding: 4px;
    min-width: 140px;

    &:focus {
        outline: none;
        border-color: $mainBlue;
    }

    &[disabled] {
        cursor: not-allowed;
        user-select: none;
        pointer-events: none;
    }

    &.error {
        border-color: $red;
        border-width: 1px;
    }
}

.local-time,
.country-flag {
    vertical-align: middle;
}

.country-flag {
    box-shadow: 2px 5px 5px rgba(0, 0, 0, 0.3);
}

.error-text {
    color: $red;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
    max-height: 40px;
}
</style>