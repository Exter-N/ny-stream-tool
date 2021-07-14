<template>
    <div>
        <div class="group">
            <input type="color" v-model="newColor" />
            <input v-model="newAuthor" :style="{ color: newColor }" class="author" />
            <button type="button" :class="{ muted: newType !== 'action' }" @click="nextType()" title="Message d'action"><icon-format-italic /></button>
            <input v-model="newMessage" :class="{ ['type-' + newType]: true }" @keypress.enter="addMarquee()" />
            <button type="button" :class="{ muted: !newEnabled }" @click="newEnabled = !newEnabled" title="Afficher / Cacher"><icon-visibility v-if="newEnabled" /><icon-visibility-off v-else /></button>
            <button type="button" :class="{ muted: !newRepeat }" @click="newRepeat = !newRepeat" title="Répéter périodiquement"><icon-repeat /></button>
            <button type="button" class="primary" @click="addMarquee()" title="Ajouter le message"><icon-add /></button>
        </div>
        <hr />
        <section class="has-h3">
            <h3>Messages défilants périodiques</h3>
            <div v-for="marquee in marquees" :key="getMarqueeKey(marquee)" class="group" :class="{ muted: !marquee.enabled }">
                <input :value="marquee.author" :style="{ color: marquee.color }" class="author" readonly />
                <input :value="messageToString(marquee.message)" :class="{ ['type-' + marquee.type]: true }" readonly />
                <button type="button" :class="{ muted: !marquee.enabled }" @click="toggleMarquee(marquee)" title="Afficher / Cacher"><icon-visibility v-if="marquee.enabled" /><icon-visibility-off v-else /></button>
                <button type="button" class="muted" @click="editMarquee(marquee, true)" title="Modifier le message"><icon-edit /></button>
                <button type="button" class="muted" @click="deleteMarquee(marquee)" title="Supprimer le message"><icon-delete /></button>
            </div>
        </section>
        <hr />
        <section class="has-h3">
            <h3>Messages défilants éphémères</h3>
            <div v-for="marquee in marqueesOnce" :key="getMarqueeKey(marquee)" class="group" :class="{ muted: !marquee.enabled }">
                <input :value="marquee.author" :style="{ color: marquee.color }" class="author" readonly />
                <input :value="messageToString(marquee.message)" :class="{ ['type-' + marquee.type]: true }" readonly />
                <button type="button" :class="{ muted: !marquee.enabled }" @click="toggleMarqueeOnce(marquee)" title="Afficher / Cacher"><icon-visibility v-if="marquee.enabled" /><icon-visibility-off v-else /></button>
                <button type="button" class="muted" @click="editMarquee(marquee, false)" title="Modifier le message"><icon-edit /></button>
                <button type="button" class="muted" @click="deleteMarqueeOnce(marquee)" title="Supprimer le message"><icon-delete /></button>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { messageToString } from '../../common/chat-message';
import { getBlankMarquee, getMarqueeKey, marqueeEquals, Marquee } from '../../common/settings';
import { setSetting } from './sync/settings';
import IconAdd from './icons/Add.vue';
import IconDelete from './icons/Delete.vue';
import IconEdit from './icons/Edit.vue';
import IconFormatItalic from './icons/FormatItalic.vue';
import IconRepeat from './icons/Repeat.vue';
import IconVisibility from './icons/Visibility.vue';
import IconVisibilityOff from './icons/VisibilityOff.vue';
import { useSettings } from './sync/vue-settings';

export default defineComponent(useSettings({
    marquees: 'marquees',
    marqueesOnce: 'marqueesOnce',
}, {
    components: {
        IconAdd,
        IconDelete,
        IconEdit,
        IconFormatItalic,
        IconRepeat,
        IconVisibility,
        IconVisibilityOff,
    },
    data() {
        const blank = getBlankMarquee();

        return {
            newColor: blank.color,
            newAuthor: blank.author,
            newMessage: messageToString(blank.message),
            newEnabled: blank.enabled,
            newType: blank.type,
            newRepeat: true as boolean,
        };
    },
    methods: {
        nextType() {
            switch (this.newType) {
                case 'chat':
                    this.newType = 'action';
                    break;
                default:
                    this.newType = 'chat';
                    break;
            }
        },
        getMarqueeKey,
        messageToString,
        getNewMarquee() {
            const newMarquee: Marquee = {
                message: this.newMessage.trim(),
                type: this.newType,
                enabled: this.newEnabled,
            };
            const author = this.newAuthor.trim();
            if (author) {
                newMarquee.author = author;
                const color = this.newColor.trim();
                if (color) {
                    newMarquee.color = color;
                }
            }

            return newMarquee;
        },
        addMarquee() {
            const newMarquee = this.getNewMarquee();
            if (!newMarquee.message) {
                return;
            }

            if (this.newRepeat) {
                if (!this.marquees.some(mq => marqueeEquals(mq, newMarquee))) {
                    setSetting('marquees', this.marquees.concat([newMarquee]));
                }
            } else {
                if (!this.marqueesOnce.some(mq => marqueeEquals(mq, newMarquee))) {
                    setSetting('marqueesOnce', this.marqueesOnce.concat([newMarquee]));
                }
            }
            this.doEditMarquee(getBlankMarquee(), true);
        },
        toggleMarquee(marquee: Marquee) {
            marquee.enabled = !marquee.enabled;

            setSetting('marquees', this.marquees);
        },
        toggleMarqueeOnce(marquee: Marquee) {
            marquee.enabled = !marquee.enabled;

            setSetting('marqueesOnce', this.marqueesOnce);
        },
        editMarquee(marquee: Marquee, repeat: boolean) {
            this.doEditMarquee(Object.assign(getBlankMarquee(), marquee), repeat);
        },
        doEditMarquee(marquee: Required<Marquee>, repeat: boolean) {
            this.newColor = marquee.color;
            this.newAuthor = marquee.author;
            this.newMessage = messageToString(marquee.message);
            this.newEnabled = marquee.enabled;
            this.newType = marquee.type;
            this.newRepeat = repeat;
        },
        deleteMarquee(marquee: Marquee) {
            const i = this.marquees.indexOf(marquee);
            if (i < 0) {
                return;
            }

            const newMarquee = this.getNewMarquee();
            if (!marqueeEquals(marquee, newMarquee) && !confirm('Voulez-vous vraiment supprimer ce message défilant ?')) {
                return;
            }

            this.marquees.splice(i, 1);
            setSetting('marquees', this.marquees);
        },
        deleteMarqueeOnce(marquee: Marquee) {
            const i = this.marqueesOnce.indexOf(marquee);
            if (i < 0) {
                return;
            }

            this.marqueesOnce.splice(i, 1);
            setSetting('marqueesOnce', this.marqueesOnce);
        },
    },
}));
</script>

<style scoped>
.group {
    margin-bottom: 8px;
}

.group.muted {
    opacity: 0.5;
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

.group > input.author {
    width: calc(25% - 78px);
}

.group > input.author:first-child {
    margin-left: 32px;
    margin-right: 38px;
}

.group > * + * {
    margin-left: 8px;
}

input.type-action {
    font-style: italic;
}
</style>