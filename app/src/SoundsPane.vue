<template>
    <div>
        <div class="actions">
            <button class="muted" @click="refreshSounds()" title="Actualiser"><icon-refresh /></button>
        </div>
        <div class="sounds">
            <button v-for="sound in sounds" :key="sound" @click="playSound(sound)">{{ prettify(sound) }}</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { rpc } from './sync/ws';
import IconRefresh from './icons/Refresh.vue';
import { soundsAddOnChange, soundsRemoveOnChange } from './sync/sounds';

export default defineComponent({
    components: {
        IconRefresh,
    },
    data() {
        return {
            sounds: [] as string[],
        };
    },
    beforeMount() {
        soundsAddOnChange(this.setSounds, true);
    },
    unmounted() {
        soundsRemoveOnChange(this.setSounds);
    },
    methods: {
        setSounds(sounds: string[]) {
            this.sounds = sounds.slice();
        },
        prettify(sound: string) {
            return sound
                .replace(/\.[^\.]+$/, '')
                .replace(/[-_]/g, ' ')
                .replace(/\b\w/gu, c => c.toLocaleUpperCase());
        },
        refreshSounds() {
            rpc('refreshSounds', { });
        },
        playSound(sound: string) {
            rpc('playSound', {
                name: sound,
            });
        },
    },
});
</script>

<style scoped>
div.actions {
    text-align: right;
    margin-bottom: 8px;
}

div.sounds {
    display: flex;
    flex-flow: row wrap;
}

div.sounds > button {
    margin-bottom: 8px;
    width: calc(33.333% - 5.333px);
}

div.sounds > button:nth-child(3n-1), div.sounds > button:nth-child(3n) {
    margin-left: 8px;
}
</style>