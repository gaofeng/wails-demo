<template>
  <q-page>
    <div class="q-pa-md">
      <div class="row items-center justify-left">
        <q-select
          outlined
          :options="splist"
          v-model="selectedPort"
          label="串口列表"
          style="width: 150px"
          :display-value="selectedPort?.value"
          :readonly="isOpened"
          clearable
        >
        </q-select>
        <q-btn
          color="primary"
          @click="OpenClosePortClicked"
          class="q-ml-md"
          :loading="openCloseButtonLoading"
          :disabled="selectedPort === null"
        >
          {{ isOpened ? '关闭串口' : '打开串口' }}
        </q-btn>
      </div>
      <div>Friendly Name: {{ selectedPort?.friendlyName }}</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted, onUnmounted, ref } from 'vue';
import {
  ClosePort,
  GetPortList,
  PortIsOpen,
  OpenPort,
} from 'app/wailsjs/go/main/SerialManager';
import { debug } from 'debug';
import { ModbusRTUServer } from 'app/modbus/modbus';
import { Buffer } from 'buffer';
import { SerialStream } from 'src/serial/SerialStream';

const debug_log = debug('IndexPage');
const $q = useQuasar();

interface PortOpType {
  label: string;
  value: string;
  friendlyName: string;
}
let splist = ref<Array<PortOpType>>([]);
let selectedPort = ref<PortOpType | null>(null);
let openCloseButtonLoading = ref(false);

let isOpened = ref(false);
let portName = ref<string>();
let MBRTUServer: ModbusRTUServer;
let serial_stream: SerialStream;

onMounted(async () => {
  $q.notify({
    message: '页面已加载',
    icon: 'info',
    iconColor: 'green',
    position: 'top',
    timeout: 1000,
  });
  let list = await GetPortList();
  for (let i = 0; i < list.length; i++) {
    let sp = {
      label: `${list[i].Name} - ${list[i].Product}`,
      value: list[i].Name,
      friendlyName: list[i].Product,
    };
    splist.value.push(sp);
    if (await PortIsOpen(list[i].Name)) {
      selectedPort.value = sp;
      isOpened.value = true;
    }
  }
});

onUnmounted(() => {
  debug_log('Index page unmounted');
});

async function CloseSerialPort() {
  if (selectedPort.value != null) {
      serial_stream?.stop();
      await ClosePort(selectedPort.value.value);
      isOpened.value = false;
      $q.notify({
          message: `串口${portName.value}已关闭`,
          icon: 'info',
          iconColor: 'blue',
          position: 'top',
          timeout: 1000,
        });
    }
}

async function OpenClosePortClicked(): Promise<void> {
  if (isOpened.value) {
    //关闭串口
    await CloseSerialPort();
  } else {
    //打开串口
    try {
      if (selectedPort.value != null) {
        portName.value = selectedPort.value?.value;
        openCloseButtonLoading.value = true;
        await OpenPort(portName.value, 38400);
        isOpened.value = true;

        $q.notify({
          message: `串口${portName.value}已打开`,
          icon: 'info',
          iconColor: 'green',
          position: 'top',
          timeout: 1000,
        });
      }
    } catch (err: any) {
      $q.notify({
        message: err,
        icon: 'error',
        iconColor: 'red',
        position: 'top',
      });
      return;
    } finally {
      openCloseButtonLoading.value = false;
    }
    if (portName.value != null) {
      serial_stream = new SerialStream(portName.value);
      serial_stream.start();
      serial_stream.on('error', async (err: any) => {
        await CloseSerialPort();
        $q.notify({
          message: '串口读取数据出错' + err,
          icon: 'error',
          iconColor: 'red',
          position: 'top',
        });
      });
      MBRTUServer = new ModbusRTUServer(serial_stream, {
        holding: Buffer.alloc(100, 0x00),
        coils: Buffer.alloc(100, 0x00),
      });
    }
  }
}
</script>
