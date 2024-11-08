---
title: JS 代码编写优化
date: 2022-03-20
info: 使用对象映射、数组判断、解构赋值、事件清理、定时器合并等，提升代码简洁性和性能
tags:
  - JavaScript
---

# JS 代码编写优化

## 1. 合理使用对象

### 1.1 多种条件(初始)

```
const a = 1
let res
switch (a) {
  case 1:
    res = 'one'
    break
  case 2:
    res = 'two'
    break
  // 超级多...
}
console.log(res) // one
```

### 1.2 利用对象(优化)

```
const a = 1
const map = {
  '1': 'one',
  '2': 'two',
  // ...
}
let res = map[a]
```

## 2.合理使用 数组 + includes

### 2.1 多个或进行 if 判断(初始)

```
const a = 1

if (a === 1 || a === 2 || a === 3) {
  // ...
}
```

### 2.2 利用数组 + includes(优化)

```
const a = 1

if ([1, 2, 3].includes(a)) {
  // ...
}
```

## 3. ES6 默认参数

### 3.1 默认参数(初始)

```
const fn = (name) => {
  name = name || 'lhd'
  console.log(name)
}
```

### 3.2 ES6 默认参数(优化)

```
const fn = (name = 'lhd') => {
  console.log(name)
}
```

## 4. 嵌套解构赋值

### 4.1 链式取值(初始)

```
const obj = {
  eat: {
    breakfast: 'egg',
    dinner: 'meal'
  }
}

console.log(obj.eat.breakfast) // egg
console.log(obj.eat.dinner) // meal
```

### 4.2 嵌套解构(优化)

```
const {
  eat: {
    breakfast,
    dinner
  }
} = obj

console.log(breakfast) // egg
console.log(dinner) // meal
```

## 5. 三元代替 if

### 5.1 if 赋值(初始)

```
let player
let no = 24
if (no === 24) {
  player = 'kobe'
} else {
  player = 'james'
}
```

### 5.2 三元代替(优化)

```
let no = 24
const name = no === 24 ? 'kobe' : 'james'
```

## 6. 多 if 的 return

### 6.1 else if(初始)

```
const a = 1
const fn = () => {
  if (a === 1) {
    return 1
  } else if (a === 2) {
    return 2
  } else if (a === 3) {
    return 3
  }
}
```

### 6.2 if(优化)

```
const a = 1
const fn = () => {
  if (a === 1) {
    return 1
  }
  if (a === 2) {
    return 2
  }
  if (a === 3) {
    return 3
  }
}
```

## 7. if 判断假值

### 7.1 ===判断(初始)

```
if (key === null) {
  // 进行对应操作
}
```

### 7.2 自动转布尔值(优化)

```
if (key) {
  // 进行对应操作
}
```

## 8. Vue 不需响应式的数据

### 8.1 初始

如果 selects 是不需要响应式的，但是你放在这里，会进行响应式的处理，浪费性能

```
  data() {
    return {
      selects: [
        {label: '选项一', value: 1},
        {label: '选项二', value: 2},
        {label: '选项三', value: 3}
    ]
    };
  }
```

### 8.2 优化

放在外面，则不会进行响应式处理，节省性能

```
  data() {
    // 放在这
    this.selects = [
      {label: '选项一', value: 1},
      {label: '选项二', value: 2},
      {label: '选项三', value: 3}
    ]
    return { };
  }
```

## 9. 定时器、绑定事件的清除

```
export default{
  data(){
    timer:null
  },
  mounted(){
      this.timer = setInterval(()=>{
      //具体执行内容
      console.log('1');
        },1000);
  }
  beforeDestory(){
    clearInterval(this.timer);
    this.timer = null;
  }
}
```

## 10. 小程序多次 setData 合并

小程序不像 React，小程序的 setData 并没有做多次修改自动合并，所以需要我们手动合并

### 10.1 初始

```
this.setState({
    name: 'lhd'
})
if (confition1) {
  this.setState({
    age: 22
  })
}
if (condition2) {
  this.setState({
    gender: '男'
  })
}
```

### 10.2 优化

```
const model = {
  name: 'lhd'
}
if (confition1) {
  model.age = 22
}
if (condition2) {
  model.gender = '男'
}
// 合并更新
this.setData(model)
```

## 11. 简短函数调用

### 11.1 初始

```
// test2 test3 都是函数
// 值为1时调用 test1(),否则调用 test2()
var temp = 1
if(temp == '1'){
  test1()
} else {
  test2()
}
```

### 11.2 优化

```
var temp = 1
(temp=='1' ? test1:test2)()
```

## 12. 给多个变量赋值

### 12.1 初始

```
let test1,test2,test3
test1 = 1
test2 = 2
test3 = 3
```

### 12.2 优化

```
let [test1,test2,test3] = [1,2,3]
```
