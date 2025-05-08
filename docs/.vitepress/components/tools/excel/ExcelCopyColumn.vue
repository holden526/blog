<script setup lang="ts">
import {
  NUpload,
  NIcon,
  NInput,
  NInputNumber,
  UploadFileInfo,
  useMessage,
  NButton,
  NSelect,
} from 'naive-ui'
import { KeyboardDoubleArrowRightFilled } from '@vicons/material'
import { ref } from 'vue'
import ExcelJS from 'exceljs'
const copySheetName = ref('')
const copySheetColumn = ref('')
const startNum = ref(1)
const endNum = ref(1)
const pastePosition = ref('')
const preInfo = ref('')
const copyType = ref('value')
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

// 替换公式中的单元格引用为实际值
const replaceFormulaReferences = (formula: string, sheet: ExcelJS.Worksheet): string => {
  if (!formula) return formula

  // 正则表达式匹配单元格引用，如A1, B2, AA10等
  const cellRefRegex = /([A-Z]+)([0-9]+)/g

  // 递归替换所有匹配项
  let result = formula
  let match
  let replacedRefs: Record<string, string> = {}

  // 使用while循环查找所有匹配项
  while ((match = cellRefRegex.exec(formula)) !== null) {
    const cellRef = match[0]

    // 避免重复处理同一个引用
    if (replacedRefs[cellRef]) continue

    try {
      // 获取引用单元格的值
      const cell = sheet.getCell(cellRef)
      let cellValue = ''

      const raw = cell.result ?? cell.value

      if (raw === null || raw === undefined) {
        cellValue = '0'
      } else if (raw instanceof Date) {
        cellValue = raw.toISOString()
      } else if (typeof raw === 'object') {
        const obj = raw as Record<string, any>
        if ('error' in obj) {
          cellValue = '0'
        } else if ('richText' in obj && Array.isArray(obj.richText)) {
          cellValue = obj.richText.map((rt: any) => rt.text).join('')
        } else if ('hyperlink' in obj) {
          cellValue = obj.text || obj.hyperlink || '0'
        } else if ('result' in obj) {
          cellValue = obj.result?.toString() || '0'
        } else {
          cellValue = '0'
        }
      } else {
        cellValue = raw.toString()
      }

      // 如果值不是数字，则用0替代
      if (isNaN(Number(cellValue))) {
        cellValue = '0'
      }

      // 替换公式中的单元格引用为实际值
      result = result.replace(new RegExp(cellRef, 'g'), cellValue)
      replacedRefs[cellRef] = cellValue
    } catch (error) {
      console.log(`替换单元格引用 ${cellRef} 时出错:`, error)
      // 如果出错，用0替代
      result = result.replace(new RegExp(cellRef, 'g'), '0')
      replacedRefs[cellRef] = '0'
    }
  }

  return result
}

const copyColumn = async () => {
  try {
    if (!inputFile || !outputFile) {
      message.error('请选择文件')
      return
    }
    if (!copySheetName.value || !copySheetColumn.value || !pastePosition.value) {
      message.error('请输入复制的完整信息')
      return
    }
    if (!startNum.value || !endNum.value) {
      message.error('请输入正确的行号数字')
      return
    }
    if (startNum.value > endNum.value) {
      message.error('开始行号不能大于结束行号')
      return
    }
    loading.value = true
    const aData = await inputFile.arrayBuffer()
    const bData = await outputFile.arrayBuffer()
    const workbookA = new ExcelJS.Workbook()
    const workbookB = new ExcelJS.Workbook()
    await workbookA.xlsx.load(aData)
    await workbookB.xlsx.load(bData)
    const aSheet = workbookA.getWorksheet(copySheetName.value)

    if (!aSheet) {
      message.error('A表不存在该工作表')
      return
    }

    const aVal: string[] = []
    const aFormula: string[] = [] // 存储公式

    aSheet.eachRow({ includeEmpty: true }, (_row, rowNumber) => {
      if (rowNumber < startNum.value || rowNumber > endNum.value) return

      const cell = aSheet.getCell(`${copySheetColumn.value}${rowNumber}`)
      let val = ''
      let formula = cell.formula || '' // 获取公式

      // 如果选择了公式模式，并且有公式，则替换公式中的引用
      if (copyType.value === 'formula' && formula) {
        formula = replaceFormulaReferences(formula, aSheet)
      }

      const raw = cell.result ?? cell.value // 优先取计算结果

      if (raw === null || raw === undefined) {
        val = ''
      } else if (raw instanceof Date) {
        val = raw.toISOString()
      } else if (typeof raw === 'object') {
        const obj = raw as Record<string, any>
        if ('error' in obj) {
          val = obj.error || ''
        } else if ('richText' in obj && Array.isArray(obj.richText)) {
          val = obj.richText.map((rt: any) => rt.text).join('')
        } else if ('hyperlink' in obj) {
          val = obj.text || obj.hyperlink || ''
        } else if ('result' in obj) {
          val = obj.result?.toString() || ''
        } else {
          val = JSON.stringify(obj)
        }
      } else {
        val = raw.toString()
      }

      aVal.push(preInfo.value + val)
      aFormula.push(formula ? formula : '')
    })

    workbookB.worksheets.forEach((sheet, index) => {
      const bSheet = workbookB.getWorksheet(sheet.name)
      if (bSheet && index < aVal.length) {
        if (copyType.value === 'formula' && aFormula[index]) {
          // 如果选择复制公式且有公式，则复制处理后的公式string
          bSheet.getCell(pastePosition.value).value = aFormula[index]
        } else {
          // 否则复制值
          bSheet.getCell(pastePosition.value).value = aVal[index]
        }
      }
    })

    // 生成 Excel 文件并保存为 Blob
    const buffer = await workbookB.xlsx.writeBuffer() // 生成 Excel 文件的二进制数据
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // 创建下载链接并模拟点击下载
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '复制列文件.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    message.error('出现异常，请确认参数是否正确')
    console.log(error)
  }
  loading.value = false
}
</script>

<template>
  <div class="excel-copy-column">
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
        <p>复制列号：</p>
        <n-input
          v-model:value="copySheetColumn"
          type="text"
          placeholder="请输入需要复制的列号（例如：J）"
        />
      </div>
      <div class="input-item">
        <p>开始行号：</p>
        <n-input-number
          v-model:value="startNum"
          :min="1"
          :step="1"
          :precision="0"
          :formatter="(value) => value.replace(/[^0-9]/g, '')"
          placeholder="请输入需要复制的列开始行（数字）"
        />
      </div>
      <div class="input-item">
        <p>结束行号：</p>
        <n-input-number
          v-model:value="endNum"
          :min="1"
          :step="1"
          :precision="0"
          :formatter="(value) => value.replace(/[^0-9]/g, '')"
          placeholder="请输入需要复制的列结束行（数字）"
        />
      </div>
      <div class="input-item">
        <p>粘贴位置：</p>
        <n-input
          v-model:value="pastePosition"
          type="text"
          placeholder="请输入需要粘贴的单元格位置（例如：B14）"
        />
      </div>
      <div class="input-item">
        <p>粘贴前缀：</p>
        <n-input
          v-model:value="preInfo"
          type="text"
          placeholder="请输入需要粘贴的单元格前缀（可为空）"
        />
      </div>
      <div class="input-item">
        <p>复制内容：</p>
        <n-select
          v-model:value="copyType"
          :options="[
            { label: '值', value: 'value' },
            { label: '公式', value: 'formula' },
          ]"
          placeholder="请选择复制内容类型"
        />
      </div>
    </div>
    <n-button
      strong
      secondary
      type="info"
      :loading="loading"
      style="width: 100%; margin-bottom: 10px"
      @click="copyColumn"
    >
      开始复制
    </n-button>
  </div>
</template>

<style scoped lang="scss">
.excel-copy-column {
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
      .n-input,
      .n-select {
        width: calc(100% - 100px);
      }
      p {
        width: 100px;
      }
    }
  }
}
</style>
