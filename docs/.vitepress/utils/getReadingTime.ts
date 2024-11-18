export function getWords(content: string): RegExpMatchArray | null {
  // 仅匹配英文单词，忽略标点和纯数字
  return content.match(/\b[a-zA-Z]+(?:['-]?[a-zA-Z]+)?\b/gu)
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

export function getReadingTime(content: string, cnWordPerMinute = 350, enWordPerMinute = 160) {
  const trimmedContent = content.trim()
  const enWord = getEnWordCount(trimmedContent)
  const cnWord = getCnWordCount(trimmedContent)

  const totalWords = enWord + cnWord
  const words = totalWords >= 1000 ? `${Math.round(totalWords / 100) / 10}k` : totalWords

  const readingTime = cnWord / cnWordPerMinute + enWord / enWordPerMinute
  const readTime = Math.ceil(readingTime)

  return {
    readTime,
    words,
  }
}
