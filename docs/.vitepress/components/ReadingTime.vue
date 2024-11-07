<script setup lang="ts">
import { AccessTimeFilled, ArticleOutlined, BorderColorOutlined, UpdateOutlined } from '@vicons/material'
import { NIcon } from 'naive-ui'
import { useData } from 'vitepress'
import dayjs from 'dayjs'
const { frontmatter } = useData()
defineProps<{
  readTime: string
  words: string
  lastUpdated: string
}>()
</script>

<template>
  <div class='readingTime'>
    <div class="read">
      <NIcon :size="20">
        <AccessTimeFilled />
      </NIcon> 阅读时间:<p>{{ readTime }}</p>分钟
    </div>
    <div class="words">
      <NIcon :size="20">
        <ArticleOutlined />
      </NIcon> 文章字数:<p>{{ words }}</p>字
    </div>
    <div class="write">
      <NIcon :size="20">
        <BorderColorOutlined />
      </NIcon> 发布日期:<p>{{ dayjs(frontmatter.date).format('YYYY-MM-DD') }}</p>
    </div>
    <div class="update">
      <NIcon :size="20">
        <UpdateOutlined />
      </NIcon> 最近更新:<p>{{ dayjs(lastUpdated).format('YYYY-MM-DD') }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.readingTime {
  width: 100%;
  display: flex;
  margin: 5px 0 15px 0;
  flex-wrap: wrap;
  font-size: 14px;
  color: var(--grey-color-1);

  .read,
  .words,
  .write,
  .update {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;

    p {
      margin: 0 5px;
    }

    i {
      margin-right: 2px;
    }
  }
}
</style>