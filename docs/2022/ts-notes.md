---
title: TypeScript 基础知识点笔记
date: 2022-01-05
info: 日常学习随笔
tags:
  - TypeScript
---

# TypeScript 基础知识点笔记

待完善

## 1. 基础使用

### 1.1 安装 TypeScript

打开终端安装全局安装 TypeScript

::: code-group

```sh [npm]
npm install -g typescript
```

```sh [yarn]
yarn global add typescript
```

```sh [pnpm]
pnpm add -g typescript
```

```sh [bun]
bun add -g typescript
```

:::

### 1.2 TS 文件转换成 JS

TS 文件无法直接运行，使用以下终端命令将 TS 转成浏览器可识别的 JS 文件

xxx 代表文件名

```bash
tsc xxx.ts
```

运行后会在同目录下生成 JS 文件

```bash
node xxx.js        // 运行js文件测试一下
```

## 2. 优化编译

### 2.1 解决 TS 和 JS 冲突问题

由于编译后的 JS 文件 与 TS 文件有相同的变量名或者函数名。所以 TS 文件会提示函数重复定义等问题。

解决方案：关闭严格模式

（1）生成配置文件，

```bash
tsc --init
```

（2）打开生成的 tsconfig.json，修改 "strict" 值为 false 或者 注释掉即可

### 2.2 自动编译

修改 TS 文件后保存会自动编译到 JS 文件中

```bash
tsc --watch
```

### 2.3 发出错误

当代码有错时，保存会发出错误，不会自动编译到 JS 中

```bash
tsc --onEmitOnError --watch
```

### 2.4 显示类型

当严格模式开启时，定义函数传参
