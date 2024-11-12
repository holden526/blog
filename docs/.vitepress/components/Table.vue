<script setup lang="ts">
import { h, computed } from 'vue'
const props = defineProps<{
  columns: { title: string; key: string }[]
  data: { name: string; url: string; remark: string }[]
}>()

const renderColumn = computed(() => {
  const columnWidth = `${100 / props.columns.length}%`
  return props.columns.map((column) => {
    return {
      title: column.title,
      key: column.key,
      width: columnWidth,
    }
  })
})

const getRenderType = (
  dataItem: {
    name: string
    url: string
    remark: string
  },
  key: string
) => {
  const renderFunctions: Record<string, string> = {
    url: `<a href=${dataItem.url} target="_blank">${dataItem.url}</a>`,
  }
  return renderFunctions[key] || dataItem[key]
}
</script>

<template>
  <div class="table">
    <table>
      <thead>
        <tr>
          <th v-for="headItem in renderColumn" :style="{ width: headItem.width }">
            {{ headItem.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="dataItem in data">
          <td v-for="key in Object.keys(dataItem)" v-html="getRenderType(dataItem, key)"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.table {
  width: 100%;
  th,
  td {
    text-align: center;
    vertical-align: center;
  }
}
</style>
