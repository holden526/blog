<script setup lang="ts">
import {
  AccessTimeFilled,
  ArticleOutlined,
  BorderColorOutlined,
  UpdateOutlined,
  MenuBookRound,
  DiscountOutlined,
} from '@vicons/material'
import { NIcon, NTag } from 'naive-ui'
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
  <div class="header">
    <section class="info">
      <div class="read">
        <NIcon :size="20">
          <AccessTimeFilled />
        </NIcon>
        阅读时间:
        <p>{{ readTime }}</p>
        min
      </div>
      <div class="words">
        <NIcon :size="20">
          <ArticleOutlined />
        </NIcon>
        文章字数:
        <p>{{ words }}</p>
        字
      </div>
      <div class="write">
        <NIcon :size="18">
          <BorderColorOutlined />
        </NIcon>
        发布日期:
        <p>{{ dayjs(frontmatter.date).format('YYYY-MM-DD') }}</p>
      </div>
      <div class="update">
        <NIcon :size="20">
          <UpdateOutlined />
        </NIcon>
        最近更新:
        <p>{{ dayjs(lastUpdated).format('YYYY-MM-DD') }}</p>
      </div>
      <div class="update">
        <NIcon :size="20">
          <MenuBookRound />
        </NIcon>
        阅读量:
        <p id="busuanzi_value_page_pv">-</p>
      </div>
    </section>
    <section class="tags">
      <n-tag :bordered="false" type="info" v-for="item in frontmatter.tags">
        {{ item }}
        <template #icon>
          <n-icon :size="16" :component="DiscountOutlined" />
        </template>
      </n-tag>
    </section>
  </div>
</template>

<style scoped lang="scss">
.header {
  width: 100%;

  .info {
    width: 100%;
    display: flex;
    margin-top: 5px;
    margin-bottom: 5px;
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

  .tags {
    width: 100%;
    display: flex;
    flex-wrap: wrap;

    .n-tag {
      margin-right: 10px;
      margin-bottom: 10px;
    }
  }
}
</style>
