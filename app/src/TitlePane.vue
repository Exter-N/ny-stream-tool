<template>
    <div>
        <div class="group">
            <label>Titre actuel</label>
            <input v-model="activeTitle" readonly />
            <button type="button" title="Modifier le titre" @click="newTitle = activeTitle"><icon-edit /></button>
            <button type="button" class="muted" title="Ajouter aux titres prédéfinis" @click="addPreset(activeTitle)"><icon-add /></button>
            <button type="button" class="muted" title="Effacer le titre" @click="activateTitle('')"><icon-clear /></button>
        </div>
        <div class="group">
            <label>Nouveau titre</label>
            <input v-model="newTitle" @keypress.enter="activateTitle(newTitle); newTitle = ''" />
            <button type="button" class="primary" title="Définir le titre" @click="activateTitle(newTitle); newTitle = ''"><icon-check /></button>
            <button type="button" class="muted" title="Ajouter aux titres prédéfinis" @click="addPreset(newTitle); newTitle = ''"><icon-add /></button>
        </div>
        <hr />
        <section class="has-h3">
            <h3>Titres prédéfinis</h3>
            <div v-for="preset in presetTitles" :key="preset" class="group">
                <label></label>
                <input :value="preset" readonly />
                <button type="button" title="Définir le titre" @click="activateTitle(preset)"><icon-check /></button>
                <button type="button" title="Modifier le titre" @click="newTitle = preset" class="muted"><icon-edit /></button>
                <button type="button" title="Supprimer le titre" @click="deletePreset(preset)" class="muted"><icon-delete /></button>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IconAdd from './icons/Add.vue';
import IconCheck from './icons/Check.vue';
import IconClear from './icons/Clear.vue';
import IconDelete from './icons/Delete.vue';
import IconEdit from './icons/Edit.vue';
import { setSetting } from './sync/settings';
import { useSettings } from './sync/vue-settings';

export default defineComponent(useSettings({
    activeTitle: 'title',
    presetTitles: 'presetTitles',
}, {
    components: {
        IconAdd,
        IconCheck,
        IconClear,
        IconDelete,
        IconEdit,
    },
    data() {
        return {
            newTitle: '',
        };
    },
    methods: {
        activateTitle(value: string) {
            setSetting('title', value.trim());
        },
        addPreset(value: string) {
            value = value.trim();
            if (!value || this.presetTitles.includes(value)) {
                return;
            }

            setSetting('presetTitles', this.presetTitles.concat([value]));
        },
        deletePreset(value: string) {
            if (!value || !this.presetTitles.includes(value)) {
                return;
            }
            if (this.newTitle !== value && this.activeTitle !== value && !confirm('Voulez-vous vraiment supprimer ce titre ?')) {
                return;
            }

            setSetting('presetTitles', this.presetTitles.filter(p => p !== value));
        },
    },
}));
</script>

<style scoped>
.group {
    margin-bottom: 8px;
}

.group > label {
    display: inline-block;
    width: calc(25% - 8px);
    text-align: right;
}

.group > input:not([type]), .group > input[type="text"] {
    width: 50%;
    box-sizing: border-box;
}

.group > * + * {
    margin-left: 8px;
}
</style>