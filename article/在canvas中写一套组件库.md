> 完善中 [组件演示地址](https://gitjinfeiyang.github.io/easy-canvas/example/ui.html)
>
> [项目演示地址](https://gitjinfeiyang.github.io/easy-canvas/example/index.html)
>
> [项目地址 easyCanvas](https://github.com/Gitjinfeiyang/easy-canvas)
>
> TAGS: 朋友圈分享图、canvas图片、小程序分享图、canvas dom

## 介绍

其实在标题上本来我是不想写是用canvas生成的，想让大家在看过demo后再知道，这样一开始你们肯定想，就这？就这？然后再 卧槽。

看到这，观众老爷们可能要说了：同志你辛苦了，但是这有什么毛用吗？当然了，这个组件库也不是纯苦力用ctx画出来的，我写这个演示是为了测试easyCanvas的能力以及稳定性，还有能作为示例介绍一下。

这个页面用了[easyCanvas](https://github.com/Gitjinfeiyang/easy-canvas)这个库，关于这个库，可以看我前面几篇。

> [在canvas中使用文档流布局，快速实现朋友圈分享图生成](https://juejin.im/post/6866334040513839112)

> [easyCanvas实现分析](https://juejin.im/post/6871124987550531592)

## 代码

### 安装
推荐使用npm安装
``` bash
npm install easy-canvas-layout --save
```
也可以直接引用dist内打包好的包

### 基本使用
easyCanvas的基本语法类似render函数

``` javascript
    // 创建node
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
```

基础标签提供了 view、text、image、scroll-view，样式属性基本常用的都支持，另外还支持绑定事件、操作修改元素。使用easyCanvas可以很快速的在canvas中生成具有交互的布局，api是前端开发都能快速熟悉的，几乎0学习成本。

### 支持元素
- [x] `view` 基本元素，类似div
- [x] `text` 文本 支持自动换行以及超过省略等功能,目前text实现为inline-block
- [x] `image` 图片 `src` `mode`支持aspectFit以及aspectFill，其他css特性同web 支持`load`事件监听图片加载并且绘制完成
- [x] `scroll-view` 滚动容器，需要在样式里设置`direction` 支持x、y、xy，并且设置具体尺寸 设置`renderOnDemand`只绘制可见部分

### 支持属性
属性使用像素的地方统一使用数字

- [x] `display` block | inline-block | flex, text默认是inline-block的
- [x] `width` auto 100% Number 这里盒模型使用border-box，不可修改
- [x] `height`
- [x] `flex` flex不支持auto，固定宽度直接使用width
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
- [x] `whiteSpace` normal nowrap 控制换行，不能控制字体，只能控制inline-block
- [x] `overflow` hidden 如果添加了圆角，会自动加上 hidden
- [x] `flexDirection`
- [x] `borderStyle` dash Array 详见ctx.setLineDash()
- [x] `shadowBlur` 设置了阴影会自动加上 overflow:hidden;
- [x] `shadowColor`
- [x] `shadowOffsetX`
- [x] `shadowOffsetY`
- [x] `position` `static` `absolute`
- [x] `opacity` `Number`

例如这个组件库里的button组件

正常来说我们写一个按钮
``` css
.button{
    display:inline-block;
    background:green;
    color:#fff;
    font-size:14px;
    padding:4px 12px;
    text-align:center;
    border-radius:4px;
}
```

在easyCanvas中的写法
``` javascript
function Button(c){
    return c('view',{
        styles:{
            display:'inline-block',
            backgroundColor:'green',
            color:'#fff',
            fontSize:14,
            padding:[4,12],
            textAlign:'center',
            borderRadius:4
        }
    },[
        c('text',{},'按钮')
    ])
}
```

是不是觉得很熟悉很简单，让我们来写一个可以接受参数的按钮
``` javascript
function Button(c, { attrs, styles, on }, content) {
  const size = attrs.size || 'medium'
  const nums = SIZE[size]
  let _styles = Object.assign({
    backgroundColor: THEME[attrs.type.toUpperCase() || 'info'],
    display: 'inline-block',
    borderRadius: 2,
    color: '#fff',
    lineHeight: nums.lineHeight,
    padding: nums.padding,
    fontSize: nums.fontSize
  }, styles || {})

  if (attrs.plain) {
    _styles.color = THEME[attrs.type.toUpperCase()]
    _styles.borderWidth = 0.5
    _styles.borderColor = THEME[attrs.type.toUpperCase()]
    _styles.backgroundColor = PLAIN_THEME[attrs.type.toUpperCase() || 'info']
  }

  if (attrs.round) {
    _styles.borderRadius = nums.borderRadius
  }

  return c('view', {
    attrs: Object.assign({

    }, attrs || {}),
    styles: _styles,
    on: on || {},
  }, typeof content === 'string' ? [c('text', {}, content)] : content)
}
```
这样在使用的地方可以传入参数，像这样，也就是大家在demo里看到的
``` javascript
Button(c, {
    attrs: { type: 'primary', plain: true },
}, '主要按钮'),
Button(c, {
    attrs: { type: 'success', plain: true },
}, '成功按钮'),
Button(c, {
    attrs: { type: 'info', plain: true },
}, '信息按钮'),
Button(c, {
    attrs: { type: 'warning', plain: true },
}, '警告按钮'),
Button(c, {
    attrs: { type: 'error', plain: true },
}, '危险按钮'),
```

并且，easyCanvas支持注册全局组件，方便调用，其他参数请看项目使用文档
``` javascript
// 注册全局组件
easyCanvas.component('button',Button)

// 使用全局组件
function Page(c){
    return c('button',{
        attrs: { type: 'warning', plain: true },
    }, '警告按钮')
}
```

另外easyCanvas内置了事件管理器，可以支持类似web中的事件，从父级向子级执行捕获，子级再向父级冒泡。

首先需要让canvas元素接管事件
``` javascript

// canvas元素监听鼠标事件
canvas.ontouchstart = ontouchstart
canvas.ontouchmove = ontouchmove
canvas.ontouchend = ontouchend
canvas.onmousedown = ontouchstart
canvas.onmousemove = ontouchmove
canvas.onmouseup = ontouchend
canvas.onmousewheel = onmousewheel


// 将事件交给事件管理器接管 需要注意的是，这里的坐标是相对于canvas元素的坐标，而不是屏幕
function ontouchstart(e) {
  e.preventDefault()
  layer.eventManager.touchstart(e.pageX || e.touches[0].pageX || 0, e.pageY || e.touches[0].pageY || 0)
}
function ontouchmove(e) {
  e.preventDefault()
  layer.eventManager.touchmove(e.pageX || e.touches[0].pageX || 0, e.pageY || e.touches[0].pageY || 0)
}
function ontouchend(e) {
  e.preventDefault()
  layer.eventManager.touchend(
    e.pageX || e.changedTouches[0].pageX || 0,
    e.pageY || e.changedTouches[0].pageY || 0
  )
}
function onClick(e) {
  e.preventDefault()
  layer.eventManager.click(e.pageX, e.pageY)
}
function onmousewheel(e){
  e.preventDefault()
  layer.eventManager.mousewheel(e.pageX,e.pageY,-e.deltaX,-e.deltaY)
}
```

接管到事件后，我们就可以在元素内监听事件了
``` javascript
c('button',{
    id:'测试按钮',
    on:{
        click(e){
            // 阻止冒泡到父级
            e.stopPropagation()
            alert(e.currentTarget.id) // alert 测试按钮
        }
    }
},'点我点我')
```

目前支持的鼠标事件有： click、touchstart、touchmove、touchend、mousewheel。

图片支持 load、error事件

另外，支持在layer中监听所有图片请求完成，比如我们需要在图片加载完成，reflow布局并且重新渲染后立即生成图片：
``` javascript
easyCanvas.createLayer(ctx, {
    dpr,
    width,
    height,
    lifecycle: {
        onEffectSuccess(res) {
            // 所有图片加载成功
        },
        onEffectFail(res) {
            // 有图片加载失败
        },
        onEffectComplete(){
            // 只要加载结束就会调用
            // 生成图片...
        }
    }
})
```

easyCanvas还支持在初始渲染后对元素进行操作
``` javascript
// 获取元素 key为attrs中定义的
el.getElementBy(key,value)

// 增加元素
el.appendChild(element)
el.prependChild(element)
el.append(element) // 加在当前元素后
el.prepend(element)

// 删除元素
el.removeChild(element)
el.remove()

// 修改样式 内部会根据样式判断是否需要reflow还是仅仅repaint就足够
el.setStyles(styles)
```

demo中点击左侧右侧定位代码
``` javascript
c('view', {
    on: {
        click(e) {
            const target = layer.getElementBy('id', item.en)[0]
            if (!target || e.currentTarget === lastSelect) return
            const scrollView = layer.getElementBy('id', 'main')[1]
            scrollView.scrollTo({ y: target.y })
            e.currentTarget.setStyles({ backgroundColor: '#f1f1f1', color: '#333' })
            if (lastSelect) lastSelect.setStyles({ backgroundColor: '' })
            lastSelect = e.currentTarget
        }
    },
    styles: {
        padding: 10,
        color: '#666',
        fontSize: 16
    }
}, [c('text', {}, item.en + ' ' + item.zh)]))
```

## 总结
对于生成分享图这个需求，目前已有的一些库感觉还是不够完善，因此有想法写了这个库，中间重构了两次，在重新思考的过程中，觉得完全可以扩展的更强一些，将这件事情在能力范围做的再彻底一些。

如果用ctx，正常来说要开发好几天的布局，用easyCanvas分分钟就可以开发好，并且ctx画的不好维护，画好之后视觉需要调整一下，又得费很大的精力。

下阶段：
1. flex布局支持auto，目前只支持像素以及比例，对于一些场景，自动宽度还是很有必要的。
2. 绝对布局支持zIndex，目前只能通过人为控制顺序，需要找一个健壮的实现方案。
3. 性能优化。 虽然目前已经做了大量优化，比如按需渲染，局部重流，设计上的优化，但是还是不够，如果同屏渲染元素太多还是帧率不够，限制了这个库的可能性，后面正在思考局部重绘以及元素绘制缓存。局部重绘难点在于绝对布局的元素判断，另外缓存也需要考虑很多情况清缓存问题等等。





