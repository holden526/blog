<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { NGrid, NGridItem, NCard, NSpin, NImage } from 'naive-ui'
const imagesImport = (import.meta as any).glob('../../img/**')

const props = defineProps({
  images: {
    type: Array as () => string[],
    default: () => [],
  },
})

interface ImageState {
  src: string
  loading: boolean
  error: boolean
}

const imageStates = ref<ImageState[]>([])

const getImageUrl = async (name: string) => {
  const importer = imagesImport[`../../img${name}`]
  if (importer) {
    try {
      const module = (await importer()) as any
      return module.default || ''
    } catch (err) {
      console.error('导入图片失败:', err)
    }
  } else {
    console.error('图片未找到:', name)
  }
  return ''
}

onMounted(() => {
  imageStates.value = props.images.map(() => ({
    src: '',
    loading: true,
    error: false,
  }))

  props.images.forEach(async (name, index) => {
    const url = await getImageUrl(name)
    if (url) {
      imageStates.value[index].src = url
    } else {
      imageStates.value[index].error = true
    }
    imageStates.value[index].loading = false
  })
})

// 动态计算列数
const gridCols = computed(() => {
  if (props.images.length === 1) {
    return 1 // 如果只有一张图片，设置为1列
  }
  return props.images.length === 4 ? 2 : 3 // 否则，按默认设置
})
</script>

<template>
  <n-grid :x-gap="12" :y-gap="8" :cols="gridCols">
    <n-grid-item v-for="(imgState, index) in imageStates" :key="index">
      <n-card>
        <template #cover>
          <div class="image-container">
            <n-spin :show="imgState.loading" size="large" class="spin-container">
              <n-image
                :show-toolbar="false"
                v-if="!imgState.error"
                :src="imgState.src"
                fit="cover"
                preview
                width="100%"
                height="100%"
                lazy
              />
              <div v-else class="error-placeholder">加载异常</div>
            </n-spin>
          </div>
        </template>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<style lang="scss" scoped>
.image-container {
  width: 100%;
  padding-top: 100%;
  position: relative;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  :deep(.n-spin-content) {
    width: 100%;
    height: 100%;
  }

  :deep(.n-image) {
    width: 100%;
    height: 100%;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover !important;
    }
  }

  .spin-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
  }

  .error-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    color: #999;
  }
}
</style>
