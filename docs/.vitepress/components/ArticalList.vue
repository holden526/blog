<script setup lang="ts">
import { NTimeline, NTimelineItem, NIcon } from 'naive-ui'
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
          <n-timeline-item content="啊" />
          <n-timeline-item type="success" title="成功" content="哪里成功" time="2018-04-03 20:46" />
          <n-timeline-item type="error" content="哪里错误" time="2018-04-03 20:46" />
          <n-timeline-item type="warning" title="警告" content="哪里警告" time="2018-04-03 20:46" />
          <n-timeline-item type="info" title="信息" content="是的" time="2018-04-03 20:46" />
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
  color: var(--black-color);

  .top {
    width: 100%;
    height: 90%;
    display: flex;

    .left-wrapper {
      margin-top: 3vh;
      border: 1px solid var(--border-color);
      width: 250px;
      height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;

      p {
        margin: 0;
      }

      .avatar {
        width: 100px;
        border-radius: 100%;
        margin-top: 40px;
        user-select: none;
      }

      .name {
        font-size: 20px;
        margin: 10px 0;
      }

      .text {
        font-size: 14px;
        color: var(--grey-color);
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
      margin-left: 2vw;
      margin-top: 3vh;
      border: 1px solid;
      width: calc(100% - 250px - 2vw);
      min-width: 300px;
    }
  }

  .bottom {
    width: 100%;
    height: 10%;
    border: 1px solid;
  }

}

@media (max-width: 650px) {
  .artical-list {
    flex-direction: column;

    .left-wrapper {
      min-width: 300px;
      width: 100%;
    }

    .right-wrapper {
      margin-left: 0;
      width: 100%;
    }
  }
}
</style>
