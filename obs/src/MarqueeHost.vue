<template>
    <div class="host" ref="host" :class="{ 'with-triangles': running.length > 0 }" :style="{ marginRight: marqueesRight + 'px' }">
        <marquee-item v-for="marquee in running" :key="marquee.runningId" :marquee="marquee"></marquee-item>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { registerMulticastTickFunction } from './renderer/tick';
import { useMulticastCallbacks } from '../../util/vue-multicast-callback';
import { useSettings } from './sync/vue-settings';
import { isObs } from "./obs";
import { Marquee, marqueeEquals, getMarqueeKey } from "../../common/settings";
import { arrayDeleteFound } from "../../util/array";
import MarqueeItem, { RunningMarquee } from './MarqueeItem.vue';
import settings, { settingsTriggerOnChange } from './sync/settings';

const SPEED = 100;

const updateMarquee = registerMulticastTickFunction('marquee', {
    before: ['updateTriangleColors'],
});

export default defineComponent(useMulticastCallbacks({
    updateMarquee,
}, useSettings({
    marquees: 'marquees',
    marqueesOnce: 'marqueesOnce',
    marqueesRight: 'marqueesRight',
}, {
    components: {
        MarqueeItem,
    },
    data() {
        return {
            nextRunningId: 1 as number,
            marqueeOffset: 0 as number,
            canNextBeOnce: true as boolean,
            running: [] as RunningMarquee[],
        };
    },
    watch: {
        marquees(value: Marquee[]) {
            this.marqueeOffset %= Math.max(value.length, 1);
            this.prune();
        },
        marqueesOnce() {
            this.prune();
        },
    },
    methods: {
        prune(): void {
            const marquees = this.marquees.concat(this.marqueesOnce).filter(marquee => false !== marquee.enabled);
            this.running = this.running.filter(marquee => marquees.some(mq => marqueeEquals(mq, marquee)));
        },
        getMarqueeKey,
        pickNext(): Marquee | undefined {
            const hasPermanent = this.marquees.some(mq => false !== mq.enabled);
            if (!hasPermanent || this.canNextBeOnce) {
                const next = this.marqueesOnce.find(mq => false !== mq.enabled && !this.running.some(marquee => marqueeEquals(mq, marquee)));
                if (null != next) {
                    this.canNextBeOnce = false;

                    return next;
                }
            }

            {
                const next = this.marquees.slice(this.marqueeOffset).concat(this.marquees.slice(0, this.marqueeOffset)).find(mq => false !== mq.enabled);
                if (null != next) {
                    this.marqueeOffset = (this.marquees.indexOf(next) + 1) % this.marquees.length;
                    this.canNextBeOnce = true;

                    return next;
                }
            }
        },
        updateMarquee(time: number, deltaTime: number): void {
            const deltaPx = deltaTime * SPEED;
            let maxRight: number = -Infinity;
            const toDelete: RunningMarquee[] = [];
            for (const marquee of this.running) {
                marquee.left -= deltaPx;
                const right = marquee.left + marquee.width;
                maxRight = Math.max(maxRight, right);
                if (right <= 0) {
                    toDelete.push(marquee);
                }
            }
            if (toDelete.length > 0) {
                this.running = this.running.filter(mq => !toDelete.includes(mq));
                if (isObs) {
                    let triggerMarqueesOnceChange = false;
                    for (const marquee of toDelete) {
                        if (arrayDeleteFound(settings.marqueesOnce, mq => marqueeEquals(mq, marquee)).deleted) {
                            triggerMarqueesOnceChange = true;
                        }
                    }
                    if (triggerMarqueesOnceChange) {
                        settingsTriggerOnChange('marqueesOnce');
                    }
                }
            }

            const hostWidth = (this.$refs.host as HTMLDivElement).offsetWidth;
            if (maxRight <= hostWidth - 200) {
                const marquee = this.pickNext();
                if (null != marquee) {
                    this.running = this.running.concat([
                        Object.assign({ }, marquee, {
                            runningId: this.nextRunningId++,
                            left: hostWidth,
                            width: 0,
                        }),
                    ]);
                }
            }
        },
    },
})));
</script>

<style scoped>
.host {
    position: absolute;
    left: 8px;
    bottom: 0;
    right: 8px;
    height: 1.42em;
    line-height: 1.42em;
    font-family: 'Indie Flower';
    color: white;
    text-shadow: 0 -2px 1px black, 0 2px 1px black, -2px 0 1px black, 2px 0 1px black, 1px 1px 1px black, -1px 1px 1px black, 1px -1px 1px black, -1px -1px 1px black;
    font-size: 20pt;
    padding: 0 32px;
    overflow: hidden;
    white-space: nowrap;
    mask-image: linear-gradient(to right, transparent 0, black 32px, black calc(100% - 32px), transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0, black 32px, black calc(100% - 32px), transparent 100%);
}

.host > div {
    position: absolute;
    left: 32px;
    bottom: 0;
    line-height: 1.42em;
}
</style>