---
title: LeeCode 笔记
date: 2021-12-22
info: 学习笔记
tags:
  - LeeCode
---

# LeeCode 笔记

记录我 LeeCode 刷题使用的好用知识点，查漏补缺

## 推荐题目参考

[题目](https://www.yuque.com/cuggz/interview/cmno8a)

## 1. 数字类

我常用的方法:

```js
array.forEach((i) => {
  xxx
}) // 遍历数组
array.reverse() // 数组反转
String.split('') // 把字符串变为数组
parseInt(String) // 字符串转数字
String - 0 // 字符串转数字
number.toString() // 数字转字符串
isNaN(number / String) // 判断值是否为NaN; 可用于检测是否为数字
array.unshift(xxx) // 在数组前插入
```

### 1.1 LeeCode 第 7 题：整数反转

幂表示方法：

```js
Math.pow(-2, 31) // -2^31 可表示负数
2 ** 31 //  2^31 不可为负
```

### 1.2 LeeCode 第 43 题：字符串相乘

JavaScript 中的最大安全整数是 9007199254740991，当我们进行超出这个范围的数值计算的时候就无法得到精确的值，而是一个近似值。

我使用的是 BigInt 进行运算。JavaScript 用时超过 71% 、内存超过 81% 用户提交记录。

```JS
// 整数转BigInt，在后面+n
console.log(123456789n)
// 使用函数转
BigInt("10") // 10n
BigInt(10)   // 10n
BigInt(true) // 1n
```

我的题解

```js
/**
 * @param {string} num1
 * @param {string} num2
 * @return {string}
 */
var multiply = function (num1, num2) {
  return (BigInt(num1) * BigInt(num2)).toString()
}
```

### 1.3 LeeCode 第 168 题：Excel 表列名称

将数字转换为 ASCII 码

题目技巧，1~26，每一个加 64 就是对应大写 A~Z

```js
var num = 65
String.fromCharCode(num) // A
```

### 1.4 LeeCode 第 171 题：Excel 表列名称

将数字转换为 ASCII 码

题目技巧，1~26，每一个加 64 就是对应大写 A~Z

```js
var a = 'A'
a.charCodeAt() // 64
```

## 未完待续
