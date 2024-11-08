---
title: JavaScript DOM 常用知识点
date: 2021-10-11
info: JavaScript DOM 随笔，记录常用方法及示例
tags:
  - JavaScript
---

# JavaScript DOM 常用知识点

## 1. HTML DOM nodeType

nodeType 属性返回节点类型。属性是只读的。

（1）如果节点是一个元素节点，nodeType 属性返回 1。

（2）如果节点是属性节点, nodeType 属性返回 2。

（3）如果节点是一个文本节点，nodeType 属性返回 3。

（4）如果节点是一个注释节点，nodeType 属性返回 8。

## 2. 获取标签

### （1）获取 ol 下的所有 li

```html
<ul id="ul">
  <li></li>
  <li></li>
</ul>
<ol id="ol">
  <li></li>
  <li></li>
</ol>
```

给 li 标签加类名的话太多了，可以选择用这种方式，先获取父标签，通过父标签获取 li

```js
const ol = document.getElementById('ol')
const lis = ol.getElementByTagName('li')
```

获取到的是一个对象集合，可以用 for 循环遍历

```js
for (let i = 0; i < lis.length; i++) {
  console.log(lis[i])
}
```

### （2）找父节点 parentNode

寻找最近的父节点，找不到返回 NULL

```js
node.parentNode
```

### （3）找子节点

第一种：(寻找所有的子节点，包含元素节点、文本节点（换行是 text）等等)

```js
parentNode.childNodes
```

第二种：(寻找所有的子节点，只要元素节点)

```js
parentNode.children
```

### （4）获取第一个或最后一个子节点

包含所有的节点（text 等）

```js
parentNode.firstChild
parentNode.lastChild
```

只要元素节点（有兼容性问题，仅支持 IE9 以上）

```js
parentNode.firstElementChild
parentNode.lastElementChild
```

### （5）获取兄弟节点

包含所有节点

```js
// 下一个
node.nextSibling
// 上一个
node.previousSibling
```

只获取元素节点（有兼容性问题，仅支持 IE9 以上）

```js
// 下一个
node.nextElementSibling
// 上一个
node.previousElementSibling
```

封装获取兄弟节点函数，解决兼容性问题

```js
function getNextElementSibling(element) {
  var el = element
  while ((el = el.nextSibling)) {
    return el
  }
  return null
}
```

## 3. 节点操作

### （1）创建插入节点

```js
var li = document.createElement('li');
var ul = document.querySelector('ul');
// 插入末尾
ul.appendChild(li);
// 插入指定位置
ul.insertBefore(元素，插入位置)
```

### （2）删除节点

返回删除的节点

```js
node.removeChild(child)
```

### （3）克隆节点

返回克隆的节点（括号为空或者 false 为浅拷贝只复制标签，括号里为 true 为深拷贝）

```js
node.cloneNode()
```

### （4）document.write

直接将内容写入页面的内容流，文档流执行完毕后再使用，会导致页面全部重绘

## 4. innerText 和 innerHTML 区别

（1）innerHTML 能识别标签，innerText 不能识别标签

（2）innerText 与 innerHTML 都能获取内容，innerText 读取时会去除空格和换行

```html
<p>
  我是文字
  <span>999</span>
</p>
<script>
  var p = document.querySelector('p')
  console.log(p.innerText) // 我是文字 999
  console.log(p.innerHTML) // 我是文字 <span>999</span>
</script>
```

（3）innerHTML 相比 creatElement

innerHTML 创建多个元素效率更高（不要用拼接字符串，使用数组形式拼接）

## 5. h5 新增获取元素方式

缺点：兼容性差，仅 IE8 以上

返回的是对象集合

```js
querySelector('选择器')
querySelectorAll('选择器')
```

## 6. 注册事件

（1）传统方式注册

缺点：一个元素只能绑定一个事件，重复绑定会被覆盖

```js
node.onclick = function () {}
```

（2）事件侦听注册事件 addEventListener

优点：可重复绑定

缺点：IE9 以上才能使用

```js
// (事件类型字符串，事件函数，useCapture)
node.addEventListener('click', function () {})
```

## 7. DOM 事件流冒泡

（1）JS 代码中只能执行捕获或者冒泡其中的一个阶段。

（2）onclick 和 attachEvent 只能得到冒泡阶段。

（3）addEventListener(type, listener[, usecapture])第三个参数如果是 true，表示在事件捕获阶段调用事件处理程序；如果是 false（不写默认就是 false），表示在事件冒泡阶段调用事件处理程序。

（4）有些事件是没有冒泡的，比如 onblur、onfocus、onmouseenter、onmouseleave

## 8. 阻止行为

（1）阻止冒泡

```js
node.stopPropagation()
```

（2）阻止默认行为

```js
node.preventDefault()
```

## 9.禁用右键菜单和禁止鼠标选中

```js
// 禁止右键
document.addEventListener('contextmenu', function (e) {
  e.preventDefault()
})
// 禁止鼠标选中文字
document.addEventListener('selectstart', function (e) {
  e.preventDefault()
})
```

## 10. JS 执行机制

（1）先执行执行栈中的同步任务

（2）异步任务（回调函数）放入任务队列中

（3）一旦执行栈中的所有同步任务执行完毕，任务就会按次序读取任务队列的异步任务，于是被读取的异步任务进入执行栈，开始执行

## 11. location 常用方法

（1）获取 url

```js
location.href
```

（2）获取参数

```js
location.search
```

（3）跳转

```js
location.href = '地址'
location.assign('地址') // 重定向页面
location.replace('地址') // 替换当前页面，不记录历史，不能后退
location.reload() // 重新加载页面，参数true为强制刷新
```

## 12. 判断用户端设备

```js
if((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
  		/*window.location.href="你的手机版地址";*/
  		alert("mobile")
	}else{
  		/*window.location.href="你的电脑版地址";    */
  		alert("pc")
	}
}
```

## 13. 获取元素大小

（1）offset
offset 可以得到任意样式表中的样式值
offset 系列获得的数值是没有单位的
offsetWidth 包含 padding+border+width
offsetWidth 等属性是只读属性，只能获取不能赋值
所以，我们想要获取元素大小位置，用 offset 更合适，注意：如果有带定位的父亲，则以父亲为标准，否则以 body 为标准

（2）style
style 只能得到行内样式表中的样式值
style.width 获得的是带有单位的字符串
style.width 获得不包含 padding 和 border 的值
style.width 是可读写属性，可以获取也可以赋值
所以，我们想要给元素更改值，则需要用 style 改变

## 14. 获取 url 的参数

[MDN URLsearchParams](https://developer.mozilla.org/zh-CN/docs/Web/API/URLSearchParams)

```js
var paramsString = 'http://localhost:8080?name=lhd&age=19'
var searchParams = new URLSearchParams(paramsString.split('?')[1])
for (let p of searchParams) {
  console.log(p)
}
```
