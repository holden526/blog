<script setup lang="ts">
import { MenuBookRound } from '@vicons/material'
import { NIcon } from 'naive-ui'
</script>

<template>
  <div class="header">
    <NIcon :size="20">
      <MenuBookRound />
    </NIcon>
    <div class="text">本文总阅读量 <span id="busuanzi_value_page_pv">-</span> 次</div>
  </div>
</template>

<style scoped lang="scss">
.header {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: var(--grey-color-1);
  margin-top: 20px;
  .text {
    margin-left: 2px;
  }
}
</style>
