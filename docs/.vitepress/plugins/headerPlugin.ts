import { Plugin } from 'vite'
import { getReadingTime } from '../utils/getReadingTime'
import fs from 'fs'

export function HeaderPlugin(): Plugin {
  return {
    name: 'header-plugin',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.match(/\.md\b/)) return null

      // 获取文件的最近更新时间
      const lastUpdated = getLastUpdatedTime(id)

      // 获取阅读时间和字数
      const { readTime, words } = getReadingTime(code)

      // 插入组件到文章中
      code = insertReadingTimeAndWords(
        `<ArticleHeader readTime="${readTime}" words="${words}" lastUpdated="${lastUpdated}" />`,
        code
      )
      return code
    },
  }
}

// 获取文件的最近更新时间
function getLastUpdatedTime(filePath: string): string {
  const stats = fs.statSync(filePath)
  const lastModifiedTime = stats.mtime
  return lastModifiedTime.toLocaleString()
}

// 插入目标字符串到第一个一级标题后
function insertReadingTimeAndWords(target: string, source: string) {
  const headerRegex = /(^#\s.+$)/m
  return source.replace(headerRegex, `$1\n\n${target}`)
}
