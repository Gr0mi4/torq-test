import { ref, onMounted, onBeforeUnmount } from "vue";

/**
 * Provides a reactive clock that updates every second, for all rows
 */
export function useClock() {
    const now = ref<Date>(new Date());

    let intervalId: number;

    const updateClock = () => {
        now.value = new Date();
        // Make sure date will be updated exactly next second
        const delay = 1000 - (Date.now() % 1000);
        intervalId = window.setTimeout(updateClock, delay);
    };

    onMounted(() => {
        updateClock();
    });

    onBeforeUnmount(() => {
        clearInterval(intervalId);
    });

    return { now };
}