---
title: 模块化
date: 2021-9-1
sidebar: auto
categories:
  - es6
tags:
  - '模块化'
---

## 1.浏览器端模块化规范

AMD

```javascript
Require.js(http://www.requirejs.cn)
```

CMD

```javascript
Sea.js(http://seajs.github.io/seajs/docs/)
```

## 2.服务器端模块化规范

node 中的 CommonJs

① 模块分为 单文件模块 和 包

② 模块成员导出：module.exports 和 exports

③ 模块成员导入：require( ' 模块标识符 ' )

## 3.大一统的模块化规范 - ES6 模块化

① 每个 js 文件都是应该独立的模块

② 导入模块成员使用 import 关键字

③ 暴露模块成员使用 export 关键字

### 3.1 Node.js 中通过 babel 体验 ES6 模块化

①

```javascript
npm install --save-dev @babel/core
```

② 导入模块成员使用 import 关键字

③ 暴露模块成员使用 export 关键字
