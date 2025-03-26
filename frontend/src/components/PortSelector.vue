<template>
  <div class="serial-port-selector">
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
    </div>
    <div class="row items-center">Friendly Name: {{ selectedPort?.friendlyName || '未选择' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { GetPortList, ClosePort, OpenPort } from 'app/wailsjs/go/main/SerialManager'

// 定义接口
interface PortOpType {
  label: string
  value: string
  friendlyName: string
}

// 定义props
defineProps<{
  portList?: Array<{ Name: string; Product: string }>
}>()

// 定义emit事件
const emit = defineEmits<{
  (e: 'port-opened', portName: string): void
  (e: 'port-closed', portName: string): void
}>()

//串口对象数组
const splist = ref<Array<PortOpType>>([])
const selectedPort = ref<PortOpType | null>(null)
const openCloseButtonLoading = ref(false)
const isOpened = ref(false)
const portName = ref<string>('')

// 初始化串口列表
const initPortList = async () => {
  try {
    const list = await GetPortList()
    if (list && list.length > 0) {
      splist.value = list.map((item) => ({
        label: `${item.Name} - ${item.Product}`,
        value: item.Name,
        friendlyName: item.Product,
      }))
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
      await ClosePort(selectedPort.value.value)
      isOpened.value = false
      emit('port-closed', selectedPort.value.value)
    } else {
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
      await OpenPort(selectedPort.value.value, 38400)
      isOpened.value = true
      portName.value = selectedPort.value.value
      emit('port-opened', portName.value)
    } catch (error) {
      if (error == 'Serial port busy') {
        isOpened.value = true
        portName.value = selectedPort.value.value
      }
      console.error('串口打开失败:', error)
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
