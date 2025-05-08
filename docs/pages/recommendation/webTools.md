---
title: 工具网页
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
    '文档工具', [
      { name: 'ilovepdf', url: 'https://www.ilovepdf.com/zh-cn', remark: 'PDF在线转换工具' },
      { name: '超级PDF', url: 'https://xpdf.cn/', remark: 'PDF在线工具合集' },
      { name: 'wd1x', url: 'https://word.wd1x.com/', remark: 'Word代码高亮' },
    ]
  ],
  [
    '日常工具', [
      { name: 'ev录屏', url: 'https://www.ieway.cn/', remark: '免费、轻量录屏' },
      { name: 'parsec', url: 'https://dash.parsec.app/', remark: '远程串流' },
      { name: 'snapdrop', url: 'https://onedoes.github.io/snapdrop/', remark: '局域网文件分享' },
    ]
  ],
  
])
</script>

## 文档工具

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('文档工具')"
/>

## 日常工具

<Table 
  :columns="[
    { title: '名称', key: 'name' },
    { title: '地址', key: 'url' },
    { title: '备注', key: 'remark' }
  ]"
  :data="data.get('日常工具')"
/>
