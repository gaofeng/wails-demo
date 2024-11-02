<template>
  <q-layout view="lhh LpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer :width="200" v-model="leftDrawerOpen" bordered>
      <q-scroll-area class="fit">
        <q-list padding>
          <NavigateMenu
            v-for="link in NavigateMenus"
            :key="link.title"
            v-bind="link"
          />
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NavigateMenu from 'components/NavigateMenuComponent.vue';

defineOptions({
  name: 'MainLayout',
});

const NavigateMenus = [
  {
    title: '主页',
    caption: '测试页面',
    icon: 'terminal',
    link: '/',
  },
  {
    title: 'About',
    caption: '关于 Quasar',
    icon: 'info',
    link: '/about',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
