---
title: 五一长沙游玩攻略
date: 2025-04-25
info: 游玩景点，美食，住宿，交通等
tags:
  - travel
---

# 五一长沙游玩攻略

<script setup lang="ts">
import TimeLine from '../.vitepress/components/TimeLine.vue'
import PhotoGroup from '../.vitepress/components/PhotoGroup.vue'

// 湖南博物院时间线
const museumTimeline = [
  { title: '出门', time: '10:30', iconKey: 'walk' },
  {
    title: '梅溪湖西站',
    content: '2号线光达方向 => 迎宾路口站（25min）',
    time: '11:00',
    iconKey: 'subway',
    type: 'success',
  },
  {
    title: '迎宾路口站',
    content: '6号线谢家桥方向 => 湘雅医院站3号口出（4min）',
    time: '11:10',
    iconKey: 'subway',
    type: 'success',
  },
  { title: '步行700m', content: '湘雅医院站出发步行（10min）', time: '11:20', iconKey: 'walk' },
  {
    title: '湖南博物院',
    content: '开始参观（约40min）',
    time: '12:00',
    iconKey: 'emoticon',
    type: 'warning',
  },
  { title: '转点', content: '开始下一个行程', time: '12:10', iconKey: 'car', type: 'info' },
]

// 湖南大学时间线
const schoolTimeline = [
  { title: '湖南博物院出发', time: '12:30', iconKey: 'walk' },
   { title: '步行700m', content: '步行至湘雅医院站3号口（10min）', time: '12:40', iconKey: 'walk' },
  {
    title: '湘雅医院站',
    content: '6号线谢家桥方向 => 六沟珑站（6min）',
    time: '12:50',
    iconKey: 'subway',
    type: 'success',
  },
  {
    title: '六沟珑站',
    content: '4号线杜家坪方向 => 湖南大学站2号口（10min）',
    time: '13:00',
    iconKey: 'subway',
    type: 'success',
  },
  {
    title: '湖南大学',
    content: '开始参观（约2h）',
    time: '15:00',
    iconKey: 'emoticon',
    type: 'warning',
  },
  { title: '转点', content: '开始下一个行程', time: '15:00', iconKey: 'car', type: 'info' },
]

// 五一广场时间线
const wuYiTimeline = [
  { title: '湖南大学出发', time: '15:10', iconKey: 'walk' },
  {
    title: '湖南大学站',
    content: '4号线罐子岭方向 => 溁湾镇站（5min）',
    time: '15:15',
    iconKey: 'subway',
    type: 'success',
  },
  {
    title: '溁湾镇站',
    content: '2号线光达方向 => 五一广场站（5min）',
    time: '15:20',
    iconKey: 'subway',
    type: 'success',
  },
  {
    title: '五一广场6D口',
    content: '开始参观（不限时间）',
    time: '15:00',
    iconKey: 'emoticon',
    type: 'warning',
  },
  { title: '返程', content: '回酒店', time: '24:00', iconKey: 'car', type: 'info' },
]

// 长沙站时间线
const changShaTimeline = [
  { title: '出门', time: '9:00', iconKey: 'walk' },
  {
    title: '梅溪湖西站',
    content: '2号线光达方向 => 长沙火车站（27min）',
    time: '9:30',
    iconKey: 'subway',
    type: 'success',
  },
  { title: '转点', content: '开始下一行程', time: '9:30', iconKey: 'car', type: 'info' },
]

// 橘子洲时间线
const juZiZhouTimeline = [
  { title: '长沙火车站出发', time: '9:40', iconKey: 'walk' },
  {
    title: '长沙火车站',
    content: '2号线梅溪湖西方向 => 橘子洲·青莲站（10min）',
    time: '10:00',
    iconKey: 'subway',
    type: 'success',
  },
  {
    title: '橘子洲',
    content: '开始参观（约2h）',
    time: '12:00',
    iconKey: 'emoticon',
    type: 'warning',
  },
  { title: '转点', content: '开始下一行程', time: '12:00', iconKey: 'car', type: 'info' },
]

// 湖南广播电视台时间线
const huNanTimeline = [
  { title: '橘子洲·青莲站出发', time: '12:00', iconKey: 'walk' },
  {
    title: '橘子洲·青莲站',
    content: '2号线光达方向 => 万家丽广场（15min）',
    time: '12:15',
    iconKey: 'subway',
    type: 'success',
  },
  {
    title: '万家丽广场',
    content: '吃饭逛街（1h30min）',
    time: '13:30',
    iconKey: 'food',
    type: 'info',
  },
   {
    title: '万家丽广场',
    content: '5号线水渡河方向 => 马栏山站3号口（10min）',
    time: '13:40',
    iconKey: 'subway',
    type: 'success',
  },
  { 
    title: '马栏山站3号口步行900m',
    content:'步行至湖南广播电视台（10min）',
    time:'14:00',
    iconKey: 'walk'
  },
  {
    title: '湖南广播电视台',
    content: '开始参观（约1h）',
    time: '15:00',
    iconKey: 'emoticon',
    type: 'warning',
  },
  { title: '转点', content: '开始下一行程', time: '15:00', iconKey: 'car', type: 'info' },
]

</script>

行程：5月2号凌晨两点到达长沙南站，5月4日早上9点半到达广州

## 一、住宿地点

住宿地址：梅溪湖风景区·岳麓区达美·寰宇中心loft

地铁站：梅溪湖西（距离270m）

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel1.jpg',
]" />

## 二、5月2日行程

### 1. 湖南博物院

提前7天去小程序预约 `基本陈列`（免费）

#### 1.1 参观内容

参观内容如下：
::: tip 一楼辛追夫人真身
辛追夫人真身是湖南博物院的镇馆之宝，出土于马王堆汉墓，是西汉时期长沙国丞相利苍的妻子。其尸体保存完好，历经2000多年仍柔软如初，被誉为“中国第一美女”
:::

::: tip 二楼湖南人历史馆
湖南人历史馆展示了湖南的历史、文化、民俗等，涵盖湖南的地理环境、历史变迁、民俗风情等。馆内陈列了豕型猪尊、大禾人面纹方鼎等国宝文物，全面呈现湖南从古至今的发展脉络
:::

::: tip 三楼马王堆陈列馆
马王堆汉墓出土了大量珍贵文物，包括丝绸、玉器、金器、铜器、瓷器等，展示了汉朝时期的服饰、生活和文化。其中，素纱禅衣、T型帛画、黄纱地印花敷彩直裾式丝绵袍等尤为珍贵，还设有永生之梦灯光秀
:::

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel2.jpg',
]" />

#### 1.2 时间线

<TimeLine :data="museumTimeline" />

### 2. 湖南大学

#### 2.1 参观内容

::: tip 东方红广场 - 毛泽东雕像
始建于1966年文化大革命期间。广场中央的毛主席雕像由新中国雕塑事业奠基人之一的张松鹤设计。2008年6月3日，奥运火炬长沙站的传递从这开始。此外，每年毛主席诞辰纪念日等重要节日，都会在此举行纪念活动。
:::

::: tip 湖南大学红楼
始建于1933年，由蔡泽奉教授主持设计，原为两层，1948年由柳士英教授主持加建一层。1945年9月15日，长衡地区侵华日军的受降仪式就在这里的205教室举行，湖南大学也因此成为唯一一所举行抗日战争胜利受降仪式的中国大学。红楼的北面拱券形大门入口处悬挂着毛泽东主席1950年8月手书的“湖南大学”匾额，成为游客拍照留影的热门打卡地。
:::

::: tip 爱晚亭
始建于清乾隆五十七年（1792年），由岳麓书院山长罗典创建，原名“红叶亭”，后根据杜牧诗句“停车坐爱枫林晚，霜叶红于二月花”之意更名为“爱晚亭”。中国四大名亭之一，它见证了毛泽东早期的革命活动，是其创作《沁园春·长沙》的灵感来源之一，亭内还立有毛泽东手书《沁园春·长沙》的碑刻。东西两面亭棂悬有红底鎏金“爱晚亭”匾额，由毛泽东主席手书。
:::

#### 2.2 时间线

<TimeLine :data="schoolTimeline" />

#### 2.3 参考照片

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel3.jpg',
  '/2025/changsha_travel/changsha_travel4.jpg',
  '/2025/changsha_travel/changsha_travel6.jpg',
  '/2025/changsha_travel/changsha_travel7.jpg',
  '/2025/changsha_travel/changsha_travel8.jpg',
  '/2025/changsha_travel/changsha_travel9.jpg',
  '/2025/changsha_travel/changsha_travel10.jpg',
  '/2025/changsha_travel/changsha_travel11.jpg',
  '/2025/changsha_travel/changsha_travel12.jpg',
  '/2025/changsha_travel/changsha_travel13.jpg',
  '/2025/changsha_travel/changsha_travel14.jpg',
  '/2025/changsha_travel/changsha_travel15.jpg',
  '/2025/changsha_travel/changsha_travel16.jpg',
  '/2025/changsha_travel/changsha_travel17.jpg',
  '/2025/changsha_travel/changsha_travel18.jpg',
]" />

### 3. 五一广场

#### 3.1 参观内容

::: tip 五一广场
五一广场位于长沙市市中心，是长沙市最大的城市广场。广场占地面积约10万平方米，是长沙市标志性建筑之一。广场内有毛泽东主席雕像、毛泽东主席铜像、毛泽东主席铜像广场、毛泽东主席铜像广场、毛泽东主席铜像广场等著名景点。广场内还有音乐喷泉、灯光秀等娱乐设施，是市民和游客休闲、娱乐的好去处。
:::

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel56.jpg',
]" />

#### 3.2 时间线

<TimeLine :data="wuYiTimeline" />

#### 3.3 打卡点

IFS国金购物中心1层 `GM 巨人像`

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel19.jpg',
  '/2025/changsha_travel/changsha_travel20.jpg',
  '/2025/changsha_travel/changsha_travel21.jpg',
  '/2025/changsha_travel/changsha_travel22.jpg',
]" />

五一广场 `春天百货KKV`

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel23.jpg',
  '/2025/changsha_travel/changsha_travel24.jpg',
  '/2025/changsha_travel/changsha_travel25.jpg',
  '/2025/changsha_travel/changsha_travel26.jpg',
  '/2025/changsha_travel/changsha_travel27.jpg',
  '/2025/changsha_travel/changsha_travel28.jpg',
]" />

国金中心东门通往LG1层楼梯 `长沙`

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel29.jpg',
  '/2025/changsha_travel/changsha_travel30.jpg',
  '/2025/changsha_travel/changsha_travel31.jpg',
  '/2025/changsha_travel/changsha_travel32.jpg',
]" />

IFS国金购物中心7楼 `Kaws`

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel33.jpg',
  '/2025/changsha_travel/changsha_travel34.jpg',
  '/2025/changsha_travel/changsha_travel35.jpg',
  '/2025/changsha_travel/changsha_travel36.jpg',
]" />

IFS `爱心大屏`

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel37.jpg',
  '/2025/changsha_travel/changsha_travel38.jpg',
  '/2025/changsha_travel/changsha_travel39.jpg',
  '/2025/changsha_travel/changsha_travel40.jpg',
]" />

`火宫殿`

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel41.jpg',
  '/2025/changsha_travel/changsha_travel42.jpg',
  '/2025/changsha_travel/changsha_travel43.jpg',
  '/2025/changsha_travel/changsha_travel44.jpg',
]" />

`超级文和友`

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel45.jpg',
  '/2025/changsha_travel/changsha_travel46.jpg',
  '/2025/changsha_travel/changsha_travel47.jpg',
]" />

`杜甫江阁`

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel48.jpg',
  '/2025/changsha_travel/changsha_travel49.jpg',
  '/2025/changsha_travel/changsha_travel50.jpg',
  '/2025/changsha_travel/changsha_travel51.jpg',
]" />

`坡子街派出所`

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel52.jpg',
  '/2025/changsha_travel/changsha_travel53.jpg',
  '/2025/changsha_travel/changsha_travel54.jpg',
  '/2025/changsha_travel/changsha_travel55.jpg',
]" />

## 三、5月3号行程

### 1. 长沙站

顺路提前寄存行李, 小程序：`存知己`

#### 1.1 时间线

<TimeLine :data="changShaTimeline" />

### 2. 橘子洲头

#### 2.1 参观内容

::: tip 橘子洲头
五A景区，橘子洲头位于湖南省长沙市岳麓区的湘江中心，是湘江下游众多冲积沙洲中面积最大的沙洲。这里西望岳麓山，东临长沙城，四面环水，形状宛如一艘巨轮停泊在湘江之中。橘子洲头景区整体开发陆地面积达91.64公顷，是长沙的标志性景点之一。这里不仅风景优美，四季各有特色，还承载着深厚的历史文化底蕴。
:::

#### 2.1 时间线

<TimeLine :data="juZiZhouTimeline" />

#### 2.2 参考照片

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel57.jpg',
  '/2025/changsha_travel/changsha_travel58.jpg',
  '/2025/changsha_travel/changsha_travel59.jpg',
  '/2025/changsha_travel/changsha_travel60.jpg',
  '/2025/changsha_travel/changsha_travel61.jpg',
  '/2025/changsha_travel/changsha_travel62.jpg',
  '/2025/changsha_travel/changsha_travel63.jpg',
  '/2025/changsha_travel/changsha_travel64.jpg',
  '/2025/changsha_travel/changsha_travel65.jpg',
]" />

### 3. 湖南广播电视台

#### 3.1 参观内容

::: tip 湖南广播电视台
湖南广播电视台（Hunan Broadcasting System，HBS）是湖南省重要的传媒机构，成立于2010年6月28日，由湖南广播影视集团改制而成。其前身可追溯至1949年11月开播的湖南人民广播电台和1960年开播的湖南电视台
:::

#### 3.2 打卡点

<PhotoGroup style="margin:20px 0;" :images="[
  '/2025/changsha_travel/changsha_travel66.jpg',
  '/2025/changsha_travel/changsha_travel67.jpg',
  '/2025/changsha_travel/changsha_travel68.jpg',
]" />

#### 3.2 时间线

<TimeLine :data="huNanTimeline" />

### 4. 五一广场

#### 4.1 参观内容

未定
