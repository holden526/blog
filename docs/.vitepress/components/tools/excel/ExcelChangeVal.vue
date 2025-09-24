<script setup lang="ts">
import {
  NUpload,
  NUploadDragger,
  NAlert,
  NInput,
  UploadFileInfo,
  useMessage,
  NButton,
  NInputGroup,
  NInputGroupLabel,
  NSpace,
  NP,
  NCard,
  NIcon,
  NText,
  NFormItem,
  NSelect,
  NTabs,
  NTabPane,
} from 'naive-ui'
import { ref } from 'vue'
import ExcelJS from 'exceljs'

// 用户选择的文件
const inputFile = ref<File | null>(null)

// 单元格范围输入
const cellRanges = ref('')

// 处理模式选择
const processMode = ref<'original' | 'custom'>('original')

// 自定义文本输入
const customText = ref('')

// 小数位数（下拉 0-20）
const decimalPlacesInput = ref<number>(2)
const decimalOptions = Array.from({ length: 21 }, (_, i) => ({
  label: `${i} 位`,
  value: i,
}))

// 四舍五入 / 截断（下拉选择）
const roundMethod = ref<'round' | 'truncate'>('round')
const roundOptions = [
  { label: '四舍五入', value: 'round' },
  { label: '直接截断', value: 'truncate' },
]

// 加载状态
const loading = ref(false)
const message = useMessage()

// 获取小数位数
const getDecimalPlaces = (): number => decimalPlacesInput.value

// 文件上传处理
const handleInputChange = ({ fileList }: { fileList: UploadFileInfo[] }) => {
  inputFile.value = fileList[0]?.file as File | null
}

// 列字母与数字转换
const numberToColumn = (num: number): string => {
  let result = ''
  while (num > 0) {
    num--
    result = String.fromCharCode(65 + (num % 26)) + result
    num = Math.floor(num / 26)
  }
  return result
}
const columnToNumber = (col: string): number => {
  let result = 0
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64)
  }
  return result
}

// 数值格式化
const formatNumber = (value: number, decimal: number): number => {
  const factor = Math.pow(10, decimal)
  return roundMethod.value === 'round'
    ? Math.round(value * factor) / factor
    : Math.trunc(value * factor) / factor
}

// 获取数值
const getNumericValue = (value: any): number | null => {
  if (typeof value === 'number' && !isNaN(value)) return value
  if (typeof value === 'string' && !isNaN(parseFloat(value))) return parseFloat(value)
  if (typeof value === 'object' && value !== null && 'result' in value) {
    const res = (value as any).result
    if (typeof res === 'number' && !isNaN(res)) return res
    if (typeof res === 'string' && !isNaN(parseFloat(res))) return parseFloat(res)
  }
  return null
}

// 解析单元格范围
const parseCellRanges = (rangeString: string): string[] => {
  if (!rangeString.trim()) return []
  const ranges = rangeString.split(',').map((range) => range.trim().toUpperCase())
  const validCells: string[] = []
  ranges.forEach((range) => {
    if (range.includes(':')) {
      const [startCell, endCell] = range.split(':')
      const startMatch = startCell.match(/^([A-Z]+)(\d+)$/)
      const endMatch = endCell.match(/^([A-Z]+)(\d+)$/)
      if (startMatch && endMatch) {
        const startCol = columnToNumber(startMatch[1])
        const startRow = parseInt(startMatch[2])
        const endCol = columnToNumber(endMatch[1])
        const endRow = parseInt(endMatch[2])
        for (let row = startRow; row <= endRow; row++) {
          for (let col = startCol; col <= endCol; col++) {
            validCells.push(numberToColumn(col) + row)
          }
        }
      }
    } else {
      if (/^[A-Z]+\d+$/.test(range)) {
        validCells.push(range)
      }
    }
  })
  return validCells
}

// 主处理函数
const processFile = async () => {
  try {
    if (!inputFile.value) {
      message.error('请上传 Excel 文件')
      return
    }
    if (!cellRanges.value.trim()) {
      message.error('请输入要处理的单元格范围')
      return
    }

    if (processMode.value === 'custom' && !customText.value) {
      message.error('请输入要填充的自定义文本')
      return
    }

    loading.value = true
    const data = await inputFile.value.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(data)

    const cellAddresses = parseCellRanges(cellRanges.value)
    if (cellAddresses.length === 0) {
      message.error('请输入有效的单元格范围（如：A1,B2:C5）')
      loading.value = false
      return
    }

    let totalCount = 0
    workbook.eachSheet((sheet) => {
      cellAddresses.forEach((cellAddress) => {
        try {
          const match = cellAddress.match(/^([A-Z]+)(\d+)$/)
          if (!match) return
          const colNum = columnToNumber(match[1])
          const rowNum = parseInt(match[2])
          const cell = sheet.getCell(rowNum, colNum)

          if (processMode.value === 'custom') {
            if (cell.value !== null && cell.value !== undefined) totalCount++
            cell.value = customText.value
          } else if (processMode.value === 'original') {
            const num = getNumericValue(cell.value)
            if (num !== null) {
              const dp = getDecimalPlaces()
              const formattedValue = formatNumber(num, dp)
              if (num !== formattedValue) {
                cell.value = formattedValue
                totalCount++
              }
            }
          }
        } catch (e) {
          console.error(`处理单元格 ${cellAddress} 出错:`, e)
        }
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `处理后的文件_${new Date().toLocaleString('zh-CN').replace(/[/:\s]/g, '')}.xlsx`
    link.click()
    URL.revokeObjectURL(url)

    message.success(`成功处理 ${totalCount} 个单元格！`)
  } catch (e) {
    message.error('文件处理失败，请检查格式')
    console.error('处理异常:', e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="excel-cell-editor-container">
    <n-card title="上传 Excel 文件" embedded>
      <n-alert style="margin-bottom: 20px" title="使用说明" type="info">
        <ul class="template-syntax-list">
          <li>支持 <code>.xlsx</code> 和 <code>.xls</code> 文件</li>
          <li>文件仅在浏览器本地处理，不会上传</li>
          <li>所有工作表中指定的单元格都会被处理</li>
        </ul>
      </n-alert>

      <NUpload
        :max="1"
        multiple
        directory-dnd
        :default-upload="false"
        accept=".xlsx,.xls"
        @change="handleInputChange"
      >
        <n-upload-dragger>
          <n-icon size="48" :depth="3" style="margin-bottom: 12px">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="currentColor"
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM16 18H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V8h8v2z"
              />
            </svg>
          </n-icon>
          <n-text style="font-size: 16px"> 点击或拖动文件到此区域上传 </n-text>
          <n-p depth="3" style="margin: 8px 0 0 0"> 支持 .xlsx 和 .xls 文件 </n-p>
          <n-p v-if="inputFile?.name" style="margin-top: 12px; color: #18a058">
            当前文件：{{ inputFile.name }}
          </n-p>
        </n-upload-dragger>
      </NUpload>
    </n-card>

    <n-card title="设置处理方式" embedded>
      <n-input-group style="margin: 13px 0">
        <n-input-group-label>单元格范围</n-input-group-label>
        <n-input v-model:value="cellRanges" type="text" placeholder="A1,B2:C5,D10" />
      </n-input-group>

      <n-form-item label="处理模式">
        <n-tabs v-model:value="processMode" type="line">
          <n-tab-pane name="original" tab="数值格式化">
            <n-space vertical>
              <n-space align="center">
                <span>保留</span>
                <n-select
                  v-model:value="decimalPlacesInput"
                  :options="decimalOptions"
                  style="width: 120px"
                />
                <span>位小数</span>
              </n-space>

              <n-space align="center">
                <span>小数处理方式</span>
                <n-select
                  v-model:value="roundMethod"
                  :options="roundOptions"
                  style="width: 150px"
                />
              </n-space>
            </n-space>
          </n-tab-pane>

          <n-tab-pane name="custom" tab="自定义文本">
            <n-input
              v-model:value="customText"
              placeholder="输入要填充的文本，如：M3"
              style="margin-top: 8px; width: 100%"
            />
          </n-tab-pane>
        </n-tabs>
      </n-form-item>
    </n-card>

    <n-button
      strong
      secondary
      type="primary"
      :loading="loading"
      size="large"
      block
      style="margin: 20px 0"
      @click="processFile"
      :disabled="
        !inputFile || !cellRanges.trim() || (processMode === 'custom' && !customText.trim())
      "
    >
      {{ loading ? '处理中...' : '开始处理' }}
    </n-button>
  </div>
</template>

<style scoped lang="scss">
.excel-cell-editor-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;

  .template-syntax-list {
    margin: 0;
    padding-left: 20px;
    font-size: 14px;

    code {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
  }
}
</style>
