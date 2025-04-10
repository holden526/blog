---
title: ExcelTools
date: 2025-04-10
layout: doc
prev: false
next: false
sidebar: false
---

<script setup> 
import ExcelCopyWorksheet from '../.vitepress/components/tools/excel/ExcelCopyWorksheet.vue'
import ExcelCopyColumn from '../.vitepress/components/tools/excel/ExcelCopyColumn.vue'
</script>

# Excel Tools

## excel工作表复制

::: warning 作用
复制指定数量工作表

命名风格：原工作表名+序号
:::

<ExcelCopyWorksheet />

## excel指定列复制

::: warning 作用
复制A表中指定某一列的数据到B工作表中

比如：A表第一列内容，复制到B表工作表中，循环赋值，直至赋值完成所有B工作表
:::

::: danger 注意
赋值的长度，会根据B工作表长度决定。若A表列长度大于B工作表长度，则只复制B工作表数量的值
:::

<ExcelCopyColumn />
