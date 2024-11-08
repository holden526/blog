---
title: 请求与跨域
date: 2021-08-10
info: 日常学习随笔
tags:
  - Request
---

# 请求与跨域

## 请求的方式

### 1. Ajax

*Ajax*即“**Asynchronous JavaScript And XML**”（**异步 JavaScript 和 XML**），是指一种创建交互式网页应用的网页开发技术。

```javascript
$.ajax({
  type: 'POST',
  url: url,
  data: data,
  dataType: dataType,
  success: function () {},
  error: function () {},
})
```

**优点：**

- **提高了性能和速度**：减少了客户端和服务器之间的流量传输，同时减少了双方响应的时间，响应更快，因此提高了性能和速度
- **交互性好**：使用 ajax，可以开发更快，更具交互性的 Web 应用程序
- **异步调用**：Ajax 对 Web 服务器进行异步调用。这意味着客户端浏览器在开始渲染之前避免等待所有数据到达。
- **节省带宽**：基于 Ajax 的应用程序使用较少的服务器带宽，因为无需重新加载完整的页面
- **底层使用**: XMLHttpRequest

- 拥有开源 JavaScript 库 ： JQuery，Prototype，Scriptaculous 等。

- AJAX 通过 HTTP 协议进行通信。

**缺点：**

- 增加了设计和开发的时间
- 比构建经典 Web 应用程序更复杂
- Ajax 应用程序中的安全性较低（**容易收到 CSRF 和 XSS 攻击**)，因为所有文件都是在客户端下载的
- 可能出现网络延迟的问题
- 禁用 javascript 的浏览器无法使用该应用程序
- 由于安全限制，只能使用它来访问服务于初始页面的主机的信息。如果需要显示来自其他服务器的信息，则无法在 AJAX 中显示。

### 2. axios

axios **基于 promise 用于浏览器和 node.js 的 http 客户端**。

```javascript
// 安装
npm i axios
// 引入
import axios from 'axios'
// 使用示例1
axios.get(url).then(
    response=>{
        console.log(response.data)
    },
    error=>{
        console.log(error.message)
    }
)

// 使用示例2
axios({
    method: 'post',
    url: '/user/12345',
    headers:{
        'token':xxx
    }
    responseType: "blob",
    data: {
        firstName: 'Fred',
        lastName: 'Flintstone'
    }
})
.then(function (response) {
    console.log(response);
})
.catch(function (error) {
    console.log(error);
});
```

**优点：**

- 从 node.js 创建 http 请求
- 在浏览器中创建 XMLHttpRequest
- 支持 Promise API
- 提供了一些并发请求的接口
- 支持拦截请求和响应
- 转换请求和响应数据
- 取消请求
- 自动转换 JSON 数据
- 客户端支持防御 CSRF/XSRF

### 3. fetch

fetch 号称是 AJAX 的替代品，**是在 ES6 出现的，使用了 ES6 中的 promise 对象**。Fetch 是基于 promise 设计的。Fetch 的代码结构比起 ajax 简单多了，参数有点像 jQuery ajax。但是，一定记住**fetch 不是 ajax 的进一步封装，而是原生 js，没有使用 XMLHttpRequest 对象**。（然而问题还是有很多）

```javascript
try {
  let response = await fetch(url)
  let data = response.json()
  console.log(data)
} catch (e) {
  console.log('Oops, error', e)
}
```

**优点：**

- 符合关注分离，没有将输入、输出和用事件来跟踪的状态混杂在一个对象中
- 更好更方便的写法
- 更加底层，提供的 API 丰富（request，response）
- 脱离了 XHR，是 ES 规范里新的实现方式

**缺点：**

- fetch 只对网络请求报错，对 400，500 都当做成功的请求，需要封装去处理
- fetch 默认不会带 cookie，需要添加配置项
- fetch 不支持 abort,不支持超时控制，使用**setTimeout**及**Promise.reject**和**Promise.race 结合 setTimeout**实现的超时控制\*\*并不能阻止请求过程继续在后台执行，造成了量的浪费
- fetch 没有办法原生监测请求的进度，而 XHR 可以

## 解决跨域问题

### 1. cors

后端配置请求头（有一定风险）

### 2. jsonp

利用 script 中的 src 引入外部资源时不受同源限制

只能解决 get 请求（前端后端都要处理）

### 3. 代理服务器

后端 nginx 或者 Vue-cli

1.Vue-cli 配置 vue.config.js

方式一：

缺点：不能控制代理服务器走代理，且只能代理一个服务器

代理服务器本身是 public 中的内容，如果你请求的东西代理服务器有，它就不会转发给服务器

```javascript
module.exports = {
  pages: {
    index: {
      // 入口
      entry: 'src/main.js',
    },
  },

  lintOnSave: false, // 关闭语法检查
  // 开启代理服务器
  devServer: {
    proxy: 'http://localhost:5000', // 要请求的服务器端口
    // 修改请求接口为本机即可
  },
}
```

方式二：

```javascript
module.exports = {
	devServer：
	proxy: {
		'/api1': {// 匹配所有以‘/api1'开头的请求路径
		target: 'http://localhost:5000',// 代理目标的基础路径
		changeOrigin: true,
		pathRewrite: {'^/api1': ''}
	}，
	'/api2': {// 匹配所有以 '/api2'开头的请求路径
		target:'http://localhost:5001',// 代理目标的基础路径
		changeOrigin: true,
		pathRewrite: {'^/api2': ''}
	}
}
/*
	changeOrigin设置为true时，服务器收到的请求头中的host为：localhost：5000
	changeOrigin设置为false时，服务器收到的请求头中的host为：localhost：8080
	changeOrigin默认值为true
/*
```

说明:

1. 优点：可以配置多个代理，且可以灵活的控制请求是否走代理。
2. 缺点：配置略微繁琐，请求资源时必须加前缀。

### 4. 创建 json-server 服务器

::: code-group

```sh [npm]
npm install -g json-server
```

```sh [yarn]
yarn global add json-server
```

```sh [pnpm]
pnpm add -g json-server
```

```sh [bun]
bun add -g json-server
```

:::

创建 db.json 文件

```js
{
    "posts": [
        {
            "id": 1,
            "title": "json-server",
            "author": "typicode"
        }
    ],
    "comments": [
        {
            "id": 1,
            "body": "some comment",
            "postId": 1
        }
    ],
    "profile":
    {
        "name": "typicode"
    }
}
```

```bash
json-server --watch db.json
```

```js
get https://localhost:3000/posts/1          // 获取指定id数据
post 新增     	 需要传id  /posts/1
put 修改 			需要传id  /posts/1
DELETE 删除		需要传id  /posts/1
```

# 服务器状态码

| 200 | （成功）服务器已成功处理了请求。                                                 |
| --- | -------------------------------------------------------------------------------- |
| 201 | （已创建）请求成功并且服务器创建了新的资源。                                     |
| 204 | （无内容）服务器成功处理了请求，但没有返回任何内容。                             |
| 301 | （永久移动）请求的网页已永久移动到新位置。                                       |
| 302 | （临时移动）服务器目前从不同的位置响应请求。                                     |
| 400 | （错误请求）服务器不理解请求的语法。                                             |
| 401 | （未授权）请求要求身份验证。                                                     |
| 403 | （禁止）无权限, 服务器拒绝请求。                                                 |
| 404 | （未找到） 服务器找不到请求的资源                                                |
| 408 | （超时） 请求超时                                                                |
| 422 | （验证错误） 请求参数未通过验证                                                  |
| 429 | （被限制）请求次数过多                                                           |
| 500 | （服务器内部错误） 服务器遇到错误，无法完成请求。                                |
| 501 | （尚未实施） 服务器不具备完成请求的功能。                                        |
| 502 | （错误网关） 服务器作为网关或代理，从上游服务器收到无效响应。                    |
| 503 | （服务不可用） 服务器目前无法使用（由于超载或停机维护）。 通常，这只是暂时状态。 |
| 504 | （网关超时） 服务器作为网关或代理，但是没有及时从上游服务器收到请求。            |
| 505 | （HTTP 版本不受支持） 服务器不支持请求中所用的 HTTP 协议版本。                   |
