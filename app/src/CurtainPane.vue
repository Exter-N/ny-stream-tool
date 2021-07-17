<template>
    <div>
        <div class="columns">
            <div>
                <div><label>Opacité :</label> <input type="range" v-model="curtainOpacity" min="0" max="1" step="0.01" /> <span class="number3">{{ Math.round(curtainOpacity * 100) }}</span> %</div>
            </div>
        </div>
        <hr />
        <section class="has-h3">
            <h3>Position</h3>
            <div class="columns">
                <div>
                    <div><label></label> <input type="range" class="lsh20" v-model="curtainLeftX" min="-512" max="380" step="1" /> <span class="number4">{{ Math.round(curtainLeftX) }}</span></div>
                    <div><label></label> <input type="range" class="reverse" v-model="invCurtainRightX" min="-512" max="380" step="1" /> <span class="number4">{{ Math.round(curtainRightX) }}</span></div>
                </div>
            </div>
        </section>
        <hr />
        <section class="has-h3">
            <h3>Éclairage</h3>
            <div class="columns">
                <div>
                    <div><label>Intensité :</label> <input type="range" v-model="curtainLightIntensity" min="0" max="15000000" step="100000" /> <span class="number3">{{ Math.round(curtainLightIntensity / 150000) }}</span> %</div>
                    <div><label>Position :</label> <input type="range" v-model="curtainLightX" min="-500" max="500" step="1" /> <span class="number4">{{ Math.round(curtainLightX) }}</span></div>
                </div>
            </div>
        </section>
        <hr />
        <section class="has-h3">
            <h3>Vent</h3>
            <div class="columns">
                <div>
                    <div><label>Force :</label> <input type="range" v-model="curtainWindMaxStrength" min="0" max="50" step="0.5" /> <span class="number3">{{ Math.round(curtainWindMaxStrength * 2) }}</span> %</div>
                    <div><label>Direction :</label> <input type="range" v-model="curtainWindAngleOffset" min="0" max="360" step="1" /> <span class="number3">{{ Math.round(curtainWindAngleOffset) }}</span>°</div>
                </div>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import settings, { setSetting } from './sync/settings';
import { useSettings } from './sync/vue-settings';

export default defineComponent(useSettings({
    curtainLeftX: 'curtainLeftX',
    curtainRightX: 'curtainRightX',
    curtainLightX: 'curtainLightX',
    curtainLightIntensity: 'curtainLightIntensity',
    curtainWindMaxStrength: 'curtainWindMaxStrength',
    curtainWindAngleOffset: 'curtainWindAngleOffset',
    curtainOpacity: 'curtainOpacity',
}, {
    computed: {
        invCurtainRightX: {
            get(): number {
                return -this.curtainRightX;
            },
            set(value: number) {
                this.curtainRightX = -Number(value);
            },
        },
    },
    watch: {
        curtainLeftX(value: string) {
            const nValue = Number(value);
            if (nValue !== settings.curtainLeftX) {
                setSetting('curtainLeftX', nValue);
            }
        },
        curtainRightX(value: string) {
            const nValue = Number(value);
            if (nValue !== settings.curtainRightX) {
                setSetting('curtainRightX', nValue);
            }
        },
        curtainLightX(value: string) {
            const nValue = Number(value);
            if (nValue !== settings.curtainLightX) {
                setSetting('curtainLightX', nValue);
            }
        },
        curtainLightIntensity(value: string) {
            const nValue = Number(value);
            if (nValue !== settings.curtainLightIntensity) {
                setSetting('curtainLightIntensity', nValue);
            }
        },
        curtainWindMaxStrength(value: string) {
            const nValue = Number(value);
            if (nValue !== settings.curtainWindMaxStrength) {
                setSetting('curtainWindMaxStrength', nValue);
            }
        },
        curtainWindAngleOffset(value: string) {
            const nValue = Number(value);
            if (nValue !== settings.curtainWindAngleOffset) {
                setSetting('curtainWindAngleOffset', nValue);
            }
        },
        curtainOpacity(value: string) {
            const nValue = Number(value);
            if (nValue !== settings.curtainOpacity) {
                setSetting('curtainOpacity', nValue);
            }
        },
    },
}));
</script>

<style scoped>
.lsh20 {
    position: relative;
    left: -20px;
}

label {
    display: inline-block;
    text-align: right;
    height: 1.2em;
    width: 6em;
    vertical-align: middle;
}
</style>