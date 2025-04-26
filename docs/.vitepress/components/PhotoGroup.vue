<script setup lang="ts">
import { NGrid, NGridItem, NCard } from 'naive-ui'
import { computed } from 'vue'

const props = defineProps({
  images: {
    type: Array as () => string[],
    default: () => [],
  },
})

const getImageUrl = (name: string) => {
  return new URL(`../../img/${name}`, import.meta.url).href
}

// 动态计算列数
const gridCols = computed(() => (props.images.length === 4 ? 2 : 3))
</script>

<template>
  <n-grid :x-gap="12" :y-gap="8" :cols="gridCols">
    <n-grid-item v-for="(image, index) in images" :key="index">
      <n-card>
        <template #cover>
          <div class="image-container">
            <img :src="getImageUrl(image)" />
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

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
