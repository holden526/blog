import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 确保输出目录存在
const outputDir = path.join(__dirname, '../docs/public')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const outputPath = path.join(outputDir, 'commits.json')

try {
  console.log('正在获取git commit记录...')

  // 获取最近20条commit记录
  const gitLog = execSync('git log --oneline --format="%H|%s|%an|%ad|%ar" --date=iso -20', {
    encoding: 'utf-8',
    cwd: process.cwd(),
  })

  const commits = gitLog
    .trim()
    .split('\n')
    .map((line) => {
      const [hash, message, author, date, relativeDate] = line.split('|')
      return {
        hash: hash.substring(0, 7), // 短hash
        message: message.trim(),
        author: author.trim(),
        date: new Date(date).toISOString(),
        relativeDate: relativeDate.trim(),
      }
    })
    .filter((commit) => commit.hash && commit.message)

  // 直接覆盖写入JSON文件
  fs.writeFileSync(outputPath, JSON.stringify(commits, null, 2), 'utf-8')

  console.log(`✅ 成功生成 ${commits.length} 条commit记录到 ${outputPath}`)
} catch (error) {
  console.warn('⚠️ 获取git commits失败:', error.message)

  // 生成默认数据并直接覆盖
  const defaultCommits = [
    {
      hash: 'abc1234',
      message: '更新博客内容',
      author: 'holden',
      date: new Date().toISOString(),
      relativeDate: '刚刚',
    },
  ]

  fs.writeFileSync(outputPath, JSON.stringify(defaultCommits, null, 2), 'utf-8')

  console.log('✅ 已生成默认commit数据')
}
