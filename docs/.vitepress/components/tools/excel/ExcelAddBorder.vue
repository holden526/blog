<script setup lang="ts">
import {
  NUpload,
  NUploadDragger,
  NAlert,
  NIcon,
  NInput,
  UploadFileInfo,
  useMessage,
  NButton,
  NInputGroup,
  NInputGroupLabel,
  NCheckbox,
  NSpace,
} from 'naive-ui'
import { ref } from 'vue'
import ExcelJS from 'exceljs'
import { DriveFolderUploadOutlined } from '@vicons/material'
const cellRanges = ref('')
const message = useMessage()
const loading = ref(false)
let inputFile: File | null | undefined = null

// 边框选择
const borderOptions = ref({
  top: false,
  right: false,
  bottom: false,
  left: false,
})

// 获取文件
const handleInputChange = async ({ fileList }: { fileList: UploadFileInfo[] }) => {
  inputFile = fileList[0]?.file
}

// 解析单元格字符串，只接受单个单元格，用逗号分隔
const parseCellRanges = (rangeString: string): string[] => {
  if (!rangeString.trim()) return []

  const cells = rangeString.split(',').map((cell) => cell.trim().toUpperCase())
  const validCells: string[] = []

  cells.forEach((cell) => {
    // 验证单元格格式（例如：A1, B2, AA10）
    if (/^[A-Z]+\d+$/.test(cell)) {
      validCells.push(cell)
    }
  })

  return validCells
}

// 为单元格添加指定的边框
const addSelectedBorders = (cell: ExcelJS.Cell) => {
  if (!cell.border) {
    cell.border = {}
  }

  // 只为选中的边框添加样式
  if (borderOptions.value.top) {
    cell.border.top = {
      style: 'thin',
      color: { argb: 'FF000000' }, // 黑色
    }
  }

  if (borderOptions.value.right) {
    cell.border.right = {
      style: 'thin',
      color: { argb: 'FF000000' }, // 黑色
    }
  }

  if (borderOptions.value.bottom) {
    cell.border.bottom = {
      style: 'thin',
      color: { argb: 'FF000000' }, // 黑色
    }
  }

  if (borderOptions.value.left) {
    cell.border.left = {
      style: 'thin',
      color: { argb: 'FF000000' }, // 黑色
    }
  }
}

// 为指定的单元格添加边框
const processCells = (sheet: ExcelJS.Worksheet, cellAddresses: string[]) => {
  cellAddresses.forEach((cellAddress) => {
    try {
      const cell = sheet.getCell(cellAddress)
      addSelectedBorders(cell)
    } catch (error) {
      console.log(`处理单元格 ${cellAddress} 时出错:`, error)
    }
  })
}

const addBorders = async () => {
  try {
    if (!inputFile) {
      message.error('请选择 Excel 文件')
      return
    }
    if (!cellRanges.value.trim()) {
      message.error('请输入需要添加边框的单元格')
      return
    }

    // 检查是否至少选择了一个边框
    const hasSelectedBorder = Object.values(borderOptions.value).some((selected) => selected)
    if (!hasSelectedBorder) {
      message.error('请至少选择一个边框方向')
      return
    }

    loading.value = true

    const data = await inputFile.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(data)

    // 解析单元格，只接受单个单元格
    const cellAddresses = parseCellRanges(cellRanges.value)

    if (cellAddresses.length === 0) {
      message.error('请输入有效的单元格（例如：A1,B2,C3）')
      return
    }

    // 显示将要处理的边框
    const selectedBorders = Object.entries(borderOptions.value)
      .filter(([_, selected]) => selected)
      .map(([direction, _]) => direction)
      .join('、')

    console.log(`将为以下单元格添加${selectedBorders}边框: ${cellAddresses.join(', ')}`)

    // 遍历所有工作表
    workbook.worksheets.forEach((sheet, index) => {
      console.log(`正在处理工作表: ${sheet.name}`)

      // 为每个工作表的指定单元格添加边框
      processCells(sheet, cellAddresses)
    })

    // 生成 Excel 文件并保存为 Blob
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // 创建下载链接并模拟点击下载
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '添加边框后的文件.xlsx'
    link.click()
    URL.revokeObjectURL(url)

    message.success('边框添加完成并已下载')
  } catch (error) {
    message.error('处理文件时出现异常，请检查文件格式和单元格')
    console.log(error)
  }
  loading.value = false
}
</script>

<template>
  <div class="excel-border-tool-container">
    <n-card title="上传 Excel 文件" embedded>
      <n-alert style="margin-bottom: 20px" title="使用说明" type="info">
        <ul class="template-syntax-list">
          <li>单个单元格 => A1</li>
          <li>多个单元格 => A1,B2,C3 (用英文逗号分隔)</li>
          <li>边框选择 => 可以同时选择上、右、下、左任意组合</li>
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
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <DriveFolderUploadOutlined />
            </n-icon>
          </div>
          <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来读取 Excel </n-text>
          <n-p depth="3" style="margin: 8px 0 0 0">
            请上传一个 Excel 文件（.xlsx 或 .xls），文件不会被上传
          </n-p>
          <n-p v-if="inputFile?.name" style="margin-top: 12px; color: #18a058">
            当前文件：{{ inputFile.name }}
          </n-p>
        </n-upload-dragger>
      </NUpload>
    </n-card>

    <n-card title="设置边框" embedded>
      <n-input-group style="margin: 13px 0">
        <n-input-group-label>单元格</n-input-group-label>
        <n-input
          v-model:value="cellRanges"
          type="text"
          placeholder="请输入单元格，多个单元格用逗号分隔（例如：A1,B2,C3）"
        />
      </n-input-group>

      <div class="border-selection">
        <n-space>
          <n-checkbox v-model:checked="borderOptions.top">上边框</n-checkbox>
          <n-checkbox v-model:checked="borderOptions.right">右边框</n-checkbox>
          <n-checkbox v-model:checked="borderOptions.bottom">下边框</n-checkbox>
          <n-checkbox v-model:checked="borderOptions.left">左边框</n-checkbox>
        </n-space>
      </div>
    </n-card>

    <n-button
      strong
      secondary
      type="primary"
      :loading="loading"
      size="large"
      block
      style="margin: 20px 0"
      @click="addBorders"
      :disabled="!inputFile || !cellRanges.trim() || !Object.values(borderOptions).some((v) => v)"
    >
      {{ loading ? '处理中...' : '开始添加边框' }}
    </n-button>
  </div>
</template>

<style scoped lang="scss">
.excel-border-tool-container {
  width: 100%;
  height: 100%;
  .border-selection {
    border: 1px solid #d9d9d9;
    display: flex;
    justify-content: space-around;
    border-radius: 4px;
    padding: 10px;
  }
}
</style>
