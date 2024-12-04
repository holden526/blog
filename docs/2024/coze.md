---
title: Coze Agent 调试
date: 2024-11-30
info: 预研任务
tags:
  - Coze
---

# Coze Agent 调试

::: tip 相关链接

- [Coze 预研需求文档](https://app.yinxiang.com/fx/9a223968-f2c3-49a7-a0ee-651dfd6766c0t)
- [Coze 智能体控制台](https://www.coze.cn/space/7443848775191740455/develop)
- [Coze 开发文档](https://www.coze.cn/docs/developer_guides/coze_api_overview)

:::

## 1. Coze 平台基本信息

扣子是新一代 AI 应用开发平台。无论你是否有编程基础，都可以在扣子上快速搭建基于大模型的各类 AI 应用，并将 AI 应用发布到各个社交平台、通讯软件，也可以通过 API 或 SDK 将 AI 应用集成到你的业务系统中。

### 1.1 Coze 专业版收费情况

[Coze 计费说明](https://www.coze.cn/docs/coze_pro/4xxpauwh)

::: danger 注意
只有专业版本可以无限请求API，普通版本限制100次请求，并且模型token限额，无法满足日常开发需求
:::

::: warning 计费示例

- 产品内部调试和邀测期间，用量较小，但测试周期长，每个月差异大，全年共计 5 万条左右的消息量

  使用智能体资源包平均每天的费用为：100（元） / 365（天） ≈ 0.27 元

- 产品稳定运营期间，用户量稳定，约每天 1000 条消息，但峰值波动大（白天和夜晚、工作日和周末）

  按量计费模式每天的费用为：1000（次） \* 0.002 元/次 = 2 元

- 账号下知识库空间存储量达到 10GB，所以额外购买 20GB 的知识库空间，为期一个月，

  费用为：20GB ✖️ 1 元/GB/月 = 20 元
  :::

### 1.2 Coze 平台模型

coze agent 支持分配不同的大语言模型，处理问题时，可采用合适的模型获取更好的效果。

<script setup>
import Card from '../.vitepress/components/Card.vue'
const cozeModuleData = [
  { text:'豆包',imgUrl:'../img/coze1.png',link:'https://www.volcengine.com/product/doubao'},
  { text:'通义千问',imgUrl:'../img/coze2.png',link:'https://dundunlu.com/web/tongyi/'},
  { text:'GLM-4',imgUrl:'../img/coze3.png',link:'https://chatglm.cn/'},
  { text:'MiniMax',imgUrl:'../img/coze4.png',link:'https://www.minimaxi.com/'},
  { text:'Kimi',imgUrl:'../img/coze5.png',link:'https://www.minimaxi.com/'},
]
</script>

<Card :data="cozeModuleData"/>

### 1.3 Coze 智能体与应用

[Coze 智能体开发教程](https://www.coze.cn/docs/guides/agent_overview)

在工作空间中，可选择新建智能体和应用

- 智能体：智能体是基于对话的 AI 项目，它通过对话方式接收用户的输入，由大模型自动调用插件或工作流等方式执行用户指定的业务流程，并生成最终的回复。智能客服、虚拟女友、个人助理、英语外教都是智能体的典型应用场景。

- 应用：应用是指利用大模型技术开发的应用程序。扣子中搭建的 AI 应用具备完整业务逻辑和可视化用户界面，是一个独立的 AI 项目。通过扣子开发的 AI 应用有明确的输入和输出，可以根据既定的业务逻辑和流程完成一系列简单或复杂的任务，例如 AI 搜索、翻译工具、饮食记录等。

![创建](../img/coze7.png)

![工作空间](../img/coze6.png)

### 1.4 Coze 智能体配置介绍

[功能概述文档](https://www.coze.cn/docs/guides/agent_overview)

新建智能体后，在控制台可配置智能体，智能体控制台分3个部分

- 人设和回复逻辑

  [prompt 提示词概述文档](https://www.coze.cn/docs/guides/prompt)

  描述这个助手的人设/角色，告诉它应该和不应该回答什么，告诉它如何格式化响应，以及更多的参考信息以便获得更准确的回复。可通过使用 AI 功能帮你优化提示词，以更结构化和更清晰的格式和内容指导模型进行响应。

- 技能

  技能是智能体的基础能力，你可以在搭建智能体时通过插件、工作流等方式拓展模型的能力边界。

  |  功能  |                                                                                                                                             说明                                                                                                                                              |
  | :----: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
  |  插件  | 通过 API 连接集成各种平台和服务，扩展了智能体能力。扣子平台内置丰富的插件供你直接调用，你也可以创建自定义插件，将你所需要的 API 集成在扣子内作为工具来使用。更多信息，参考[插件介绍](https://www.coze.cn/docs/guides/create_plugin)。例如使用新闻插件来搜索新闻，使用搜索工具查找在线信息等。 |
  | 工作流 |                                            工作流是一种用于规划和实现复杂功能逻辑的工具。你可以通过拖拽不同的任务节点来设计复杂的多步骤任务，提升智能体处理复杂任务的效率。更多信息，参考[工作流介绍](https://www.coze.cn/docs/guides/workflow)。                                             |
  | 触发器 |                                                                                    触发器功能支持智能体在特定时间或特定事件下自动执行任务。更多信息，参考[触发器](https://www.coze.cn/docs/guides/task)。                                                                                     |

- 预览和回复

![配置](../img/coze8.png)
