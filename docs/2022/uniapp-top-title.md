---
title: Uniapp 小程序自定义顶部标题
date: 2022-4-8
sidebar: auto
categories:
  - WeChat
  - Uniapp
tags:
  - WeChat
  - 框架
---

## 前言

小程序自带的顶部不太好康，而且能改的只要颜色和文字。很多时候设计图都是需要自定义顶部的。比如放个**搜索框** 或者 **标题** 或者 **可切换的 tabs** 等等 。分享一下我之前的做法。

<hr />

## 一、获取胶囊的位置信息 API

**wx.getMenuButtonBoundingClientRect()**

> 基础库 2.1.0 开始支持，低版本需做[兼容处理](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html)。

> **小程序插件**：支持，需要小程序基础库版本不低于 [2.15.0](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html)
>
> **微信 Windows 版**：支持
>
> **微信 Mac 版**：支持

获取菜单按钮（右上角胶囊按钮）的布局位置信息。坐标信息以屏幕左上角为原点。

### 1.返回值

**Object**

返回菜单按钮的布局位置信息

| 属性   | 类型   | 说明                 |
| ------ | ------ | -------------------- |
| width  | number | 宽度，单位：px       |
| height | number | 高度，单位：px       |
| top    | number | 上边界坐标，单位：px |
| right  | number | 右边界坐标，单位：px |
| bottom | number | 下边界坐标，单位：px |
| left   | number | 左边界坐标，单位：px |

## 二、演示

标题型

![在这里插入图片描述](https://img-blog.csdnimg.cn/0bfc3644851240909e3efe3cc0162c6f.png)

### 1.关闭原生的顶部栏

==/pages.json==

```js
"pages": [{
			"path": "pages/index/index",
			"style": {
				"navigationStyle": "custom",
				"app-plus": {
					"titleView": false
				}
			}
		},
        ...
 }]
```

### 2.页面加载时获取胶囊高度并设置标题高度

==index.vue==

```html
<template>
  <view class="bg">
    <view class="title" :style="'padding-top:' + titleHeight + 'px'"
      >新华的湖</view
    >
  </view>
</template>
```

```js
<script>
export default {
	data() {
		return {
			titleHeight: 0
	},
	onLoad() {
		// #ifdef MP-WEIXIN
		this.getHeight();
		// #endif
	},
	methods: {
		// 获取微信右上角胶囊高度
		getHeight() {
			let res = wx.getMenuButtonBoundingClientRect();
			this.titleHeight = res.top;
		}
	}
};
</script>

<style lang="scss" scoped>
.title {
	font-weight: 600;
	line-height: 30px;
	margin-left: 40rpx;
	font-size: 17px;
}
</style>
```

## 三、举例

不想翻以前的代码，拿图说明一下，做法与上面相似滴。聪明的你肯定轻松做出来啦~

### 1.tabs

uview 有现成可以用的 tabs 标签，可以根据当前索引来实现切换效果

下面是我去年用 js 写的效果，点击规则后会下拉到规则那里，点击公告回到最顶部 （第一张图没截好，下划线是在公告那的）

|                                          打开主页                                          |                                         切换到规则                                         |
| :----------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: |
| <img src="https://img-blog.csdnimg.cn/9e564e61e638461ca134056ae3d5e31f.png"   width="45%"> | <img src="https://img-blog.csdnimg.cn/f850a8ae052e4b21bb058860e4418818.png"   width="45%"> |

### 2.设置背景图

去掉顶部栏后，可以把图片设置到全屏，十分美观，在 app 里面可以很实用。小程序的话，如果有背景图上有文字，尽量考虑与胶囊按钮对齐，这样看起来正常点

|                                         打开主页                                          |                                         切换到规则                                         |
| :---------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: |
| <img src="https://img-blog.csdnimg.cn/00ff6b609de34c56a0b717d8dddcf63d.png"  width="45%"> | <img src="https://img-blog.csdnimg.cn/05b1b1a43de24079b934f3ea4ddbe2a3.png"   width="45%"> |
