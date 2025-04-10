<script setup lang="ts">
import {
  NUpload,
  NUploadDragger,
  NIcon,
  NInput,
  NInputNumber,
  NText,
  NP,
  UploadFileInfo,
  useMessage,
  NButton,
} from 'naive-ui'
import { DriveFolderUploadOutlined } from '@vicons/material'
import { ref } from 'vue'
import ExcelJS from 'exceljs'
const copyNum = ref(1)
const copySheetName = ref('')
const message = useMessage()
const loading = ref(false)
let file: File | null | undefined = null

// 开始复制
const copySheet = async () => {
  try {
    if (!file) {
      message.error('请先上传文件')
      return
    }
    if (!copySheetName.value) {
      message.error('请输入需要复制的工作表名称')
      return
    }
    if (!copyNum.value) {
      message.error('请输入正确的复制数量')
      return
    }
    const fileName = file.name
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext !== 'xlsx' && ext !== 'xls') {
      message.error('不支持的文件类型')
      return
    }

    loading.value = true
    // 开始读取 Excel 文件
    const data = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(data)
    const dataSheet = workbook.getWorksheet(copySheetName.value)
    if (!dataSheet) {
      message.error(`没有找到${copySheetName.value}工作表`)
      return
    }
    for (let i = 0; i < copyNum.value; i++) {
      let newSheetName = ''
      if (/^\d+$/.test(dataSheet.name)) {
        // 如果是纯数字，直接加i，格式化为3位数
        newSheetName = (parseInt(dataSheet.name) + i + 1).toString().padStart(3, '0')
      } else if (/表格(\d+)$/.test(dataSheet.name)) {
        // 如果名称是带有“表格数字”的格式，提取数字并加i
        newSheetName = dataSheet.name.replace(/(\d+)$/, (_, p1) =>
          (parseInt(p1) + i + 1).toString()
        )
      } else {
        // 如果是其他格式名称，直接在名称后加i
        newSheetName = dataSheet.name + (i + 1)
      }
      const copySheet = workbook.addWorksheet(newSheetName)
      copySheet.model = { ...dataSheet.model, name: newSheetName }
      dataSheet.model.merges.forEach((merge) => {
        copySheet.mergeCells(merge)
      })
    }

    // 生成 Excel 文件并保存为 Blob
    const buffer = await workbook.xlsx.writeBuffer() // 生成 Excel 文件的二进制数据
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // 创建下载链接并模拟点击下载
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '复制表文件.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    message.error('复制失败')
    console.error(error)
  }
  loading.value = false
}

// 获取文件
const handleChange = async ({ fileList }: { fileList: UploadFileInfo[] }) => {
  file = fileList[0]?.file
  if (!file) return
}
</script>

<template>
  <div class="excel-copy-worksheet">
    <div class="input">
      <div class="input-item">
        <p>工表名称：</p>
        <n-input
          v-model:value="copySheetName"
          type="text"
          placeholder="请输入需要复制的工作表名称"
        />
      </div>
      <div class="input-item">
        <p>复制数量：</p>
        <n-input-number
          v-model:value="copyNum"
          clearable
          placeholder="请输入需要复制的数量"
          :min="1"
          :step="1"
          :precision="0"
          :formatter="(value) => value.replace(/[^0-9]/g, '')"
        />
      </div>
    </div>
    <div class="item">
      <NUpload
        :max="1"
        multiple
        directory-dnd
        :default-upload="false"
        accept=".xlsx,.xls"
        @change="handleChange"
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
        </n-upload-dragger>
      </NUpload>
    </div>
    <n-button
      strong
      secondary
      :loading="loading"
      type="info"
      style="width: 100%; margin: 10px 0"
      @click="copySheet"
    >
      开始复制
    </n-button>
  </div>
</template>

<style scoped lang="scss">
.excel-copy-worksheet {
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
}
</style>
