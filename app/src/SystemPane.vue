<template>
    <div>
        <section class="has-h3">
            <h3>Maintenance</h3>
            <div class="actions">
                <button type="button" class="primary" @click="reload()">Recharger l'overlay</button>
                <button type="button" class="danger" @click="restartServer()" v-if="hasApi">Redémarrer le serveur</button>
            </div>
        </section>
        <hr />
        <section class="has-h3">
            <h3>Données</h3>
            <div class="actions">
                <button type="button" @click="refreshRewards()">Actualiser les récompenses</button>
                <button type="button" @click="refreshRoles()">Actualiser les rôles (modérateur / VIP)</button>
                <button type="button" @click="refreshFFZBots()">Actualiser les bots</button>
                <button type="button" @click="refreshFFZBots()">Actualiser les émoticônes globales FFZ</button>
                <button type="button" @click="refreshFFZRoom()">Actualiser les données de salon FFZ</button>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import api from './api';
import { rpc } from './sync/ws';

export default defineComponent({
    data() {
        return {
            hasApi: null != api,
        };
    },
    methods: {
        restartServer() {
            api?.restartServer();
        },
        reload() {
            rpc('reload', { });
        },
        refreshRewards() {
            rpc('refreshRewards', { });
        },
        refreshRoles() {
            rpc('refreshRoles', { });
        },
        refreshFFZBots() {
            rpc('refreshFFZBots', { });
        },
        refreshFFZEmotes() {
            rpc('refreshFFZEmotes', { });
        },
        refreshFFZRoom() {
            rpc('refreshFFZRoom', { });
        },
    },
});
</script>

<style scoped>
div.actions {
    display: flex;
    flex-flow: row wrap;
}

div.actions > button {
    margin-bottom: 8px;
    width: calc(50% - 4px);
}

div.actions > button:nth-child(2n) {
    margin-left: 8px;
}
</style>