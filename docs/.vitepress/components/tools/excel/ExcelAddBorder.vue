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
  NP,
  NCard,
  NText,
} from 'naive-ui'
import { ref } from 'vue'
import ExcelJS from 'exceljs'
import { DriveFolderUploadOutlined } from '@vicons/material'
const cellRanges = ref('')
const message = useMessage()
const loading = ref(false)
const inputFile = ref<File | null>(null)

// 边框选择
const borderOptions = ref({
  top: false,
  right: false,
  bottom: false,
  left: false,
})

// 获取文件
const handleInputChange = async ({ fileList }: { fileList: UploadFileInfo[] }) => {
  inputFile.value = fileList[0]?.file as File | null
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
const addSelectedBorders = (cell: ExcelJS.Cell, cellAddress: string) => {
  console.log(`开始处理单元格 ${cellAddress}`)

  // 检查是否是合并单元格
  const worksheet = cell.worksheet
  let isMergedCell = false
  let mergeRange = null

  if (worksheet && worksheet.model.merges) {
    // 检查当前单元格是否在合并区域内
    for (const merge of worksheet.model.merges) {
      const mergeStr = typeof merge === 'string' ? merge : merge.toString()
      const [topLeft, bottomRight] = mergeStr.split(':')

      // 解析合并区域的范围
      const topLeftMatch = topLeft.match(/^([A-Z]+)(\d+)$/)
      const bottomRightMatch = bottomRight ? bottomRight.match(/^([A-Z]+)(\d+)$/) : topLeftMatch

      if (topLeftMatch && bottomRightMatch) {
        const startCol = columnToNumber(topLeftMatch[1])
        const startRow = parseInt(topLeftMatch[2])
        const endCol = columnToNumber(bottomRightMatch[1])
        const endRow = parseInt(bottomRightMatch[2])

        // 解析当前单元格的坐标
        const cellMatch = cellAddress.match(/^([A-Z]+)(\d+)$/)
        if (cellMatch) {
          const cellCol = columnToNumber(cellMatch[1])
          const cellRow = parseInt(cellMatch[2])

          // 检查是否在合并范围内
          if (
            cellCol >= startCol &&
            cellCol <= endCol &&
            cellRow >= startRow &&
            cellRow <= endRow
          ) {
            isMergedCell = true
            mergeRange = { startRow, startCol, endRow, endCol, topLeft }
            console.log(`发现合并单元格: ${cellAddress} 在范围 ${mergeStr} 内`)
            break
          }
        }
      }
    }
  }

  if (isMergedCell && mergeRange) {
    // 如果是合并单元格，只为合并区域的主单元格（左上角）设置边框
    if (cellAddress === mergeRange.topLeft) {
      console.log(`${cellAddress} 是合并单元格的主单元格，设置边框`)
      setMergedCellBorder(worksheet, mergeRange)
    } else {
      console.log(`跳过合并单元格中的从属单元格: ${cellAddress}`)
      return
    }
  } else {
    // 普通单元格，直接设置边框
    console.log(`${cellAddress} 是普通单元格，设置边框`)
    setSingleCellBorder(cell, cellAddress)
  }
}

// 将列字母转换为数字 (A=1, B=2, ..., Z=26, AA=27, ...)
const columnToNumber = (col: string): number => {
  let result = 0
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64)
  }
  return result
}

// 为合并单元格设置边框
const setMergedCellBorder = (worksheet: ExcelJS.Worksheet, mergeRange: any) => {
  // 对于合并单元格，我们需要为边界单元格设置相应的边框
  for (let row = mergeRange.startRow; row <= mergeRange.endRow; row++) {
    for (let col = mergeRange.startCol; col <= mergeRange.endCol; col++) {
      const cell = worksheet.getCell(row, col)
      const isTopBorder = row === mergeRange.startRow
      const isBottomBorder = row === mergeRange.endRow
      const isLeftBorder = col === mergeRange.startCol
      const isRightBorder = col === mergeRange.endCol

      const cellBorder: any = {}

      // 只有当用户选择了对应方向的边框，且单元格在相应的边界上时，才添加边框
      if (borderOptions.value.top && isTopBorder) {
        cellBorder.top = { style: 'thin', color: { argb: 'FF000000' } }
      }
      if (borderOptions.value.bottom && isBottomBorder) {
        cellBorder.bottom = { style: 'thin', color: { argb: 'FF000000' } }
      }
      if (borderOptions.value.left && isLeftBorder) {
        cellBorder.left = { style: 'thin', color: { argb: 'FF000000' } }
      }
      if (borderOptions.value.right && isRightBorder) {
        cellBorder.right = { style: 'thin', color: { argb: 'FF000000' } }
      }

      // 保留原有样式，只更新边框部分
      if (Object.keys(cellBorder).length > 0) {
        const originalStyle = cell.style || {}
        cell.style = {
          ...originalStyle,
          border: {
            ...originalStyle.border,
            ...cellBorder,
          },
        }
      }
    }
  }
  console.log(`✅ 合并单元格边框设置完成`)
}

// 为单个单元格设置边框
const setSingleCellBorder = (cell: ExcelJS.Cell, cellAddress: string) => {
  const originalStyle = cell.style || {}
  const newBorder: any = { ...originalStyle.border }

  // 只为用户选择的边框方向添加样式
  if (borderOptions.value.top) {
    newBorder.top = { style: 'thin', color: { argb: 'FF000000' } }
  }
  if (borderOptions.value.right) {
    newBorder.right = { style: 'thin', color: { argb: 'FF000000' } }
  }
  if (borderOptions.value.bottom) {
    newBorder.bottom = { style: 'thin', color: { argb: 'FF000000' } }
  }
  if (borderOptions.value.left) {
    newBorder.left = { style: 'thin', color: { argb: 'FF000000' } }
  }

  // 应用新样式
  cell.style = {
    ...originalStyle,
    border: newBorder,
  }

  console.log(`✅ 单元格 ${cellAddress} 边框设置完成`)
}

// 为指定的单元格添加边框
const processCells = (sheet: ExcelJS.Worksheet, cellAddresses: string[]) => {
  console.log(`工作表 "${sheet.name}" 开始处理单元格:`, cellAddresses)

  cellAddresses.forEach((cellAddress) => {
    try {
      // 使用行列坐标确保精确定位
      const match = cellAddress.match(/^([A-Z]+)(\d+)$/)
      if (!match) {
        console.error(`无效的单元格地址: ${cellAddress}`)
        return
      }

      const colStr = match[1]
      const rowNum = parseInt(match[2])

      // 将列字母转换为数字
      let colNum = 0
      for (let i = 0; i < colStr.length; i++) {
        colNum = colNum * 26 + (colStr.charCodeAt(i) - 64)
      }

      // 使用行列坐标获取单元格，确保精确定位
      const cell = sheet.getCell(rowNum, colNum)

      console.log(`处理单元格: ${cellAddress} (行${rowNum},列${colNum}), 实际地址: ${cell.address}`)

      // 验证地址是否匹配
      if (cell.address === cellAddress) {
        addSelectedBorders(cell, cellAddress)
      } else {
        console.error(`地址不匹配: 期望 ${cellAddress}, 实际 ${cell.address}`)
      }
    } catch (error) {
      console.error(`处理单元格 ${cellAddress} 时出错:`, error)
    }
  })

  console.log(`工作表 "${sheet.name}" 处理完成`)
}

const addBorders = async () => {
  try {
    if (!inputFile.value) {
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

    const data = await inputFile.value!.arrayBuffer()
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

    console.log(`🎯 目标操作: 为单元格 [${cellAddresses.join(', ')}] 添加 ${selectedBorders} 边框`)

    // 记录所有被修改的单元格
    const modifiedCells: string[] = []

    // 遍历所有工作表
    workbook.worksheets.forEach((sheet, index) => {
      console.log(`📋 正在处理工作表: ${sheet.name}`)

      // 在处理前，记录工作表中所有有边框的单元格
      const beforeProcessing: string[] = []
      sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (cell.border && Object.keys(cell.border).length > 0) {
            beforeProcessing.push(cell.address)
          }
        })
      })
      console.log(`处理前有边框的单元格:`, beforeProcessing)

      // 为每个工作表的指定单元格添加边框
      processCells(sheet, cellAddresses)

      // 处理后，再次检查所有有边框的单元格
      const afterProcessing: string[] = []
      sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (cell.border && Object.keys(cell.border).length > 0) {
            afterProcessing.push(cell.address)
          }
        })
      })
      console.log(`处理后有边框的单元格:`, afterProcessing)

      // 找出新增的边框单元格
      const newBorderedCells = afterProcessing.filter((addr) => !beforeProcessing.includes(addr))
      if (newBorderedCells.length > 0) {
        console.log(`🆕 新增边框的单元格:`, newBorderedCells)
        modifiedCells.push(...newBorderedCells.map((addr) => `${sheet.name}:${addr}`))
      }
    })

    console.log(`📊 总共修改的单元格:`, modifiedCells)

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

    message.success(`边框添加完成！实际修改了 ${modifiedCells.length} 个单元格`)
  } catch (error) {
    message.error('处理文件时出现异常，请检查文件格式和单元格')
    console.error('处理异常:', error)
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
