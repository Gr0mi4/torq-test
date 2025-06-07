<template>
    <div class="row-actions">
        <button
            :class="{ disabled }"
            class="generate-random-btn"
            @click="$emit('random')"
            data-tooltip="Generate Random IP Address"
        >
            <span class="fsz18">🎲</span>
        </button>
        <button
            :class="{ disabled }"
            class="delete-row-btn"
            @click="$emit('delete')"
            data-tooltip="Delete Input Row"
        >
            <span class="fsz18">🗑️</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

defineProps({
    disabled: {
        type: Boolean,
        default: false,
    }
})
</script>

<style scoped>
.row-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

.generate-random-btn, .delete-row-btn {
    border-radius: 50%;
    padding: 4px;
    background-color: transparent;

    &.disabled {
        opacity: 0.5;
    }
}
</style>