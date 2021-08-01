<template>
    <div class="columns">
        <div>
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
        <div class="separator"></div>
        <div>
            <div class="columns">
                <div>
                    <div class="horizontal"><input type="range" v-model="left" min="0" max="1" step="0.01" /> <span class="number3">{{ Math.round(left * 100) }}</span> % <button type="button" :class="{ muted: !snapLeft }" @click="snapLeft = !snapLeft" title="Ancrer"><icon-grid /></button></div>
                    <div class="horizontal"><input type="range" class="reverse" v-model="invRight" min="0" max="1" step="0.01" /> <span class="number3">{{ Math.round(invRight * 100) }}</span> % <button type="button" :class="{ muted: !snapRight }" @click="snapRight = !snapRight" title="Ancrer"><icon-grid /></button></div>
                </div>
                <div class="separator"></div>
                <div class="vertical"><div class="vertical-range-host"><input type="range" class="reverse" v-model="invTop" min="0" max="1" step="0.01" /></div><div><span class="number3">{{ Math.round(invTop * 100) }}</span> %</div><div><button type="button" :class="{ muted: !snapTop }" @click="snapTop = !snapTop" title="Ancrer"><icon-grid /></button></div></div>
                <div class="vertical"><div class="vertical-range-host"><input type="range" v-model="bottom" min="0" max="1" step="0.01" /></div><div><span class="number3">{{ Math.round(bottom * 100) }}</span> %</div><div><button type="button" :class="{ muted: !snapBottom }" @click="snapBottom = !snapBottom" title="Ancrer"><icon-grid /></button></div></div>
            </div>
            <hr />
            <div>
                    <div><label><input type="checkbox" v-model="avatar" /> Afficher l'avatar</label></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import lab50 from './lab50';
import settings, { setSetting, setSettings } from './sync/settings';
import { useSettings } from './sync/vue-settings';
import { rpc } from './sync/ws';
import IconGrid from './icons/Grid.vue';

export default defineComponent(useSettings({
    activeA: 'chromaA',
    activeB: 'chromaB',
    left: 'left',
    top: 'top',
    right: 'right',
    bottom: 'bottom',
    snapLeft: 'snapLeft',
    snapTop: 'snapTop',
    snapRight: 'snapRight',
    snapBottom: 'snapBottom',
    avatar: 'avatar',
}, {
    components: {
        IconGrid,
    },
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
    computed: {
        invTop: {
            get(): number {
                return 1 - this.top;
            },
            set(value: number) {
                this.top = 1 - Number(value);
            },
        },
        invRight: {
            get(): number {
                return 1 - this.right;
            },
            set(value: number) {
                this.right = 1 - Number(value);
            },
        },
    },
    watch: {
        left(value: string) {
            const nValue = Number(value);
            if (nValue !== settings.left) {
                setSetting('left', nValue);
            }
        },
        top(value: string) {
            const nValue = Number(value);
            if (nValue !== settings.top) {
                setSetting('top', nValue);
            }
        },
        right(value: string) {
            const nValue = Number(value);
            if (nValue !== settings.right) {
                setSetting('right', nValue);
            }
        },
        bottom(value: string) {
            const nValue = Number(value);
            if (nValue !== settings.bottom) {
                setSetting('bottom', nValue);
            }
        },
        snapLeft(value: boolean) {
            if (value !== settings.snapLeft) {
                setSetting('snapLeft', value);
            }
        },
        snapTop(value: boolean) {
            if (value !== settings.snapTop) {
                setSetting('snapTop', value);
            }
        },
        snapRight(value: boolean) {
            if (value !== settings.snapRight) {
                setSetting('snapRight', value);
            }
        },
        snapBottom(value: boolean) {
            if (value !== settings.snapBottom) {
                setSetting('snapBottom', value);
            }
        },
        avatar(value: boolean) {
            if (value !== settings.avatar) {
                setSetting('avatar', value);
            }
        },
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
</style>