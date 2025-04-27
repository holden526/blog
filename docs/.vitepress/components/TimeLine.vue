<script setup lang="ts">
import { NTimeline, NTimelineItem, NIcon } from 'naive-ui'
import {
  DirectionsWalkFilled,
  SubwayRound,
  InsertEmoticonSharp,
  DirectionsCarFilledRound,
  FastfoodFilled,
} from '@vicons/material'

// 图标映射表
const iconMap: Record<string, any> = {
  walk: DirectionsWalkFilled,
  subway: SubwayRound,
  emoticon: InsertEmoticonSharp,
  car: DirectionsCarFilledRound,
  food: FastfoodFilled,
}

interface DataType {
  title: string
  content?: string
  time: string
  iconKey: string
  type: 'default' | 'error' | 'info' | 'success' | 'warning'
}

defineProps({
  iconSize: {
    type: Number,
    default: 35,
  },
  data: {
    type: Array as () => DataType[],
    default: () => [],
  },
})
</script>

<template>
  <div class="timeLine">
    <n-timeline :icon-size="iconSize" size="large">
      <n-timeline-item
        v-for="(item, index) in data"
        :key="index"
        :type="item.type"
        :title="item.title"
        :content="item.content"
        :time="item.time"
      >
        <template #icon>
          <n-icon v-if="iconMap[item.iconKey]">
            <component :is="iconMap[item.iconKey]" />
          </n-icon>
        </template>
      </n-timeline-item>
    </n-timeline>
  </div>
</template>

<style scoped lang="scss">
.timeLine {
  width: 100%;
  height: 100%;
  margin-top: 4vh;
}
</style>
