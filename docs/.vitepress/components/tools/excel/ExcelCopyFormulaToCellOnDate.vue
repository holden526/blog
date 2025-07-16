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
const startRow = ref(7) // 开始行
const endRow = ref(215) // 结束行
const pastePosition = ref('A17') // 粘贴位置
const groupColumn = ref('B') // 新增：用于分组的列
const message = useMessage()
const loading = ref(false)
const recursionDepth = ref(1) // 添加递归层数控制，默认为1层
let inputFile: File | null | undefined = null
let outputFile: File | null | undefined = null

// 模板文本 - 支持动态循环
const templateText = ref(`
一、清理范围：
[循环开始]
{序号}. {值{序号}D} {值{序号}E} {值{序号}F}
[循环结束]

二、投入情况
1. 清理工人：{值1R}人，共{值1R}工日。
2. 100型防撞车：{值1S}台，共{值1S}台班。
3. 12t自卸车：{值1W}台，共{值1W}台班。
4. 大巴车：{值1Z}台，共{值1Z}台班。
5. 施工车：{值1AA}台，共{值1AA}台班。
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

// 处理动态循环的函数
const processLoopTemplate = (
  sheet: ExcelJS.Worksheet,
  baseRowNumber: number,
  template: string,
  groupRows: number[]
): string => {
  let result = template

  // 处理动态循环块 [循环开始] ... [循环结束]
  const loopPattern = /\[循环开始\]([\s\S]*?)\[循环结束\]/g

  result = result.replace(loopPattern, (match, content) => {
    let loopResult = ''

    // 遍历当前分组的所有行
    for (let i = 0; i < groupRows.length; i++) {
      const currentRowNumber = groupRows[i]
      let iterationContent = content

      // 替换 {序号} 为当前行号（从1开始）
      iterationContent = iterationContent.replace(/\{序号\}/g, (i + 1).toString())

      // 去掉每次迭代内容末尾的换行符
      iterationContent = iterationContent.replace(/\n\s*$/, '')

      loopResult += iterationContent
    }

    return loopResult
  })

  return result
}

// 处理模板变量替换 - 修改以支持循环
const processTemplate = (
  sheet: ExcelJS.Worksheet,
  baseRowNumber: number,
  template: string,
  groupRows: number[]
): string => {
  // 首先处理循环模板
  let result = processLoopTemplate(sheet, baseRowNumber, template, groupRows)

  // 然后处理常规变量替换
  const templateVarPattern =
    /\{(值|公式)(\d+)([A-Z]+)(?:\[(四舍五入|小数进1|保留\d+位小数|递归\d+层)\])?\}/g

  result = result.replace(
    templateVarPattern,
    (match, varType, rowOffset, columnLetter, roundingMethod) => {
      const columnIndex = columnLetterToIndex(columnLetter)
      // 计算实际行号：基础行号 + 偏移量 - 1（因为偏移量从1开始）
      const actualRowNumber = baseRowNumber + parseInt(rowOffset) - 1
      const cell = sheet.getCell(`${columnLetter}${actualRowNumber}`)
      let value = ''

      if (varType === '值') {
        // 获取单元格的文本值
        value = cell.text || cell.result.toString() || cell.value?.toString() || ''
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
    }
  )

  // 去除所有 [四舍五入]、[小数进1]、[保留N位小数] 和 [递归N层] 标记
  result = result.replace(/\[四舍五入\]|\[小数进1\]|\[保留\d+位小数\]|\[递归\d+层\]/g, '')

  return result
}

// 动态分组函数：根据指定列的内容将连续相同的行分组
const groupRowsByColumn = (
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  column: string
): number[][] => {
  const groups: number[][] = []
  let currentGroup: number[] = []
  let previousValue: string | null = null

  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
    const cell = sheet.getCell(`${column}${rowNumber}`)
    const currentValue = cell.text || cell.value?.toString() || ''

    // 如果当前值与前一个值相同，或者是第一行，则加入当前组
    if (previousValue === null || currentValue === previousValue) {
      currentGroup.push(rowNumber)
    } else {
      // 当前值与前一个值不同，结束当前组，开始新组
      if (currentGroup.length > 0) {
        groups.push([...currentGroup])
      }
      currentGroup = [rowNumber]
    }

    previousValue = currentValue
  }

  // 添加最后一个组
  if (currentGroup.length > 0) {
    groups.push([...currentGroup])
  }

  return groups
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
    const trimmedGroupColumn = groupColumn.value.trim()

    if (
      !trimmedCopySheetName ||
      !trimmedPastePosition ||
      !trimmedGroupColumn ||
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

    // 根据指定列的内容进行动态分组
    const rowGroups = groupRowsByColumn(aSheet, startRow.value, endRow.value, trimmedGroupColumn)

    // 处理每个分组
    for (let groupIndex = 0; groupIndex < rowGroups.length; groupIndex++) {
      const currentGroup = rowGroups[groupIndex]
      const groupStartRow = currentGroup[0]

      // 获取对应的B表工作表
      const bSheet = workbookB.worksheets[groupIndex]

      if (!bSheet) {
        message.error(`B表不存在第 ${groupIndex + 1} 个工作表`)
        failCount++
        continue
      }

      // 使用模板处理函数生成最终文本，传入当前分组的起始行号和分组行数组
      const result = processTemplate(aSheet, groupStartRow, templateText.value, currentGroup)

      bSheet.getCell(trimmedPastePosition).value = result
      successCount++

      console.log(
        `第${groupIndex + 1}组: 行${currentGroup.join(', ')} (共${currentGroup.length}行) -> B表第${groupIndex + 1}个工作表`
      )
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

      message.success(
        `复制完成，共分${rowGroups.length}组，成功: ${successCount}，失败: ${failCount}`
      )
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
        <p>分组列：</p>
        <n-input
          v-model:value="groupColumn"
          type="text"
          placeholder="请输入用于分组的列（如：B）"
        />
        <NTooltip trigger="hover" placement="right">
          <template #trigger>
            <n-icon size="18" class="help-icon">
              <HelpOutlined />
            </n-icon>
          </template>
          根据此列的内容进行分组，相同内容的连续行会被分到同一组中
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
          公式解析的公用递归层数，默认为1层。
        </NTooltip>
      </div>
    </div>

    <div class="template-input">
      <h3>
        输出模板（支持动态循环）
        <NTooltip trigger="hover" placement="right">
          <template #trigger>
            <n-icon size="18" class="help-icon">
              <HelpOutlined />
            </n-icon>
          </template>
          支持动态循环语法，自动根据分组行数处理
        </NTooltip>
      </h3>

      <n-highlight
        text="循环语法：[循环开始] ... [循环结束]，在循环内用 {序号} 表示当前行号"
        :patterns="['[循环开始]', '[循环结束]', '{序号}']"
        :highlight-style="{
          padding: '0 6px',
          borderRadius: themeVars.borderRadius,
          display: 'inline-block',
          color: themeVars.baseColor,
          background: themeVars.primaryColor,
          transition: `all .3s ${themeVars.cubicBezierEaseInOut}`,
        }"
      />

      <n-alert style="margin-top: 10px" title="循环语法说明" type="info">
        <ul class="template-syntax-list">
          <li>
            <strong>动态循环：</strong>[循环开始] ... [循环结束] - 根据当前分组的实际行数自动循环
          </li>
          <li><strong>序号变量：</strong>{序号} - 在循环内部表示当前行号（从1开始）</li>
          <li>
            <strong>使用方法：</strong>{序号}、{值{序号}D}{值{序号}E} - 自动替换为每行的实际数据
          </li>
        </ul>
      </n-alert>

      <n-alert style="margin-top: 10px" title="使用示例" type="success">
        <div class="template-example">
          <h4>动态循环示例：</h4>
          序号代表每次循环的行数，1代表本次循环第一行
          <pre>
一、清理范围：
[循环开始]
{序号}、{值{序号}D}{值{序号}E}{值{序号}F}
[循环结束]</pre
          >
          <p>
            一、清理范围：<br />
            1、{值1D}{值1E}{值1F}<br />
            2、{值2D}{值2E}{值2F}<br />
            3、{值3D}{值3E}{值3F}<br />
            ...
          </p>
        </div>
      </n-alert>

      <n-alert style="margin-top: 10px" title="模板语法详解" type="info">
        <ul class="template-syntax-list">
          <li>{值1A} => 引用当前循环第1行A列的文本值</li>
          <li>{公式2B} => 引用当前循环第2行B列的公式计算结果（受递归层数控制）</li>
          <li>{公式3C[递归x层]} => 引用当前循环第3行C列的公式，并单独指定递归x(1/2/3...)层</li>
          <li>{值1C[四舍五入]} => 如果是数字则四舍五入</li>
          <li>{值2D[小数进1]} => 如果是数字且有小数，则直接进位到整数</li>
          <li>{值1E[保留x位小数]} => 保留指定x(1/2/3...)位数的小数</li>
          <li>行号说明：1表示当前循环的第1行，2表示第2行，以此类推</li>
        </ul>
      </n-alert>

      <n-input
        v-model:value="templateText"
        type="textarea"
        placeholder="请输入模板文本，支持动态循环语法"
        :autosize="{
          minRows: 15,
          maxRows: 25,
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
        margin-bottom: 8px;
        line-height: 1.5;
      }
    }

    .template-example {
      h4 {
        margin: 10px 0 5px 0;
        color: #2080f0;
      }

      pre {
        background: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
        margin: 5px 0 15px 0;
        font-size: 12px;
        line-height: 1.4;
      }
    }
  }
}
</style>
