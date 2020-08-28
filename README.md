# 简介
使用render函数，在canvas中创建文档流，实现静态布局.
点击查看 [DEMO](https://gitjinfeiyang.github.io/easyFlow/example/)

- 支持文档流，参照web，无需设置x、y以及宽高
- 兼容小程序以及web，无第三方依赖
- 支持组件化，全局组件以及局部组件
- 支持事件

## 支持元素
- [x] view 基本元素，类似div
- [x] text 文本 支持自动换行以及超过省略等功能
- [x] image 图片 src mode支持aspectFit以及aspectFill，其他css特性同web
- [x] scroll-view 滚动容器，需要在样式里设置direction，并且设置具体尺寸 实验性功能

## Styles
属性使用像素的地方统一使用数字

- [x] display `block` `inline-block` `flex` text默认是inline的
- [x] width `auto` `100%` `Number` 这里盒模型使用border-box，不可修改
- [x] height
- [x] minWidth maxWidth minHeight maxHeight 如果设置了具体宽度高度不生效
- [x] margin marginLeft,marginRight,marginTop,marginBottom margin支持数组缩写例如 [10,20] [10,20,10,20]
- [x] paddingLeft,paddingRight,paddingTop,paddingBottom 同上
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
- [x] shadowColor  待优化
- [ ] shadowOffsetX
- [ ] shadowOffsetY
- [x] position `static` `absolute`


## Screenshot
![1](screenshot/01.png)


## Usage

### Basic
``` javascript
    import ef from 'easyflow'

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
    const node = ef.createElement((c) => {
      return c('view', { styles: { backgroundColor:'#000' } }, [
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

    ef.component('button',(opt,children,c) => button(c,children))

    const node = ef.createElement((c) => {
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
* 发布npm
* ~~max-width~~
* vue模版支持