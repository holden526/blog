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
  NTable,
  NPopconfirm,
  NSpace,
} from 'naive-ui'
import { KeyboardDoubleArrowRightFilled } from '@vicons/material'
import { ref } from 'vue'
import ExcelJS from 'exceljs'
const copySheetName = ref('')
const copySheetColumn = ref('')
const startNum = ref(1)
const endNum = ref(1)
const pasteSheetName = ref('') // 添加粘贴表名
const pastePosition = ref('')
const separator = ref('') // 修改为间隔符
const prefix = ref('') // 添加前缀
const copyType = ref('value')
const message = useMessage()
const loading = ref(false)
let inputFile: File | null | undefined = null
let outputFile: File | null | undefined = null

// 添加批量任务列表
const batchTasks = ref<
  {
    id: number
    copySheetName: string
    copySheetColumn: string
    startNum: number
    endNum: number
    pasteSheetName: string
    pastePosition: string
    separator: string
    prefix: string
    copyType: string
  }[]
>([])

// 生成唯一ID
let taskIdCounter = 1

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

// 复制单元格内容到剪贴板
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(
    () => {
      message.success('已复制到剪贴板')
    },
    (err) => {
      message.error('复制失败: ' + err)
    }
  )
}

// 添加到批量任务
const addToBatchTasks = () => {
  // 去除输入内容的前后空格
  const trimmedCopySheetName = copySheetName.value.trim()
  const trimmedCopySheetColumn = copySheetColumn.value.trim()
  const trimmedPasteSheetName = pasteSheetName.value.trim()
  const trimmedPastePosition = pastePosition.value.trim()
  const trimmedSeparator = separator.value.trim()
  const trimmedPrefix = prefix.value.trim()

  if (
    !trimmedCopySheetName ||
    !trimmedCopySheetColumn ||
    !trimmedPastePosition ||
    !trimmedPasteSheetName
  ) {
    message.error('请填写完整的复制信息')
    return
  }

  if (!startNum.value || !endNum.value || startNum.value > endNum.value) {
    message.error('请输入正确的行号范围')
    return
  }

  batchTasks.value.push({
    id: taskIdCounter++,
    copySheetName: trimmedCopySheetName,
    copySheetColumn: trimmedCopySheetColumn,
    startNum: startNum.value,
    endNum: endNum.value,
    pasteSheetName: trimmedPasteSheetName,
    pastePosition: trimmedPastePosition,
    separator: trimmedSeparator,
    prefix: trimmedPrefix,
    copyType: copyType.value,
  })

  // 清空输入框，方便用户继续添加
  copySheetName.value = ''
  copySheetColumn.value = ''
  startNum.value = 1
  endNum.value = 1
  pasteSheetName.value = ''
  pastePosition.value = ''
  separator.value = ''
  prefix.value = ''

  message.success('已添加到批量任务')
}

// 删除批量任务
const removeTask = (taskId: number) => {
  const index = batchTasks.value.findIndex((task) => task.id === taskId)
  if (index !== -1) {
    batchTasks.value.splice(index, 1)
    message.success('已删除任务')
  }
}

// 执行单个复制任务
const executeSingleTask = async (
  task: (typeof batchTasks.value)[0],
  workbookA: ExcelJS.Workbook,
  workbookB: ExcelJS.Workbook
) => {
  const aSheet = workbookA.getWorksheet(task.copySheetName)

  if (!aSheet) {
    message.error(`任务ID ${task.id}: A表不存在工作表 "${task.copySheetName}"`)
    return false
  }

  const aVal: string[] = []
  const aFormula: string[] = []

  aSheet.eachRow({ includeEmpty: true }, (_row, rowNumber) => {
    if (rowNumber < task.startNum || rowNumber > task.endNum) return

    const cell = aSheet.getCell(`${task.copySheetColumn}${rowNumber}`)
    let val = ''
    let formula = cell.formula || ''

    if (task.copyType === 'formula' && formula) {
      formula = replaceFormulaReferences(formula, aSheet)
    }

    const raw = cell.result ?? cell.value

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

    // 只有当值不为空时才添加到数组中
    if (val.trim() !== '') {
      aVal.push(val)
    }

    if (formula && formula.trim() !== '') {
      aFormula.push(formula)
    }
  })

  const bSheet = workbookB.getWorksheet(task.pasteSheetName)
  if (bSheet) {
    if (task.copyType === 'formula') {
      // 先拼接公式，然后在前面添加前缀
      const combinedFormulas = aFormula.join(task.separator)
      bSheet.getCell(task.pastePosition).value = task.prefix + combinedFormulas
    } else {
      // 先拼接值，然后在前面添加前缀
      const combinedValue = aVal.join(task.separator)
      bSheet.getCell(task.pastePosition).value = task.prefix + combinedValue
    }
    return true
  } else {
    message.error(`任务ID ${task.id}: B表不存在工作表 "${task.pasteSheetName}"`)
    return false
  }
}

// 执行批量任务
const executeBatchTasks = async () => {
  if (batchTasks.value.length === 0) {
    message.warning('没有批量任务可执行')
    return
  }

  if (!inputFile || !outputFile) {
    message.error('请选择输入和输出文件')
    return
  }

  try {
    loading.value = true
    const aData = await inputFile.arrayBuffer()
    const bData = await outputFile.arrayBuffer()
    const workbookA = new ExcelJS.Workbook()
    const workbookB = new ExcelJS.Workbook()
    await workbookA.xlsx.load(aData)
    await workbookB.xlsx.load(bData)

    let successCount = 0
    let failCount = 0

    for (const task of batchTasks.value) {
      const success = await executeSingleTask(task, workbookA, workbookB)
      if (success) {
        successCount++
      } else {
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
      link.download = '批量复制列文件.xlsx'
      link.click()
      URL.revokeObjectURL(url)

      message.success(`批量任务执行完成，成功: ${successCount}，失败: ${failCount}`)
    } else {
      message.error('所有批量任务均执行失败')
    }
  } catch (error) {
    message.error('执行批量任务时出现异常，请确认参数是否正确')
    console.log(error)
  }
  loading.value = false
}

const copyColumn = async () => {
  try {
    if (!inputFile || !outputFile) {
      message.error('请选择文件')
      return
    }

    // 去除输入内容的前后空格
    const trimmedCopySheetName = copySheetName.value.trim()
    const trimmedCopySheetColumn = copySheetColumn.value.trim()
    const trimmedPasteSheetName = pasteSheetName.value.trim()
    const trimmedPastePosition = pastePosition.value.trim()
    const trimmedSeparator = separator.value.trim()
    const trimmedPrefix = prefix.value.trim() // 添加前缀并去除前后空格

    if (!trimmedCopySheetName || !trimmedCopySheetColumn || !trimmedPastePosition) {
      message.error('请输入复制的完整信息')
      return
    }
    if (!trimmedPasteSheetName) {
      message.error('请输入粘贴的工作表名称')
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
    const aSheet = workbookA.getWorksheet(trimmedCopySheetName)

    if (!aSheet) {
      message.error('A表不存在该工作表')
      loading.value = false
      return
    }

    const aVal: string[] = []
    const aFormula: string[] = [] // 存储公式

    aSheet.eachRow({ includeEmpty: true }, (_row, rowNumber) => {
      if (rowNumber < startNum.value || rowNumber > endNum.value) return

      const cell = aSheet.getCell(`${trimmedCopySheetColumn}${rowNumber}`)
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

      // 只有当值不为空时才添加到数组中
      if (val.trim() !== '') {
        aVal.push(val)
      }

      if (formula && formula.trim() !== '') {
        aFormula.push(formula)
      }
    })

    // 修改这部分，使用指定的工作表名
    const bSheet = workbookB.getWorksheet(trimmedPasteSheetName)
    if (bSheet) {
      // 拼接所有值，使用指定的间隔符，然后在前面添加前缀
      if (copyType.value === 'formula') {
        const combinedFormulas = aFormula.join(trimmedSeparator)
        bSheet.getCell(trimmedPastePosition).value = trimmedPrefix + combinedFormulas
      } else {
        const combinedValue = aVal.join(trimmedSeparator)
        bSheet.getCell(trimmedPastePosition).value = trimmedPrefix + combinedValue
      }
    } else {
      message.error('B表不存在该工作表')
      loading.value = false
      return
    }

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
        <p>粘贴表名：</p>
        <n-input
          v-model:value="pasteSheetName"
          type="text"
          placeholder="请输入需要粘贴的工作表名称"
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
        <p>前缀：</p>
        <n-input v-model:value="prefix" type="text" placeholder="请输入拼接值前面的内容（可空）" />
      </div>
      <div class="input-item">
        <p>间隔符：</p>
        <n-input
          v-model:value="separator"
          type="text"
          placeholder="请输入数据间的间隔符（默认无间隔）"
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

    <div class="action-buttons">
      <n-space>
        <n-button strong secondary type="info" :loading="loading" @click="copyColumn">
          单次复制
        </n-button>
        <n-button strong secondary type="success" @click="addToBatchTasks">
          添加到批量任务
        </n-button>
      </n-space>
    </div>

    <!-- 批量任务列表 -->
    <div class="batch-tasks" v-if="batchTasks.length > 0">
      <h3>批量任务列表</h3>
      <n-table :bordered="false" :single-line="false">
        <thead>
          <tr>
            <th>ID</th>
            <th>复制表</th>
            <th>列号</th>
            <th>行范围</th>
            <th>粘贴表</th>
            <th>粘贴位置</th>
            <th>前缀</th>
            <th>间隔符</th>
            <th>类型</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in batchTasks" :key="task.id">
            <td @click="copyToClipboard(task.id.toString())" class="clickable-cell">
              {{ task.id }}
            </td>
            <td @click="copyToClipboard(task.copySheetName)" class="clickable-cell">
              {{ task.copySheetName }}
            </td>
            <td @click="copyToClipboard(task.copySheetColumn)" class="clickable-cell">
              {{ task.copySheetColumn }}
            </td>
            <td @click="copyToClipboard(`${task.startNum}-${task.endNum}`)" class="clickable-cell">
              {{ task.startNum }}-{{ task.endNum }}
            </td>
            <td @click="copyToClipboard(task.pasteSheetName)" class="clickable-cell">
              {{ task.pasteSheetName }}
            </td>
            <td @click="copyToClipboard(task.pastePosition)" class="clickable-cell">
              {{ task.pastePosition }}
            </td>
            <td @click="copyToClipboard(task.prefix)" class="clickable-cell">
              {{ task.prefix || '无' }}
            </td>
            <td @click="copyToClipboard(task.separator)" class="clickable-cell">
              {{ task.separator || '无' }}
            </td>
            <td
              @click="copyToClipboard(task.copyType === 'value' ? '值' : '公式')"
              class="clickable-cell"
            >
              {{ task.copyType === 'value' ? '值' : '公式' }}
            </td>
            <td>
              <n-popconfirm
                @positive-click="() => removeTask(task.id)"
                positive-text="确定"
                negative-text="取消"
              >
                <template #trigger>
                  <n-button size="small" type="error">删除</n-button>
                </template>
                确定要删除此任务吗？
              </n-popconfirm>
            </td>
          </tr>
        </tbody>
      </n-table>

      <n-button
        strong
        secondary
        type="primary"
        :loading="loading"
        style="width: 100%; margin-top: 10px"
        @click="executeBatchTasks"
      >
        执行批量任务
      </n-button>
    </div>
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
  .action-buttons {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
  }
  .batch-tasks {
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 20px;

    h3 {
      margin-bottom: 10px;
    }

    .clickable-cell {
      cursor: pointer;
      &:hover {
        background-color: #f5f5f5;
      }
    }
  }
}
</style>
