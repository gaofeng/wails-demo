<template>
  <q-page class="row items-left">
    <div class="row q-pa-sm">
      <q-select
        :options="splist"
        v-model="portPath"
        label="串口列表"
        style="width: 250px"
      ></q-select>
      <q-btn @click="OpenSerialPort"> 打开串口 </q-btn>
      <q-btn @click="CloseSerialPort"> 关闭串口 </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// import { useQuasar } from 'quasar';
import { LogDebug } from 'app/wailsjs/runtime/runtime';
import { onMounted, ref } from 'vue';
import { GetPortList } from 'app/wailsjs/go/main/SerialManager';
// const $q = useQuasar();

let splist = ref<Array<object>>([]);
let portPath = ref<{ value: string; label: string }>();
onMounted(async () => {
  LogDebug('Index page mounted.');
  let list = await GetPortList();
  splist.value = [];
  for (let i = 0; i < list.length; i++) {
    splist.value.push({
      label: `${list[i].Name} - ${list[i].Product}`,
      value: list[i].Name,
    });
  }
});

function OpenSerialPort(): void {}
function CloseSerialPort(): void {}
</script>
