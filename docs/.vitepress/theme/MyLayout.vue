<script setup>
import DefaultTheme from 'vitepress/theme'
import { toggleTheme } from './index'
import { watch, nextTick, onMounted, ref } from 'vue'
import { useRoute, useData, inBrowser } from 'vitepress'
import Giscus from '@giscus/vue'
import Loading from '../components/Loading.vue'
const { Layout } = DefaultTheme
const { isDark, page } = useData()
const route = useRoute()
const loading = ref(true)
const nowYear = new Date().getFullYear()

onMounted(() => {
  hideSpecificSidebarItem()
  loading.value = false
})

watch(
  isDark,
  (dark) => {
    if (!inBrowser) return
    const iframe = document.querySelector('giscus-widget')?.shadowRoot?.querySelector('iframe')
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: dark ? 'dark' : 'light' } } },
      'https://giscus.app'
    )
    toggleTheme(dark)
  },
  { immediate: true }
)

watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath.includes('/pages/') || oldPath === '/') {
      nextTick(() => {
        hideSpecificSidebarItem()
      })
    }
  }
)

// 隐藏pages
function hideSpecificSidebarItem() {
  const sidebarItems = document.querySelectorAll('#VPSidebarNav > .group')
  sidebarItems.forEach((item, index) => {
    const textContent = item.querySelector('.text')?.textContent.trim()
    if (textContent === 'pages') {
      item.style.display = 'none'
      sidebarItems[index + 1].style.borderTop = 'none'
    }
  })
}
</script>

<template>
  <Loading v-show="loading" />
  <Layout v-show="!loading">
    <template #layout-bottom>
      <div class="bottom">
        <div>
          本站总访问量
          <span id="busuanzi_value_site_pv" class="font-bold">--</span> 次 本站访客数
          <span id="busuanzi_value_site_uv" class="font-bold">--</span> 人次
        </div>
        <p>{{ `前端狗都不如 © 2021-${nowYear} holden` }}</p>
      </div>
    </template>
    <template #doc-after>
      <div style="margin-top: 24px">
        <Giscus
          :key="page.filePath"
          repo="lee-holden/blog"
          repo-id="R_kgDONLMmMw"
          category="Announcements"
          category-id="DIC_kwDONLMmM84CkKCl"
          mapping="title"
          strict="0"
          reactions-enabled="1"
          emit-metadata="0"
          input-position="top"
          :theme="isDark ? 'dark' : 'light'"
          lang="zh-CN"
          crossorigin="anonymous"
        />
      </div>
    </template>
  </Layout>
</template>

<style lang="scss" scoped>
.bottom {
  margin-left: 5%;
  width: 90%;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--border-color-1);
  text-align: center;

  p {
    margin-top: 5px;
  }
}
</style>
