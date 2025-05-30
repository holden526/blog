import { Plugin } from 'vite'

export function FooterPlugin(): Plugin {
  return {
    name: 'header-plugin',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.match(/\.md\b/)) return null

      // 插入组件到文章底部
      code += '<ArticleFooter />'
      return code
    },
  }
}
