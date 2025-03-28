<template>
  <q-page>
    <div class="q-pa-md">
      <PortSelector
        @port-opened="OnPortOpen"
        @port-closed="OnPortClose"
        @port-error="OnPortError"
        app="select1"
        v-model="openedPortName"
      />
      <PortSelector
        @port-opened="OnPortOpen"
        @port-closed="OnPortClose"
        app="select2"
        v-model="openedPortName2"
      />
    </div>
    <div class="q-pa-md q-gutter-md">
      <q-btn @click="HttpTest">Http Test</q-btn>
      <q-btn @click="PortTest">Port Test</q-btn>
    </div>
    <div>
      {{ openedPortName }}
      {{ openedPortName2 }}
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { onMounted, onUnmounted, ref } from 'vue'
import { debug } from 'debug'
import {
  ModbusAbstractRequest,
  ModbusRTURequest,
  ModbusRTUResponse,
  ModbusRTUServer,
} from 'app/modbus/modbus'
import { SerialStream } from 'src/serial/SerialStream'
import type { BufferCB } from 'app/modbus/modbus-server'
import type { ReadHoldingRegistersRequestBody } from 'app/modbus/request'
import { ReadHoldingRegistersResponseBody } from 'app/modbus/response'

import PortSelector from 'src/components/PortSelector.vue'
import { api } from 'src/boot/axios'

const openedPortName = ref<string | null>(null)
const openedPortName2 = ref<string | null>(null)

const debug_log = debug('IndexPage')
const $q = useQuasar()

let MBRTUServer: ModbusRTUServer
let serial_stream: SerialStream

function ShowMsg(msg: string) {
  $q.notify({
    message: msg,
    icon: 'info',
    iconColor: 'green',
    position: 'top',
    timeout: 1000,
  })
}

function ShowErr(msg: string) {
  $q.notify({
    message: msg,
    icon: 'error',
    iconColor: 'red',
    position: 'top',
    timeout: 3000,
  })
}

onMounted(async () => {
  console.log('on mounted')
  ShowMsg('页面已加载')
})

onUnmounted(() => {
  debug_log('Index page unmounted')
})

function HttpTest() {
  api
    .get('/control/init')
    .then((response) => {
      const msg: any = response.data
      if (msg.success) {
        ShowMsg('初始化成功!上位机路径为:' + msg.message)
      } else {
        ShowErr(msg.message)
      }
    })
    .catch((err) => {
      ShowErr(err.message)
    })
}

function PortTest() {
  ShowMsg(openedPortName.value)
}

function OnPortOpen(portName: string): void {
  ShowMsg(`串口${portName}已打开`)
  if (portName != null) {
    serial_stream = new SerialStream(portName)
    serial_stream.start()
    // serial_stream.on('error', async (err: any) => {
    //   // await CloseSerialPort()
    //   ShowErr('串口读取数据出错:' + err)
    // })
    MBRTUServer = new ModbusRTUServer(serial_stream, {
      holding: undefined,
      coils: undefined,
    })

    MBRTUServer.on('readHoldingRegisters', readHoldingRegisters)
  }
}

function OnPortClose(portName: string): void {
  ShowMsg(`串口${portName}已关闭`)
}

function OnPortError(portName: string, code: number, msg: string): void {
  ShowErr(`串口[${portName}]打开失败，错误信息为:${msg}, 错误码为:${code}`)
}

function readHoldingRegisters(request: ModbusAbstractRequest, cb: BufferCB): void {
  const rtu_request = request as ModbusRTURequest
  const body = rtu_request.body as ReadHoldingRegistersRequestBody
  console.log(
    `请求读多个保持寄存器 站号:${rtu_request.slaveId}, 地址: ${body.start}, 个数:${body.count}`,
  )
  // let frame = rtu_request.createPayload();
  const bufferSegment = Array<number>(10)
  for (let i = 0; i < 10; i++) {
    bufferSegment[i] = Math.floor(Math.random() * 1000) // 随机生成1000以内的数值
  }
  const respond_body = new ReadHoldingRegistersResponseBody(bufferSegment.length * 2, bufferSegment)
  const rtu_response = new ModbusRTUResponse(rtu_request.address, undefined, respond_body)
  const rtu_response_frame = rtu_response.createPayload()
  cb(rtu_response_frame)

  //console.log("接收到数据帧：", frame);
  /**
   let response_body = err.response.body as ExceptionResponseBody
        console.log('返回异常帧：' + response_body.message)
        let rtu_response = new ModbusRTUResponse(err.response.address, undefined, err.response.body)
        let rtu_response_frame = rtu_response.createPayload()
        cb(rtu_response_frame)
   */
}
</script>
