<script setup>
import DefaultTheme from 'vitepress/theme'
import { toggleTheme } from './index'
import { watch, nextTick, onMounted, ref } from 'vue'
import { useRoute, useData, inBrowser } from 'vitepress'
import Giscus from '@giscus/vue'
import Loading from '../components/Loading.vue'
import { toggleDark } from '../plugins/themeChangeAni'
const { Layout } = DefaultTheme
const { isDark, page } = useData()
const route = useRoute()
const loading = ref(true)
const nowYear = new Date().getFullYear()
toggleDark(isDark)

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

// 加载访问统计
const loadVerCount = () => {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://events.vercount.one/js'
    script.async = true
    document.body.appendChild(script)
  }
}
loadVerCount()
</script>

<template>
  <Loading v-show="loading" />
  <Layout v-show="!loading">
    <template #layout-bottom>
      <div class="bottom">
        <div>
          本站总访问量
          <span id="busuanzi_value_site_pv">-</span> 次 本站总访客数
          <span id="busuanzi_value_site_uv">-</span> 人
        </div>
        <p>{{ `下辈子别选前端 © 2021-${nowYear} holden 本站已开源` }}</p>
      </div>
    </template>
    <template #doc-after>
      <div style="margin-top: 24px">
        <Giscus
          :key="page.filePath"
          repo="holden526/blog"
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
