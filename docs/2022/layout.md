---
title: 前端常用的响应式布局方法
date: 2022-03-19
info: 响应式布局
tags:
  - 响应式
---

# 前端常用的响应式布局方法

## 前言

响应式布局可以为不同终端的用户提供更加舒适的界面和更好的用户体验，而且随着大屏幕移动设备的普及，用“大势所趋”来形容也不为过。

最近写的项目都有考虑响应式，接下来我来分享一下我用过的响应式处理方案，有错请多多指教！

## 1. 媒体查询

概念：为不同尺寸的屏幕设置不同的 CSS 样式

当屏幕符合时，会使用里面的样式，如果外部设置过，则会替换里面**相同**的样式，不同的样式会继承

@media 常用参数

|    属性名     |         作用         |
| :-----------: | :------------------: |
| width、height | 浏览器可视宽度、高度 |
| device-width  |    设备屏幕的宽度    |
| device-height |    设备屏幕的高度    |

### 1.1 用法一

```css
/* 屏幕小于 300 px */
@media screen and (max-width: 300px) {
  div {
    background-color: red;
  }
}

/* 屏幕大于 300 px */
@media screen and (min-width: 300px) {
  div {
    background-color: yellow;
  }
}

/* 屏幕小于 300px 大于 200px */
@media screen and (min-width: 200px) and (max-width: 300px) {
  div {
    background-color: blue;
  }
}
```

### 1.2 用法二

条件执行内联样式

```html
<style media="(min-device-width:200px) and (max-device-width:300px)">
  div {
    background-color: blue;
  }
</style>

<style media="(min-device-width:300px) and (max-device-width:400px)">
  div {
    background-color: yellow;
  }
</style>
```

### 1.3 用法三

条件引入外部样式表

```html
<link href="css/test1.css" rel="stylesheet"></link>
// 当浏览器宽度大于 200px 时引入 test2.css
<link href="css/test2.css" rel="stylesheet" media="(min-width:200px)"></link>
```

>

## 2. flex 弹性布局

Flex 是 Flexible Box 的缩写，意为”弹性布局”，用来为盒状模型提供最大的灵活性。任何一个容器都可以指定为 Flex 布局。

注意：Webkit 内核的浏览器，必须加上-webkit 前缀。（Chrome、Safari、etc）

### 1.1 交叉轴与主轴

采用 Flex 布局的元素，称为 Flex 容器（flex container），简称”容器”。它的所有子元素自动成为容器成员，称为 Flex 项目（flex item），简称”项目”。

容器默认存在两根轴：水平的主轴（main axis）和垂直的交叉轴（cross axis）

根据项目排列方式判定主轴与交叉轴，例如项目水平排列，则 x 轴为主轴，y 轴为交叉轴。

单个项目占据的主轴空间叫做 main size，占据的交叉轴空间叫做 cross size。

![layout](../img/2022/layout/layout1.png)

### 1.2 容器属性

详细讲解可以看这里：[菜鸟教程 Flex](https://www.runoob.com/w3cnote/flex-grammar.html)

|     属性名      |                                     作用                                     |                                 可选值                                  |
| :-------------: | :--------------------------------------------------------------------------: | :---------------------------------------------------------------------: |
| flex-direction  |                      决定主轴的方向（即项目的排列方向）                      |               row / row-reverse / column / column-reverse               |
|    flex-wrap    |                          决定是否开启换行，如何换行                          |                      nowrap / wrap / wrap-reverse                       |
|    flex-flow    |         flex-direction 和 flex-wrap 的简写形式，默认值为 row nowrap          |                   flex-direction 的值、flex-wrap 的值                   |
| justify-content |                         定义了项目在主轴上的对齐方式                         |      flex-start / flex-end / center / space-between / space-around      |
|   align-items   |                          定义项目在交叉轴上如何对齐                          |           flex-start / flex-end / center / baseline / stretch           |
|  align-content  | 定义多根轴线的对齐方式（相对于把整个容器看成整体）。只有一根轴线时，不起作用 | flex-start / flex-end / center / space-between / space-around / stretch |

### 1.3 项目属性

|   属性名    |                                        作用                                        |                           可选值                           |
| :---------: | :--------------------------------------------------------------------------------: | :--------------------------------------------------------: |
|    order    |                 定义项目的排列顺序。数值越小，排列越靠前，默认为 0                 |                          integer                           |
|  flex-grow  |             定义项目的放大比例，默认为 0，即如果存在剩余空间，也不放大             |                           number                           |
| flex-shrink |            定义了项目的缩小比例，默认为 1，即如果空间不足，该项目将缩小            |                           number                           |
| flex-basis  |            定义了在分配多余空间之前，项目占据的主轴空间 ，默认值为 auto            |                       length / auto                        |
|    flex     | flex-grow, flex-shrink 和 flex-basis 的简写，默认值为 0 1 auto ， 后两个属性可选。 |  none / [ 'flex-grow' 'flex-shrink'? \|\| 'flex-basis' ]   |
| align-self  |         允许单个项目有与其他项目不一样的对齐方式，可覆盖 align-items 属性          | auto / flex-start / flex-end / center / baseline / stretch |

flex 的特殊写法

|    属性     |      展开      |                           作用                           |
| :---------: | :------------: | :------------------------------------------------------: |
| flex:auto;  | flex:1 1 auto  | 有剩余空间自动放大，不够空间则自动缩小，相对于自适应大小 |
| flex:none;  | flex:0 0 auto  |           不放大不缩小，按 width 展示项目宽度            |
|  flex:0%;   |  flex:1 1 0%   |                        自适应大小                        |
| flex:100px; | flex:1 1 100px |                        自适应大小                        |
|   flex:1;   |  flex:1 1 0%   |                        自适应大小                        |

>

## 3. rem 布局

概念：指相对于根元素的字体大小的单位

区别：em（指相对于父级的字体大小的单位）

### 3.1 用法

```css
html {
  font-size: 10px;
}
div {
  font-size: 1rem;
}
```

### 3.2 动态适配

可以加监听动态修改

```js
// 其实就是根据设备宽度修改根元素 font-size 大小
// 假设设计稿是iphone6 16px
let baseDevice = 375 // iphone6 设备宽度
let baseFontSize = 16 // 设计稿 16px
let htmlWidth = document.documentElement.clientWidth || document.body.clientWidth
let htmlDom = document.documentElement
htmlDom.style.fontSize = (htmlWidth / baseDevice) * 16 + 'px'
```

>

## 4. 自适应布局

### 4.1 不同的设备使用不同的页面

```
(function(){
 if(window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)) {
		console.log('移动端')
		window.location.href = "phone.html"
	}else{
		console.log('PC端')
		window.location.href = "pc.html"
	}
})()
```

### 4.2 局部伸缩

例子：两端宽度不变，中间宽度随浏览器宽度改变

![layout](../img/2022/layout/layout2.gif)

```html
<style>
  #father {
    display: flex;
    text-align: center;
  }
  #father div:nth-child(1) {
    flex: 0 0 20px;
    background-color: yellow;
  }
  #father div:nth-child(2) {
    flex: 1 1 auto;
    background-color: blue;
  }
  #father div:nth-child(3) {
    flex: 0 0 20px;
    background-color: red;
  }
</style>
<body>
  <div id="father">
    <div>1</div>
    <div>2</div>
    <div>3</div>
  </div>
</body>
```

>

## 5. 百分比布局

使用百分比作为单位进行布局，可以很好的自适应全部设备，百分比参考的是父级元素的宽度，无父元素则相对于浏览器窗口的宽度。（缺点是计算困难）

|              子元素              |                  父元素                   |
| :------------------------------: | :---------------------------------------: |
|              width               |             基于父级的 width              |
|              height              |             基于父级的 height             |
| margin（top,right,bottom,left）  |             基于父级的 width              |
| padding（top,right,bottom,left） |             基于父级的 width              |
|      left,top,right,bottom       | 基于父元素的 width，height，width，height |
|            font-size             |         基于继承得到的 font-size          |
|           line-height            |         基于当前字体的 font-size          |
|       transform(left, top)       |           基于自身的 left， top           |

>

## 6. grid 布局

与 flex 类似，但是功能更强大，暂无实例，可以取康康好的文章

[阮一锋的 grid 讲解](https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)
