---
title: ExcelTools
date: 2025-04-10
layout: doc
prev: false
next: false
sidebar: false
---

<script setup> 
import ExcelCopyWorksheet from '../../.vitepress/components/tools/excel/ExcelCopyWorksheet.vue'
import ExcelCopyColumn from '../../.vitepress/components/tools/excel/ExcelCopyColumn.vue'
import ExcelCopyColumnToRow from '../../.vitepress/components/tools/excel/ExcelCopyColumnToRow.vue'
import ExcelCopyFormulaToCell from '../../.vitepress/components/tools/excel/ExcelCopyFormulaToCell.vue'
</script>

# Excel 工具集

Excel 处理工具集，运行于本地

其中，A表代表输入的源表，B表代表输出的目标表

## 1. 工作表批量复制

::: tip 功能说明
Excel 文件中选择特定工作表，并将其复制指定数量

**特点:**

- 自动命名：复制后的工作表会按照"原工作表名+序号"的格式命名
  :::

<ExcelCopyWorksheet />

## 2. 列数据多表分发

::: tip 功能说明
将源表中的指定列的数据分发到目标表的多个工作表的指定单元格中

**示例:**

- 源表A：J 列数据为 1、2、3、4、5
- 目标表B：有5个工作表
- 目标单元格：A2
- 结果：目标表中每个工作表的 A2 单元格分别为 1、2、3、4、5
  :::

::: danger 注意事项
数据分发受目标工作表数量限制。如果源数据列长度超过目标工作表数量，系统将只复制与目标工作表数量相等的数据项。
:::

<ExcelCopyColumn />

## 3. 列数据拼接

::: tip 功能介绍
将源表中某一列的数据提取并转换为行式数据，然后分发到目标表指定工作表中的指定单元格。

**特点:**

- 数据串联：默认无分隔符连接
- 灵活定位：可指定目标单元格位置
- 批量处理：一次性完成多个操作

**示例:**

- 源表A：J 列数据为 1、2、3、4、5
- 目标表B：有一个01工作表
- 目标单元格：A2
- 前缀：无
- 间隔符：+
- 结果：目标表中的01工作表的 A2 单元格值为 1+2+3+4+5
  :::

<ExcelCopyColumnToRow />

## 4. 循环复制公式到单元格

::: tip 功能介绍
设定一个模板，提取源表中每行对应索引的数据组合，然后复制到目标表每个工作表中的指定单元格。
:::

<ExcelCopyFormulaToCell />
