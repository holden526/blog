---
title: el-table懒加载局部更新
date: 2022-04-13
info: 使用 ElementUI 中 el-table 的懒加载功能时实现局部数据更新的方案
tags:
  - Element
---

# el-table懒加载局部更新

分享一下我的做法，希望对你有帮助~

## 1. 我的问题

先说一下我的 table 表格

elementUi 的 table 懒加载，总共有四个层级，学院下有专业，专业下有年级，年级下有班级。每次展开层级会根据上一层父节点的 id 请求新的数据。最近发现更新子节点数据后，页面不更新。

![lazy](../img/2022/el-table-lazy/el-table-lazy1.png)

## 2. 我的解决方案

每次更改数据后，更新对应子节点就可以了。重新调用懒加载函数获取数据

### 2.1 在 data 声明一个 Map

因为懒加载的参数有点特殊，而我刚好可以用 id 来区分，所以用 map 来记录

```js
data() {
    return {
      maps: new Map()  // 用来记录每个层级懒加载函数的参数
    }
}
```

/>

### 2.2 在懒加载函数记录每次请求的参数

![lazy](../img/2022/el-table-lazy/el-table-lazy2.png)

`loadSomeData` 是我的懒加载函数

tree.id 是我用来请求子节点数据的参数

```js
this.maps.set(tree.id, { tree, treeNode, resolve })
```

/>

### 2.3 在更新子节点数据后重新调用懒加载函数

修改数据的函数里我能获得`id`，所以在请求完的回调里根据`id`取出对应层级所需的懒加载参数，直接调用即可重新获取数据更新。

```js
const { tree, treeNode, resolve } = this.maps.get(id)
this.loadSomeData(tree, treeNode, resolve)
```
