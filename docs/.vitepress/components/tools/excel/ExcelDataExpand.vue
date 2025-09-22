<script setup lang="ts">
import {
  NCard,
  NAlert,
  NUpload,
  NUploadDragger,
  NIcon,
  NText,
  NP,
  NInputGroup,
  NInputGroupLabel,
  NInput,
  NInputNumber,
  NButton,
  useMessage,
} from 'naive-ui'
import { DriveFolderUploadOutlined } from '@vicons/material'
import { ref } from 'vue'
import ExcelJS from 'exceljs'
import type { UploadFileInfo } from 'naive-ui'

// 使用 message 提示
const message = useMessage()

// 加载状态
const loading = ref(false)

// 用户输入参数
const resultCol = ref('G') // 结果列
const formulaCol = ref('H') // 公式列
const startRow = ref(7)
const endRow = ref(100)
const sheetName = ref('') // 工作表名称

// 文件对象（响应式）
const uploadedFile = ref<File | null>(null)

// 处理文件上传
const handleChange = ({ fileList }: { fileList: UploadFileInfo[] }) => {
  uploadedFile.value = fileList[0]?.file || null
}

// 解析公式并缩放第一个数值（长度项），保留两位小数，自动去除末尾 .00
const transformFormula = (formula: string, scaleFactor: number): string => {
  const original = formula.trim()
  const hasEqual = original.startsWith('=')
  const cleanFormula = original.replace(/^=/, '').trim()
  if (!cleanFormula) return hasEqual ? '=' : cleanFormula

  const newFormula = cleanFormula
    .split('+')
    .map((term) => {
      const factors = term
        .trim()
        .split('*')
        .map((f) => f.trim())
      if (factors.length === 0) return term

      const length = parseFloat(factors[0])
      if (isNaN(length)) return term

      // 乘以比例，保留两位小数，再用 parseFloat 去除末尾的 .00
      const newLength = parseFloat((length * scaleFactor).toFixed(2))
      factors[0] = String(newLength)

      return factors.join('*')
    })
    .join('+')

  // ✅ 必须加回等号，否则 Excel 不识别为公式
  return hasEqual ? '=' + newFormula : newFormula
}

// 主处理函数
const processExcel = async () => {
  if (!uploadedFile.value) {
    message.error('请先上传 Excel 文件')
    return
  }
  if (!sheetName.value.trim()) {
    message.error('请输入工作表名称')
    return
  }
  if (!resultCol.value.trim()) {
    message.error('请输入结果列')
    return
  }
  if (!formulaCol.value.trim()) {
    message.error('请输入公式列')
    return
  }
  if (startRow.value < 1 || endRow.value < 1) {
    message.error('行号必须大于 0')
    return
  }
  if (startRow.value > endRow.value) {
    message.error('结束行不能小于开始行')
    return
  }

  const file = uploadedFile.value
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'xlsx' && ext !== 'xls') {
    message.error('仅支持 .xlsx 或 .xls 文件')
    return
  }

  loading.value = true

  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)

    // 查找指定工作表
    const worksheet = workbook.getWorksheet(sheetName.value.trim())
    if (!worksheet) {
      message.error(`未找到名为 "${sheetName.value}" 的工作表`)
      loading.value = false
      return
    }

    const scaleFactor = 1.3

    let hasModified = false

    for (let row = startRow.value; row <= endRow.value; row++) {
      const resultCell = worksheet.getCell(`${resultCol.value.trim()}${row}`)
      const formulaCell = worksheet.getCell(`${formulaCol.value.trim()}${row}`)

      // 处理结果列：数值 ×1.3
      const rawResult = resultCell.value
      let resultValue: number | null = null

      if (rawResult === null || rawResult === undefined || rawResult === '') {
        continue
      }

      if (typeof rawResult === 'number') {
        resultValue = rawResult
      } else if (typeof rawResult === 'string') {
        const parsed = parseFloat(rawResult.trim())
        if (!isNaN(parsed)) resultValue = parsed
      } else if (typeof rawResult === 'object' && 'result' in rawResult) {
        const num = Number((rawResult as any).result)
        if (!isNaN(num)) resultValue = num
      }

      if (resultValue === null || isNaN(resultValue)) continue

      // 处理公式列：放大第一个数
      const formulaText = formulaCell.value
      if (
        typeof formulaText !== 'string' ||
        formulaText.trim() === '' ||
        formulaText.trim() === '='
      ) {
        continue
      }

      // ✅ 执行修改
      const newResult = resultValue * scaleFactor
      const newFormula = transformFormula(formulaText, scaleFactor)

      resultCell.value = newResult
      formulaCell.value = newFormula
      resultCell.numFmt = '0.00' // 保留两位小数

      hasModified = true
    }

    if (!hasModified) {
      message.warning('未找到可处理的数据')
      loading.value = false
      return
    }

    // 生成文件并下载
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `已扩大的Excel文件_${sheetName.value}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    message.success(`工作表 "${sheetName.value}" 处理完成！`)
  } catch (error: any) {
    message.error('处理失败：' + (error.message || '未知错误'))
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="excel-formula-scaler-container">
    <!-- 第一个卡片：上传文件 -->
    <n-card title="上传 Excel 文件" embedded>
      <!-- 使用说明 -->
      <n-alert style="margin-bottom: 20px" title="使用说明" type="info">
        <ul class="template-syntax-list" style="margin: 0; padding-left: 20px; line-height: 1.8">
          <li>请输入工作表名称（如 Sheet1）</li>
          <li>指定结果列（如 G）和公式列（如 H）</li>
          <li>设置处理的行范围（开始行 → 结束行）</li>
          <li>文件仅在浏览器本地处理，不会上传</li>
          <li>功能：将结果列 ×1.3，并放大公式中的“长度项”</li>
        </ul>
      </n-alert>

      <!-- 文件上传 -->
      <n-upload :max="1" :default-upload="false" accept=".xlsx,.xls" @change="handleChange">
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <DriveFolderUploadOutlined />
            </n-icon>
          </div>
          <n-text style="font-size: 16px">点击或拖动文件到该区域上传</n-text>
          <n-p depth="3" style="margin: 8px 0 0 0"> 支持 .xlsx 和 .xls 格式，仅本地处理 </n-p>
          <n-p v-if="uploadedFile?.name" style="margin-top: 12px; color: #18a058">
            当前文件：{{ uploadedFile.name }}
          </n-p>
        </n-upload-dragger>
      </n-upload>
    </n-card>

    <!-- 第二个卡片：配置参数 -->
    <n-card title="配置处理参数" embedded>
      <n-input-group style="margin: 13px 0" class="param-input-group">
        <n-input-group-label>工作表名</n-input-group-label>
        <n-input v-model:value="sheetName" placeholder="如：Sheet1" />
      </n-input-group>

      <n-input-group style="margin: 13px 0" class="param-input-group">
        <n-input-group-label>结果列</n-input-group-label>
        <n-input v-model:value="resultCol" placeholder="G" />
      </n-input-group>

      <n-input-group style="margin: 13px 0" class="param-input-group">
        <n-input-group-label>公式列</n-input-group-label>
        <n-input v-model:value="formulaCol" placeholder="H" />
      </n-input-group>

      <n-input-group style="margin: 13px 0" class="param-input-group">
        <n-input-group-label>开始行</n-input-group-label>
        <n-input-number v-model:value="startRow" :min="1" />
      </n-input-group>

      <n-input-group style="margin: 13px 0" class="param-input-group">
        <n-input-group-label>结束行</n-input-group-label>
        <n-input-number v-model:value="endRow" :min="1" />
      </n-input-group>
    </n-card>

    <!-- 处理按钮 -->
    <n-button
      strong
      secondary
      type="primary"
      size="large"
      block
      :loading="loading"
      style="margin: 20px 0"
      @click="processExcel"
      :disabled="
        !uploadedFile ||
        !sheetName.trim() ||
        !resultCol.trim() ||
        !formulaCol.trim() ||
        startRow <= 0 ||
        endRow < startRow
      "
    >
      {{ loading ? '处理中...' : '开始处理并下载' }}
    </n-button>
  </div>
</template>

<style scoped lang="scss">
.excel-formula-scaler-container {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;

  :deep(.n-upload-dragger) {
    padding: 24px;
  }

  .template-syntax-list {
    font-size: 14px;
    list-style: disc;
  }

  // 统一输入组样式
  :deep(.param-input-group) {
    display: flex;
    align-items: center;

    // 固定标签宽度
    .n-input-group-label {
      width: 100px;
      text-align: center;
      padding-right: 12px;
    }

    // 输入框部分占满剩余空间
    .n-input,
    .n-input-number {
      flex: 1;
      min-width: 160px;
    }

    // 如果是 n-input 内部的输入框
    .n-input-wrapper,
    .n-input-number-input-wrapper {
      width: 100%;
    }
  }
}
</style>
