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
import Table from '../../.vitepress/components/Table.vue'
const data = new Map([
  [
    '前端素材', [
      { name: 'wallHere', url: 'https://wallhere.com/', remark: '国外壁纸网站，访客下载要人机验证' },
      { name: 'wallhaven',url: 'https://wallhaven.cc/', remark: '国外壁纸网站，免登录下载高清图片' },
      { name: '即时设计资源社区', url: 'https://js.design/community', remark: 'UI资源、产品设计、UI编辑器' },
      { name: '摹客资源社区', url: 'https://www.mockplus.cn/example/rp', remark: '精美原型、组件模板和设计例子' },
      { name: '爱给网', url: 'https://www.aigei.com/', remark: '各种音效、图标素材，可用利用油猴插件下载' },
      { name: '17素材', url: 'https://www.17sucai.com/', remark: '各种音效、图标素材，可用利用油猴插件下载' },
      { name: 'JQuery插件库', url: 'https://www.jq22.com/', remark: '有很多JS动画效果示例，在线预览可以获取源码' },
      { name: 'U钙网', url: 'https://www.uugai.com/', remark: '免费在线LOGO设计，简单快捷' },
      { name: '视觉效果合集', url: 'https://hepengwei.cn/#/canvas/freeFallingBody', remark: '前端视觉效果合集' },
      { name: '100font', url: 'https://www.100font.com/forum-1-1.htm?tagids=1_0_0_0', remark: '免费商用字体' },
    ]
  ],
  [
    '学习', [
      { name: '前端面试题汇总', url: 'https://www.yuque.com/cuggz/interview', remark: '前端面试题汇总' },
      { name: '大厂面试每日一题', url: 'https://q.shanyue.tech/', remark: '专注于前端的互联网大厂面试题的学习平台' },
      { name: 'vuejs-challenges', url: 'https://cn-vuejs-challenges.netlify.app/', remark: '一个 Vue.js 在线挑战平台' },
      { name: '牛客华为机试题', url: 'https://www.nowcoder.com/exam/oj/ta?tpId=37', remark: '华为笔试面试机考在线练习' },
    ]
  ],
  [
    '常用文档', [
      { name: 'MDN', url: 'https://developer.mozilla.org/zh-CN/', remark: '前端技术文档' },
      { name: 'NPM', url: 'https://www.npmjs.com/', remark: 'JS库查询' },
      { name: 'Can i use', url: 'https://caniuse.com/', remark: 'CSS兼容性查询' },
      { name: 'tool.oschina', url: 'https://tool.oschina.net/commons', remark: 'HTTP Content-type 对照表' },
    ]
  ],
  [
    '颜色', [
      { name: 'Grabient', url: 'https://www.grabient.com/', remark: '渐变色示例参考' },
      { name: 'Itmeo', url: 'https://webgradients.com/', remark: '渐变色示例参考' },
      { name: 'ColorSpace', url: 'https://mycolor.space/', remark: '渐变色生成器' },
      { name: 'safety-color', url: 'https://css.bqrdh.com/safety-color', remark: 'web安全色' },
      { name: '颜色代码表', url: 'https://www.5tu.cn/colors/yansebiao.html', remark: '各种颜色的Hex代码,快速取色'}
    ]
  ],
  [
    '在线工具', [
      { name: 'photopea', url: 'https://www.photopea.com/', remark: '在线Photoshop' },
      { name: 'scrollbar', url: 'https://scrollbar.app/', remark: 'css滚动条样式生成器' },
      { name: 'mp3cut', url: 'https://mp3cut.net/cn/', remark: '在线音频剪辑' },
      { name: 'JSON工具网', url: 'https://www.json.cn/', remark: '在线工具合集' },
      { name: 'lddgo', url: 'https://www.lddgo.net/index', remark: '在线工具大全' },
      { name: '67tool', url: 'https://www.67tool.com/', remark: '在线工具大全' },
      { name: 'regex101', url: 'https://regex101.com/', remark: '正则测试' },
      { name: 'css-loaders', url: 'https://css-loaders.com/classic/', remark: 'CSS加载动画合集' },
      { name: 'keen-slider', url: 'https://keen-slider.io/examples', remark: '轮播图示例合集' },
      { name: 'animista', url: 'https://animista.net/', remark: 'css动画效果生成器' },
      { name: 'Neumorphism', url: 'https://neumorphism.io/', remark: '拟态风格生成器' },
      { name: 'cssgrid-generator', url: 'https://cssgrid-generator.netlify.app/', remark: 'grid布局生成器' },
      { name: 'gradientbuttons', url: 'https://gradientbuttons.colorion.co/', remark: '渐变按钮CSS生成器' },
      { name: 'shadows', url: 'https://shadows.brumm.af/', remark: '阴影生成器' },
      { name: 'getwaves', url: 'https://getwaves.io/', remark: '波浪css生成器' },
      { name: 'Coolbackgrounds', url: 'https://coolbackgrounds.io/', remark: '页面背景生成器' },
      { name: 'css-separator-generator', url: 'https://wweb.dev/resources/css-separator-generator', remark: '不规则css生成器' },
      { name: 'uncss', url: 'https://oct.cn/project/uncss/', remark: '一键去除项目中未使用的css样式表' },
      { name: 'jwt-decode', url: 'https://tooltt.com/jwt-decode/', remark: '在线JWT Token解析解码' },
      { name: 'svgeditor', url: 'https://www.jyshare.com/more/svgeditor/', remark: 'svg在线编辑器' },
      { name: 'favicon', url: 'https://favicon.io/', remark: 'ico图标转换' },
      { name: 'ico51', url: 'https://www.ico51.cn/', remark: 'ico图标生成' },
      { name: 'CSS Sprites Generator', url: 'https://www.toptal.com/developers/css/sprite-generator', remark: '精灵/雪碧图制作' },
      { name: 'tinypng', url: 'https://tinypng.com/', remark: '在线图片压缩' },
      { name: 'boce', url: 'https://www.boce.com/', remark: '域名测速' },
    ]
  ],
])
</script>

## 前端素材

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('前端素材')"
/>

## 学习

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('学习')"
/>

## 常用文档

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('常用文档')"
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

## 在线工具

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('在线工具')"
/>
