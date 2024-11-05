---
title: axios二次封装
date: 2021-11-19
sidebar: auto
categories:
  - request
  - Vue
tags:
  - axios
---

# 优点

axios 二次封装接口，方便管理所有接口，提高可维护性

<hr>

# 具体操作步骤

# 一、安装 axios

```bash
npm i axios
```

# 二、创建 api 文件夹

![在这里插入图片描述](https://img-blog.csdnimg.cn/09cd6883339d4e03870b990096f07d30.png)

## 1.request.js

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

## 2.index.js

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

## 3.在页面中调用接口

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

## 4.请求成功时

![在这里插入图片描述](https://img-blog.csdnimg.cn/1691fc0611e84cb8b635bd3f53f9b80b.png)

## 5.请求失败时

![在这里插入图片描述](https://img-blog.csdnimg.cn/0ef5ef9eb9a94406ab0bf3ff24a3db45.png)

# 总结

把所有接口都放在一起，可以便捷管理。可以像本文一样按需引入，如果是 vue 项目的话也可以直接在入口文件中导入，变成全局。

==多个接口演示：==
![在这里插入图片描述](https://img-blog.csdnimg.cn/3001308a70ac4a2b8c64f06ccfbbe932.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBARERESExf,size_14,color_FFFFFF,t_70,g_se,x_16)
