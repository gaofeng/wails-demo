<template>
  <q-page>
    <div class="q-pa-md">
      <div class="row items-center justify-left">
        <q-select
          filled
          :options="splist"
          v-model="selectedPort"
          label="串口列表"
          style="width: 150px"
          :display-value="selectedPort?.value"
        >
          <template v-slot:append>
            <q-icon
              v-if="selectedPort !== null"
              class="cursor-pointer"
              name="clear"
              @click.stop.prevent="selectedPort = null"
            />
          </template>
        </q-select>
        <q-btn color="primary" @click="OpenSerialPort" class="q-ml-md">
          打开串口
        </q-btn>
        <q-btn color="purple" @click="CloseSerialPort" class="q-ml-md">
          关闭串口
        </q-btn>
        <q-btn color="black" @click="SendDataTest" class="q-ml-md">
          发送数据
        </q-btn>
      </div>
      <div>Selected COM: {{ selectedPort?.value }}</div>
      <div>Selected COM Label: {{ selectedPort?.friendlyName }}</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// import { useQuasar } from 'quasar';
import { EventsOn, LogDebug } from 'app/wailsjs/runtime/runtime';
import { onMounted, ref } from 'vue';
import {
  ClosePort,
  GetPortList,
  OpenPort,
  SendData,
} from 'app/wailsjs/go/main/SerialManager';
import { debug } from 'debug';
import { CustomStream } from 'app/modbus/CustomStream';
import { ModbusRTUServer } from 'app/modbus/modbus';
import { Buffer } from 'buffer';

var debug_log = debug('wailsjs');
// const $q = useQuasar();
interface PortOpType {
  label: string;
  value: string;
  friendlyName: string;
}
let splist = ref<Array<PortOpType>>([]);
let selectedPort = ref<PortOpType | null>();

class SerialStream extends CustomStream {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  write(chunk: Buffer, _callback?: (error?: Error | null) => void) {
    if (!Buffer.isBuffer(chunk)) {
      throw new Error('chunk must be a Buffer');
    }
    const data = Array.from(chunk);
    if (selectedPort.value != null) {
      SendData(selectedPort.value.value, data).then(() =>{
        if (_callback != null) {
          _callback();
        }
      });
    }
    // 返回 true 表示可以继续写入
    return true;
  }
}

const serial = new SerialStream();

function base64ToHexWithSpaces(base64Str: string): string {
  // 解码 Base64 字符串为字节数组
  const binaryStr = atob(base64Str);
  // 将每个字符转换为其十六进制表示，并用空格分隔
  const hexArray = [];
  for (let i = 0; i < binaryStr.length; i++) {
    const hex = binaryStr
      .charCodeAt(i)
      .toString(16)
      .toUpperCase()
      .padStart(2, '0');
    hexArray.push(hex);
  }

  // 用空格连接数组元素
  return hexArray.join(' ');
}

onMounted(async () => {
  LogDebug('Index page mounted.');
  debug_log('Index page mounted');
  let list = await GetPortList();
  for (let i = 0; i < list.length; i++) {
    splist.value.push({
      label: `${list[i].Name} - ${list[i].Product}`,
      value: list[i].Name,
      friendlyName: list[i].Product,
    });
  }
});

async function OpenSerialPort(): Promise<void> {
  try {
    if (selectedPort.value != null) {
      const portName = selectedPort.value?.value;
      debug_log('OpenSerialPort:%s', portName);
      await OpenPort(portName, 38400);
      EventsOn(`serial-data-${portName}`, (base64Str) => {
        // console.log(
        //   `Received data from ${portName}:`,
        //   base64ToHexWithSpaces(data)
        // );
        const binaryStr = atob(base64Str);
        const numberArray = [];
        for (let i = 0; i < binaryStr.length; i++) {
          numberArray.push(binaryStr.charCodeAt(i));
        }
        const buf = Buffer.from(numberArray);
        serial.emit('data', buf);
      });
    }
  } catch (err) {
    console.log(err);
  }
}
async function CloseSerialPort(): Promise<void> {
  if (selectedPort.value != null) {
    await ClosePort(selectedPort.value?.value);
  }
}

async function SendDataTest(): Promise<void> {
  const data = Array.from('hello world').map((char) => char.charCodeAt(0));
  if (selectedPort.value != null) {
    await SendData(selectedPort.value?.value, data);
  }
}

let MBRTUServer: ModbusRTUServer;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
MBRTUServer = new ModbusRTUServer(serial, {
  holding: Buffer.alloc(100, 0x00),
  coils: Buffer.alloc(100, 0x00),
});
</script>
