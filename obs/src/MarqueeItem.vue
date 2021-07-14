<template>
    <div ref="item" :style="{ left: mq.left + 'px' }"><span v-if="mq.author" :style="{ color: mq.color }">{{ mq.author }}</span> <span class="body" :class="{ ['type-' + mq.type]: true }"><message-body :message="mq.message"></message-body></span></div>
</template>

<script lang="ts">
import { defineComponent, h, VNode } from 'vue';
import { Marquee } from '../../common/settings';
import MessageBody from '../../common/MessageBody.vue';

export interface RunningMarquee extends Marquee {
    runningId: number;
    left: number;
    width: number;
}

export default defineComponent({
    props: ['marquee'],
    emits: ['left'],
    components: {
        MessageBody,
    },
    data() {
        return {
            mq: this.$props.marquee as RunningMarquee,
        };
    },
    mounted() {
        this.mq.width = (this.$refs.item as HTMLDivElement).offsetWidth;
    },
})
</script>

<style scoped>
.type-action {
    font-style: italic;
}

.body >>> img {
    vertical-align: sub;
}
</style>