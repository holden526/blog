<script setup lang="ts">
import {
  NUpload,
  NIcon,
  NInput,
  NInputNumber,
  UploadFileInfo,
  useMessage,
  NButton,
  NPopconfirm,
  NSelect,
  NDataTable,
  NHighlight,
  useThemeVars,
  NAlert,
} from 'naive-ui'
import { KeyboardDoubleArrowRightFilled } from '@vicons/material'
import { ref, reactive, h } from 'vue'
import ExcelJS from 'exceljs'
const copySheetName = ref('')
const themeVars = useThemeVars()
const startRow = ref(1) // 开始行
const endRow = ref(1) // 结束行
// 移除了复制列变量
const pastePosition = ref('') // 粘贴位置
const message = useMessage()
const loading = ref(false)
let inputFile: File | null | undefined = null
let outputFile: File | null | undefined = null

// 重命名为通用键值对列表
const keyValuePairs = reactive([
  { key: '100型防撞车', cellIndex: 31, prefix: '，', suffix: '台班', condition: 'notEmpty' },
  { key: '60型挖机', cellIndex: 32, prefix: '，', suffix: '台班', condition: 'notEmpty' },
  { key: '12t自卸车', cellIndex: 33, prefix: '，', suffix: '台班', condition: 'notEmpty' },
  { key: '20t拖车', cellIndex: 34, prefix: '，', suffix: '台班', condition: 'notEmpty' },
  { key: '大巴车', cellIndex: 35, prefix: '，', suffix: '台班', condition: 'notEmpty' },
  { key: '施工车', cellIndex: 36, prefix: '，', suffix: '台班', condition: 'notEmpty' },
])

// 条件选项
const conditionOptions = [
  { label: '非空时显示', value: 'notEmpty' },
  { label: '始终显示', value: 'always' },
  { label: '大于0时显示', value: 'greaterThanZero' },
]

// 键值对变量名称
const keyValueVarName = ref('equipment')

// 添加模板输入变量
const templateText = ref(`
{cell5}

一、清理工程量

1、清理排水系淤泥体积：{formula26}={cell26}m³
2、清理灌木及杂草面积：{formula28}={cell28}m²
3、树木清砍：{cell27[小数进1]}株
4、清理孤石：


二、投入情况

1、2025年2月13日能达公司投入{cell30}人{equipment}。`)

// 获取文件
const handleInputChange = async ({ fileList }: { fileList: UploadFileInfo[] }) => {
  inputFile = fileList[0]?.file
}
const handleOutputChange = async ({ fileList }: { fileList: UploadFileInfo[] }) => {
  outputFile = fileList[0]?.file
}

// 删除键值对
const removeKeyValuePair = (index: number) => {
  keyValuePairs.splice(index, 1)
  message.success('删除键值对成功')
}

// 添加新行到表格
const addNewRow = () => {
  keyValuePairs.push({
    key: '',
    cellIndex: 1,
    prefix: '，',
    suffix: '台班',
    condition: 'notEmpty',
  })
}

// 更新键值对
const updateKeyValuePair = (index: number, field: string, value: any) => {
  if (keyValuePairs[index]) {
    keyValuePairs[index][field] = value
  }
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

// 处理模板变量替换
const processTemplate = (sheet: ExcelJS.Worksheet, row: ExcelJS.Row, template: string): string => {
  let result = template

  // 1. 处理 {cell} 和 {formula} 变量，增加对特殊格式的支持
  // 优化正则表达式，确保能正确捕获括号内内容
  const templateVarPattern = /{(cell|formula)(\d+)(?:\[(四舍五入|小数进1)\])?}/g
  result = result.replace(templateVarPattern, (match, varType, cellIndex, roundingMethod) => {
    const cellIdx = parseInt(cellIndex)
    const cell = row.getCell(cellIdx)
    let value = ''

    if (varType === 'cell') {
      value = cell.text || cell.value?.toString() || ''
    } else if (varType === 'formula') {
      value = formatFormula(sheet, cell.formula) || ''
    }

    // 只有当 roundingMethod 存在且 value 是数字时才处理
    if (roundingMethod && value && !isNaN(Number(value))) {
      const numValue = Number(value)
      if (roundingMethod === '四舍五入') {
        return Math.round(numValue).toString()
      } else if (roundingMethod === '小数进1') {
        return Math.ceil(numValue).toString()
      }
    }

    return value
  })

  // 2. 处理键值对列表 - 使用用户定义的键值对
  const keyValueTextItems = keyValuePairs
    .filter((item) => {
      const value =
        row.getCell(item.cellIndex).text || row.getCell(item.cellIndex).value?.toString() || ''

      if (item.condition === 'notEmpty') {
        return value && value.trim() !== ''
      } else if (item.condition === 'always') {
        return true
      } else if (item.condition === 'greaterThanZero') {
        const numValue = parseFloat(value)
        return !isNaN(numValue) && numValue > 0
      }

      return false
    })
    .map((item) => {
      const value =
        row.getCell(item.cellIndex).text || row.getCell(item.cellIndex).value?.toString() || ''
      return `${item.prefix}${item.key}${value}${item.suffix}`
    })

  const keyValueText = keyValueTextItems.join('')

  // 替换键值对变量
  const keyValueVarPattern = new RegExp(`{${keyValueVarName.value}}`, 'g')
  result = result.replace(keyValueVarPattern, keyValueText)

  // 3. 去除所有 [四舍五入] 和 [小数进1] 标记
  result = result.replace(/\[四舍五入\]|\[小数进1\]/g, '')

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

      // 使用新的模板处理函数
      const result = processTemplate(aSheet, row, templateText.value)

      if (bSheet) {
        bSheet.getCell(trimmedPastePosition).value = result
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

    <!-- 通用键值对管理部分 -->
    <div class="key-value-section">
      <h3 style="margin-bottom: 10px">键值对管理</h3>
      <div class="key-value-table">
        <n-data-table
          :columns="[
            {
              title: '键名称',
              key: 'key',
              render: (row, index) => {
                return h(NInput, {
                  value: row.key,
                  onUpdateValue: (v) => updateKeyValuePair(index, 'key', v),
                })
              },
            },
            {
              title: '单元格索引',
              key: 'cellIndex',
              render: (row, index) => {
                return h(NInputNumber, {
                  value: row.cellIndex,
                  min: 1,
                  onUpdateValue: (v) => updateKeyValuePair(index, 'cellIndex', v),
                })
              },
            },
            {
              title: '前缀',
              key: 'prefix',
              render: (row, index) => {
                return h(NInput, {
                  value: row.prefix,
                  onUpdateValue: (v) => updateKeyValuePair(index, 'prefix', v),
                })
              },
            },
            {
              title: '后缀',
              key: 'suffix',
              render: (row, index) => {
                return h(NInput, {
                  value: row.suffix,
                  onUpdateValue: (v) => updateKeyValuePair(index, 'suffix', v),
                })
              },
            },
            {
              title: '显示条件',
              key: 'condition',
              render: (row, index) => {
                return h(NSelect, {
                  value: row.condition,
                  options: conditionOptions,
                  onUpdateValue: (v) => updateKeyValuePair(index, 'condition', v),
                })
              },
            },
            {
              title: '操作',
              key: 'actions',
              render: (row, index) => {
                return h(
                  NPopconfirm,
                  {
                    positiveText: '确定',
                    negativeText: '取消',
                    onPositiveClick: () => removeKeyValuePair(index),
                  },
                  {
                    trigger: () =>
                      h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' }),
                    default: () => '确定要删除该键值对吗？',
                  }
                )
              },
            },
          ]"
          :data="keyValuePairs"
          :bordered="false"
          :single-line="false"
          style="width: 100%"
        />

        <n-button style="width: 100%" type="warning" @click="addNewRow">新增键值对</n-button>
      </div>
    </div>

    <div class="template-input">
      <p>输出模板：</p>
      <n-highlight
        text="使用 {cellX} 引用单元格文本，{formulaX} 引用公式，{变量名} 引用键值对列表。"
        :patterns="['{cellX}', '{formulaX}', '{变量名}']"
        :highlight-style="{
          padding: '0 6px',
          borderRadius: themeVars.borderRadius,
          display: 'inline-block',
          color: themeVars.baseColor,
          background: themeVars.primaryColor,
          transition: `all .3s ${themeVars.cubicBezierEaseInOut}`,
        }"
      />
      <n-alert style="margin-top: 10px" title="" type="info">
        "{cell1}" 代表每一行的第一列的文本值，"{formula1}"
        代表每一行的第一列的公式。"{cell1[四舍五入]}" 代表如果是数字则四舍五入，"{cell1[小数进1]}"
        代表如果是数字且有小数，则直接进1。</n-alert
      >
      <n-input
        style="margin-top: 10px"
        v-model:value="templateText"
        type="textarea"
        :autosize="{ minRows: 10, maxRows: 20 }"
        placeholder="请输入输出模板，使用 {cellX} 引用单元格文本，{formulaX} 引用公式，{变量名} 引用键值对列表"
      />
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
  .input-item {
    width: 100%;
    display: flex;
    align-items: center;
    height: 40px;
    margin-bottom: 10px;
    .n-input-number,
    .n-input,
    .n-select {
      width: calc(100% - 100px);
    }
    p {
      width: 100px;
    }
  }
  .input {
    margin-bottom: 20px;

    .template-input {
      height: auto;
      align-items: flex-start;
      p {
        margin-top: 8px;
      }
    }
  }
  .action-buttons {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
  }
  .template-card {
    margin-top: 20px;
    margin-bottom: 20px;

    .variable-selector {
      margin-bottom: 10px;
      display: flex;
      align-items: center;

      span {
        margin-right: 10px;
        white-space: nowrap;
      }

      .variable-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;

        .variable-button {
          margin-right: 5px;
          margin-bottom: 5px;
        }
      }
    }
  }

  .key-value-table {
    width: 100%;
    margin-bottom: 20px;
  }

  .hint {
    font-size: 12px;
    color: #999;
    margin-top: -5px;
    margin-bottom: 10px;
  }
}
</style>
