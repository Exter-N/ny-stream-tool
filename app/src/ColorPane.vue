<template>
    <div class="pane">
        <div>
            <div class="lab50">
                <canvas width="303" height="303" ref="lab50" @pointermove="pointerMove($event)" @pointerdown="pointerDown($event)" @pointerup="pointerUp($event)" @pointerleave="pointerLeave($event)"></canvas>
                <div class="cursor" :style="{ left: (activeA + 50) * 3 + 'px', top: (activeB + 50) * 3 + 'px' }"></div>
            </div>
        </div>
        <div class="abs">
            <div class="pointer-ab" :class="{ hidden: null == pointerA || null == pointerB }">a* : <span class="number3">{{ (null != pointerA) ? Math.round(pointerA) : '' }}</span>, b* : <span class="number3">{{ (null != pointerB) ? Math.round(pointerB) : '' }}</span></div>
            <div class="active-ab"><div class="cursor"></div> a* : <span class="number3">{{ (null != activeA) ? Math.round(activeA) : '' }}</span>, b* : <span class="number3">{{ (null != activeB) ? Math.round(activeB) : '' }}</span></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import lab50 from './lab50';
import { setSettings } from './sync/settings';
import { useSettings } from './sync/vue-settings';
import { rpc } from './sync/ws';

export default defineComponent(useSettings({
    activeA: 'chromaA',
    activeB: 'chromaB',
}, {
    data() {
        return {
            pointerA: null as (number | null),
            pointerB: null as (number | null),
            button: -1 as number,
        };
    },
    mounted() {
        const canvas = this.$refs.lab50 as HTMLCanvasElement;

        canvas.getContext('2d')?.putImageData(lab50, 0, 0);
    },
    methods: {
        updatePosition(event: PointerEvent) {
            const rect = (this.$refs.lab50 as HTMLCanvasElement).getBoundingClientRect();
            this.pointerA = Math.max(-50, Math.min(50, (0 | ((event.clientX - rect.x) / 3)) - 50));
            this.pointerB = Math.max(-50, Math.min(50, (0 | ((event.clientY - rect.y) / 3)) - 50));
        },
        sendCommand() {
            if (null == this.pointerA || null == this.pointerB) {
                return;
            }
            switch (this.button) {
                case 0:
                    rpc('startChromaTransition', { a: this.pointerA, b: this.pointerB });
                    break;
                case 1:
                    setSettings({
                        chromaA: this.pointerA,
                        chromaB: this.pointerB,
                    });
                    break;
            }
        },
        pointerMove(event: PointerEvent) {
            this.updatePosition(event);
            this.sendCommand();
        },
        pointerDown(event: PointerEvent) {
            this.updatePosition(event);
            const target = event.target as any;
            if (target.setPointerCapture) {
                target.setPointerCapture(event.pointerId);
            }
            if (-1 !== this.button) {
                return;
            }
            this.button = event.button;
            this.sendCommand();
        },
        pointerUp(event: PointerEvent) {
            this.updatePosition(event);
            if (0 === event.buttons) {
                this.button = -1;
            }
        },
        pointerLeave(event: Event) {
            this.pointerA = null;
            this.pointerB = null;
        },
    },
}));
</script>

<style scoped>
.pane {
    text-align: center;
}

.lab50 {
    cursor: crosshair;
    position: relative;
    display: inline-block;
    width: 303px;
    height: 303px;
}

.lab50 > canvas {
    position: absolute;
    left: 0;
    top: 0;
}

.lab50 > .cursor {
    position: absolute;
    pointer-events: none;
    margin: -2px;
}

.cursor {
    border-radius: 50%;
    width: 5px;
    height: 5px;
    border: 1px solid white;
}

.abs {
    display: flex;
    flex-flow: row nowrap;
    padding: 0 calc(50% - 151.5px);
}

.active-ab {
    text-align: right;
    flex-grow: 1;
}

.active-ab > .cursor {
    display: inline-block;
}

.number3 {
    font-family: monospace;
    display: inline-block;
    text-align: right;
    width: 2em;
    height: 1.2em;
    vertical-align: middle;
}
</style>