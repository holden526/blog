<script setup lang="ts">
import { onMounted, ref } from 'vue'
const props = defineProps({
  data: {
    type: Array as () => { url: string; text: string; link?: string }[],
    required: true,
  },
  target: {
    type: String as () => '_blank' | '_self' | '_parent' | '_top',
    default: '_blank',
  },
})
const imageList = ref<{ url: string; text: string; link: string }[]>([])
const imagesImport = (import.meta as any).glob('../../img/**')

onMounted(() => {
  props.data.forEach(async (i) => {
    const url = await getImageUrl(i.url)
    imageList.value.push({ url: url ?? '', text: i.text, link: i.link ?? '' })
  })
})

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

const clickCard = (item: string) => {
  if (item) {
    window.open(item, props.target)
  }
}
</script>

<template>
  <div class="card">
    <div v-for="item in imageList" class="card-item" @click="clickCard(item.link)">
      <img :src="item.url" class="card-img" />
      <div class="text">
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
  gap: 10px;
  .card-item {
    width: calc(50% - 5px);
    display: flex;
    height: 60px;
    align-items: center;
    box-shadow: 1px 1px 5px 3px var(--border-color-1);
    border-radius: 10px;
    cursor: pointer;
    .text {
      width: calc(100% - 50px);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .card-img {
      width: 40px;
      margin: 10px;
    }
  }

  // 当屏幕宽度小于 768px 时，卡片宽度调整为 100%
  @media (max-width: 768px) {
    .card-item {
      width: 100%;
    }
  }
}
</style>
