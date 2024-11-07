import type { Plugin } from 'vite'
import { getReadingTime } from '../utils/getReadingTime'

export function ReadingTimePlugin(): Plugin {
  return {
    name: 'reading-time-plugin',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.match(/\.md\b/)) return null
      const { readTime, words } = getReadingTime(code)
      code = insertReadingTimeAndWords(
        `<ReadingTime readTime="${readTime}" words="${words}" />`,
        code
      )
      return code
    },
  }
}

// 插入阅读时间字数组件到第一个一级标题后
function insertReadingTimeAndWords(target: string, source: string) {
  const headerRegex = /(^#\s.+$)/m
  return source.replace(headerRegex, `$1\n\n${target}`)
}
