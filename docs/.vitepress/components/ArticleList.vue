<script setup lang="ts">
import { NTimeline, NTimelineItem, NIcon, NBackTop, NTag, NCard, NScrollbar } from 'naive-ui'
import { useRouter } from 'vitepress'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { ref, onMounted, computed } from 'vue'
import { EmailOutlined, UpdateOutlined, DiscountOutlined } from '@vicons/material'
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')
const commitsData = ref([])
const router = useRouter()
// @ts-ignore
import { data as posts } from '../utils/posts.data'

onMounted(async () => {
  try {
    const response = await fetch('/commits.json')
    if (response.ok) {
      commitsData.value = await response.json()
    }
  } catch (error) {
    console.warn('获取 commits 数据失败:', error)
    commitsData.value = []
  }
})

// 计算动态相对时间
const commitsWithDynamicTime = computed(() => {
  return commitsData.value.map((commit) => ({
    ...commit,
    dynamicRelativeDate: dayjs(commit.date).fromNow(),
  }))
})

const list = posts
  .filter((item) => !item.url.includes('/pages/'))
  .map((item) => ({
    ...item,
    unixDate: dayjs(item.frontmatter.date).unix(),
  }))
  .sort((a, b) => b.unixDate - a.unixDate)
  .map((item) => {
    const { unixDate, ...rest } = item
    return rest
  })
const jump = (path: string) => {
  router.go(path)
}
</script>

<template>
  <div class="artical-list">
    <section class="left-wrapper">
      <!-- 个人信息卡片 -->
      <div class="profile-card">
        <img class="avatar" src="/assets/avatar.jpg" alt="avatar" />
        <p class="name">holden</p>
        <p class="text">快不快乐有天总过去</p>
        <div class="email">
          <NIcon :size="23">
            <EmailOutlined />
          </NIcon>
          holden.lee@aliyun.com
        </div>
      </div>

      <!-- 最近更新列表 -->
      <div class="recent-updates">
        <div class="updates-header">
          <NIcon :size="18">
            <UpdateOutlined />
          </NIcon>
          <span>最近更新</span>
        </div>
        <n-scrollbar style="max-height: 300px">
          <div class="commit-list">
            <div
              v-for="commit in commitsWithDynamicTime.slice(0, 20)"
              :key="commit.hash"
              class="commit-item"
            >
              <div class="commit-message">{{ commit.message }}</div>
              <div class="commit-meta">
                <span class="commit-author">{{ commit.author }}</span>
                <span class="commit-date">{{ commit.dynamicRelativeDate }}</span>
              </div>
            </div>
          </div>
        </n-scrollbar>
      </div>
    </section>

    <section class="right-wrapper">
      <n-timeline size="large">
        <n-timeline-item v-for="item in list">
          <template #icon>
            <div class="icon">
              <p>{{ dayjs(item.frontmatter.date).format('YYYY-MM-DD') }}</p>
              <div class="dot"></div>
            </div>
          </template>
          <template #default>
            <div class="card" @click="jump(item.url)">
              <div class="title">{{ item.frontmatter.title }}</div>
              <div class="tags">
                <n-tag :bordered="false" type="info" v-for="tagItem in item.frontmatter.tags">
                  {{ tagItem }}
                  <template #icon>
                    <n-icon :size="16" :component="DiscountOutlined" />
                  </template>
                </n-tag>
              </div>
              <div class="info">{{ item.frontmatter.info ?? '无简介' }}</div>
              <div class="date">{{ dayjs(item.frontmatter.date).format('YYYY-MM-DD') }}</div>
            </div>
          </template>
        </n-timeline-item>
      </n-timeline>
    </section>
    <n-back-top :right="10" />
  </div>
</template>

<style scoped lang="scss">
.artical-list {
  width: 100%;
  height: 100%;
  color: var(--black-color-1);
  display: flex;

  .left-wrapper {
    position: sticky;
    top: 92px;
    margin-top: 3vh;
    width: 250px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .profile-card {
      border: 1px solid var(--border-color-1);
      height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-radius: var(--border-radius);
      padding: 20px 15px;

      p {
        margin: 0;
      }

      .avatar {
        width: 100px;
        border-radius: 100%;
        user-select: none;
        cursor: auto;
        margin: 20px 0 0 0;
      }

      .name {
        font-size: var(--font-size-md);
        margin: 10px 0;
      }

      .text {
        font-size: var(--font-size-base);
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

    .recent-updates {
      border: 1px solid var(--border-color-1);
      border-radius: var(--border-radius);
      padding: 15px;
      max-height: 400px;
      overflow: hidden;

      .updates-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--font-size-md);
        font-weight: 600;
        margin-bottom: 15px;
        color: var(--black-color-1);
        justify-content: flex-start;
      }

      .commit-list {
        .commit-item {
          padding: 10px 0;
          border-bottom: 1px solid var(--border-color-1);

          &:last-child {
            border-bottom: none;
          }

          .commit-message {
            font-size: var(--font-size-base);
            color: var(--black-color-1);
            line-height: 1.4;
            margin-bottom: 6px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .commit-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: var(--font-size-sm);
            color: var(--grey-color-1);

            .commit-author {
              font-weight: 500;
            }

            .commit-date {
              font-style: italic;
              margin-right: 1.5px;
            }
          }
        }
      }
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

    .card {
      cursor: pointer;
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
        font-size: var(--font-size-sm);
        line-height: var(--font-size-sm);
        height: var(--font-size-sm);
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
      min-height: 120px;
      color: var(--black-color-1);
      border: 1px solid var(--border-color-1);
      border-radius: var(--border-radius);
      padding: 15px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      .title {
        font-size: var(--font-size-lg);
        font-weight: 700;
        cursor: pointer;
      }

      .tags {
        width: 100%;
        display: flex;
        flex-wrap: wrap;

        .n-tag {
          margin-right: 10px;
        }
      }

      .info,
      .date {
        font-size: var(--font-size-base);
        color: var(--grey-color-1);
        margin-top: 5px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .date {
        display: none;
      }
    }
  }
}

@media (max-width: 730px) {
  .artical-list {
    flex-direction: column;

    .left-wrapper {
      width: 100%;
      position: static;
      flex-direction: row;
      gap: 15px;

      .profile-card {
        flex: 1;
        height: 200px;
        padding: 15px 10px;
        min-width: 0;

        .avatar {
          width: 60px;
          margin: 10px 0 0 0;
        }

        .name {
          margin: 8px 0;
        }

        .text {
          font-size: var(--font-size-base);
        }

        .email {
          font-size: var(--font-size-base);
          margin-top: 8px;
        }
      }

      .recent-updates {
        flex: 1;
        max-height: 200px;
        padding: 10px;
        min-width: 0;

        .updates-header {
          font-size: var(--font-size-base);
          margin-bottom: 10px;
        }

        .commit-list {
          .commit-item {
            padding: 6px 0;

            .commit-message {
              font-size: var(--font-size-base);
              -webkit-line-clamp: 1;
            }

            .commit-meta {
              font-size: var(--font-size-base);
            }
          }
        }
      }
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

    .card {
      .date {
        display: block !important;
      }

      .info {
        display: none !important;
      }
    }
  }

  @media (max-width: 480px) {
    .artical-list {
      .left-wrapper {
        flex-direction: column;
        gap: 10px;

        .profile-card,
        .recent-updates {
          width: 100%;
          min-width: 0;
        }
      }
    }
  }
}
</style>
