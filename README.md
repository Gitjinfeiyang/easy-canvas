# 简介
使用render函数，在canvas中创建文档流，实现静态布局.

> *使用中有问题查看example中的代码，点击查看 [DEMO](https://gitjinfeiyang.github.io/easy-canvas/example/)*

- vue组件 [vue-easy-canvas](https://github.com/Gitjinfeiyang/vue-easy-canvas)
- 支持文档流，参照web，无需设置x、y以及宽高
- 兼容小程序以及web，无第三方依赖
- 支持组件化，全局组件以及局部组件
- 支持事件
- 高性能，scroll-view支持脏矩形，只绘制可视部分
- 支持操作element，类似操作dom修改文档流

## 支持元素
- [x] `view` 基本元素，类似div
- [x] `text` 文本 支持自动换行以及超过省略等功能,目前text实现为inline-block
- [x] `image` 图片 `src` `mode`支持aspectFit以及aspectFill，其他css特性同web 支持`load`事件监听图片加载并且绘制完成
- [x] `scroll-view` 滚动容器，需要在样式里设置`direction`，并且设置具体尺寸 实验性功能

## Styles
属性使用像素的地方统一使用数字

- [x] `display` block | inline-block | flex, text默认是inline的
- [x] `width` auto 100% Number 这里盒模型使用border-box，不可修改
- [x] `height`
- [x] `minWidth` `maxWidth` `minHeight` `maxHeight` 如果设置了具体宽度高度不生效
- [x] `margin` `marginLeft`,`marginRight`,`marginTop`,`marginBottom` margin支持数组缩写例如 [10,20] [10,20,10,20]
- [x] `paddingLeft`,`paddingRight`,`paddingTop`,`paddingBottom` 同上
- [x] `backgroundColor`
- [x] `borderRadius`
- [x] `borderWidth` `borderTopWidth` ... 细边框直接设置0.5
- [x] `borderColor`
- [x] `lineHeight` 字体相关的只在text内有效
- [x] `color`
- [x] `fontSize`
- [x] `textAlign` left right center
- [x] `textIndent` Number
- [x] `verticalAlign` top middle bottom
- [x] `justifyContent` flex-start center flex-end flex布局 水平方向对其
- [x] `alignItems` flex-start center flex-end flex布局 垂直方向对其
- [x] `maxLine` 最大行数，超出自动省略号，只支持在text中使用
- [x] `whiteSpace` normal nowrap 控制换行，不能控制字体
- [x] `overflow` hidden 如果添加了圆角，会自动加上 hidden
- [ ] `flexDirection`
- [x] `borderStyle` dash Array 详见ctx.setLineDash()
- [x] `shadowBlur` 设置了阴影会自动加上 overflow:hidden;
- [x] `shadowColor`
- [x] `shadowOffsetX`
- [x] `shadowOffsetY`
- [x] `position` `static` `absolute`
- [x] `opacity` `Number`


## Installation

``` bash
npm install easy-canvas-layout --save
```

## Usage

### Basic
``` javascript
    import easyCanvas from 'easy-canvas-layout'

    // create a layer bind with ctx
    const layer = easyCanvas.createLayer(ctx, {
      dpr: 2,
      width: 300,
      height: 600,
      canvas   // 小程序环境必传
    })

    // create a node tree
    // c(tag,options,children)
    const node = easyCanvas.createElement((c) => {
      return c('view', {
        styles: { backgroundColor:'#000' }, // 样式
        attrs:{},                           // 属性 比如src
        on:{}                               // 事件 如click load
      },
      [
        c('text',{color:'#fff'},'Hello World')
      ])
    })

    // mount
    node.mount(layer)

```
### Register Component
``` javascript
    ...

    function button(c,text){
      return c(
        'view',
        {
          styles: {
            backgroundColor: '#ff6c79',
            borderRadius: 10,
            borderColor: '#fff',
            display: 'inline-block',
            margin: 2,
            padding:[0,10]
          },
        },
        [
          c(
            'text',
            {
              styles: {
                lineHeight: 20,
                color: '#fff',
                textAlign: 'center',
                fontSize: 11,
              },
            },
            text
          ),
        ]
      )
    }

    easyCanvas.component('button',(opt,children,c) => button(c,children))

    const node = easyCanvas.createElement((c) => {
      return c('view',{},[
        c('button',{},'这是全局组件')
      ])
    })

    ...

```

## TodoList
* ~~支持position~~
* ~~inline-block换行以及textAlign~~
* ~~通过栈实现属性继承~~
* 支持flex-direction
* ~~box-shadow 待优化~~
* 兼容小程序measuretext
* ~~兼容小程序image~~
* ~~打包问题解决~~
* scroll-view嵌套 ~~translate值继承~~
* 补充其他属性
* ~~image 支持mode~~
* ~~发布npm~~
* ~~max-width~~
* ~~vue模版支持~~
* scroll-view点击区域判断优化
* ~~移除元素时移除事件~~
* 滚动优化
* 按需渲染

## MIT License

Copyright (c) 2020 Gitjinfeiyang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
