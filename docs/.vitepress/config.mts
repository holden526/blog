import { defineConfig } from 'vitepress'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'
import { generateSidebar } from 'vitepress-sidebar'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { HeaderPlugin } from './plugins/headerPlugin'
import path from 'path'
const fileAndStyles: Record<string, string> = {}

const autoSidebar = () => {
  let result: any = generateSidebar({
    documentRootPath: '/docs',
    collapseDepth: 2,
    useTitleFromFrontmatter: true,
    sortMenusByFrontmatterDate: true,
    sortMenusOrderByDescending: true,
  })
  result.forEach((year) => {
    year.items.reverse()
  })
  return result
}

export default defineConfig({
  title: '山不让尘，川不辞盈',
  description: 'A VitePress Site',
  lang: 'zh-CN',
  vite: {
    plugins: [pagefindPlugin(), groupIconVitePlugin(), HeaderPlugin()],
    ssr: {
      noExternal: ['naive-ui', 'date-fns', 'vueuc'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          additionalData: `@use "@/docs/.vitepress/theme/styles/mixin" as *;`,
        },
      },
    },
  },
  postRender(context) {
    const styleRegex = /<css-render-style>((.|\s)+)<\/css-render-style>/
    const vitepressPathRegex = /<vitepress-path>(.+)<\/vitepress-path>/
    const style = styleRegex.exec(context.content)?.[1]
    const vitepressPath = vitepressPathRegex.exec(context.content)?.[1]
    if (vitepressPath && style) {
      fileAndStyles[vitepressPath] = style
    }
    context.content = context.content.replace(styleRegex, '')
    context.content = context.content.replace(vitepressPathRegex, '')
  },
  transformHtml(code, id) {
    const html = id.split('/').pop()
    if (!html) return
    const style = fileAndStyles[`/${html}`]
    if (style) {
      return code.replace(/<\/head>/, `${style}</head>`)
    }
  },
  themeConfig: {
    outline: [2, 6],
    outlineTitle: '文章目录',
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    nav: [{ text: '主页', link: '/' }],
    sidebar: autoSidebar(),
    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }],
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
    headers: {
      level: [1, 2, 3],
    },
    toc: {
      level: [1, 2, 3],
    },
  },
})
