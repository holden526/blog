<script setup lang="ts">
import { NTimeline, NTimelineItem, NIcon } from 'naive-ui'
import dayjs from 'dayjs'
import { EmailOutlined } from '@vicons/material'
// @ts-ignore
import { data as posts } from "../utils/posts.data"

console.log(posts)
</script>

<template>
  <div class="artical-list">
    <div class="top">
      <section class="left-wrapper">
        <img class="avatar" src="@/public/assets/avatar.jpg" alt="avatar">
        <p class="name">holden</p>
        <p class="text">快不快乐有天总过去</p>
        <div class="email">
          <NIcon :size="23">
            <EmailOutlined />
          </NIcon>
          holden.lee@aliyun.com
        </div>
      </section>
      <section class="right-wrapper">
        <n-timeline size="large">
          <n-timeline-item v-for="item in posts">
            <template #icon>
              <div class="icon">
                <p>{{ dayjs(item.frontmatter.date).format('YYYY-MM-DD') }}</p>
                <div class="dot"></div>
              </div>
            </template>
            <template #default>
              <div class="card">
                <div class="title">{{ item.frontmatter.title }}</div>
                <div class="tags">
                  <div class="tagItem" v-for="tagItem in item.frontmatter.tags">
                    {{ tagItem }}
                  </div>
                </div>
                <div class="info">{{ item.frontmatter.date }}</div>
              </div>
            </template>
          </n-timeline-item>
        </n-timeline>
      </section>
    </div>
    <div class="bottom">
      本站总访问量
      <span id="busuanzi_value_site_pv" class="font-bold">--</span> 次
      本站访客数
      <span id="busuanzi_value_site_uv" class="font-bold">--</span> 人次
    </div>
  </div>
</template>

<style scoped lang="scss">
.artical-list {
  width: 100%;
  height: 100%;
  color: var(--black-color-1);

  .top {
    width: 100%;
    height: 90%;
    display: flex;

    .left-wrapper {
      margin-top: 3vh;
      border: 1px solid var(--border-color-1);
      width: 250px;
      height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-radius: var(--border-radius);

      p {
        margin: 0;
      }

      .avatar {
        width: 100px;
        border-radius: 100%;
        user-select: none;
        cursor: auto;
        margin: 40px 0 0 0;
      }

      .name {
        font-size: 20px;
        margin: 10px 0;
      }

      .text {
        font-size: 14px;
        color: var(--grey-color-1);
        user-select: none;
      }

      .email {
        width: 100%;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-top: 10px;
      }
    }

    .right-wrapper {
      margin-left: 150px;
      margin-top: 3vh;
      width: calc(100% - 250px - 150px);
      min-width: 300px;

      :deep(.n-timeline-item-timeline__line) {
        background-color: var(--grey-color-2);
      }

      .icon {
        width: 6px;
        height: 6px;
        position: relative;

        p {
          position: absolute;
          margin: 0;
          width: 130px;
          left: -140px;
          top: -2px;
          font-size: 12px;
          line-height: 12px;
          height: 12px;
          text-align: right;
        }

        .dot {
          width: 100%;
          height: 100%;
          border-radius: 100%;
          background-color: var(--blue-color-1);
        }

      }

      .card {
        width: 100%;
        height: 120px;
        color: var(--black-color-1);
        border: 1px solid var(--border-color-1);
        border-radius: var(--border-radius);
        padding: 15px;
        display: flex;
        flex-direction: column;

        .title {
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
        }

        .tags {
          display: flex;

          .tagItem {
            color: var(--grey-color-1);
          }
        }

        .info {
          font-size: 14px;
          color: var(--grey-color-1);
        }
      }
    }
  }

  .bottom {
    width: 100%;
    height: 10%;
    border: 1px solid;
  }

}

@media (max-width: 730px) {
  .artical-list {
    .top {
      flex-direction: column;

      .left-wrapper {
        min-width: 300px;
        width: 100%;
      }

      .right-wrapper {
        margin-left: 0;
        width: 100%;

        .icon {
          p {
            display: none;
          }
        }
      }
    }

    .bottom {
      min-width: 300px;
    }


  }
}
</style>
