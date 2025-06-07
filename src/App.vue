<template>
    <main class="ip-container br5">
        <header class="header border-box p16">IP Lookup</header>
        <IpLookupList/>
    </main>
</template>

<script setup>
import IpLookupList from './components/IpLookupList.vue';
</script>

<style scoped lang="scss">
.ip-container {
    width: 650px;
    margin: 0 auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    font-family: Inter, sans-serif;
    color: $black;
}

.header {
    font-size: 24px;
    font-weight: 600;
    border-bottom: 1px solid $gray;
}
</style>