# 简介
使用render函数，在canvas中创建文档流，实现静态布局，几乎0学习成本。

## 支持元素
- [x] view 基本元素，类似div
- [x] scrollview 滚动容器，需要在样式里设置direction，并且设置具体尺寸 实验性功能
- [x] text 文本 支持自动换行以及超过省略等功能
- [x] image 图片 src

## 支持属性
属性使用像素的地方统一使用数字

- [x] display `block` `inline-block` `flex` text默认是inline的
- [x] width `auto` `100%` `Number` 这里盒模型使用border-box，不可修改
- [x] height
- [x] marginLeft,marginRight,marginTop,marginBottom
- [x] paddingLeft,paddingRight,paddingTop,paddingBottom
- [x] backgroundColor
- [ ] backgroundImage
- [x] borderRadius
- [x] borderWidth borderTopWidth ... 细边框直接设置0.5
- [x] borderColor
- [x] lineHeight 字体相关的只在text内有效
- [x] color
- [x] fontSize
- [x] textAlign `left` `right` `center`
- [x] verticalAlign
- [x] maxLine 最大行数，超出自动省略号，只支持在text中使用
- [x] whiteSpace `normal` `nowrap` 控制换行，不能控制字体
- [x] overflow `hidden` 如果添加了圆角，会自动加上 hidden
- [ ] flexDirection
- [ ] borderStyle
- [x] shadowBlur
- [x] shadowColor 目前阴影会被父容器截取 待优化
- [x] position `static` `absolute`



## Usage
``` javascript
    const canvas = document.querySelector('#canvas')

    const ctx = canvas.getContext('2d')
    canvas.width = canvas.width * 2
    canvas.height = canvas.height * 2
    ctx.scale(2, 2)

    // create a layer bind with ctx
    const layer = ef.createLayer(ctx, {
      dpr: 2,
      width: 300,
      height: 600,
      canvas   // 小程序环境必传
    })

    // create a node tree
    const node = ef.createElement((h) => {
      return h('view', { styles: { backgroundColor:'#000' } }, [
        h('text',{color:'#fff'},'Hello World')
      ])
    })

    // mount
    node.mount(layer)

```

## Screenshot
![1](screenshot/01.png)

## TodoList
* ~~支持position~~
* ~~inline-block换行以及textAlign~~
* ~~通过栈实现属性继承~~
* 支持flex-direction
* box-shadow 待优化
* 兼容小程序measuretext
* ~~兼容小程序image~~
* 打包问题解决
* scrollview嵌套 translate值继承