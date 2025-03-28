<template>
  <div class="serial-port-selector">
    <div class="row items-center justify-start q-pa-xs">
      <q-select
        outlined
        :options="splist"
        v-model="selectedPort"
        label="串口列表"
        style="width: 150px"
        :display-value="selectedPort?.value"
        :readonly="isOpened"
        clearable
      />
      <q-btn
        :color="isOpened ? 'deep-orange' : 'primary'"
        @click="OpenClosePortClicked"
        class="q-ml-md"
        :loading="openCloseButtonLoading"
        :disabled="!selectedPort"
        glossy
      >
        {{ isOpened ? '关闭串口' : '打开串口' }}
      </q-btn>
      <div class="q-pa-md">串口描述: {{ selectedPort?.friendlyName || '未选择' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { GetPortList, ClosePort, OpenPort, PortIsOpen } from 'app/wailsjs/go/main/SerialManager'
import { EventsOn } from 'app/wailsjs/runtime/runtime'

// 定义接口
interface PortOpType {
  label: string
  value: string
  friendlyName: string
}

const portName = defineModel()

// 定义props
const props = defineProps<{
  app?: string
}>()
console.log('app', props.app)
// 定义emit事件
const emit = defineEmits<{
  (e: 'port-opened', portName: string): void
  (e: 'port-closed', portName: string): void
  (e: 'port-error', portName: string, code: number, msg: string): void
}>()

//串口对象数组
const splist = ref<Array<PortOpType>>([])
const selectedPort = ref<PortOpType | null>(null)
const openCloseButtonLoading = ref(false)
const isOpened = ref(false)

// 初始化串口列表
const initPortList = async () => {
  try {
    splist.value = []
    const list = await GetPortList()
    if (list) {
      for (let i = 0; i < list.length; i++) {
        const sp = {
          label: `${list[i].Name} - ${list[i].Product}`,
          value: list[i].Name,
          friendlyName: list[i].Product,
        }
        splist.value.push(sp)
        if (await PortIsOpen(list[i].Name, props.app)) {
          selectedPort.value = sp
          portName.value = sp.value
          isOpened.value = true
        }
      }
    }
  } catch (error) {
    console.error('初始化串口列表失败:', error)
  }
}

// 打开/关闭串口
async function OpenClosePortClicked(): Promise<void> {
  if (isOpened.value) {
    // 关闭串口
    if (selectedPort.value != null) {
      await ClosePort(selectedPort.value.value, props.app)
      isOpened.value = false
      portName.value = ''
      emit('port-closed', selectedPort.value.value)
    } else {
      portName.value = ''
      console.warn('未选择串口')
    }
  } else {
    // 打开串口
    if (selectedPort.value == null) {
      console.warn('未选择串口')
      return
    }
    try {
      openCloseButtonLoading.value = true
      await OpenPort(selectedPort.value.value, 38400, props.app)
      isOpened.value = true
      portName.value = selectedPort.value.value
      emit('port-opened', selectedPort.value.value)
      EventsOn(`serial-error-${selectedPort.value.value}`, async (code, error) => {
        console.error(`串口[${selectedPort.value.value}]发生错误，错误信息为:${error}, 错误码为:${code}`)
        await ClosePort(selectedPort.value.value, props.app)
        isOpened.value = false
        portName.value = ''
        emit('port-error', selectedPort.value.value, code, error)
        selectedPort.value = null
        portName.value = ''
        initPortList()
      })
    } catch (error: any) {
      const err_list = error.split(',')
      if (err_list.length > 1) {
        emit('port-error', selectedPort.value.value, err_list[0], err_list[1])
      } else {
        console.error('串口打开失败:', error)
        emit('port-error', selectedPort.value.value, -1, '串口打开失败')
      }
    } finally {
      openCloseButtonLoading.value = false
    }
  }
}

// 组件挂载时初始化
onMounted(() => {
  initPortList()
})

// 暴露给外部的方法和属性
defineExpose({
  getCurrentPort: () => portName.value, // 获取当前选中的串口号
  isPortOpened: () => isOpened.value, // 获取串口打开状态
  getSelectedPortInfo: () => selectedPort.value, // 获取完整的端口信息
})
</script>

<style scoped>
.serial-port-selector {
  padding: 10px;
}
</style>
