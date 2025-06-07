<template>
    <img
        v-if="iconSrc"
        :src="iconSrc"
        :alt="iconAlt"
        class="icon"
        :class="iconClass"
    />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { defineProps, } from "vue";
import { RequestStatus } from "@/types";

import loaderIcon from "@/assets/icons/loader.svg";
import errorIcon from "@/assets/icons/error-circle.svg";
import successIcon from "@/assets/icons/success-circle.svg";

const props = defineProps<{ status: RequestStatus }>();

const iconSrc = computed(() => {
    switch (props.status) {
        case RequestStatus.Loading:
            return loaderIcon;
        case RequestStatus.Error:
            return errorIcon;
        case RequestStatus.Success:
            return successIcon;
        default:
            return "";
    }
});

const iconAlt = computed(() => {
    switch (props.status) {
        case RequestStatus.Loading:
            return "Loading Spinner";
        case RequestStatus.Error:
            return "Error Icon";
        case RequestStatus.Success:
            return "Success Icon";
        default:
            return "";
    }
});

const iconClass = computed(() => {
    switch (props.status) {
        case RequestStatus.Loading:
            return "spinner";
        case RequestStatus.Error:
            return "error-icon";
        case RequestStatus.Success:
            return "success-icon";
        default:
            return "";
    }
});
</script>

<style scoped>
.icon {
    width: 24px;
    height: 24px;
    user-select: none;
}

.spinner {
    animation: spin 1s linear infinite;
}

.success-icon {
    animation: fadeOut 1s ease-in-out forwards;
    animation-delay: .7s;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes fadeOut {
    to {
        opacity: 0;
    }
}
</style>
