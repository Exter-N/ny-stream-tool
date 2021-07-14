<template>
    <div class="app-container">
        <nav>
            <ul class="tabs">
                <li @click="activeTab = 'color'" :class="{ selected: activeTab == 'color' }">Couleur</li>
                <li @click="activeTab = 'layout'" :class="{ selected: activeTab == 'layout' }">Disposition</li>
                <li @click="activeTab = 'marquees'" :class="{ selected: activeTab == 'marquees' }">Messages défilants</li>
                <li @click="activeTab = 'title'" :class="{ selected: activeTab == 'title' }">Titre</li>
                <li @click="activeTab = 'chat'" :class="{ selected: activeTab == 'chat' }">Chat</li>
                <li @click="activeTab = 'sounds'" :class="{ selected: activeTab == 'sounds' }">Sons</li>
                <li @click="activeTab = 'system'" :class="{ selected: activeTab == 'system' }">Système</li>
            </ul>
        </nav>
        <main>
            <color-pane :class="{ hidden: activeTab != 'color' }"></color-pane>
            <layout-pane :class="{ hidden: activeTab != 'layout' }"></layout-pane>
            <marquees-pane :class="{ hidden: activeTab != 'marquees' }"></marquees-pane>
            <title-pane :class="{ hidden: activeTab != 'title' }"></title-pane>
            <chat-pane :class="{ hidden: activeTab != 'chat' }"></chat-pane>
            <sounds-pane :class="{ hidden: activeTab != 'sounds' }"></sounds-pane>
            <system-pane :class="{ hidden: activeTab != 'system' }"></system-pane>
        </main>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ChatPane from './ChatPane.vue';
import ColorPane from './ColorPane.vue';
import LayoutPane from './LayoutPane.vue';
import MarqueesPane from './MarqueesPane.vue';
import SoundsPane from './SoundsPane.vue';
import SystemPane from './SystemPane.vue';
import TitlePane from './TitlePane.vue';

export default defineComponent({
    components: {
        ChatPane,
        ColorPane,
        LayoutPane,
        MarqueesPane,
        SoundsPane,
        SystemPane,
        TitlePane,
    },
    data() {
        return {
            activeTab: 'color',
        };
    },
});
</script>

<style scoped>
.app-container {
    display: flex;
    flex-flow: column nowrap;
    width: 100vw;
    height: 100vh;
}

nav {
    padding: 8px;
    background-color: #1f1f23;
    border-bottom: 1px solid #0d0d0f;
    box-shadow: rgba(0, 0, 0, 0.9) 0px 1px 2px 0px, rgba(0, 0, 0, 0.9) 0px 0px 2px 0px;
}

ul.tabs {
    list-style: none outside none;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
}

ul.tabs li {
    cursor: pointer;
    user-select: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
}
ul.tabs li + li {
    margin-left: 8px;
}

ul.tabs li:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

ul.tabs li:active {
    background-color: rgba(255, 255, 255, 0.15);
}

ul.tabs li.selected {
    background-color: #9147ff;
    cursor: default;
}

ul.tabs li.selected:hover {
    background-color: #9147ff;
}

ul.tabs li.selected:active {
    background-color: #9147ff;
}

main {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 8px;
}
</style>