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
  NSelect,
} from 'naive-ui'
import { DriveFolderUploadOutlined } from '@vicons/material'
import { ref } from 'vue'
import ExcelJS from 'exceljs'
import type { UploadFileInfo } from 'naive-ui'

const message = useMessage()

// 加载状态
const loading = ref(false)

// 用户输入参数
const resultCol = ref('G') // 结果数据所在列
const outputCol = ref('R') // 输出公式的目标列
const startRow = ref(7)
const endRow = ref(100)
const sheetName = ref('')

// 宽度来源：'fixed' 表示手动输入，'column' 表示从列读取
const widthSource = ref<'fixed' | 'column'>('fixed')
// 高度来源：'fixed' 表示手动输入，'column' 表示从列读取
const heightSource = ref<'fixed' | 'column'>('fixed')

// 固定值（手动输入时）
const widthFixed = ref(0.5)
const heightFixed = ref(0.6)

// 列设置（从列读取时）
const widthCol = ref('') // 宽度所在列
const heightCol = ref('') // 高度所在列

// 公式类型选择：'area' 表示 长×宽，'volume' 表示 长×宽×高
const formulaType = ref<'area' | 'volume'>('area')
const formulaOptions = [
  { label: '长度 × 宽度（面积）', value: 'area' },
  { label: '长度 × 宽度 × 高度（体积）', value: 'volume' },
]

// 文件对象
const uploadedFile = ref<File | null>(null)

// 处理文件上传
const handleChange = ({ fileList }: { fileList: UploadFileInfo[] }) => {
  uploadedFile.value = fileList[0]?.file || null
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
  if (!outputCol.value.trim()) {
    message.error('请输入输出列')
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

    const worksheet = workbook.getWorksheet(sheetName.value.trim())
    if (!worksheet) {
      message.error(`未找到名为 "${sheetName.value}" 的工作表`)
      loading.value = false
      return
    }

    let hasModified = false

    for (let row = startRow.value; row <= endRow.value; row++) {
      const resultCell = worksheet.getCell(`${resultCol.value.trim()}${row}`)
      const outputCell = worksheet.getCell(`${outputCol.value.trim()}${row}`)

      // 获取当前行的宽度值
      let width: number
      if (widthSource.value === 'column') {
        const widthCell = worksheet.getCell(`${widthCol.value.trim()}${row}`)
        const widthVal = widthCell.value
        width = typeof widthVal === 'number' ? widthVal : parseFloat(String(widthVal))
        if (isNaN(width) || width === 0) {
          continue // 跳过无效宽度值的行
        }
      } else {
        width = widthFixed.value
      }

      // 获取当前行的高度值（体积模式需要）
      let height: number
      if (formulaType.value === 'volume') {
        if (heightSource.value === 'column') {
          const heightCell = worksheet.getCell(`${heightCol.value.trim()}${row}`)
          const heightVal = heightCell.value
          height = typeof heightVal === 'number' ? heightVal : parseFloat(String(heightVal))
          if (isNaN(height) || height === 0) {
            continue // 跳过无效高度值的行
          }
        } else {
          height = heightFixed.value
        }
      } else {
        height = heightFixed.value // 面积模式下不需要高度，使用默认值
      }

      const rawValue = resultCell.value

      // 情况1：空值，跳过
      if (rawValue === null || rawValue === undefined || rawValue === '') {
        continue
      }

      // 情况2：是公式对象（ExcelJS 中 formula 存在）
      if (typeof rawValue === 'object' && 'formula' in rawValue) {
        const formulaStr = (rawValue as any).formula as string
        const cleanFormula = formulaStr.trim().replace(/^=/, '') // 去掉 =

        // 子情况2a：包含乘法，直接输出原公式（不带 =）
        if (cleanFormula.includes('*')) {
          outputCell.value = cleanFormula // 纯文本，不加 =
          hasModified = true
          continue
        }

        // 子情况2b：只包含加法，如 876.2+5.2（已去 =）
        if (cleanFormula.includes('+')) {
          const terms = cleanFormula.split('+').map((t) => t.trim())
          const newTerms: string[] = []

          for (const term of terms) {
            const num = parseFloat(term)
            if (isNaN(num)) {
              // 无法解析的项（如 A1、B2 等引用），保留原样
              newTerms.push(term)
              continue
            }

            // 根据公式类型生成子公式（不带 =）
            if (formulaType.value === 'area') {
              const length = parseFloat((num / width).toFixed(2))
              newTerms.push(`${length} * 0.5`)
            } else {
              const length = parseFloat((num / width / height).toFixed(2))
              newTerms.push(`${length} * 0.5 * 0.6`)
            }
          }

          // 拼接为纯文本公式，不加 =
          const newFormulaText = newTerms.join(' + ')
          outputCell.value = newFormulaText
          hasModified = true
          continue
        }

        // 子情况2c：包含除法或其他运算，当作数值处理（fall through）
        // 其他情况（如单个值 =100），当作数值处理（fall through）
      }

      // 情况3：纯数值（包括非公式对象或 fallback）
      let numericValue: number | null = null
      if (typeof rawValue === 'number') {
        numericValue = rawValue
      } else if (typeof rawValue === 'string') {
        const parsed = parseFloat(rawValue.trim())
        if (!isNaN(parsed)) numericValue = parsed
      } else if (typeof rawValue === 'object' && 'result' in rawValue) {
        const num = Number((rawValue as any).result)
        if (!isNaN(num)) numericValue = num
      }

      if (numericValue === null || isNaN(numericValue)) continue

      // 生成纯文本公式（不带 =）
      let formulaText = ''
      if (formulaType.value === 'area') {
        const length = parseFloat((numericValue / width).toFixed(2))
        const widthDisplay = widthSource.value === 'column' ? `${widthCol.value.trim()}${row}` : width
        formulaText = `${length} * ${widthDisplay}`
      } else {
        const length = parseFloat((numericValue / width / height).toFixed(2))
        const widthDisplay = widthSource.value === 'column' ? `${widthCol.value.trim()}${row}` : width
        const heightDisplay = heightSource.value === 'column' ? `${heightCol.value.trim()}${row}` : height
        formulaText = `${length} * ${widthDisplay} * ${heightDisplay}`
      }

      outputCell.value = formulaText
      hasModified = true
    }

    if (!hasModified) {
      message.warning('未找到可处理的数据')
      loading.value = false
      return
    }

    // 生成并下载文件
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `已生成公式的Excel文件_${sheetName.value}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    message.success(`工作表 "${sheetName.value}" 公式生成完成！`)
  } catch (error: any) {
    message.error('处理失败：' + (error.message || '未知错误'))
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="excel-formula-generator-container">
    <!-- 说明卡片 -->
    <n-card title="上传 Excel 文件" embedded>
      <n-alert style="margin-bottom: 20px" title="使用说明" type="info">
        <ul class="usage-list" style="margin: 0; padding-left: 20px; line-height: 1.8">
          <li>上传 .xlsx 或 .xls 文件（仅本地处理）</li>
          <li>输入包含结果值的列（如 G）</li>
          <li>指定输出公式的列（如 H）</li>
          <li>设置处理的行范围</li>
          <li>选择公式类型：长×宽 或 长×宽×高</li>
          <li>宽度：可手动输入固定值（默认0.5）或从指定列读取</li>
          <li>高度（体积模式）：可手动输入固定值（默认0.6）或从指定列读取</li>
          <li>若结果列含公式，直接复制；否则根据数值反推“长度”生成公式</li>
        </ul>
      </n-alert>

      <n-upload :max="1" :default-upload="false" accept=".xlsx,.xls" @change="handleChange">
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <DriveFolderUploadOutlined />
            </n-icon>
          </div>
          <n-text style="font-size: 16px">点击或拖动文件上传</n-text>
          <n-p depth="3" style="margin: 8px 0 0 0">支持 .xlsx 和 .xls 格式</n-p>
          <n-p v-if="uploadedFile?.name" style="margin-top: 12px; color: #18a058">
            当前文件：{{ uploadedFile.name }}
          </n-p>
        </n-upload-dragger>
      </n-upload>
    </n-card>

    <!-- 参数配置卡片 -->
    <n-card title="配置处理参数" embedded>
      <n-input-group style="margin: 13px 0">
        <n-input-group-label>工作表名</n-input-group-label>
        <n-input v-model:value="sheetName" placeholder="如：Sheet1" />
      </n-input-group>

      <n-input-group style="margin: 13px 0">
        <n-input-group-label>结果列</n-input-group-label>
        <n-input v-model:value="resultCol" placeholder="G" />
      </n-input-group>

      <n-input-group style="margin: 13px 0">
        <n-input-group-label>输出列</n-input-group-label>
        <n-input v-model:value="outputCol" placeholder="H" />
      </n-input-group>

      <n-input-group style="margin: 13px 0">
        <n-input-group-label>开始行</n-input-group-label>
        <n-input-number v-model:value="startRow" :min="1" />
      </n-input-group>

      <n-input-group style="margin: 13px 0">
        <n-input-group-label>结束行</n-input-group-label>
        <n-input-number v-model:value="endRow" :min="1" />
      </n-input-group>

      <n-input-group style="margin: 13px 0">
        <n-input-group-label>公式类型</n-input-group-label>
        <n-select
          v-model:value="formulaType"
          :options="formulaOptions"
          placeholder="选择公式类型"
        />
      </n-input-group>

      <!-- 宽度配置 -->
      <n-card title="宽度配置" embedded style="margin: 16px 0">
        <n-input-group style="margin: 13px 0">
          <n-input-group-label>来源方式</n-input-group-label>
          <n-select
            v-model:value="widthSource"
            :options="[
              { label: '手动输入固定值（默认0.5）', value: 'fixed' },
              { label: '从指定列读取', value: 'column' },
            ]"
            placeholder="选择宽度来源"
          />
        </n-input-group>

        <n-input-group v-if="widthSource === 'fixed'" style="margin: 13px 0">
          <n-input-group-label>宽度固定值</n-input-group-label>
          <n-input-number v-model:value="widthFixed" :min="0.01" :step="0.1" />
        </n-input-group>

        <n-input-group v-if="widthSource === 'column'" style="margin: 13px 0">
          <n-input-group-label>宽度所在列</n-input-group-label>
          <n-input v-model:value="widthCol" placeholder="如：B" />
        </n-input-group>
      </n-card>

      <!-- 高度配置（仅体积模式显示） -->
      <n-card v-if="formulaType === 'volume'" title="高度配置" embedded style="margin: 16px 0">
        <n-input-group style="margin: 13px 0">
          <n-input-group-label>来源方式</n-input-group-label>
          <n-select
            v-model:value="heightSource"
            :options="[
              { label: '手动输入固定值（默认0.6）', value: 'fixed' },
              { label: '从指定列读取', value: 'column' },
            ]"
            placeholder="选择高度来源"
          />
        </n-input-group>

        <n-input-group v-if="heightSource === 'fixed'" style="margin: 13px 0">
          <n-input-group-label>高度固定值</n-input-group-label>
          <n-input-number v-model:value="heightFixed" :min="0.01" :step="0.1" />
        </n-input-group>

        <n-input-group v-if="heightSource === 'column'" style="margin: 13px 0">
          <n-input-group-label>高度所在列</n-input-group-label>
          <n-input v-model:value="heightCol" placeholder="如：C" />
        </n-input-group>
      </n-card>
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
        !outputCol.trim() ||
        startRow <= 0 ||
        endRow < startRow ||
        (widthSource === 'column' && !widthCol.trim()) ||
        (formulaType === 'volume' && heightSource === 'column' && !heightCol.trim())
      "
    >
      {{ loading ? '处理中...' : '开始处理并下载' }}
    </n-button>
  </div>
</template>

<style scoped lang="scss">
.excel-formula-generator-container {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 16px;

  :deep(.n-upload-dragger) {
    padding: 24px;
  }

  .usage-list {
    font-size: 14px;
    list-style: disc;
  }

  :deep(.n-input-group) {
    display: flex;
    align-items: center;
    .n-input-group-label {
      width: 110px;
      text-align: right;
      padding-right: 12px;
    }
    .n-input,
    .n-input-number,
    .n-select {
      flex: 1;
    }
  }
}
</style>
