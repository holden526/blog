import { nextTick, provide } from 'vue'
// 判断是否能使用 startViewTransition
const enableTransitions = () => {
  return (
    'startViewTransition' in document &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  )
}
// 切换动画
export const toggleDark = (isDark) => {
  provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
    //如果不支持动效直接切换
    if (!enableTransitions()) {
      isDark.value = !isDark.value
      return
    }
    document.documentElement.style.setProperty('--darkX', x + 'px')
    document.documentElement.style.setProperty('--darkY', y + 'px')
    await document.startViewTransition(async () => {
      isDark.value = !isDark.value
      await nextTick()
    }).ready
  })
}
