---
title: 实用网页
date: 2024-11-12
layout: doc
prev: false
next: false
sidebar: false
---

# 实用网页

<script setup> 
import Table from '../.vitepress/components/Table.vue'
const data = new Map([
  [
    '素材类', [
      { name: 'wallhaven',url: 'https://wallhaven.cc/', remark: '国外壁纸网站，免登录下载高清图片' },
      { name: 'WallHere', url: 'https://wallhere.com/', remark: '国外壁纸网站，访客下载要人机验证' }
    ]
  ],
  [
    '前端设计网站', [
      { name: '拟态设计网', url: 'https://neumorphism.io/', remark: '一键生成拟态样式' },
      { name: 'Cool Backgrounds', url: 'https://coolbackgrounds.io/', remark: '设计经典背景图' },
      { name: '404设计网', url: 'https://404.life/', remark: '有多种404好康的界面,可通过代码白嫖' },
      { name: '即时设计',url: 'https://js.design/square', remark: '有多种小程序/app的设计图,以及好用的切图工具台' },
      { name: '520设计网', url: 'http://hao.sj520.cn/',  remark: '有多种小程序/app的设计图,以及好用的切图工具台' },
      { name: 'U钙网', url: 'https://www.uugai.com/', remark: '设计简单logo' }
    ]
  ],
  [
    '颜色', [
      { name: 'Grabient', url: 'https://www.grabient.com/', remark: '设计背景图渐变色' },
      { name: 'ColorSpace', url: 'https://mycolor.space/', remark: '设计背景图渐变色' },
      { name: 'Itmeo', url: 'https://webgradients.com/', remark: '设计背景图渐变色' },
      { name: '颜色代码表', url: 'https://www.5tu.cn/colors/yansebiao.html', remark: '各种颜色的代码及中文名'}
    ]
  ],
  [
    '动画', [
      { name: 'jQuery插件库', url: 'https://www.jq22.com/', remark: '有很多好康的动画效果,以及纯css动画' },
      { name: 'animate.css', url: 'https://animate.style/', remark: '炒鸡无敌好用的css动画' },
      { name: 'animastore', url: 'http://guowc.github.io/animastore/', remark: '多种简单的css动画' },
      { name: 'animista', url: 'https://animista.net/', remark: '设计css动画工具' },
      { name: 'animation', url: 'https://angrytools.com/css/animation/', remark: '设计css动画工具,可在线编辑' }
    ]
  ],
  [
    '工具类网站', [
      { name: 'lodash', url: 'https://www.lodashjs.com/', remark: '工具库，内部封装了很多字符串、数组、对象等常见数据类型的处理函数' },
      { name: 'npm', url: 'https://www.npmjs.com/', remark: '查询各种npm包的使用' },
      { name: 'MDN', url: 'https://developer.mozilla.org/zh-CN/', remark: '面向 Web 开发者的文档' },
      { name: 'ToolTT', url: 'https://tooltt.com/jwt-decode/', remark: '在线 JWT Token 解析解码' },
      { name: 'Uncss', url: 'https://oct.cn/project/uncss/', remark: '在线精简css,一键去除项目中未使用的css样式表' },
      { name: '在线生成器工具', url: 'http://tools.jb51.net/code/css3path', remark: '一键生成图片切割代码及各种工具' },
      { name: 'shadows', url: 'https://shadows.brumm.af/', remark: '一键生成阴影代码' },
      { name: 'CSS Grid Generator', url: 'https://cssgrid-generator.netlify.app/', remark: '一键生成网格布局' },
      { name: 'css-separator-generator', url: 'https://wweb.dev/resources/css-separator-generator/', remark: '实现不同样式的分割线生成器' },
      { name: 'getwaves', url: 'https://getwaves.io/', remark: '生成波浪线代码' }
    ]
  ],
  [
    '框架', [
      { name: 'Vant', url: 'https://youzan.github.io/vant-weapp', remark: '轻量、可靠的小程序 UI 组件库' },
      { name: 'BootStrap', url: 'https://v4.bootcss.com/', remark: '用于开发响应式布局、移动设备优先的 WEB 项目' },
      { name: 'uView UI', url: 'https://www.uviewui.com/', remark: '全面兼容nvue的uni-app生态框架' },
      { name: 'ColorUi', url: 'http://docs.xzeu.com/#/', remark: '适用于uni-app的css框架,兼容全端' },
      { name: 'animation', url: 'https://angrytools.com/css/animation/', remark: '设计css动画工具,可在线编辑' },
    ]
  ],
  [
    '面试题', [
      { name: '前端知识库', url: 'https://www.html5iq.com/5feb26ddf72c21052324d0fd.html', remark: '多种前端面试题的集合' },
      { name: 'R2Coding', url: 'https://www.r2coding.com/', remark: 'B站Up的知识网站,包括前后端' },
    ]
  ],
])
</script>

## 素材类

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('素材类')"
/>

## 前端设计网站

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('前端设计网站')"
/>

## 颜色

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('颜色')"
/>

## 动画

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('动画')"
/>

## 工具类网站

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('工具类网站')"
/>

## 框架

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('框架')"
/>

## 面试题

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('面试题')"
/>
