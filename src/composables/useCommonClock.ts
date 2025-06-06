import { ref, onMounted, onBeforeUnmount } from "vue";

/**
 * Provides a reactive clock that updates every second, for all rows
 */
export function useClock() {
    const now = ref<Date>(new Date());

    let intervalId: number;

    onMounted(() => {
        intervalId = window.setInterval(() => {
            now.value = new Date();
        }, 1000);
    });

    onBeforeUnmount(() => {
        clearInterval(intervalId);
    });

    return { now };
}