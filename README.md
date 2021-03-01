> 中文｜[EN](./README_EN.md)

# 简介

使用 render 函数，在 canvas 中创建文档流，快速实现布局.

> 使用中有问题查看 example 中的代码，点击查看 [DEMO](https://gitjinfeiyang.github.io/easy-canvas/example/)
>
> 有问题可以微信联系 Memeda_Caonima，备注 easy-canvas
>
> [在 CodePen 中尝试一下](https://codepen.io/Fiyoung/pen/pobvWRa?editors=1010)
>
> [easyCanvas 实现原理解析](https://juejin.im/post/6871124987550531592)

- vue 组件 [vue-easy-canvas](https://github.com/Gitjinfeiyang/vue-easy-canvas)
- 支持文档流，参照 web，无需设置 x、y 以及宽高
- 兼容小程序以及 web，无第三方依赖
- 支持组件化，全局组件以及局部组件
- 支持事件
- 高性能，scroll-view 支持脏矩形，只绘制可视部分
- 支持操作 element，类似操作 dom 修改文档流

## Installation

```bash
npm install easy-canvas-layout --save
```

## Usage

### Basic

```javascript
import easyCanvas from 'easy-canvas-layout';

// 1: create a layer bind with ctx
const layer = easyCanvas.createLayer(ctx, {
  dpr: 2,
  width: 300, // root宽度
  height: 600, // 高度
  lifecycle: {
    onEffectSuccess: () => {
      // 网络请求完成，比如网络图片加载完成并且重新绘制完毕
    },
    onEffectFail() {
      // 网络请求失败
    },
  },
  canvas, // 小程序下需要把canvas实例传入，用于绘制图片
});

// 2: create a node tree
// c(tag,options,children)
const node = easyCanvas.createElement((c) => {
  return c(
    'view',
    {
      styles: { backgroundColor: '#000' }, // 样式
      attrs: {}, // 属性 比如src
      on: {}, // 事件 如click load
    },
    [c('text', { color: '#fff' }, 'Hello World')]
  );
});

// mount
node.mount(layer);
```

### Register Component

```javascript
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

## 支持元素

- [x] `view` 基本元素，类似 div
- [x] `text` 文本 支持自动换行以及超过省略等功能,目前 text 实现为 inline-block
- [x] `image` 图片 `src` `mode`支持 aspectFit 以及 aspectFill，其他 css 特性同 web 支持`load`事件监听图片加载并且绘制完成
- [x] `scroll-view` 滚动容器，需要在样式里设置`direction` 支持 x、y、xy，并且设置具体尺寸 设置`renderOnDemand`只绘制可见部分

## Styles

属性使用像素的地方统一使用数字

| name            | des                                                                 | default    | options                          |
| --------------- | ------------------------------------------------------------------- | ---------- | -------------------------------- |
| display         | 表现                                                                | ---        | `block` `inline-block` `flex`    |
| width           | 宽度                                                                | ---        | `auto` `<Number>`                |
| height          | 高度                                                                | ---        | `auto` `<Number>`                |
| flex            | flex 值，目前只支持数字，固定宽度直接设置 width                     | ---        | `<Number>`                       |
| flexDirection   | flex 方向                                                           | row        | `row` `column`                   |
| margin          | 外边距，支持数组缩写例如 [10,20] [10,20,10,20]                      | 0          | `Array` `<Number>`               |
| marginLeft      | 外边距                                                              | 0          | `<Number>`                       |
| marginRight     | 外边距                                                              | 0          | `<Number>`                       |
| marginTop       | 外边距                                                              | 0          | `<Number>`                       |
| marginBottom    | 外边距                                                              | 0          | `<Number>`                       |
| padding         | 内边距，支持数组缩写例如 [10,20] [10,20,10,20]                      | 0          | `Array` `<Number>`               |
| paddingLeft     | 内边距                                                              | 0          | `<Number>`                       |
| paddingRight    | 内边距                                                              | 0          | `<Number>`                       |
| paddingTop      | 内边距                                                              | 0          | `<Number>`                       |
| paddingBottom   | 内边距                                                              | 0          | `<Number>`                       |
| backgroundColor | 背景色，设置为数组时，会转换为水平渐变                              | ---        | `String` `Array`                 |
| borderRadius    | 圆角，只要设置圆角会自动加上 overflow:hidden                        | 0          | `<Number>`                       |
| borderWidth     | 边框宽度，也可单独设置 borderTopWidth ...等单个边                   | 0          | `<Number>`                       |
| borderColor     | 边框颜色                                                            | ---        | `<String>`                       |
| borderStyle     | 边框样式，数组见 ctx.setLineDash() api                              | solid      | `solid` `<Array>`                |
| lineHeight      | 行高，默认为 1.4，手动设置只能设置像素值，如 36                     | 1.4        | `<Number>`                       |
| color           | 字体颜色                                                            | #000       | `<String>`                       |
| fontSize        | 字体大小                                                            | 14         | `<Number>`                       |
| textAlign       | 对齐方式                                                            | left       | `left` `center` `right`          |
| textIndent      | 首行缩紧                                                            | 0          | `<Number>`                       |
| verticalAlign   | 竖向对齐                                                            | middle     | `top` `middle` `bottom`          |
| justifyContent  | 主轴对齐                                                            | flex-start | `flex-start` `center` `flex-end` |
| alignItems      | 交叉轴对齐                                                          | flex-start | `flex-start` `center` `flex-end` |
| maxLine         | 最大行数，只能在 text 内使用，超出省略号显示                        | ---        | `<Number>`                       |
| whiteSpace      | 是否换行                                                            | normal     | `normal` `nowrap`                |
| overflow        | 超出是否显示                                                        | visible    | `visible` `hidden`               |
| shadowBlur      | 设置了阴影会自动加上 overflow:hidden;                               | 0          | `<Number>`                       |
| shadowColor     | 阴影颜色                                                            | ---        | `<String>`                       |
| shadowOffsetX   | 阴影水平偏移                                                        | ---        | `<Number>`                       |
| shadowOffsetY   | 阴影纵向偏移                                                        | ---        | `<Number>`                       |
| position        | 定位，绝对定位需要设置相对定位元素为 relative，否则根据顶层元素定位 | static     | `static` `absolute` `fixed`      |
| opacity         | 透明度 取值 0-1                                                     | ---        | `<Number>`                       |
| textDecoration  | 文字修饰                                                            | ---        | `<Array>`                        |

### 已知问题

- linear-gradient 必须在 scroll-view 视图内创建才生效 对于生成分享图场景不会有这个问题
- 微信小程序请使用 canvas.getContext() api 来创建，即同层渲染 api，否则在 ios 上 overflow 效果不生效，新老 api 不能混用
- ios 小程序 7.0.20 版本目前反馈 drawImage api 存在问题，微信问题
- Canvas.getImage() api 无法正确加载带有查询功能的图片 url，比如 https://xxx?w=100&h=100，这种目前可以通过先下载好图片，再放到 src 上
- 企业微信小程序同时加载多张图片，只能加载出来一张，是微信问题，目前解决方案为在图片 attrs 增加 `timeout`，可以延迟图片加载时机

## TodoList

- ~~支持 position~~
- ~~inline-block 换行以及 textAlign~~
- ~~通过栈实现属性继承~~
- ~~支持 flex-direction~~
- ~~box-shadow 待优化~~
- ~~兼容小程序 measuretext~~
- ~~兼容小程序 image~~
- ~~打包问题解决~~
- ~~scroll-view 嵌套~~ ~~translate 值继承~~
- 补充其他属性
- ~~image 支持 mode~~
- ~~发布 npm~~
- ~~max-width~~
- ~~vue 模版支持~~
- ~~scroll-view 点击区域判断优化~~
- ~~移除元素时移除事件~~
- ~~滚动优化~~
- ~~按需渲染~~
- zIndex 急急急！！！

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
