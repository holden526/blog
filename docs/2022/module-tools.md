---
title: 十个常用工具库
date: 2022-03-19
info: 平时做项目经常用到的小工具库，可提高开发效率，分享一下
tags:
  - 工具
---

# 十个常用工具库

平时做项目经常用到的小工具库，可提高开发效率，分享一下

## 1. Moment.js

JavaScript 日期处理类库

### 1.1 安装

::: code-group

```sh [npm]
npm install moment --save
```

```sh [yarn]
yarn add moment
```

```sh [pnpm]
pnpm add moment
```

```sh [bun]
bun add moment
```

:::

### 1.2 使用

更多使用方法请看官网：[官网地址](http://momentjs.cn/)

```js
var moment = require('moment')

moment().format('MMMM Do YYYY, h:mm:ss a') // 三月 19日 2022, 3:52:08 下午
moment().format('dddd') // 星期六
moment().format('MMM Do YY') // 3月 19日 22
moment().format('YYYY [escaped] YYYY') // 2022 escaped 2022
moment().format() // 2022-03-19T15:52:08+08:00
```

## 2. dayjs

一个极简的处理时间和日期的 JavaScript 库，和 Moment.js 的 API 设计保持一样, 但体积仅有 2KB。

### 2.1 安装

::: code-group

```sh [npm]
npm install dayjs
```

```sh [yarn]
yarn add dayjs
```

```sh [pnpm]
pnpm add dayjs
```

```sh [bun]
bun add dayjs
```

:::

### 2.2 使用

更多使用方法请看官网：[官网地址](https://dayjs.fenxianglu.cn/)

```js
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015

dayjs().format() // 2020-09-08T13:42:32+08:00
dayjs().format('YYYY-MM-DD') // 2020-09-08
dayjs().format('YYYY-MM-DD HH:mm:ss') // 2020-09-08 13:47:12
dayjs(1318781876406).format('YYYY-MM-DD HH:mm:ss') // 2011-10-17 00:17:56
```

## 3. nanoid

生成 uuid

### 3.1 安装

::: code-group

```sh [npm]
npm install nanoid
```

```sh [yarn]
yarn add nanoid
```

```sh [pnpm]
pnpm add nanoid
```

```sh [bun]
bun add nanoid
```

:::

### 3.2 使用

```javascript
// 导入
import { nanoid } from 'nanoid'

let id1 = nanoid() //=> "V1StGXR8_Z5jdHi6B-myT"
//也可以指定生成字符串的长度
let id2 = nanoid(5)
```

## 4. animate.css

强大的跨平台的预设 css3 动画库，内置了很多典型的 css3 动画，兼容性好使用方便

### 4.1 安装

::: code-group

```sh [npm]
npm install animate.css --save
```

```sh [yarn]
yarn add animate.css
```

```sh [pnpm]
pnpm add animate.css
```

```sh [bun]
bun add animate.css
```

:::

### 4.2 使用

更多使用方法请看官网：[官网地址](https://animate.style/)

```javascript
// 引入
import 'animate.css'

// 使用方法
<h1 class="animate__animated animate__bounce">An animated element</h1>

// Vue使用方法
<transition-group
	appear
    name="animate__animated animate__bounce"
	enter-active-class="xxx"
	leave-active-class="xxx"
>
......
</transition-group>
```

## 5 animejs

一个轻量的 JavaScript 动画库， 拥有简单而强大的 API。 可对 CSS 属性、 SVG、 DOM 和 JavaScript 对象进行动画。

### 5.1 安装

::: code-group

```sh [npm]
npm install animejs
```

```sh [yarn]
yarn add animejs
```

```sh [pnpm]
pnpm add animejs
```

```sh [bun]
bun add animejs
```

:::

### 5.2 使用

更多使用方法请看官网：[官网地址](https://www.animejs.cn/)

```js
;<div class="ball" style="width: 50px; height: 50px; background: blue"></div>

import anime from 'animejs/lib/anime.es.js'

// 页面渲染完成之后执行
anime({
  targets: '.ball',
  translateX: 250,
  rotate: '1turn',
  backgroundColor: '#F00',
  duration: 800,
})
```

## 6. nprogress

请求进度条。这是一个类似 youtube、Medium 等网站上的小进度条插件。纳米级的进度条，涓涓细流动画告诉你的用户，一些事情正在发生！

### 6.1 安装

::: code-group

```sh [npm]
npm install --save nprogress
```

```sh [yarn]
yarn add nprogress
```

```sh [pnpm]
pnpm add nprogress
```

```sh [bun]
bun add nprogress
```

:::

### 6.2 使用

更多使用方法请看官网：[官网地址](https://madewith.cn/23)

```js
import nprogress from "nprogress"
import "nprogress/nprogress.css"
// 开始
nprogress.start()
// 结束
nprogress.done()
// 改样式
#nprogress .bar{
	background:xxx !important
}
```

## 7. qs

[qs](https://github.com/ljharb/qs)是一个流行的查询参数序列化和解析库。可以将一个普通的 object 序列化成一个查询字符串，或者反过来将一个查询字符串解析成一个 object，而且支持复杂的嵌套。

### 7.1 安装

::: code-group

```sh [npm]
npm install qs
```

```sh [yarn]
yarn add qs
```

```sh [pnpm]
pnpm add qs
```

```sh [bun]
bun add qs
```

:::

### 7.2 使用

[npm 库地址](https://www.npmjs.com/package/qs)

[中文网](https://storm4542.github.io/archives/7b89c88d.html)

```js
import qs from 'qs'

qs.parse('user=tom&age=22') // => { user: "tom", age: "22" }
qs.stringify({ user: 'tom', age: '22' }) // => user=tom&age=22
```

## 8. flv.js

哔哩哔哩开源的播放器

### 8.1 安装

::: code-group

```sh [npm]
npm install --save flv.js
```

```sh [yarn]
yarn add flv.js
```

```sh [pnpm]
pnpm add flv.js
```

```sh [bun]
bun add flv.js
```

:::

### 8.2 使用

[github 文档地址](https://github.com/bilibili/flv.js/blob/master/docs/api.md)

[npm 库地址](https://www.npmjs.com/package/flv.js)

```js
;<video autoplay controls width="100%" height="500" id="myVideo"></video>

import flvjs from 'flv.js'

// 页面渲染完成后执行
if (flvjs.isSupported()) {
  var myVideo = document.getElementById('myVideo')
  var flvPlayer = flvjs.createPlayer({
    type: 'flv',
    url: 'http://localhost:8080/test.flv', // 视频 url 地址
  })
  flvPlayer.attachMediaElement(myVideo)
  flvPlayer.load()
  flvPlayer.play()
}
```

## 9. uniq

数组去重

### 9.1 安装

::: code-group

```sh [npm]
npm install uniq
```

```sh [yarn]
yarn add uniq
```

```sh [pnpm]
pnpm add uniq
```

```sh [bun]
bun add uniq
```

:::

### 9.2 使用

[npm 库地址](https://www.npmjs.com/package/uniq)

```js
var arr = [1, 1, 2, 2, 3, 5]

require('uniq')(arr)
console.log(arr) // 1,2,3,5
```

## 10. element-resize-detector

监听元素大小变化，一般用于解决折叠侧边栏时 Echarts 无法 resize

### 10.1 安装

::: code-group

```sh [npm]
npm install element-resize-detector --save
```

```sh [yarn]
yarn add element-resize-detector
```

```sh [pnpm]
pnpm add element-resize-detector
```

```sh [bun]
bun add element-resize-detector
```

:::

### 10.2 使用

[npm 地址](https://www.npmjs.com/package/element-resize-detector)

[csdn 好文章地址](https://blog.csdn.net/ljy_1024/article/details/120185771)

```js
let elementResizeDetectorMaker = require('element-resize-detector')

//监听元素变化

let erd = elementResizeDetectorMaker()
let that = this
erd.listenTo(document.getElementById('bar'), function (element) {
  that.$nextTick(function () {
    //使echarts尺寸重置
    that.myEcharts.resize()
  })
})
```
