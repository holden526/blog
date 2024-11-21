---
title: Git 多仓库提交用户信息动态设置
date: 2024-11-21
info: 解决多个远程仓库提交用户信息不一致问题
tags:
  - GIT
---

# Git 多仓库提交用户信息动态设置

## 前言

在日常开发中，我们可能需要同时管理多个远程仓库（如 GitHub、Gitee、GitLab），而每个仓库使用不同的邮箱和用户名。比如，GitHub 和 Gitee 使用相同的邮箱，而 GitLab 使用另一个邮箱。每次提交代码时手动切换邮箱非常繁琐，尤其是在多个仓库频繁提交的情况下。

## 解决方案

通过修改 Git 配置文件 .gitconfig，可以动态设置不同仓库使用不同的用户名和邮箱。以下是详细的操作步骤。

### 1. 新建外部配置文件

首先，新建一个文件 `C:\Users\用户名\.gitconfig-holden` ，并在其中设置你希望使用的 Git 用户名和邮箱（例如 GitHub 和 Gitee 使用相同的邮箱）：

```sh
[user]
name = holden
email = holden.lee@aliyun.com
```

### 2. 修改全局配置文件

然后，打开全局 Git 配置文件 `C:\Users\用户名\.gitconfig` ，并按照以下内容进行配置：

```sh
[user]
name = xxx
email = xxx@gmail.com

# 对于 Gitee 和 GitHub，使用外部配置文件

[includeIf "hasconfig:remote.*.url:https://gitee.com/"]
path = ~/.gitconfig-holden

[includeIf "hasconfig:remote.*.url:git@gitee.com:"]
path = ~/.gitconfig-holden

[includeIf "hasconfig:remote.*.url:https://github.com/"]
path = ~/.gitconfig-holden

[includeIf "hasconfig:remote.*.url:git@github.com:"]
path = ~/.gitconfig-holden

# 配置 HTTP 请求缓冲区

[http]
postBuffer = 524288000
```

## 配置解释

`[user] 配置`

全局默认的 Git 用户名和邮箱（适用于除 GitHub 和 Gitee 外的仓库）。

`[includeIf "hasconfig:remote.*.url:https://gitee.com/"]`

当远程仓库地址是 Gitee 时，加载外部配置文件 ~/.gitconfig-holden，并使用该文件中的 Git 用户名和邮箱。

`[includeIf "hasconfig:remote.*.url:https://github.com/"]`

当远程仓库地址是 GitHub 时，加载外部配置文件 ~/.gitconfig-holden，并使用该文件中的 Git 用户名和邮箱。

`其他仓库`

对其他远程仓库使用默认的全局配置。

## 结果

通过这种方式，当你操作 GitHub 或 Gitee 时，Git 会自动使用 ~/.gitconfig-holden 文件中的用户名和邮箱，而 GitLab 等其他仓库则使用全局配置。这样就解决了不同仓库提交信息不一致的问题，避免了频繁切换用户名和邮箱的麻烦。
