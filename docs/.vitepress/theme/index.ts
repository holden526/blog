import DefaultTheme from 'vitepress/theme'
import { generate } from '@ant-design/colors'
import { defineComponent, h, inject, ref } from 'vue'
import {
  NConfigProvider,
  NMessageProvider,
  darkTheme,
  type GlobalTheme,
  type GlobalThemeOverrides,
} from 'naive-ui'
import { setup } from '@css-render/vue3-ssr'
import { useRoute } from 'vitepress'
import imageViewer from 'vitepress-plugin-image-viewer'
import vImageViewer from 'vitepress-plugin-image-viewer/lib/vImageViewer.vue'
import ArticleHeader from '../components/ArticleHeader.vue'
import MyLayout from './MyLayout.vue'
import './styles/global.css'
import 'viewerjs/dist/viewer.min.css'
import 'virtual:group-icons.css'

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
  setup(props, { slots }) {
    return () =>
      h(NMessageProvider, null, {
        default: () =>
          h(
            NConfigProvider,
            {
              abstract: true,
              inlineThemeDisabled: true,
              themeOverrides: themeOverrides.value,
              theme: theme.value,
            },
            {
              default: () => [
                h(MyLayout, null, { default: slots.default?.() }),
                (import.meta as any).env.SSR ? [h(CssRenderStyle), h(VitepressPath)] : null,
              ],
            }
          ),
      })
  },
})

// 主题切换
const theme = ref<GlobalTheme | null>(null)
const primaryColor = ref('#2080f0')
const themeOverrides = ref<GlobalThemeOverrides>({})
const generateColors = ref<string[]>([])
export const toggleTheme = (isDark: boolean) => {
  theme.value = isDark ? darkTheme : null
  primaryColor.value = isDark ? '#7B68EE' : '#2080f0'
  setThemeOverrides()
}

export const setThemeOverrides = () => {
  generateColors.value = theme.value
    ? generate(primaryColor.value, {
        theme: 'dark',
        backgroundColor: '#1B1B1F',
      })
    : generate(primaryColor.value)

  const commonColors = {
    primaryColor: generateColors.value[5],
    primaryColorHover: generateColors.value[4],
    primaryColorPressed: generateColors.value[5],
    primaryColorSuppl: generateColors.value[6],
  }

  themeOverrides.value = {
    common: commonColors,
  }
}

export default {
  extends: DefaultTheme,
  Layout: NaiveUIProvider,
  setup() {
    const route = useRoute()
    // 图片放大
    imageViewer(route)
  },
  enhanceApp: ({ app }) => {
    // 全局组件
    app.component('vImageViewer', vImageViewer)
    app.component('ArticleHeader', ArticleHeader)
    // css-render
    if ((import.meta as any).env.SSR) {
      const { collect } = setup(app)
      app.provide('css-render-collect', collect)
    }
  },
}
