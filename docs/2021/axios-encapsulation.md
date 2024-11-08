---
title: axios简单封装
date: 2021-11-19
info: 简单封装 axios，统一管理 API 请求。通过配置基础路径、请求与响应拦截器，简化了接口调用流程
tags:
  - Axios
---

# axios简单封装

## 优点

axios 二次封装接口，方便管理所有接口，提高可维护性

## 1. 安装 axios

::: code-group

```sh [npm]
npm install axios
```

```sh [yarn]
yarn add axios
```

```sh [pnpm]
pnpm add axios
```

```sh [bun]
bun add axios
```

:::

## 2. request.js

用于管理请求配置

```js
// 引入 axios
import axios from 'axios'

const requests = axios.create({
  // 配置基础路径
  baseURL: 'http://localhost:3000',
  timeout: 3000,
  // 请求头
  /* headers:{} */
})

// 配置拦截器
requests.interceptors.request.use((config) => {
  // 请求带token
  /* config.headers.Authorization = window.sessionStorage.getItem('token') */
  return config
})

// 对应拦截器
requests.interceptors.response.use(
  (res) => {
    // 请求成功的回调函数
    return res.data
  },
  () => {
    // 请求失败的回调函数
    return Promise.reject('fail')
  }
)
// 对外暴露
export default requests
```

## 3. index.js

用于管理所有的请求，这里演示一个 test 接口，由于 request.js 配置了 baseURL，所以这里的 url 只需要填写 /test

```js
// 导入封装好的axios请求文件
import requests from './request'

// 测试接口
export const Test = () => {
  return requests({
    url: '/test',
    method: 'GET',
  })
}
```

## 4. 在页面中调用接口

先引入接口文件，因为接口文件名字是 index，所以引入时可以省略

```js
import { Test } from '../api'
```

因为 axios 返回的是 promise 对象，所以用 await 进行解析

```js
// test 函数，触发就发送请求
async test() {
	try {
		// 调用接口
		let a = await Test()
		// 输出请求后的返回值
		console.log(a)
	} catch(error){
		// 请求失败的回调
		console.log(error)
	}
}
```
