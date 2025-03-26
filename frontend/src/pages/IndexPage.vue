<template>
  <q-page>
    <div class="q-pa-md">
      <PortSelector @port-opened="OnPortOpen" @port-closed="OnPortClose" ref="test_select" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { onMounted, onUnmounted, useTemplateRef} from 'vue'
import { debug } from 'debug'
// import {
//   ModbusAbstractRequest,
//   ModbusRTURequest,
//   ModbusRTUResponse,
//   ModbusRTUServer,
// } from 'app/modbus/modbus'
// import { SerialStream } from 'src/serial/SerialStream'
// import type { BufferCB } from 'app/modbus/modbus-server'
// import type { ReadHoldingRegistersRequestBody } from 'app/modbus/request'
// import { ReadHoldingRegistersResponseBody } from 'app/modbus/response'

import PortSelector from 'src/components/PortSelector.vue'

const debug_log = debug('IndexPage')
const $q = useQuasar()

// interface PortOpType {
//   label: string
//   value: string
//   friendlyName: string
// }
// const splist = ref<Array<PortOpType>>([])
// const selectedPort = ref<PortOpType | null>(null)
// const openCloseButtonLoading = ref(false)

// const isOpened = ref(false)
// const portName = ref<string>()
// let MBRTUServer: ModbusRTUServer
// let serial_stream: SerialStream


const selectRef = useTemplateRef('test_select')

onMounted(async () => {
  console.log("on mounted 3")
  $q.notify({
    message: '页面已加载',
    icon: 'info',
    iconColor: 'green',
    position: 'top',
    timeout: 1000,
  })
  // const list = await GetPortList()
  // if (list) {
  //   for (let i = 0; i < list.length; i++) {
  //     const sp = {
  //       label: `${list[i].Name} - ${list[i].Product}`,
  //       value: list[i].Name,
  //       friendlyName: list[i].Product,
  //     }
  //     splist.value.push(sp)
  //     if (await PortIsOpen(list[i].Name)) {
  //       selectedPort.value = sp
  //       portName.value = sp.value
  //       isOpened.value = true
  //     }
  //   }
  // }
})

onUnmounted(() => {
  debug_log('Index page unmounted')
})

function OnPortOpen(portName: string): void {
 console.log(selectRef.value.getSelectedPortInfo().friendlyName)
  $q.notify({
    message: `串口${portName}已打开3`,
    icon: 'info',
    iconColor: 'green',
    position: 'top',
    timeout: 1000,
  })
}

function OnPortClose(portName: string): void {
  $q.notify({
    message: `串口${portName}已关闭`,
    icon: 'info',
    iconColor: 'blue',
    position: 'top',
    timeout: 1000,
  })
}

// async function CloseSerialPort() {
//   if (selectedPort.value != null) {
//     serial_stream?.stop()
//     await ClosePort(selectedPort.value.value)
//     isOpened.value = false
//     $q.notify({
//       message: `串口${portName.value}已关闭`,
//       icon: 'info',
//       iconColor: 'blue',
//       position: 'top',
//       timeout: 1000,
//     })
//   }
// }

// async function OpenClosePortClicked(): Promise<void> {
//   if (isOpened.value) {
//     //关闭串口
//     await CloseSerialPort()
//   } else {
//     //打开串口
//     try {
//       if (selectedPort.value != null) {
//         portName.value = selectedPort.value?.value
//         openCloseButtonLoading.value = true
//         await OpenPort(portName.value, 38400)
//         isOpened.value = true

//         $q.notify({
//           message: `串口${portName.value}已打开`,
//           icon: 'info',
//           iconColor: 'green',
//           position: 'top',
//           timeout: 1000,
//         })
//       }
//     } catch (err: any) {
//       $q.notify({
//         message: err,
//         icon: 'error',
//         iconColor: 'red',
//         position: 'top',
//       })
//       return
//     } finally {
//       openCloseButtonLoading.value = false
//     }
//     if (portName.value != null) {
//       serial_stream = new SerialStream(portName.value)
//       serial_stream.start()
//       serial_stream.on('error', async (err: any) => {
//         await CloseSerialPort()
//         $q.notify({
//           message: '串口读取数据出错' + err,
//           icon: 'error',
//           iconColor: 'red',
//           position: 'top',
//         })
//       })
//       MBRTUServer = new ModbusRTUServer(serial_stream, {
//         holding: undefined,
//         coils: undefined,
//       })

//       MBRTUServer.on('readHoldingRegisters', readHoldingRegisters)
//     }
//   }
// }

// function readHoldingRegisters(request: ModbusAbstractRequest, cb: BufferCB): void {
//   const rtu_request = request as ModbusRTURequest
//   const body = rtu_request.body as ReadHoldingRegistersRequestBody
//   console.log(
//     `请求读多个保持寄存器 站号:${rtu_request.slaveId}, 地址: ${body.start}, 个数:${body.count}`,
//   )
//   // let frame = rtu_request.createPayload();
//   const bufferSegment = Array<number>(10)
//   for (let i = 0; i < 10; i++) {
//     bufferSegment[i] = Math.floor(Math.random() * 1000) // 随机生成1000以内的数值
//   }
//   const respond_body = new ReadHoldingRegistersResponseBody(bufferSegment.length * 2, bufferSegment)
//   const rtu_response = new ModbusRTUResponse(rtu_request.address, undefined, respond_body)
//   const rtu_response_frame = rtu_response.createPayload()
//   cb(rtu_response_frame)

//   //console.log("接收到数据帧：", frame);
//   /**
//    let response_body = err.response.body as ExceptionResponseBody
//         console.log('返回异常帧：' + response_body.message)
//         let rtu_response = new ModbusRTUResponse(err.response.address, undefined, err.response.body)
//         let rtu_response_frame = rtu_response.createPayload()
//         cb(rtu_response_frame)
//    */
// }
</script>
