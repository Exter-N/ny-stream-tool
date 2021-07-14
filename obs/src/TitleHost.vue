<template>
    <div class="with-triangles" ref="host" :class="{ measuring }" :style="{
            opacity,
            width: (null != width) ? (width + 'px') : '',
            height: (null != height) ? (height + 'px') : '',
            marginLeft: (null != width) ? (-(width / 2) + 'px') : '',
            marginTop: (null != height) ? (-(height / 2) + 'px') : '',
        }">{{ title }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { registerMulticastTickFunction } from './renderer/tick';
import { useMulticastCallbacks } from '../../util/vue-multicast-callback';
import { saturate } from "../../util/math/saturate";
import settings from './sync/settings';

const updateTitle = registerMulticastTickFunction('updateTitle', {
    before: ['updateTriangleColors'],
});

export default defineComponent(useMulticastCallbacks({
    updateTitle,
}, {
    data() {
        return {
            title: '',
            width: null as (number | null),
            height: null as (number | null),
            opacity: 0,
            measuring: false,
        };
    },
    methods: {
        updateTitle(time: number, deltaTime: number): void {
            if (this.title !== settings.title) {
                if (this.opacity > 0) {
                    this.opacity = saturate(this.opacity - deltaTime / 0.4);
                } else {
                    this.title = settings.title;
                    if (this.title) {
                        this.width = null;
                        this.height = null;
                        this.measuring = true;
                    }
                }
            } else {
                const host = this.$refs.host as HTMLDivElement;
                if (host.classList.contains('measuring')) {
                    const { offsetWidth, offsetHeight } = host;
                    this.width = offsetWidth + 2;
                    this.height = offsetHeight;
                    this.measuring = false;
                } else if (this.title && this.opacity < 1) {
                    this.opacity = saturate(this.opacity + deltaTime / 0.4);
                }
            }
        },
    },
}));
</script>

<style scoped>
div {
    position: absolute;
    left: 50%;
    top: 50%;
    line-height: 1.42em;
    font-family: 'Indie Flower';
    color: white;
    text-shadow: 0 -2px 1px black, 0 2px 1px black, -2px 0 1px black, 2px 0 1px black, 1px 1px 1px black, -1px 1px 1px black, 1px -1px 1px black, -1px -1px 1px black;
    font-size: 60pt;
    text-align: center;
    max-width: 80%;
    opacity: 0;
    transform: rotate(-10deg);
}

div.measuring {
    left: 10%;
    transform: none;
}
</style>