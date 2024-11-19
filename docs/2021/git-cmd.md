---
title: Git 常用命令
date: 2021-10-15
info: Git 基本命令，涵盖配置、分支管理、远程操作和版本回退等常用技巧
tags:
  - Git
---

# Git 常用命令

## 1. 基本命令

### 1.1 设置本地用户签名

必须设置，设置一次即可

```bash
git config --global user.name LHD
git config --global user.email Lyouxiang526@163.com
```

### 1.2 查看本地库状态

红色代表未跟踪

```bash
git status
```

### 1.3 添加、删除暂存区

```bash
git add xxx
git rm -cached xxx
```

### 1.4 提交本地库

""里是版本信息

```bash
git commit -m "first commit" xxx
```

### 1.5 查看日志信息

```bash
git reflog
git log
```

### 1.6 版本穿梭（回退或前进）

```bash
git reflog  => 复制版本号。shift + ins 粘贴
```

```bash
git reset --hard +版本号
```

### 1.7 查看分支

```bash
git branch -v
```

### 1.8 创建分支

```bash
git branch 分支名
```

### 1.9 切换分支

```bash
git checkout 分支名
```

### 1.10 合并分支（正常合并）

```bash
在master合并hot-fix。先切换到master分支再合并
git merge hot-fix
```

### 1.11 合并冲突

合并分支时，两个分支在同一个文件的同一个位置有两套完全不同的修改，git 无法选择使用哪一个，所以必须认为决定新代码内容。

```bash
合并出错后，手动修改内容
重新添加到暂存区
git add xxx
重新提交到本地库，不要带文件名！
git commit -m "版本信息"
```

## 2. Github 仓库

初始化远程仓库连接 gitee remote and orgin xxxx

### 2.1 基本语法

远程地址为 https

```bash
git remote -v 查看当前所有远程地址别名
创建别名
git remote add 别名 远程地址
```

### 2.2 推送代码到远程仓库

```bash
git push 别名或地址 分支名
```

### 2.3 拉取最新代码到本地

```bash
git pull 别名或地址 分支名
```

### 2.4 克隆

克隆完会把别名也克隆过来

```bash
git clone 地址
```

### 2.5 跨团体协作

先登录另一个团队的账号，在要协助的团队 github 仓库 fork 到自己的仓库上。在自己仓库改完后 pull request 一下。被协助的团队就可以在 github 仓库上看到 pull request。然后就可以合并

### 2.6 SSH 免密登录

先在 c:/用户/你的用户名目录下，删除.ssh 目录，然后右键打开 git bash

```bash
ssh-keygen -t rsa -C 你的github邮箱地址
cat id_rsa.pub 把里面的值复制到你的github个人资料 ssh keys 中
然后就可以使用ssh地址了
```

## 3. 回退

### 3.1 git log

该命令显示从最近到最远的提交日志。每一次提交都有对应的 **commit id** 和 **commit message**。

如果嫌弃输出的信息杂乱无章，那么加上  **--pretty=oneline**  参数试试吧！

d 下一个， q 退出

```bash
git log --pretty=oneline
```

### 3.2 git reset --hard id

根据 id 回退到指定的版本

### 3.3 git reflog

查看命令操作的历史

## 4. ssh

```bash
ssh-keygen -t rsa -C "your_email@163.com"
cat ~/.ssh/id_rsa.pub
关联仓库起别名
git remote add github xxx
git push github master
```
