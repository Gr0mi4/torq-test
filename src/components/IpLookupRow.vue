<template>
    <div>
        <div class="row-wrapper">
            <span class="index">{{ displayIndex }}</span>
            <input
                type="text"
                class="ip-input fsz18 br5"
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
            <div class="row-actions">
                <button
                    class="generate-random-btn"
                    @click="handleRandomClick"
                    :disabled="status === RequestStatus.Loading"
                    data-tooltip="Generate Random IP Address"
                >
                    <span class="fsz18">🎲</span>
                </button>
                <button class="delete-row-btn" @click="deleteInput" data-tooltip="Delete Input Row">
                    <span class="fsz18">🗑️</span>
                </button>
            </div>
        </div>
        <span v-if="status === RequestStatus.Error" class="error-text">{{ errorText }}</span>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, onBeforeUnmount, computed } from "vue";
import { fixLeadingZeros, validateIPv4 } from "@/utils/validation";
import { getFlagUrl } from "@/utils/flagHelper";
import StatusIcon from "@/components/StatusIcon.vue";
import { GeoData, RequestStatus } from "@/types";
import { useIpInputMask, generateRandomIp } from "@/composables/useIpInputMask";
import { getGeoData } from "@/composables/useGeoData";
import { useClock } from "@/composables/useCommonClock";

// TODO: IP SERVICE FALLBACK

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

onBeforeUnmount(() => {
    if (timerId !== null) {
        clearInterval(timerId);
    }
});

const status = ref<RequestStatus>(RequestStatus.Idle);

const ipInput = ref<string>("");
const { onKeypress, onPaste, ipInputHelper } = useIpInputMask(ipInput, inputEl);

const processInput = async () => {
    ipInput.value = fixLeadingZeros(ipInput.value).trim();
    const { isValid, message } = validateIPv4(ipInput.value);
    if (!isValid) {
        status.value = RequestStatus.Error;
        errorText.value = message || "Invalid IP address";
        return;
    }
    clearCountryData();
    status.value = RequestStatus.Loading;
    try {
        const { country, countryCode, timezone } = await getGeoData(ipInput.value);
        Object.assign(countryData, { country, countryCode, timezone });

        flagUrl.value = await getFlagUrl(countryCode);
        status.value = RequestStatus.Success;
    } catch (e) {
        console.log(e)
        status.value = RequestStatus.Error;
        errorText.value = e;
    }
}
const countryData = reactive<GeoData>({
    countryCode: "",
    timezone: "",
})
const flagUrl = ref<string>("");
let timerId: number | null = null;

function clearCountryData() {
    countryData.countryCode = "";
    countryData.timezone = "";
    flagUrl.value = "";
    errorText.value = "";
}

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

const errorText = ref<string>("");

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

<style scoped>
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
    background-color: #e5e5e5;
    border-radius: 50%;
}

.ip-input {
    border: 2px solid #e5e5e5;
    padding: 4px;
    min-width: 140px;
}

.ip-input:focus {
    outline: none;
    border-color: #73d2f9;
}

.ip-input[disabled] {
    cursor: not-allowed;
    user-select: none;
    pointer-events: none;
}

.local-time, .country-flag {
    vertical-align: middle;
}

.country-flag {
    box-shadow: 2px 5px 5px rgba(0, 0, 0, 0.3);
}

.generate-random-btn, .delete-row-btn {
    border-radius: 50%;
    padding: 4px;
    background-color: transparent;
}

.error-text {
    color: red;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
    max-height: 40px;
}

.row-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}
</style>