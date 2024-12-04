<script setup lang="ts">
const props = defineProps<{
  data: { imgUrl: string; text: string; link: string }[]
}>()

const clickCard = (item: string) => {
  if (item) {
    window.open(item, '_blank')
  }
}
</script>

<template>
  <div class="card">
    <div v-for="item in props.data" class="card-item" @click="clickCard(item.link)">
      <img :src="item.imgUrl" class="card-img" />
      <div class="text">
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
  gap: 10px;
  .card-item {
    width: calc(50% - 5px);
    display: flex;
    height: 60px;
    align-items: center;
    box-shadow: 1px 1px 5px 3px var(--border-color-1);
    border-radius: 10px;
    cursor: pointer;
    .text {
      width: calc(100% - 50px);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .card-img {
      width: 40px;
      margin: 10px;
    }
  }

  // 当屏幕宽度小于 768px 时，卡片宽度调整为 100%
  @media (max-width: 768px) {
    .card-item {
      width: 100%;
    }
  }
}
</style>
