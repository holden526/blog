<script setup lang="ts">
import { NUpload, NIcon, NInput, NInputNumber, UploadFileInfo, useMessage, NButton } from 'naive-ui'
import { KeyboardDoubleArrowRightFilled } from '@vicons/material'
import { ref } from 'vue'
import ExcelJS from 'exceljs'
const copySheetName = ref('')
const startRow = ref(1) // 开始行
const endRow = ref(1) // 结束行
// 移除了复制列变量
const pastePosition = ref('') // 粘贴位置
const message = useMessage()
const loading = ref(false)
let inputFile: File | null | undefined = null
let outputFile: File | null | undefined = null

// 获取文件
const handleInputChange = async ({ fileList }: { fileList: UploadFileInfo[] }) => {
  inputFile = fileList[0]?.file
}
const handleOutputChange = async ({ fileList }: { fileList: UploadFileInfo[] }) => {
  outputFile = fileList[0]?.file
}

// 递归解析公式中的单元格引用
const parseFormula = (sheet: ExcelJS.Worksheet, formula: string | undefined): string => {
  if (!formula) return ''

  // 移除公式前的等号
  let cleanFormula = formula.startsWith('=') ? formula.substring(1) : formula

  // 匹配单元格引用模式 (如 A1, B2, AA10 等)
  const cellRefPattern = /([A-Z]+)(\d+)/g

  return cleanFormula.replace(cellRefPattern, (match, column, row) => {
    const cell = sheet.getCell(`${column}${row}`)

    // 如果单元格有公式，递归解析
    if (cell.formula) {
      return parseFormula(sheet, cell.formula)
    }

    // 否则返回单元格的值
    return cell.text || cell.value?.toString() || ''
  })
}

// 格式化公式为可读形式
const formatFormula = (sheet: ExcelJS.Worksheet, formula: string | undefined): string => {
  if (!formula) return ''

  // 移除公式前的等号
  let cleanFormula = formula.startsWith('=') ? formula.substring(1) : formula

  // 匹配单元格引用模式
  const cellRefPattern = /([A-Z]+)(\d+)/g
  let result = cleanFormula
  let matches: any = []
  let match

  // 收集所有匹配项
  while ((match = cellRefPattern.exec(cleanFormula)) !== null) {
    matches.push({
      fullMatch: match[0],
      column: match[1],
      row: match[2],
      index: match.index,
    })
  }

  // 从后向前替换，避免替换过程中改变索引位置
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i]
    const cell = sheet.getCell(`${m.column}${m.row}`)
    let replacement = cell.text || cell.value?.toString() || ''

    // 如果单元格有公式，递归解析
    if (cell.formula) {
      replacement = `${formatFormula(sheet, cell.formula)}`
    }

    // 如果是空值，返回空字符串
    if (!replacement || replacement.trim() === '') {
      replacement = ''
    }

    result =
      result.substring(0, m.index) + replacement + result.substring(m.index + m.fullMatch.length)
  }

  // 全面清理公式中的多余运算符
  // 1. 处理空公式
  if (!result || result.trim() === '') return ''

  // 2. 处理开头的运算符
  result = result.replace(/^[+\-*/]+/, '')

  // 3. 处理结尾的运算符
  result = result.replace(/[+\-*/]+$/g, '')
  result = result.replace(/[+\-*/]+=/g, '=')

  // 4. 处理连续的运算符（保留第一个）
  result = result.replace(/[+\-*/]{2,}/g, (match) => match[0])

  // 5. 处理空操作（如 "5+" 或 "+6" 这样的情况）
  result = result.replace(/(\d+)[+\-*/]+$/g, '$1')
  result = result.replace(/^[+\-*/]+(\d+)/g, '$1')

  // 6. 如果处理后为空，返回空字符串
  if (result.trim() === '') return ''

  return result
}

const copyRow = async () => {
  try {
    if (!inputFile || !outputFile) {
      message.error('请选择文件')
      return
    }

    // 去除输入内容的前后空格
    const trimmedCopySheetName = copySheetName.value.trim()
    // 移除了复制列的处理
    const trimmedPastePosition = pastePosition.value.trim()

    if (
      !trimmedCopySheetName ||
      !trimmedPastePosition ||
      startRow.value <= 0 ||
      endRow.value <= 0
    ) {
      message.error('请输入复制的完整信息')
      return
    }

    if (startRow.value > endRow.value) {
      message.error('开始行不能大于结束行')
      return
    }

    loading.value = true
    const aData = await inputFile.arrayBuffer()
    const bData = await outputFile.arrayBuffer()
    const workbookA = new ExcelJS.Workbook()
    const workbookB = new ExcelJS.Workbook()
    await workbookA.xlsx.load(aData)
    await workbookB.xlsx.load(bData)
    const aSheet = workbookA.getWorksheet(trimmedCopySheetName)

    if (!aSheet) {
      message.error('A表不存在该工作表')
      loading.value = false
      return
    }

    // 移除了列索引的计算
    let successCount = 0
    let failCount = 0

    // 遍历A表中的指定行
    for (let rowNumber = startRow.value; rowNumber <= endRow.value; rowNumber++) {
      // 计算对应的B表工作表索引
      const rowOffset = rowNumber - startRow.value
      const sheetIndex = rowOffset // 从0开始的索引

      // 获取A表中的行数据
      const row = aSheet.getRow(rowNumber)
      if (!row) {
        message.error(`找不到行 ${rowNumber}`)
        failCount++
        continue
      }

      // 直接通过索引获取B表中的工作表
      const bSheet = workbookB.worksheets[sheetIndex]

      // 指定值字符串
      const temp = `
${row.getCell(2).text}

一、清理工程量

1、清理排水系淤泥体积：${formatFormula(aSheet, row.getCell(10).formula)}=${row.getCell(10).text}m³
2、清理灌木及杂草面积：${row.getCell(6).text}*3.5=${row.getCell(12).text}㎡
3、树木清砍：
4、清理孤石：


二、投入情况

1、2025年2月13日能达公司投入${row.getCell(14).text}人${[
        { value: row.getCell(15).text, label: '100型防撞车' },
        { value: row.getCell(16).text, label: '60型挖机' },
        { value: row.getCell(17).text, label: '自卸车' },
        { value: row.getCell(18).text, label: '20t拖车' },
        { value: row.getCell(19).text, label: '施工车' },
        { value: row.getCell(20).text, label: '中巴' },
      ]
        .filter((item) => item.value && item.value.trim() !== '')
        .map((item) => `，${item.label}${item.value}台班`)
        .join('')}。`

      if (bSheet) {
        bSheet.getCell(trimmedPastePosition).value = temp
        successCount++
      } else {
        message.error(`B表不存在第 ${sheetIndex + 1} 个工作表`)
        failCount++
      }
    }

    if (successCount > 0) {
      // 生成 Excel 文件并保存为 Blob
      const buffer = await workbookB.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      // 创建下载链接并模拟点击下载
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = '复制行文件.xlsx'
      link.click()
      URL.revokeObjectURL(url)

      message.success(`复制完成，成功: ${successCount}，失败: ${failCount}`)
    } else {
      message.error('所有复制操作均失败')
    }
  } catch (error) {
    message.error('出现异常，请确认参数是否正确')
    console.log(error)
  }
  loading.value = false
}
</script>

<template>
  <div class="excel-copy-row">
    <div class="select">
      <div class="item">
        <NUpload
          :max="1"
          multiple
          directory-dnd
          :default-upload="false"
          accept=".xlsx,.xls"
          @change="handleInputChange"
        >
          <n-button>选择提供数据的A表</n-button>
        </NUpload>
      </div>
      <div class="item">
        <n-icon size="48" :depth="3">
          <KeyboardDoubleArrowRightFilled />
        </n-icon>
      </div>
      <div class="item">
        <NUpload
          :max="1"
          multiple
          directory-dnd
          :default-upload="false"
          accept=".xlsx,.xls"
          @change="handleOutputChange"
        >
          <n-button>选择粘贴数据的B表</n-button>
        </NUpload>
      </div>
    </div>
    <div class="input">
      <div class="input-item">
        <p>复制表名：</p>
        <n-input
          v-model:value="copySheetName"
          type="text"
          placeholder="请输入需要复制的工作表名称"
        />
      </div>
      <div class="input-item">
        <p>开始行号：</p>
        <n-input-number v-model:value="startRow" :min="1" placeholder="请输入开始行号" />
      </div>
      <div class="input-item">
        <p>结束行号：</p>
        <n-input-number v-model:value="endRow" :min="1" placeholder="请输入结束行号" />
      </div>
      <!-- 移除了复制列输入框 -->
      <div class="input-item">
        <p>粘贴位置：</p>
        <n-input
          v-model:value="pastePosition"
          type="text"
          placeholder="请输入需要粘贴的单元格位置（例如：B14）"
        />
      </div>
    </div>

    <div class="action-buttons">
      <n-button strong secondary type="info" :loading="loading" @click="copyRow">
        执行复制
      </n-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.excel-copy-row {
  .select {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .input {
    margin-bottom: 20px;
    .input-item {
      width: 100%;
      display: flex;
      align-items: center;
      height: 40px;
      margin-bottom: 10px;
      .n-input-number,
      .n-input {
        width: calc(100% - 100px);
      }
      p {
        width: 100px;
      }
    }
  }
  .action-buttons {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
