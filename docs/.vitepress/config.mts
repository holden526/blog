import { defineConfig } from 'vitepress'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'
import { generateSidebar } from 'vitepress-sidebar'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { HeaderPlugin } from './plugins/headerPlugin'
import { FooterPlugin } from './plugins/footerPlugin'
import viteImagemin from 'vite-plugin-imagemin'
import viteCompression from 'vite-plugin-compression'
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
  return result.map((year) => ({
    ...year,
    items: year.items.reverse(),
  }))
}

export default defineConfig({
  title: '山不让尘，川不辞盈',
  description: '快不快乐有天总过去',
  lang: 'zh-CN',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  vite: {
    server: {
      host: '0.0.0.0',
    },
    plugins: [
      pagefindPlugin({
        btnPlaceholder: '搜索',
        placeholder: '搜索文档',
        emptyText: '空空如也',
        heading: '共: {{searchResult}} 条结果',
        customSearchQuery(input) {
          return input
            .replace(/[\u4E00-\u9FA5]/g, ' $& ')
            .replace(/\s+/g, ' ')
            .trim()
        },
      }),
      groupIconVitePlugin(),
      HeaderPlugin(),
      FooterPlugin(),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 7,
        },
        mozjpeg: {
          quality: 70,
        },
        pngquant: {
          quality: [0.65, 0.8],
          speed: 4,
        },
        svgo: {
          plugins: [{ name: 'removeViewBox' }, { name: 'removeEmptyAttrs', active: false }],
        },
        webp: {
          quality: 75,
        },
      }),
    ],
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
    nav: [
      { text: '主页', link: '/' },
      { text: '闲聊', link: '/pages/comment' },
      { text: '关于', link: '/pages/about' },
      {
        text: '推荐',
        items: [
          {
            items: [
              { text: '实用网站', link: '/pages/recommendation/webPage' },
              { text: '工具网站', link: '/pages/recommendation/webTools' },
            ],
          },
        ],
      },
      {
        text: '工具',
        items: [
          {
            items: [
              { text: 'Excel工具', link: '/pages/tools/excelTools' },
              { text: '图片工具', link: '/pages/tools/picTools' },
            ],
          },
        ],
      },
    ],
    sidebar: autoSidebar(),
    socialLinks: [
      { icon: 'github', link: 'https://github.com/holden526' },
      {
        icon: {
          svg: `
            <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 32 32">
              <g clip-path="circle(50%)">
                <image width="32" height="32" x="0" y="0" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAEyUExURfxVMfx0V/2lkv3Et/7Rx/7Ow/25qvySe/xePPyDaf7b0/////729f2unPxbOPxaN/2+sP7+/v7i3PxlRfxdO/7Xzv7n4v2wn/3Asv7t6v28rvxWM/3OxP7r5/yIb/xXNP2ZhP718/7Pxf2kkP7h2/xkQ/xvUf7r5vyOdvxmRf749/708fxpSvxfPfxwUv2yov2diP7y7/7v7PxZNvx/ZP21pfyHbf2/sfxnR/7OxP79/f7Syf77+/3Lv/22pvx5XP2rmvxhQP77+vxjQvxsTfyJcfxWMv7WzvxhP/yAZf708vxmRv7z8P2bhvxiQPxYNf3Dtv729PyEav76+v7o4/7Z0f7Uy/7g2v759/7v6/x+Y/2woP7z8f7u6v2qmf2qmP3Ctv7Mwf27rf2hjfx6XvxXM5v88O4AAAABYktHRAsf18TAAAAAB3RJTUUH6AsPBS4hWNXJkQAAAQBJREFUOMtjYBh0gJGJmYWVjZ0DhzQnFzcE8PDyYZHmFxDkhgMhYQx5EVGQhJiAuIQkiCGFLi8tAxSVlQMx5RUUubmV0BUoA+VVVKEcNXVBDTR5TS1ubm0dOFdXD90AfaABBnj8L2/IzW1kjEeBCdAAU3whyARUYIZPgTlQgQU+BZbc3FbS+BRYc3Pb4JNnsAVaIYJPgR1QgT0+BexABQ74FDg6cXMbOiMJuLi6oaoQABrh7gHnenpxi6Mq8PYBxbavH4jtbxJgxc0diGZJUDAomQiGhIaFR4DTVAi6MzwjuZGBURSGQz2iY+DSsXG62PzCHxSfoGSdmJScksowmAAAr2Ab+wezZ1oAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjQtMTEtMTVUMDU6NDY6MzMrMDA6MDAAyPURAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDI0LTExLTE1VDA1OjQ2OjMzKzAwOjAwcZVNrQAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyNC0xMS0xNVQwNTo0NjozMyswMDowMCaAbHIAAAAASUVORK5C"/>
              </g>
            </svg>`,
        },
        link: 'https://blog.csdn.net/DDDHL_',
      },
      {
        icon: {
          svg: `
          <svg height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fill-rule="evenodd"><circle cx="16" cy="16" fill="#c71d23" r="16"/>
              <path d="m24.0987698 14.2225144h-9.0863697c-.4362899.000207-.7900048.3538292-.790326.7901191l-.0005173 1.9752185c-.0003277.4363707.353328.7902117.7896987.790326.0000712 0 .0001424 0 .0002135-.0002135l5.5317648-.0000461c.4363708-.0000102.7901221.3537352.7901257.790106 0 .0000022 0 .0000044-.0000066.0000066v.1975077.1975318c0 1.3091122-1.0612451 2.3703573-2.3703573 2.3703573h-7.5067195c-.4363081-.0000218-.790009-.353713-.7900429-.7900211l-.0002069-7.5059917c-.0001014-1.3091122 1.0611145-2.3703865 2.3702267-2.3704226.0000217 0 .0000435 0 .0000653.0000653h11.0602463c.4361793-.0004902.7898484-.35394.7906091-.79011894l.0012251-1.97521881c.0007606-.43637034-.3527683-.79033806-.7891389-.79060871-.0001634-.0000001-.0003268-.00000015-.0004901.00048976h-11.0617654c-3.27278051 0-5.92589329 2.65311278-5.92589329 5.9258933v11.0612755c0 .4363707.35374837.7901191.7901191.7901191h11.65447149c2.9454379 0 5.3331872-2.3877493 5.3331872-5.3331872v-4.5430682c0-.4363707-.3537484-.7901191-.7901191-.7901191z" fill="#fff"/>
            </g>
          </svg>`,
        },
        link: 'https://gitee.com/holden526',
      },
    ],
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
