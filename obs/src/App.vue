<template>
    <marquee-host></marquee-host>
    <title-host></title-host>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MarqueeHost from './MarqueeHost.vue';
import TitleHost from './TitleHost.vue';

export default defineComponent({
    components: {
        MarqueeHost,
        TitleHost,
    },
});
</script>