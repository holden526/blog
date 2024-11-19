---
title: Electron 控制屏幕亮度
date: 2023-11-14
info: CMD 控制屏幕亮度
tags:
  - Electron
---

# Electron 控制屏幕亮度

一开始用brightness，dev下可用，打包后执行报错，找了很多文章都没办法解决。后来想到执行CMD命令去设置( [如何在 Windows 中使用命令行调整屏幕亮度](https://www.sysgeek.cn/windows-screen-brightness-command-line/) )。测试打包后正常，无需管理员权限。

1. 引入exec

   ```
   const { exec } = require('child_process')
   ```

2. 获取屏幕亮度

   ```js
   function getScreenBrightness() {
     return new Promise<number>((resolve,reject) => {
       exec('powershell.exe "(Get-WmiObject -Namespace root\\WMI -Class WmiMonitorBrightness).CurrentBrightness"', (error: Error | null, stdout: any) => {
         if (error) {
           console.log('get screen brightness error')
           reject(0)
         } else {
           resolve(stdout.trim())
         }
       })
     })
   }
   ```

3. 设置屏幕亮度（0~100）

   ```js
   function setScreenBrightness(brightness: number): Promise<void> {
     return new Promise((resolve) => {
       const command = `WMIC /NAMESPACE:\\\\root\\wmi PATH WmiMonitorBrightnessMethods WHERE "Active=TRUE" CALL WmiSetBrightness Brightness=${brightness} Timeout=0`
       exec(command, (error: Error | null) => {
         if (error) {
           console.error(`Error: ${error.message}`)
         }
         resolve()
       })
     })
   }
   ```
