import { Plugin } from 'vite'
import { getReadingTime } from '../utils/getReadingTime'
import { exec } from 'child_process'
import util from 'util'
const execAsync = util.promisify(exec)

export function HeaderPlugin(): Plugin {
  return {
    name: 'header-plugin',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.match(/\.md\b/)) return null

      const cleanContent = cleanMarkdownContent(code)

      // 异步获取文件的最近更新时间
      const lastUpdated = await getLastUpdatedTime(id)

      // 获取阅读时间和字数
      const { readTime, words } = getReadingTime(cleanContent)

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
async function getLastUpdatedTime(filePath: string): Promise<string> {
  try {
    // 执行 git log 命令获取文件的最后提交日期
    const { stdout } = await execAsync(`git log -1 --format=%cd "${filePath}"`)
    return new Date(stdout.trim()).toLocaleString()
  } catch (err) {
    console.error(`Error getting last updated time for file ${filePath}:`, err)
    return 'Unknown'
  }
}

// 插入目标字符串到第一个一级标题后
function insertReadingTimeAndWords(target: string, source: string) {
  const headerRegex = /(^#\s.+$)/m
  return source.replace(headerRegex, `$1\n\n${target}`)
}

// 去掉 Frontmatter
function cleanMarkdownContent(content: string): string {
  return content
    .replace(/^---[\s\S]+?---(\n+)?/g, '')
    .trim()
    .replace(/\n{3,}/g, '\n\n')
}
