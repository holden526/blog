---
title: JavaScript 手写方法
date: 2022-02-09
info: 面试常用手写方法
tags:
  - JavaScript
---

# JavaScript 手写方法

## 大厂手写题

### 1. 实现原生 AJAX 封装

```
const ajax = {
  get(url, fn) {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4) {
        fn(xhr.responseText)
      }
    }
    xhr.send()
  },
  post(url, fn, data) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4) {
        fn(xhr.responseText)
      }
    }
    xhr.send(data)
  }
}
```

### 2. 实现 new 过程

```
function myNew(fn, ...args) {
    const obj = {}

    obj.__proto__ = fn.prototype

    fn.apply(obj, args)

    return obj
}
```

### 3. 打乱一个数组

```
// 方法1
const shuffle = (arr) => {
  return arr.sort(() => {
    return Math.random() > 0.5 ? 1 : -1
  })
}

// 方法2
const shuffle = (arr) => {
    let i = arr.length
    while (i) {
        let j = Math.floor(Math.random() * i--)
        [arr[j], arr[i]] = [arr[i], arr[j]]
    }
}
```

### 4. 防抖函数

```
function debounce(fn, delay = 200) {
  let timer
  return function(...args) {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
      clearTimeout(timer)
      timer = null
    }, delay)
  }
}
```

### 5. 节流函数

```
function throttle(fn, delay = 200) {
  let flag = true
  return function(...args) {
    if(!flag) {
      return
    }
    flag = false
    let timer = setTimeout(() => {
      fn.apply(this, args)
      flag = true
      clearTimeout(timer)
    }, delay)
  }
}
```

### 6. 数组去重

```
// 方法1
const quchong = (arr) => {
  return [...new Set(arr)]
}

// 方法2
const quchong = (arr) => {
  const res = []
  arr.reduce((pre, next) => {
    if (!pre.has(next)) {
      pre.set(next, 1)
      res.push(next)
    }
    return pre
  }, new Map())

  return res
}
```

### 7. setTimeout 实现 setInterval

```
const mySetInterval = (fn, delay) => {
  let timer = null
  const interval = () => {
    fn()
    timer = setTimeout(interval, delay)
  }
  timer = setTimeout(interval, delay)

  return {
    cancel: () => {
      clearTimeout(timer)
    }
  }
}
```

### 8. setInterval 实现 setTimeout

```
const mySetTimeout = (fn, delay) => {
  const timer = setInterval(() => {
    fn()
    clearInterval(timer)
  }, delay)
}
```

### 9. compose 函数

```
function fn1(x) {
  return x + 1;
}

function fn2(x) {
  return x + 2;
}

function fn3(x) {
  return x + 3;
}

function fn4(x) {
  return x + 4;
}
const compose = (...fns) => {
  if (fns.length === 0) return (num) => num
  if (fns.length === 1) return fns[0]
  return fns.reduce((pre, next) => {
    return (num) => {
      return pre(next(num))
    }
  })
}
const a = compose(fn1, fn2, fn3, fn4)
console.log(a(1)); // 1+2+3+4=11
```

### 10. curring 函数

```
const add = (a, b, c) => a + b + c;
const currying = (fn, ...args) => {
  let allArgs = [...args]
  const num = fn.length
  const res = (...args2) => {
    allArgs = [...allArgs, ...args2]
    if (allArgs.length === num) {
      return fn(...allArgs)
    } else {
      return res
    }
  }
  return res
}
const a = currying(add, 1);
console.log(a(2)(3)) // 1 + 2 + 3=6
```

### 11. LRU 算法

![图片](../img/2022/js-methods/js-methods.png)

```
class LRUCache {
  constructor(size) {
    this.size = size
    this.cache = new Map()
  }
  get(key) {
    const hasKey = this.cache.has(key)
    if (!hasKey) {
      return -1
    } else {
      const val = this.cache.get(key)
      this.cache.delete(key)
      this.cache.set(key, val)
      return val
    }
  }
  put(key, value) {
    const hasKey = this.cache.has(key)
    if (hasKey) {
      this.cache.delete(key)
    }
    this.cache.set(key, value)
    if (this.cache.size > this.size) {
      this.cache.delete(this.cache.keys().next().value)
    }
  }
}
```

### 12. 发布订阅模式

```
class EventEmitter {
  constructor() {
    this.cache = []
  }

  on(name, fn) {
    const tasks = this.cache[name]
    if (tasks) {
      tasks.push(fn)
    } else {
      this.cache[name] = [fn]
    }
  }

  off(name, fn) {
    if (!name) {
      this.cache = []
      return
    }
    const tasks = this.cache[name]
    if (tasks) {
      if (!fn) {
        this.cache[name] = []
      }
      const index = tasks.findIndex(item => item === fn)
      if (index >= 0) {
        tasks.splice(index, 1)
      }
    }
  }

  emit(name, ...args) {
    // 复制一份。防止回调里继续on，导致死循环
    const tasks = this.cache[name].slice()
    if (tasks) {
      for (let task of tasks) {
        task(...args)
      }
    }
  }

  once(name, cb) {
    const fn = (...args) => {
      cb(...args)
      this.off(name, fn)
    }
    this.on(name, fn)
  }
}
```

### 13. DOM 转 对象

```
const dom2tree = (node) => {
  const obj = {}
  obj.tag = node.tagName
  obj.children = []
  node.childNodes.forEach(child => obj.children.push(dom2tree(child)))
  return obj
}
```

### 14. 对象 转 DOM

```
function _render(vnode) {
  if (typeof vnode === 'number') {
    vnode = String(vnode)
  }

  if (typeof vnode === 'string') {
    return document.createTextNode(vnode)
  }

  const dom = document.createElement(vnode.tag)
  if (vnode.attrs) {
    Object.keys(attrs).forEach(key => {
      const attr = artts[key]
      dom.setAttribute(key, attr)
    })
  }
  vnode.children.forEach(child => dom.appenChild(_render(child)))

  return dom
}
```

### 15. 判断对象环引用

```
const cycleDetector = (obj) => {
  const arr = [obj]
  let flag = false

  const cycle = (o) => {
    const values = Object.values(o)
    for (let value of values) {
      if (typeof value === 'object' && value !== null) {
        if (arr.includes(value)) {
          flag = true
          return
        }
        arr.push(value)
        cycle(value)
      }
    }
  }

  cycle(obj)

  return flag
}
```

### 16. 计算对象的层数

```
const loopGetLevel = (obj) => {
  let num = 1

  const computed = (obj, level) => {
    level = level || 0
    if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(v => {
        if (typeof v === 'object' && v !== null) {
          computed(v, level + 1)
        } else {
          num = level + 1 > num ? level + 1 : num
        }
      })
    } else {
      num = level > num ? level : num
    }
  }
  computed(obj)

  return num
}
```

### 17. 对象的扁平化

```
const flatten = obj => {
  if (!isObject(obj)) return
  const res = {}
  const dfs = (cur, prefix) => {
    if (isObject(cur)) {
      if (Array.isArray(cur)) {
        for(let i in cur) {
          dfs(cur[i], `${prefix}[${i}]`)
        }
      } else {
        for(let i in cur) {
          dfs(cur[i], `${prefix}${prefix ? '.' : ''}${i}`)
        }
      }
    } else {
      res[prefix] = cur
    }
  }
  dfs(obj, '')

  return res
}
```

### 18. (a == 1 && a == 2 && a == 3)

```
// 第一种方法
var a = {
  i: 1,
  toString: function () {
    return a.i++;
  }
}
console.log(a == 1 && a == 2 && a == 3) // true

// 第二种方法
var a = [1, 2, 3];
a.join = a.shift;
console.log(a == 1 && a == 2 && a == 3); // true

// 第三种方法
var val = 0;
Object.defineProperty(window, 'a', {
    get: function () {
        return ++val;
    }
});
console.log(a == 1 && a == 2 && a == 3) // true
```

### 19. Promise 并发器

题目描述：

```
JS 实现一个带并发限制的异步调度器 Scheduler，保证同时运行的任务最多有两个

addTask(1000,"1");
addTask(500,"2");
addTask(300,"3");
addTask(400,"4");
的输出顺序是：2 3 1 4

整个的完整执行流程：

一开始1. 2两个任务开始执行
500ms时，2任务执行完毕，输出2，任务3开始执行
800ms时，3任务执行完毕，输出3，任务4开始执行
1000ms时，1任务执行完毕，输出1，此时只剩下4任务在执行
1200ms时，4任务执行完毕，输出4
```

实现：

```
class Scheduler {
  constructor(limit) {
    this.limit = limit
    this.queue = []
    this.count = 0
  }
  add(time, str) {
    const request = () => {
      return new Promise(resolve => {
        setTimeout(() => {
          console.log(str)
          resolve()
        }, time)
      })
    }
    this.queue.push(request)
  }
  taskStart() {
    for(let i = 0; i < this.limit; i++) {
      this.request()
    }
  }

  request() {
    if (!this.queue.length || this.count > this.limit) {
      return
    }
    this.count++
    this.queue.shift()().then(() => {
      this.count--
      this.request()
    })
  }
}
```

### 20. lazyMan 函数

要求：

```
实现一个LazyMan，可以按照以下方式调用:
LazyMan(“Hank”)输出:
Hi! This is Hank!

LazyMan(“Hank”).sleep(10).eat(“dinner”)输出
Hi! This is Hank!
//等待10秒..
Wake up after 10
Eat dinner~

LazyMan(“Hank”).eat(“dinner”).eat(“supper”)输出
Hi This is Hank!
Eat dinner~
Eat supper~

LazyMan(“Hank”).eat(“supper”).sleepFirst(5)输出
//等待5秒
Wake up after 5
Hi This is Hank!
Eat supper
```

解题：

```
class _lazyMan {
  constructor(name) {
    const fn = () => {
      console.log(`Hi! This is ${name}`)
      this.next()
    }
    this.tasks = []
    this.tasks.push(fn)
    setTimeout(() => {
      this.next()
    })
  }
  next() {
    const task = this.tasks.shift()
    task && task()
  }
  sleep(delay) {
    this.sleepWrapper(delay)
    return this
  }
  sleepFirst(delay) {
    this.sleepWrapper(delay, true)
    return this
  }
  sleepWrapper(time, first) {
    const fn = () => {
      setTimeout(() => {
        console.log(`Wake up after ${time}`)
        this.next()
      }, time * 1000)
    }
    if (first) {
      this.tasks.unshift(fn)
    } else {
      this.tasks.push(fn)
    }
  }
  eat(food) {
    const fn = () => {
      console.log(`Eat ${food}`)
      this.next()
    }
    this.tasks.push(fn)
    return this
  }

}

const LazyMan = (name) => {
  return new _lazyMan(name)
}
```

### 21. add 函数

要求：实现一个 add 方法 使计算结果能够满足如下预期：

- add(1)(2)(3)()=6
- add(1,2,3)(4)()=10

解题：

```
function add(...args1) {
  let allArgs = [...args1]

  const fn = (...args2) => {
    allArgs = [...args1, ...args2]

    return fn
  }

  fn.toString = function() {
    return allArgs.reduce((pre, next) => {
      return pre + next
    })
  }

  return fn
}
```

### 22. 深拷贝

```
const tagMap = {
  mapTag: '[object Map]',
  setTag: '[object Set]',
  arrayTag: '[object Array]',
  objectTag: '[object Object]',
  symbolTag: '[object Symbol]',
  regexpTag: '[object RegExp]'
}


const checkType = (target) => {
  return Object.prototype.toString.call(target)
}

const checkTemp = (target) => {
  const c = target.constructor
  return new c()
}

const cloneSymbol = (target) => {
  return Object(Symbol.prototype.valueOf.call(target))
}

const cloneReg = (target) => {
  const reFlags = /\w*$/
  const result = new target.constructor(target.source, reFlags.exec(target))
  result.lastIndex = target.lastIndex
  return result
}

const deepClone = (target, map = new Map()) => {

  const type = checkType(target)

  if (!Object.values(tagMap).includes(type)) {
    return target
  }

  if (type === tagMap.symbolTag) {
    return cloneSymbol(target)
  }
  if (type === tagMap.regexpTag) {
    return cloneReg(target)
  }

    const temp = checkTemp(target)

  if (map.get(target)) {
    return map.get(target)
  }

  map.set(target, temp)

  if (type === tagMap.setTag) {
    target.forEach(value => {
      temp.add(deepClone(value, map))
    })
  }

  if (type === tagMap.mapTag) {
    target.forEach((value, key) => {
      temp.set(key, deepClone(value, map))
    })
  }

  for (const key in target) {
    temp[key] = deepClone(target[key], map)
  }
  return temp
}
```

### 23. 计算 LocalStorage 总容量

```
let str = '0123456789'
let temp = ''
// 先做一个 10KB 的字符串
while (str.length !== 10240) {
  str = str + '0123456789'
}

// 先清空
localStorage.clear()

const computedTotal = () => {
  return new Promise((resolve) => {
    // 不断往 LocalStorage 中累积存储 10KB
    const timer = setInterval(() => {
      try {
        localStorage.setItem('temp', temp)
      } catch {
        // 报错说明超出最大存储
        resolve(temp.length / 1024 - 10)
        clearInterval(timer)
        // 统计完记得清空
        localStorage.clear()
      }
      temp += str
    }, 0)
  })
}

(async () => {
  const total = await computedTotal()
  console.log(`最大容量${total}KB`)
})()
```

### 24. 实现 async/await

```
const toAsync = (fn) => {
  return function() {
    const gen = fn.apply(this. arguments)

    return new Promise((resolve, reject) => {

      function go(key, arg) {
        let res
        try {
          res = gen[key](arg)
        } catch(e) {
          return reject(e)
        }

        const { value, done } = res
        if (done) {
          return resolve(value)
        } else {
          return Promise.resolve(value).then(val => {
            go('next', val)
          }).catch(err => {
            go('throw', err)
          })
        }
      }
      go('next')
    })
  }
}
```

## 数组方法

### 27. forEach

```
Array.prototype.sx_forEach = (cb) => {
    for (let i = 0; i < this.length; i++) {
        cb && cb(this[i], i, this)
    }
}
```

### 28. map

```
Array.prototype.sx_map = (cb) => {
    const res = []
    for (let i = 0; i < this.length; i++) {
        res[i] = cb && cb(this[i], i, this)
    }
    return res
}
```

### 29. filter

```
Array.prototype.sx_filter = function (cb) {
    const res = []
    for (let i = 0; i < this.length; i++) {
        cb && cb(this[i], i, this) && (res.push(this[i]))
    }
    return res
}
```

### 30. every

```
Array.prototype.sx_every = function (cb) {
    for (let i = 0; i < this.length; i++) {
        if (!cb && cb(this[i], i, this)) {
            return false
        }
    }
    return true
}
```

### 31. some

```
Array.prototype.sx_some = function (cb) {
    for (let i = 0; i < this.length; i++) {
        if (cb && cb(this[i], i, this)) {
            return true
        }
    }
    return false
}
```

### 32. reduce

```
Array.prototype.sx_reduce = function (cb, ...args) {
    let pre, start = 0
    if (args.length) {
        pre = args[0]
    } else {
        pre = this[0]
        start = 1
    }
    for (let i = start; i < this.length; i++) {
        pre = cb(pre, this[i], i, this)
    }
    return pre
}
```

### 33. findIndex

```
Array.prototype.sx_findIndex = function (cb) {
    for (let i = 0; i < this.length; i++) {
        if (cb && cb(this[i], i, this)) {
            return i
        }
    }
    return -1
}
```

### 34. find

```
Array.prototype.sx_find = function (cb) {
    for (let i = 0; i < this.length; i++) {
        if (cb && cb(this[i], i, this)) {
            return this[i]
        }
    }
    return undefined
}
```

### 35. fill

```
Array.prototype.sx_fill = function (value, start = 0, end) {
    end = end || this.length
    for (let i = start; i < end; i++) {
        this[i] = value
    }
    return this
}
```

### 36. include

```
Array.prototype.sx_include = function (value, start = 0) {
    const isnan = Number.isNaN(value)
    for (let i = start; i < this.length; i++) {
        if (this[i] === value || (isnan && Number.isNaN(this[i]))) {
            return true
        }
    }
    return false
}
```

### 37. join

```
Array.prototype.sx_join = function (str = ',') {
    let resStr = ''
    for (let i = 0; i < this.length; i++) {
        const item = this[i]
        resStr = i === 0 ? item : `${resStr}${str}${item}`
    }
    return resStr
}
```

### 38. flat

```
Array.prototype.sx_flat = function (num = Infinity) {
    let arr = this, i = 0
    while (arr.some(item => Array.isArray(item))) {
        arr = [].concat(...arr)
        i++
        if (i >= num) break
    }
    return arr
}
```

### 39. splice

```
Array.prototype.sx_splice = function (start, length, ...values) {
    if (length === 0) return []
    length = start + length > this.length - 1 ? this.length - start : length
    console.log(length)
    const res = [], tempArr = [...this]
    for (let i = start; i < start + values.length; i++) {
        this[i] = values[i - start]
    }
    this.length = start + values.length
    if (values.length < length) {
        const cha = length - values.length
        for (let i = start + values.length; i < tempArr.length; i++) {
            this[i] = tempArr[i + cha]
        }
        this.length = this.length - cha
    }
    if (values.length > length) {
        for (let i = start + length; i < tempArr.length; i++) {
            this.push(tempArr[i])
        }
    }
    for (let i = start; i < start + length; i++) {
        res.push(tempArr[i])
    }
    return res
}
```

## 对象方法

### 40. entries

```
Object.prototype.sx_entries = function (obj) {
    const res = []
    for (let key in obj) {
        obj.hasOwnProperty(key) && (res.push([key, obj[key]]))
    }
    return res
}
```

### 41. fromEntries

```
Object.prototype.sx_fromEntries = function (arr) {
    const obj = {}
    for (let item of arr) {
        const [key, value] = item
        obj[key] = item[value]
    }
    return obj
}
```

### 42. keys

```
Object.prototype.sx_keys = function (obj) {
    const res = []
    for (let key in obj) {
        obj.hasOwnProperty(key) && res.push(key)
    }
    return res
}
```

### 43. values

```
Object.prototype.sx_values = function (obj) {
    const res = []
    for (let key in obj) {
        obj.hasOwnProperty(key) && res.push(obj[key])
    }
    return res
}
```

### 44. instanceOf

```
const instanceOf = function (parent, children) {
    const fp = parent.prototype
    let cp = children.__proto__
    while (cp) {
        if (fp === cp) {
            return true
        }
        cp = cp.__proto__
    }
    return false
}
```

### 45. is

```
Object.prototype.sx_is = function (x, y) {
    if (x === y) {
        // 防止 +0 和 -0
        return x !== 0 && 1 / x === 1 / y
    }

    // 防止NaN
    return x !== x && y !== y
}
```

### 46. assign

```
Object.prototype.sx_assign = function (target, ...args) {
    if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object')
    }

    target = Object(target)

    for (let obj of args) {
        for (let key in obj) {
            obj.hasOwnProperty(key) && (target[key] = obj[key])
        }
    }

    return target
}
```

## Promise 方法

### 47. all

```
Promise.sx_all = (promises) => {
    return new Promise((resolve, reject) => {
        const result = []
        let count = 0
        for (let i = 0; i < promises.length; i++) {
            const promise = Promise.resolve(promises[i])
            promise.then(res => {
                result[i] = res
                count++
                if (count === promises.length) {
                    resolve(result)
                }
            }).catch(err => {
                reject(err)
            })
        }
    })
}
```

### 48. race

```
Promise.sx_race = (promises) => {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            const promise = Promise.resolve(promises[i])
            promise.then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        }
    })
}
```

### 49. allSettled

```
Promise.sx_allSettled = (promises) => {
    return new Promise((resolve) => {
        const result = []
        let count = 0
        const addData = (status, value, i) => {
            result[i] = {
                status,
                value
            }
            count++
            if (count === promises.length) {
                resolve(result)
            }
        }
        for (let i = 0; i < promises.length; i++) {
            const promise = Promise.resolve(promises[i])
            promise.then(res => {
                addData('fulfilled', res, i)
            }).catch(err => {
                addData('rejected', err, i)
            })
        }
    })
}
```

### 50. any

```
Promise.sx_any = (promises) => {
    return new Promise((resolve, reject) => {
        let count = 0
        for (let i = 0; i < promises.length; i++) {
            const promise = Promise.resolve(promises[i])
            promise.then(res => {
                resolve(res)
            }).catch(err => {
                count++
                if (count === promises.length) {
                    reject('全错！！！')
                }
            })
        }
    })
}
```

### 51. finally

```
Promise.prototype.sx_finally = function (fn) {
  return this.then((res) => {
    fn()
    return res
  }).catch((err) => {
    fn()
    return err
  })
}
```

## 函数

### 52. call

```
Function.prototype.sx_call = function(obj, ...args) {
  obj = obj || window
  const fn = Symbol()
  obj[fn] = this
  const res = obj[fn](...args)
  delete obj[fn]
  return res
}
```

### 53. apply

```
Function.prototype.sx_apply = function(obj, args) {
  obj = obj || window
  const fn = Symbol()
  obj[fn] = this
  const res = obj[fn](...args)
  delete obj[fn]
  return res
}
```

### 54. bind

```
Function.prototype.sx_bind = function(obj, ...args) {
  obj = obj || window
  const fn = Symbol()
  obj[fn] = this
  const _this = this

  const res = function(...innerArgs) {
    console.log(this, _this)
    if (this instanceof _this) {
      this[fn] = _this
      this[fn](...[...args, ...innerArgs])
      delete this[fn]
    } else {
      obj[fn](...[...args, ...innerArgs])
      delete obj[fn]
    }
  }
  res.prototype = Object.create(this.prototype)
  return res
}
```

## 字符串

### 55. slice

```
String.prototype.sx_slice = function (start = 0, end) {
    start = start < 0 ? this.length + start : start
    end = !end && end !== 0 ? this.length : end

    if (start >= end) return ''
    let str = ''
    for (let i = start; i < end; i++) {
        str += this[i]
    }

    return str
}
```

### 56. substr

```
String.prototype.sx_substr = function (start = 0, length) {
    if (length < 0) return ''

    start = start < 0 ? this.length + start : start
    length = (!length && length !== 0) || length > this.length - start ? this.length : start + length

    let str = ''
    for (let i = start; i < length; i++) {
        str += this[i]
    }
    return str
}
```

### 57. substring

```
String.prototype.sx_sunstring = function (start = 0, end) {
    start = start < 0 ? this.length + start : start
    end = !end && end !== 0 ? this.length : end

    if (start >= end) [start, end] = [end, start]
    let str = ''
    for (let i = start; i < end; i++) {
        str += this[i]
    }

    return str
}
```
