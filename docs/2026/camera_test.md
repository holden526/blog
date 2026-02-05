---
title: 不同分辨率图片测试
date: 2026-02-06
info: 现有图片模型在不同分辨率图片上的能力对比
tags:
  - AI
  - Image Edit
---

# 不同分辨率图片测试

现有图片模型在不同分辨率图片上的能力对比

## 1. Sony ZV-E10M2

参数：

- 分辨率：4128 × 6192
- 人物距离：1m ～ 5m
- 环境：昏暗室内
- 焦距：30 ～ 50mm
- 光圈：f/5.6
- 曝光时间：1/160

### 1.1 证件照

- 输入照片

从左到右分别：5m => 4m => 3m => 2m => 1m

<table>
  <tbody>
    <tr>
      <td><img src="../img/2026/camera_test/holden-input-sony-1.jpg" /></td>
      <td><img src="../img/2026/camera_test/holden-input-sony-2.jpg" /></td>
      <td><img src="../img/2026/camera_test/holden-input-sony-3.jpg" /></td>
      <td><img src="../img/2026/camera_test/holden-input-sony-4.jpg" /></td>
      <td><img src="../img/2026/camera_test/holden-input-sony-5.jpg" /></td>
    </tr>
  </tbody>
</table>

- 模型输出结果

<table>
  <tbody>
    <tr>
      <td><img src="../img/2026/camera_test/holden-output-sony-1.png" /></td>
      <td><img src="../img/2026/camera_test/holden-output-sony-2.png" /></td>
      <td><img src="../img/2026/camera_test/holden-output-sony-3.png" /></td>
      <td><img src="../img/2026/camera_test/holden-output-sony-4.png" /></td>
      <td><img src="../img/2026/camera_test/holden-output-sony-5.png" /></td>
    </tr>
  </tbody>
</table>

## 2. UVC 1080P

参数：

- 分辨率：1920 × 1080、640 × 480
- 人物距离：1m ～ 5m
- 环境：昏暗室内
- 焦距：30 ～ 50mm
- 光圈：f/5.6
- 曝光时间：1/160

### 2.1 证件照

- 输入照片

从左到右分别：5m => 4m => 3m => 2m

<table>
  <tbody>
    <tr>
      <td><img src="../img/2026/camera_test/holden-input-uvc-1.jpg" width=200 /></td>
      <td><img src="../img/2026/camera_test/holden-input-uvc-2.jpg" width=200 /></td>
      <td><img src="../img/2026/camera_test/holden-input-uvc-3.jpg" width=200 /></td>
      <td><img src="../img/2026/camera_test/holden-input-uvc-4.jpg" width=200 /></td>
    </tr>
  </tbody>
</table>

- 模型输出结果

<table>
  <tbody>
    <tr>
      <td><img src="../img/2026/camera_test/holden-output-uvc-1.png" /></td>
      <td><img src="../img/2026/camera_test/holden-output-uvc-2.png" /></td>
      <td><img src="../img/2026/camera_test/holden-output-uvc-3.png" /></td>
      <td><img src="../img/2026/camera_test/holden-output-uvc-4.png" /></td>
    </tr>
  </tbody>
</table>
