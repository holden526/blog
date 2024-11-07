import DefaultTheme from 'vitepress/theme'
import busuanzi from 'busuanzi.pure.js'
import { inBrowser } from 'vitepress'
import { defineComponent, h, inject } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { setup } from '@css-render/vue3-ssr'
import { useRoute } from 'vitepress'
import './styles/global.css'
import 'viewerjs/dist/viewer.min.css'
import imageViewer from 'vitepress-plugin-image-viewer'
import vImageViewer from 'vitepress-plugin-image-viewer/lib/vImageViewer.vue'
import ArticleHeader from '../components/ArticleHeader.vue'
import 'virtual:group-icons.css'
const { Layout } = DefaultTheme

const CssRenderStyle = defineComponent({
  setup() {
    const collect = inject<() => string>('css-render-collect')
    return {
      style: collect ? collect() : '',
    }
  },
  render() {
    return h('css-render-style', {
      innerHTML: this.style,
    })
  },
})

const VitepressPath = defineComponent({
  setup() {
    const route = useRoute()
    return () => {
      return h('vitepress-path', null, [route.path])
    }
  },
})

const NaiveUIProvider = defineComponent({
  render() {
    return h(
      NConfigProvider,
      { abstract: true, inlineThemeDisabled: true },
      {
        default: () => [
          h(Layout, null, { default: this.$slots.default?.() }),
          (import.meta as any).env.SSR ? [h(CssRenderStyle), h(VitepressPath)] : null,
        ],
      }
    )
  },
})

export default {
  extends: DefaultTheme,
  Layout: NaiveUIProvider,
  setup() {
    const route = useRoute()
    imageViewer(route)
  },
  enhanceApp: ({ app, router }) => {
    app.component('vImageViewer', vImageViewer)
    app.component('ArticleHeader', ArticleHeader)
    if ((import.meta as any).env.SSR) {
      const { collect } = setup(app)
      app.provide('css-render-collect', collect)
    }
    // 统计
    if (inBrowser) {
      router.onAfterRouteChanged = () => {
        busuanzi.fetch()
      }
    }
  },
}
