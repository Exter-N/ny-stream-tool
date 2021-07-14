<template>
    <div>
        <div class="layout">
            <div>
                <div><input type="range" v-model="left" min="0" max="1" step="0.01" /> <span class="number3">{{ Math.round(left * 100) }}</span> %</div>
                <div><input type="range" class="reverse" v-model="invRight" min="0" max="1" step="0.01" /> <span class="number3">{{ Math.round(invRight * 100) }}</span> %</div>
            </div>
            <div class="separator"></div>
            <div class="vertical"><div class="vertical-range-host"><input type="range" class="reverse" v-model="invTop" min="0" max="1" step="0.01" /></div><div><span class="number3">{{ Math.round(invTop * 100) }}</span> %</div></div>
            <div class="vertical"><div class="vertical-range-host"><input type="range" v-model="bottom" min="0" max="1" step="0.01" /></div><div><span class="number3">{{ Math.round(bottom * 100) }}</span> %</div></div>
        </div>
        <hr />
        <div class="options">
            <div><label><input type="checkbox" v-model="avatar" /> Afficher l'avatar</label></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import settings, { setSetting } from './sync/settings';
import { useSettings } from './sync/vue-settings';

export default defineComponent(useSettings({
    left: 'left',
    top: 'top',
    right: 'right',
    bottom: 'bottom',
    avatar: 'avatar',
}, {
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
        }
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
        avatar(value: boolean) {
            if (value !== settings.avatar) {
                setSetting('avatar', value);
            }
        },
    },
}));
</script>

<style scoped>
.layout {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
}

.layout > .separator {
    width: 0;
    align-self: stretch;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    margin: 0 0.5em;
}

.vertical {
    text-align: center;
}

.vertical-range-host {
    width: 16px;
    height: 150px;
    display: inline-block;
}

input[type="range"] {
    transform-origin: center;
    width: 150px;
    height: 16px;
}

input[type="range"].reverse {
    transform: scaleX(-1);
}

.vertical-range-host > input[type="range"] {
    margin: 67px -67px;
    transform: rotate(-90deg);
}

.vertical-range-host > input[type="range"].reverse {
    transform: rotate(90deg);
}

.number3 {
    font-family: monospace;
    display: inline-block;
    text-align: right;
    width: 2em;
    height: 1.2em;
    vertical-align: middle;
}

.options {
    width: 40%;
    margin: 0 auto;
}
</style>