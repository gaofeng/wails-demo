<template>
  <div>
    <p>{{ title }}</p>
    <ul>
      <li v-for="todo in todos" :key="todo.id" @click="increment">
        {{ todo.id }} - {{ todo.content }}
      </li>
    </ul>
    <p>Count: {{ todoCount }} / {{ meta.totalCount }}</p>
    <p>return message: {{ msg }}</p>
    <p>Clicks on todos: {{ clickCount }}</p>
    <q-btn @click="callBackend">bind test</q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Todo, Meta } from './models';
import { Greet } from '../../wailsjs/go/main/App';
import { EventsOn } from '../../wailsjs/runtime';

interface Props {
  title: string;
  todos?: Todo[];
  meta: Meta;
  active: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  todos: () => [],
});

const clickCount = ref(0);
function increment() {
  clickCount.value += 1;
  return clickCount.value;
}
const msg = ref('');
function callBackend() {
  msg.value = 'init';
  setTimeout(() => {
    Greet('gaofeng').then((result) => {
      msg.value = result;
    });
  }, 1000);
}

function base64ToUint8Array(base64String: string) {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const todoCount = computed(() => props.todos.length);
EventsOn('backendMessage', (msg) => {
  console.log('Received message from backend:', base64ToUint8Array(msg));
});
</script>
