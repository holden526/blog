<script lang="ts" setup>
import { ref } from 'vue'
import { NUpload, NButton, NProgress, NAlert, NCard, NText } from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
import JSZip from 'jszip'

// ---------- 状态 ----------
const fileList = ref<UploadFileInfo[]>([])
const processing = ref(false)
const progress = ref(0)
const message = ref('')
const messageType = ref<'success' | 'error' | 'info' | 'warning'>('info')

// ---------- 动态加载 PDF.js ----------
let pdfjsLib: any = null
let pdfjsWorker: string = ''

const loadPDFjs = async () => {
  if (typeof window === 'undefined') return null // SSR 阶段跳过

  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
    pdfjsWorker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
  }

  return pdfjsLib
}

// ---------- 处理PDF分页 ----------
const processPDF = async (file: File) => {
  try {
    const pdfjs = await loadPDFjs()
    if (!pdfjs) {
      message.value = 'PDF.js 未加载，请在浏览器环境下使用'
      return
    }

    processing.value = true
    progress.value = 0
    message.value = '正在读取PDF文件...'
    messageType.value = 'info'

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument(arrayBuffer).promise
    const totalPages = pdf.numPages

    message.value = `PDF共有 ${totalPages} 页，开始处理...`

    const zip = new JSZip()
    const fileName = file.name.replace('.pdf', '')

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      message.value = `正在处理第 ${pageNum}/${totalPages} 页...`
      progress.value = Math.round(((pageNum - 1) / totalPages) * 100)

      const page = await pdf.getPage(pageNum)
      const pageText = await extractTextFromPage(page, pageNum)
      const name = pageText ? pageText : `page_${pageNum.toString().padStart(3, '0')}`
      const imageBlob = await renderPageToImage(page, pageNum)
      zip.file(`${name}.png`, imageBlob)
    }

    message.value = '正在生成压缩包...'
    progress.value = 95
    const zipBlob = await zip.generateAsync({ type: 'blob' })

    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}_分页.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    progress.value = 100
    message.value = `成功！已将PDF分解为 ${totalPages} 个图片文件并打包下载`
    messageType.value = 'success'
  } catch (error) {
    console.error('处理PDF时出错:', error)
    message.value = '处理PDF时出错，请检查文件格式是否正确'
    messageType.value = 'error'
  } finally {
    processing.value = false
  }
}

// ---------- 提取页面文字 ----------
const extractTextFromPage = async (page: any, pageNum: number): Promise<string> => {
  const textContent = await page.getTextContent()
  const text = textContent.items.map((item: any) => item.str).join(' ')
  const nameMatch = text.match(/姓名[:：]\s*([^\s]+)/)
  return nameMatch ? nameMatch[1] : `page_${pageNum.toString().padStart(3, '0')}`
}

// ---------- 渲染PDF页面为图片 ----------
const renderPageToImage = async (page: any, pageNum: number): Promise<Blob> => {
  const viewport = page.getViewport({ scale: 2.0 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: context,
    viewport,
  }).promise

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.9)
  })
}

// ---------- 文件上传前检查 ----------
const beforeUpload = (data: { file: UploadFileInfo }) => {
  const file = data.file.file
  if (!file) return false

  if (file.type !== 'application/pdf') {
    message.value = '请选择PDF文件'
    messageType.value = 'error'
    return false
  }

  return true
}

// ---------- 文件选择后的处理 ----------
const handleFileChange = (options: { fileList: UploadFileInfo[] }) => {
  fileList.value = options.fileList
}

// ---------- 开始处理 ----------
const startProcess = () => {
  if (fileList.value.length > 0) {
    const file = fileList.value[0].file
    if (file) processPDF(file)
  } else {
    message.value = '请先选择一个PDF文件'
    messageType.value = 'warning'
  }
}

// ---------- 清除文件 ----------
const clearFiles = () => {
  fileList.value = []
  message.value = ''
  progress.value = 0
  processing.value = false
}
</script>

<template>
  <ClientOnly>
    <div class="pdf-splice">
      <NCard size="large">
        <template #header-extra>
          <NButton secondary @click="clearFiles" v-if="fileList.length > 0"> 清除文件 </NButton>
        </template>

        <div class="upload-area">
          <NUpload
            v-model:file-list="fileList"
            :max="1"
            accept=".pdf"
            :before-upload="beforeUpload"
            @change="handleFileChange"
            :disabled="processing"
            style="width: 100%"
          >
            <div class="upload-trigger">
              <div class="upload-icon">📄</div>
              <div class="upload-text">
                <NText style="font-size: 16px; font-weight: 500"> 点击选择PDF文件 </NText>
              </div>
            </div>
          </NUpload>
        </div>

        <div style="margin-top: 16px">
          <div v-if="message" class="message-area" style="margin-bottom: 12px">
            <NAlert :type="messageType" :show-icon="true">{{ message }}</NAlert>
          </div>

          <div v-if="processing" class="progress-area" style="margin-bottom: 12px">
            <NProgress type="line" :percentage="progress" :show-indicator="true" processing />
          </div>

          <NButton
            type="primary"
            block
            size="large"
            :disabled="fileList.length === 0"
            :loading="processing"
            @click="startProcess"
          >
            开始处理
          </NButton>
        </div>

        <div class="info-area">
          <NText depth="3" style="font-size: 13px">
            <strong>使用说明：</strong><br />
            1. 选择一个PDF文件（最大50MB）<br />
            2. 点击“开始处理”按钮<br />
            3. 系统会自动将PDF的每一页转换为PNG图片<br />
            4. 所有图片会打包成ZIP文件并自动下载<br />
            5. 图片文件名格式：如果有姓名，则用姓名，无姓名则用：原文件名_page_001.png
          </NText>
        </div>
      </NCard>
    </div>
  </ClientOnly>
</template>

<style scoped lang="scss">
.pdf-splice {
  width: 100%;
  margin: 0 auto;
}

.upload-area {
  width: 100%;
  :deep(.n-upload-trigger) {
    width: 100%;
  }
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 24px;
  border: 2px dashed var(--vp-c-border);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    border-color: var(--vp-c-brand-1);
    background-color: var(--vp-c-brand-soft);
  }
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.8;
}

.upload-text {
  text-align: center;
}

.message-area,
.progress-area {
  width: 100%;
}

.progress-area {
  display: flex;
  align-items: center;
}

.info-area {
  padding: 16px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 6px;
  border-left: 4px solid var(--vp-c-brand-1);
  margin-top: 20px;
  color: var(--vp-c-text-1);
  
  code {
    background-color: var(--vp-c-bg-mute);
    color: var(--vp-c-text-2);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }
}
</style>
