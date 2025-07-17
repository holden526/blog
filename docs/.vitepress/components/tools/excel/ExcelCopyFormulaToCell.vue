<script setup lang="ts">
import {
  NUpload,
  NIcon,
  NInput,
  NInputNumber,
  UploadFileInfo,
  useMessage,
  NButton,
  NHighlight,
  useThemeVars,
  NAlert,
  NTooltip,
} from 'naive-ui'
import { KeyboardDoubleArrowRightFilled, HelpOutlined } from '@vicons/material'
import { ref } from 'vue'
import ExcelJS from 'exceljs'
const copySheetName = ref('')
const themeVars = useThemeVars()
const startRow = ref(1) // 开始行
const endRow = ref(1) // 结束行
const pastePosition = ref('') // 粘贴位置
const message = useMessage()
const loading = ref(false)
const recursionDepth = ref(1) // 添加递归层数控制，默认为1层
let inputFile: File | null | undefined = null
let outputFile: File | null | undefined = null

// 模板文本 - 用于生成最终输出内容
const templateText = ref(`
{值E}

一、清理工程量

1、清理排水系淤泥体积：{公式AE[递归2层]}={值AE[保留2位小数]}m³
2、清理灌木及杂草面积：{公式AG[递归1层]}={值AG}m²
3、树木清砍：{值AF[小数进1]}株
4、清理边沟: {值Q}m;平台水沟{值R}m;急流槽{值S}m;截水沟{值T}m;

二、投入情况

1、2025年2月13日能达公司投入{值AI}人。100型防撞车{值AJ}台班，60挖机{值AK}台班，12t自卸车{值AL}台班，20t拖车{值AM}台班，大巴车{值AN}台班，施工车{值AO}台班。

`)

// 获取输入文件
const handleInputChange = async ({ fileList }: { fileList: UploadFileInfo[] }) => {
  inputFile = fileList[0]?.file
}

// 获取输出文件
const handleOutputChange = async ({ fileList }: { fileList: UploadFileInfo[] }) => {
  outputFile = fileList[0]?.file
}

// 将列字母转换为列索引
const columnLetterToIndex = (letter: string): number => {
  let result = 0
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64)
  }
  return result
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
const formatFormula = (
  sheet: ExcelJS.Worksheet,
  formula: string | undefined,
  depth: number = 1
): string => {
  if (!formula) return ''

  // 移除公式前的等号
  let cleanFormula = formula.startsWith('=') ? formula.substring(1) : formula

  // 处理ROUND函数
  const roundPattern = /ROUND\(([^,]+),\s*(\d+)\)/gi
  cleanFormula = cleanFormula.replace(roundPattern, (match, content, decimals) => {
    // 解析ROUND函数内部的表达式
    const parsedContent = parseFormula(sheet, content)
    if (parsedContent && !isNaN(Number(parsedContent))) {
      // 如果能解析为数字，则执行四舍五入
      return Number(Number(parsedContent).toFixed(Number(decimals))).toString()
    }
    return parsedContent // 无法解析时返回原内容
  })

  // 处理常见的Excel函数，如SUM、AVERAGE等
  const functionPattern = /(SUM|AVERAGE|COUNT|MAX|MIN)\(([^)]+)\)/gi
  cleanFormula = cleanFormula.replace(functionPattern, (match, func, content) => {
    return content // 只保留括号内的内容
  })

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

    // 如果单元格有公式，根据递归深度决定是否继续解析
    if (cell.formula && depth > 1) {
      replacement = `${formatFormula(sheet, cell.formula, depth - 1)}`
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

  // 1. 处理 {值} 和 {公式} 变量，增加对特殊格式的支持
  // 优化正则表达式，确保能正确捕获括号内内容，增加对保留小数位的支持
  const templateVarPattern =
    /{(值|公式)([A-Z]+)(?:\[(四舍五入|小数进1|保留\d+位小数|递归\d+层)\])?}/g
  result = result.replace(templateVarPattern, (match, varType, columnLetter, roundingMethod) => {
    const columnIndex = columnLetterToIndex(columnLetter)
    const cell = row.getCell(columnIndex)
    let value = ''

    if (varType === '值') {
      // 获取单元格的文本值
      value = cell.text || cell.value?.toString() || ''
    } else if (varType === '公式') {
      // 检查是否有单独的递归层级设置
      let currentDepth = recursionDepth.value
      if (roundingMethod && roundingMethod.startsWith('递归')) {
        // 从 "递归X层" 中提取数字
        const depthMatch = roundingMethod.match(/递归(\d+)层/)
        if (depthMatch && depthMatch[1]) {
          currentDepth = parseInt(depthMatch[1])
        }
      }
      // 获取单元格公式的计算结果，使用当前设置的递归层数或单独指定的层数
      value = formatFormula(sheet, cell.formula, currentDepth) || ''
    }

    // 只有当 roundingMethod 存在且 value 是数字时才处理
    if (roundingMethod && value && !isNaN(Number(value))) {
      const numValue = Number(value)
      if (roundingMethod === '四舍五入') {
        return Math.round(numValue).toString()
      } else if (roundingMethod === '小数进1') {
        return Math.ceil(numValue).toString()
      } else if (roundingMethod.startsWith('保留')) {
        // 处理保留小数位的情况
        const decimalPlaces = parseInt(roundingMethod.match(/\d+/)?.[0] || '0')
        return numValue.toFixed(decimalPlaces)
      }
    }

    return value
  })

  // 3. 去除所有 [四舍五入]、[小数进1]、[保留N位小数] 和 [递归N层] 标记
  result = result.replace(/\[四舍五入\]|\[小数进1\]|\[保留\d+位小数\]|\[递归\d+层\]/g, '')

  return result
}

// 执行复制操作
const copyRow = async () => {
  try {
    if (!inputFile || !outputFile) {
      message.error('请选择文件')
      return
    }

    // 去除输入内容的前后空格
    const trimmedCopySheetName = copySheetName.value.trim()
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

      // 使用模板处理函数生成最终文本
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
      link.download = `${copySheetName.value}复制结果.xlsx`
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
        <NTooltip trigger="hover" placement="right">
          <template #trigger>
            <n-icon size="18" class="help-icon">
              <HelpOutlined />
            </n-icon>
          </template>
          输入A表中包含数据的工作表名称
        </NTooltip>
      </div>
      <div class="input-item">
        <p>开始行号：</p>
        <n-input-number v-model:value="startRow" :min="1" placeholder="请输入开始行号" />
        <NTooltip trigger="hover" placement="right">
          <template #trigger>
            <n-icon size="18" class="help-icon">
              <HelpOutlined />
            </n-icon>
          </template>
          从A表中的第几行开始提取数据
        </NTooltip>
      </div>
      <div class="input-item">
        <p>结束行号：</p>
        <n-input-number v-model:value="endRow" :min="1" placeholder="请输入结束行号" />
        <NTooltip trigger="hover" placement="right">
          <template #trigger>
            <n-icon size="18" class="help-icon">
              <HelpOutlined />
            </n-icon>
          </template>
          到A表中的第几行结束提取数据
        </NTooltip>
      </div>
      <div class="input-item">
        <p>粘贴位置：</p>
        <n-input
          v-model:value="pastePosition"
          type="text"
          placeholder="请输入需要粘贴的单元格位置（例如：B14）"
        />
        <NTooltip trigger="hover" placement="right">
          <template #trigger>
            <n-icon size="18" class="help-icon">
              <HelpOutlined />
            </n-icon>
          </template>
          在B表中的哪个单元格位置粘贴生成的内容
        </NTooltip>
      </div>
      <div class="input-item">
        <p>公式递归：</p>
        <n-input-number
          v-model:value="recursionDepth"
          :min="1"
          :max="10"
          placeholder="请输入递归层数"
        />
        <NTooltip trigger="hover" placement="right">
          <template #trigger>
            <n-icon size="18" class="help-icon">
              <HelpOutlined />
            </n-icon>
          </template>
          公式解析的公用递归层数，默认为1层。例如：当解析B1+C1+C2时，如果B1也是公式，层数为1则直接使用B1的值，层数为2则解析B1的公式。另外，可通过模板语法单独设置每个单元格的递归层数。
        </NTooltip>
      </div>
    </div>

    <div class="template-input">
      <h3>
        输出模板
        <NTooltip trigger="hover" placement="right">
          <template #trigger>
            <n-icon size="18" class="help-icon">
              <HelpOutlined />
            </n-icon>
          </template>
          在此处编写输出模板，使用特定语法引用单元格数据
        </NTooltip>
      </h3>

      <n-highlight
        text="模板语法说明：{值X} 引用单元格文本，{公式X} 引用公式。X为Excel列标识（如A、B、C...）"
        :patterns="['{值X}', '{公式X}']"
        :highlight-style="{
          padding: '0 6px',
          borderRadius: themeVars.borderRadius,
          display: 'inline-block',
          color: themeVars.baseColor,
          background: themeVars.primaryColor,
          transition: `all .3s ${themeVars.cubicBezierEaseInOut}`,
        }"
      />

      <n-alert style="margin-top: 10px" title="模板语法详解" type="info">
        <ul class="template-syntax-list">
          <li>{值A} => 引用A列的文本值</li>
          <li>{公式B} => 引用B列的公式计算结果（受递归层数控制）</li>
          <li>{公式C[递归x层]} => 引用C列的公式，并单独指定递归x(1/2/3...)层</li>
          <li>{值C[四舍五入]} => 如果是数字则四舍五入</li>
          <li>{值D[小数进1]} => 如果是数字且有小数，则直接进位到整数</li>
          <li>{值E[保留x位小数]} => 保留指定x(1/2/3...)位数的小数</li>
        </ul>
      </n-alert>

      <n-input
        v-model:value="templateText"
        type="textarea"
        placeholder="请输入模板文本"
        :autosize="{
          minRows: 10,
          maxRows: 20,
        }"
        style="margin-top: 10px"
      />

      <n-button
        style="width: 100%; margin-top: 20px"
        strong
        secondary
        type="info"
        :loading="loading"
        @click="copyRow"
      >
        开始复制
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
    margin-bottom: 20px;
  }

  .input-item {
    width: 100%;
    display: flex;
    align-items: center;
    height: 40px;
    margin-bottom: 15px;

    .n-input-number,
    .n-input,
    .n-select {
      width: calc(100% - 120px);
    }

    p {
      width: 100px;
    }

    .help-icon {
      margin-left: 10px;
      cursor: pointer;
      color: #999;
      &:hover {
        color: #2080f0;
      }
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

  .key-value-section {
    margin-top: 20px;
    margin-bottom: 20px;

    .key-value-var-name {
      display: flex;
      align-items: center;
      margin-bottom: 15px;

      span {
        margin-right: 10px;
      }

      .help-icon {
        margin-left: 10px;
        cursor: pointer;
        color: #999;
        &:hover {
          color: #2080f0;
        }
      }
    }
  }

  .key-value-table {
    width: 100%;
    margin-bottom: 20px;
  }

  .template-input {
    margin-top: 30px;

    h3 {
      display: flex;
      align-items: center;
      margin-bottom: 15px;

      .help-icon {
        margin-left: 10px;
        cursor: pointer;
        color: #999;
        &:hover {
          color: #2080f0;
        }
      }
    }

    .template-syntax-list {
      margin: 0;
      padding-left: 20px;

      li {
        margin-bottom: 5px;
      }
    }
  }
}
</style>
