export function getWords(content: string): RegExpMatchArray | null {
  // 包含连字符单词和数字+字母组合
  return content.match(/(\b[a-zA-Z0-9]+(?:['’-]?[a-zA-Z0-9]+)*\b)|([a-zA-Z0-9]+)/gu)
}

export function getChinese(content: string): RegExpMatchArray | null {
  // 匹配中文字符
  return content.match(/[\u4E00-\u9FD5]/gu)
}

export function getEnWordCount(content: string): number {
  // 英文单词数量
  return getWords(content)?.length || 0
}

export function getCnWordCount(content: string): number {
  // 中文字符数量
  return getChinese(content)?.length || 0
}

export function getWordNumber(content: string): number {
  // 总字数统计
  const enWordCount = getEnWordCount(content)
  const cnWordCount = getCnWordCount(content)
  return enWordCount + cnWordCount
}

export function getReadingTime(
  content: string,
  cnWordPerMinute = 300, // 中文阅读速度为300字/分钟
  enWordPerMinute = 200 // 英文阅读速度为200词/分钟
) {
  const trimmedContent = content.trim()
  const enWord = getEnWordCount(trimmedContent)
  const cnWord = getCnWordCount(trimmedContent)

  // 优化字数显示逻辑
  const words = enWord + cnWord
  const formattedWords = words >= 1000 ? `${(words / 1000).toFixed(1)}k` : words.toString()

  // 精确计算阅读时间
  const readingTime = cnWord / cnWordPerMinute + enWord / enWordPerMinute
  const readTime = Math.ceil(readingTime) || 1 // 保证最小值为1分钟

  return {
    readTime,
    words: formattedWords,
  }
}
