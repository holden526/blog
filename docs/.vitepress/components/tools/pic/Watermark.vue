<script lang="ts" setup>
import { ref, computed, h, StyleValue } from 'vue'
import {
  NCard,
  NUpload,
  NUploadDragger,
  NSpace,
  NIcon,
  NButton,
  NAlert,
  NInputNumber,
  useMessage,
  type UploadFileInfo,
} from 'naive-ui'
import { ImageFilled as ImageIcon } from '@vicons/material'
import * as htmlToImage from 'html-to-image'
const message = useMessage()
const loading = ref(false)
const watermarkWidth = ref(250)
let imageWidth = 0
let imageHeight = 0

// 文件上传相关
const fileList = ref<UploadFileInfo[]>([])
const previewImage = ref<string | null>(null)

// 水印模板定义
interface WatermarkTemplate {
  id: string
  style: StyleValue
  render: () => any // 自定义渲染函数
}

// 预定义水印模板
const watermarkTemplates: WatermarkTemplate[] = [
  {
    id: 'template1',
    style: {
      bottom: '10px',
      left: '10px',
      width: '250px', // 固定宽度
    },
    render: () => {
      return h('div', { class: 'watermark-template1' }, [
        h('div', { class: 'title' }, '工程记录'),
        h('div', { class: 'content' }, [
          h('div', { class: 'line' }, '  施工位置：云安收费站'),
          h('div', { class: 'line' }, '  施工内容：安装标志牌'),
          h('div', { class: 'line' }, '  拍摄日期：2022年10月29日'),
          h('div', { class: 'line' }, '  施工地点：G80广昆高速'),
        ]),
      ])
    },
  },
  {
    id: 'template2',
    style: {
      bottom: '10px',
      left: '10px',
      width: '250px',
    },
    render: () => {
      return h('div', { class: 'watermark-template2' }, [
        h('div', { class: 'title' }, '工程记录'),
        h('div', { class: 'content' }, [
          h('div', { class: 'line' }, '  施工位置：云安收费站'),
          h('div', { class: 'line' }, '  施工内容：安装标志牌'),
          h('div', { class: 'line' }, '  拍摄日期：2022年10月29日'),
          h('div', { class: 'line' }, '  施工地点：G80广昆高速'),
        ]),
        h('div', { class: 'bottom' }, '施工单位：广东能达'),
      ])
    },
  },
  {
    id: 'template3',
    style: {
      bottom: '10px',
      left: '10px',
      width: '250px',
    },
    render: () => {
      return h('div', { class: 'watermark-template3' }, [
        h('div', { class: 'top' }, [h('div'), h('div', { class: 'text' }, '工程记录')]),
        h('div', { class: 'content' }, [
          h('div', { class: 'line' }, '  施工位置：云安收费站'),
          h('div', { class: 'line' }, '  施工内容：安装标志牌'),
          h('div', { class: 'line' }, '  拍摄日期：2022年10月29日'),
          h('div', { class: 'line' }, '  施工地点：G80广昆高速'),
        ]),
      ])
    },
  },
  {
    id: 'template4',
    style: {
      bottom: '10px',
      left: '10px',
      width: '250px',
    },
    render: () => {
      return h('div', { class: 'watermark-template4' }, [
        h('div', { class: 'top' }, [h('div'), h('div', { class: 'text' }, '工程记录')]),
        h('div', { class: 'content' }, [
          h('div', { class: 'line' }, '  施工位置：云安收费站'),
          h('div', { class: 'line' }, '  施工内容：安装标志牌'),
          h('div', { class: 'line' }, '  拍摄日期：2022年10月29日'),
          h('div', { class: 'line' }, '  施工地点：G80广昆高速'),
        ]),
        h('div', { class: 'bottom' }, '施工单位：广东能达'),
      ])
    },
  },
]

// 当前选中的模板
const selectedTemplateId = ref('')
const imageContainer = ref<HTMLElement | null>(null)

// 获取当前选中的模板
const selectedTemplate = computed(() => {
  return watermarkTemplates.find((template) => template.id === selectedTemplateId.value)
})

// 计算水印样式
const getWatermarkStyle = computed((): any => {
  if (!selectedTemplate.value) return {}
  return {
    ...(selectedTemplate.value.style as Object),
    position: 'absolute',
    width: `${watermarkWidth.value}px`, // 在这里应用动态宽度
  }
})

// 处理文件变化
const handleFileChange = (options: { file: UploadFileInfo; fileList: UploadFileInfo[] }) => {
  const { file } = options
  if (file.status === 'removed') {
    previewImage.value = null
    selectedTemplateId.value = ''
    return
  }

  if (file.file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      // 创建一个临时的 Image 对象来获取图片尺寸
      const img = new Image()
      img.onload = () => {
        imageHeight = img.height
        imageWidth = img.width
      }
      previewImage.value = e.target?.result as string
      img.src = e.target?.result as string
      selectedTemplateId.value = ''
    }
    reader.readAsDataURL(file.file as File)
  }
}

// 选择水印模板
const selectWatermarkTemplate = (id: string) => {
  selectedTemplateId.value = id
}
const downloadImage = async () => {
  if (!imageContainer.value) return
  message.info('图片正在生成中，请稍等...')
  try {
    loading.value = true
    // 直接将当前HTML转为PNG
    const blob = await htmlToImage.toBlob(imageContainer.value, {
      cacheBust: true,
      canvasHeight: imageHeight,
      canvasWidth: imageWidth,
      pixelRatio: 1,
    })

    if (!blob) {
      console.error('导出失败，blob为空')
      return
    }

    const link = document.createElement('a')
    link.download = `watermarked_image_${Date.now()}.png`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (err) {
    console.error('导出图片失败:', err)
  }
  loading.value = false
}
const handleWatermarkKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    document.execCommand('insertLineBreak')
  }
}
</script>

<template>
  <div class="watermark-container">
    <n-card>
      <n-space vertical>
        <n-upload
          v-model:file-list="fileList"
          :max="1"
          :default-upload="false"
          accept="image/*"
          @change="handleFileChange"
        >
          <n-upload-dragger>
            <div class="upload-area">
              <n-icon size="48" :depth="3">
                <image-icon />
              </n-icon>
              <p>点击或拖拽图片到此区域</p>
            </div>
          </n-upload-dragger>
        </n-upload>

        <div v-if="previewImage" class="preview-section">
          <n-alert style="margin-bottom: 20px" title="提示" type="info">
            请从下方选择一个水印模板，文本内容在图片处可编辑
          </n-alert>

          <div class="paramsInput">
            <p>水印宽度：</p>
            <n-input-number
              v-model:value="watermarkWidth"
              :min="250"
              placeholder="请输入水印宽度"
            />
          </div>

          <div class="watermark-templates">
            <div
              v-for="template in watermarkTemplates"
              :key="template.id"
              class="template-item"
              :class="{ selected: selectedTemplateId === template.id }"
              :style="template.style"
              @click="selectWatermarkTemplate(template.id)"
            >
              <component :is="template.render()" />
            </div>
          </div>

          <div class="preview-container">
            <div class="image-container" ref="imageContainer">
              <img :src="previewImage" alt="预览图片" />
              <div
                v-if="selectedTemplate"
                class="watermark"
                :style="getWatermarkStyle"
                @keydown="handleWatermarkKeydown"
              >
                <component contenteditable :is="selectedTemplate.render()" />
              </div>
            </div>
          </div>

          <div class="action-bar">
            <n-button :loading type="primary" @click="downloadImage">下载图片</n-button>
          </div>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<style scoped>
.watermark-template1,
.watermark-template2,
.watermark-template3,
.watermark-template4 {
  text-align: center;
  width: 100%;
  height: 100%;
  .title {
    font-size: 16px;
    background-color: rgba(100, 146, 224, 0.8);
    width: 100%;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    height: 35px;
    line-height: 35px;
    color: #fff;
    font-weight: bold;
  }
  .content {
    background-color: rgba(220, 216, 213, 0.8);
    width: 100%;
    font-size: 16px;
    font-weight: bold;
    color: #000;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    padding: 10px;
    .line {
      width: 100%;
      text-align: left;
      white-space: pre;
    }
  }
}

.watermark-template2,
.watermark-template4 {
  .content {
    border-radius: 0;
  }
  .bottom {
    width: 100%;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    background-color: rgba(100, 146, 224, 0.8);
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    height: 35px;
    line-height: 35px;
    color: #fff;
  }
}

.watermark-template3,
.watermark-template4 {
  .top {
    background-color: rgba(100, 146, 224, 0.8);
    display: flex;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    align-items: center;
    position: relative;
    .text {
      font-size: 16px;
      width: 100%;
      height: 35px;
      line-height: 35px;
      color: #fff;
      font-weight: bold;
    }
    div:first-child {
      width: 10px;
      height: 10px;
      border-radius: 100%;
      background-color: rgba(238, 194, 70, 0.8);
      position: absolute;
      left: 18px;
    }
  }
}

.paramsInput {
  display: flex;
  width: 100%;
  align-items: center;
  .n-input-number {
    flex: 1;
  }
  margin-bottom: 15px;
}

.watermark-container {
  max-width: 800px;
  margin: 0 auto;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.preview-section {
  margin-top: 20px;
}

.watermark-templates {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  justify-content: space-between;
  gap: 15px;
  border: 1px dashed #ddd;
  border-radius: 5px;
  padding: 5px;
}

.template-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 5px;
  width: 48% !important;
}

.template-item:hover {
  background-color: #f5f5f5;
}

.template-item.selected {
  border-color: #18a058;
  background-color: #f0f9f4;
}

.template-name {
  text-align: center;
  font-size: 14px;
}

.action-bar {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.preview-container {
  margin: 20px 0;
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 5px;
}

.image-container {
  position: relative;
  display: inline-block;
}

.image-container img {
  max-width: 100%;
  display: block;
}

.watermark {
  z-index: 10;
  transition: all 0.1s ease;
}

.watermark:hover {
  opacity: 0.9;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}
</style>
