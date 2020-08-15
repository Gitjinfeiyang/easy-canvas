# 简介
使用render函数，在canvas中创建文档流，实现简单静态布局。

## 元素
- [x] view 基本元素，类似div
- [x] text
- [x] image

## 属性
属性使用像素的地方统一使用数字

- [x] display `block` `inline-block` `flex` text默认是inline的
- [x] width `auto` `100%` `Number` 这里盒模型使用border-box，不可修改
- [x] height
- [x] marginLeft,marginRight,marginTop,marginBottom
- [x] paddingLeft,paddingRight,paddingTop,paddingBottom
- [x] backgroundColor
- [x] borderRadius
- [x] borderWidth borderTopWidth ...
- [x] borderColor
- [ ] borderStyle
- [ ] lineHeight 字体相关的只在text内有效
- [ ] color
- [ ] fontSize

## TodoList
* 支持position
* inline-block换行以及textAlign
* 通过栈实现属性继承
* 支持flex-direction

## Screenshot
![1](./screenshot/1.png)

