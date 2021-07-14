<template>
    <div>
        <section class="has-h3">
            <h3>Messages périodiques</h3>
            <div class="group">
                <label></label>
                <input v-model="mMessage" @keypress.enter="addMessage()" />
                <button type="button" :class="{ muted: !mEnabled }" @click="mEnabled = !mEnabled" title="Activer / Désactiver"><icon-visibility v-if="mEnabled" /><icon-visibility-off v-else /></button>
                <button type="button" class="primary" @click="addMessage()" title="Ajouter le message"><icon-add /></button>
            </div>
            <div v-for="message in periodicMessages" :key="message.message" class="group" :class="{ muted: !message.enabled }">
                <label></label>
                <input :value="message.message" readonly />
                <button type="button" :class="{ muted: !message.enabled }" @click="toggleMessage(message)" title="Activer / Désactiver"><icon-visibility v-if="message.enabled" /><icon-visibility-off v-else /></button>
                <button type="button" class="muted" @click="editMessage(message)" title="Modifier le message"><icon-edit /></button>
                <button type="button" class="muted" @click="deleteMessage(message)" title="Supprimer le message"><icon-delete /></button>
            </div>
        </section>
        <hr />
        <section class="has-h3">
            <h3>Commandes</h3>
            <div class="group">
                <input v-model="cCommand" class="command" />
                <input v-model="cReply" @keypress.enter="addCommand()" />
                <button type="button" :class="{ muted: !cEnabled }" @click="cEnabled = !cEnabled" title="Activer / Désactiver"><icon-visibility v-if="cEnabled" /><icon-visibility-off v-else /></button>
                <button type="button" class="primary" @click="addCommand()" title="Ajouter la commande"><icon-add /></button>
            </div>
            <div v-for="(command, name) in commands" :key="name" class="group" :class="{ muted: !command.enabled }">
                <input :value="name" class="command" readonly />
                <input :value="command.reply" readonly />
                <button type="button" :class="{ muted: !command.enabled }" @click="toggleCommand(command)" title="Activer / Désactiver"><icon-visibility v-if="command.enabled" /><icon-visibility-off v-else /></button>
                <button type="button" class="muted" @click="editCommand(command, name)" title="Modifier la commande"><icon-edit /></button>
                <button type="button" class="muted" @click="deleteCommand(name)" title="Supprimer la commande"><icon-delete /></button>
            </div>
        </section>
        <hr />
        <section class="has-h3">
            <h3>Citations</h3>
            <div class="group">
                <label class="quote-id">{{ (null != qId) ? ('#' + qId) : null }}</label>
                <input v-model="qAuthor" class="author" />
                <input v-model="qQuote" @keypress.enter="addQuote()" />
                <button type="button" :class="{ muted: !qEnabled }" @click="qEnabled = !qEnabled" title="Activer / Désactiver"><icon-visibility v-if="qEnabled" /><icon-visibility-off v-else /></button>
                <button type="button" class="primary" @click="addQuote()" title="Ajouter la citation"><icon-add /></button>
                <button type="button" class="muted" @click="cancelEditQuote()" title="Annuler la modification" :class="{ hidden: null == qId }"><icon-clear /></button>
            </div>
            <div v-for="quote in quotes" :key="quote.id" class="group" :class="{ muted: !quote.enabled }">
                <label class="quote-id">#{{ quote.id }}</label>
                <input :value="quote.author" class="author" readonly />
                <input :value="quote.quote" readonly />
                <button type="button" :class="{ muted: !quote.enabled }" @click="toggleQuote(quote)" title="Activer / Désactiver"><icon-visibility v-if="quote.enabled" /><icon-visibility-off v-else /></button>
                <button type="button" class="muted" @click="editQuote(quote)" title="Modifier la citation"><icon-edit /></button>
                <button type="button" class="muted" @click="deleteQuote(quote)" title="Supprimer la citation"><icon-delete /></button>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useSettings } from './sync/vue-settings';
import settings, { setSetting, setSettings } from './sync/settings';
import IconAdd from './icons/Add.vue';
import IconClear from './icons/Clear.vue';
import IconDelete from './icons/Delete.vue';
import IconEdit from './icons/Edit.vue';
import IconFormatItalic from './icons/FormatItalic.vue';
import IconRepeat from './icons/Repeat.vue';
import IconVisibility from './icons/Visibility.vue';
import IconVisibilityOff from './icons/VisibilityOff.vue';
import { PeriodicMessage, StaticCommand, Quote } from '../../common/settings';
import anyAscii from 'any-ascii';

export default defineComponent(useSettings({
    commands: 'staticCommands',
    periodicMessages: 'periodicMessages',
    quotes: 'quotes',
}, {
    components: {
        IconAdd,
        IconClear,
        IconDelete,
        IconEdit,
        IconFormatItalic,
        IconRepeat,
        IconVisibility,
        IconVisibilityOff,
    },
    data() {
        return {
            mMessage: '' as string,
            mEnabled: true as boolean,

            cCommand: '' as string,
            cReply: '' as string,
            cEnabled: true as boolean,

            qId: null as (number | null),
            qQuote: '' as string,
            qAuthor: '' as string,
            qEnabled: true as boolean,
        };
    },
    methods: {
        addMessage() {
            const mMessage = this.mMessage.trim();
            if (!mMessage) {
                return;
            }

            const message = this.periodicMessages.find(m => m.message === mMessage);
            if (null != message) {
                if (message.enabled !== this.mEnabled) {
                    message.enabled = this.mEnabled;

                    setSetting('periodicMessages', this.periodicMessages);
                }
            } else {
                const newMessage: PeriodicMessage = {
                    message: mMessage,
                    enabled: this.mEnabled,
                };
                setSetting('periodicMessages', this.periodicMessages.concat([newMessage]));
            }
            this.mMessage = '';
            this.mEnabled = true;
        },
        toggleMessage(message: PeriodicMessage) {
            message.enabled = !message.enabled;

            setSetting('periodicMessages', this.periodicMessages);
        },
        editMessage(message: PeriodicMessage) {
            this.mMessage = message.message;
            this.mEnabled = message.enabled;
        },
        deleteMessage(message: PeriodicMessage) {
            const i = this.periodicMessages.indexOf(message);
            if (i < 0) {
                return;
            }

            if (this.mMessage !== message.message && !confirm('Voulez-vous vraiment supprimer ce message périodique ?')) {
                return;
            }

            this.periodicMessages.splice(i, 1);
            setSetting('periodicMessages', this.periodicMessages);
        },
        addCommand() {
            const cCommand = anyAscii(this.cCommand).trim().toLowerCase();
            const cReply = this.cReply.trim();
            if (!cCommand || !cReply) {
                return;
            }

            const newCommand: StaticCommand = {
                reply: cReply,
                enabled: this.cEnabled,
            };

            this.commands[cCommand] = newCommand;
            setSetting('staticCommands', this.commands);
            this.cCommand = '';
            this.cReply = '';
            this.cEnabled = true;
        },
        toggleCommand(command: StaticCommand) {
            command.enabled = !command.enabled;

            setSetting('staticCommands', this.commands);
        },
        editCommand(command: StaticCommand, name: string) {
            this.cCommand = name;
            this.cReply = command.reply;
            this.cEnabled = command.enabled;
        },
        deleteCommand(name: string) {
            if (!(name in this.commands)) {
                return;
            }

            if ((anyAscii(this.cCommand).trim().toLowerCase() !== name || this.cReply !== this.commands[name].reply) && !confirm('Voulez-vous vraiment supprimer cette commande ?')) {
                return;
            }

            delete this.commands[name];
            setSetting('staticCommands', this.commands);
        },
        getNewQuote(): Quote {
            const newQuote: Quote = {
                id: this.qId ?? settings.nextQuoteId,
                quote: this.qQuote.trim(),
                enabled: this.qEnabled,
            };
            const qAuthor = this.qAuthor.trim();
            if (qAuthor) {
                newQuote.author = qAuthor;
            }

            return newQuote;
        },
        addQuote() {
            const newQuote = this.getNewQuote();
            if (!newQuote.quote) {
                return;
            }

            if (null != this.qId) {
                const quote = this.quotes.find(q => q.id === this.qId);
                if (null == quote) {
                    setSetting('quotes', this.quotes.concat([newQuote]));
                } else {
                    quote.quote = newQuote.quote;
                    if ('author' in newQuote) {
                        quote.author = newQuote.author;
                    } else {
                        delete quote.author;
                    }
                    quote.enabled = newQuote.enabled;
                    setSetting('quotes', this.quotes);
                }
            } else {
                const quote = this.quotes.find(q => q.author === newQuote.author && q.quote === newQuote.quote);
                if (null == quote) {
                    setSettings({
                        quotes: this.quotes.concat([newQuote]),
                        nextQuoteId: settings.nextQuoteId + 1,
                    });
                } else {
                    quote.enabled = newQuote.enabled;
                    setSetting('quotes', this.quotes);
                }
            }

            this.cancelEditQuote();
        },
        cancelEditQuote() {
            this.qId = null;
            this.qQuote = '';
            this.qAuthor = '';
            this.qEnabled = true;
        },
        toggleQuote(quote: Quote) {
            quote.enabled = !quote.enabled;

            setSetting('quotes', this.quotes);
        },
        editQuote(quote: Quote) {
            this.qId = quote.id;
            this.qQuote = quote.quote;
            this.qAuthor = quote.author ?? '';
            this.qEnabled = quote.enabled;
        },
        deleteQuote(quote: Quote) {
            const i = this.quotes.indexOf(quote);
            if (i < 0) {
                return;
            }

            const newQuote = this.getNewQuote();
            if ((newQuote.quote !== quote.quote || newQuote.author !== quote.author) && !confirm('Voulez-vous vraiment supprimer cette citation ?')) {
                return;
            }

            this.quotes.splice(i, 1);
            setSetting('quotes', this.quotes);
        },
    }
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

.group > label.quote-id {
    width: 40px;
}

.group > input:not([type]), .group > input[type="text"] {
    width: 50%;
    box-sizing: border-box;
}

.group > input.command {
    width: calc(25% - 8px);
}

.group > input.author {
    width: calc(25% - 56px);
}

.group > * + * {
    margin-left: 8px;
}
</style>