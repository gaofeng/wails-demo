<template>
  <q-page class="row items-center justify-evenly">
    <q-btn>I'm 高峰</q-btn>
  </q-page>
</template>

<script setup lang="ts">
import { LogDebug } from 'app/wailsjs/runtime/runtime';
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  LogDebug('about page mounted.');
});
onUnmounted(() => {
  LogDebug('about page unmounted.');
});
</script>
