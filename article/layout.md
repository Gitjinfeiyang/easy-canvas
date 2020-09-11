> 上一篇 [在canvas中使用文档流布局，快速实现朋友圈分享图生成](https://juejin.im/post/6866334040513839112)

## 背景

上一篇中介绍了easyCanvas的简单使用，本篇将介绍实现思路，


>  [DEMO](https://gitjinfeiyang.github.io/easy-canvas/example/)

> 项目地址[easy-canvas](https://github.com/Gitjinfeiyang/easy-canvas)

> vue组件版本[vue-easy-canvas](https://github.com/Gitjinfeiyang/vue-easy-canvas)

## 设计

![浏览器渲染html](https://user-gold-cdn.xitu.io/2020/3/6/170af501e710ce67?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

首先贴一下浏览器渲染html的图，easyCanvas类似，内部会根据render函数生成一棵element树，这里相当于直接生成了dom树，layer对这棵树进行样式合并、继承等操作，然后根据样式初始化宽度高度，再计算绘制的位置，布局完成后交给render进行绘制。EventManager类负责接收用户操作，寻找到对应的element对其进行修改，随后更新在视图中。

## 样式预处理
在进行布局之前，首先需要对样式进行一些预处理，这个过程类似于css tree合并
1. 添加默认样式
有一些样式用户可能没有写，但是大家约定就是这样的，比如textAlign，这一步会填充默认样式
2. 获取父级样式
一些样式属性需要从父级继承，比如fontSize color等
3. 补全样式
用户可能会有一些简写比如padding，内部需要将这个属性转换成paddingLeft等单个属性。另外，像`width:100%`这种属性也会进行解析。

贴部分代码：

``` javascript
    const renderStyles = { ...this.styles }
    const parentWidth = this._getContainerLayout().contentWidth
    const parentHeight = this._getContainerLayout().contentHeight

    if (isAuto(renderStyles.width)) {
      renderStyles.width = 0
    } else if (isOuter(renderStyles.width)) {
      renderStyles.width = parseOuter(renderStyles.width) * parentWidth
    }

    if (isAuto(renderStyles.height)) {
      renderStyles.height = 0
    } else if (isOuter(renderStyles.height)) {
      renderStyles.height = parseOuter(renderStyles.height) * parentHeight
    }

    // 初始化contentWidth
    renderStyles.contentWidth = renderStyles.width - renderStyles.paddingLeft - renderStyles.paddingRight - renderStyles.marginLeft - renderStyles.marginRight - this._getTotalBorderWidth(renderStyles)
    renderStyles.contentHeight = renderStyles.height - renderStyles.paddingTop - renderStyles.paddingBottom - renderStyles.marginTop - renderStyles.marginBottom - this._getTotalBorderHeight(renderStyles)
    this.renderStyles = renderStyles
```

*这一步对遍历方式没有特殊要求，只需要从父级向子级遍历*

仔细观察会发现，我们的元素就是一个一个的方块，有着不同的大小，然后按照一定的顺序排列在不同的地方。所以归纳起来我们只需要计算元素的尺寸和位置，就可以对其进行布局。那么问题来了，是先计算尺寸还是先计算位置呢，仔细思考一下发现是先计算尺寸,因为文档流布局下一个元素的位置是受上一个元素的影响的，而尺寸不受位置影响。

## 计算尺寸
上一步中我们的width和height已经经过一层处理，到这一步要么是`auto`要么已经是数字。

那么我们开始遍历。。。额问题来了，这里用什么遍历方式呢，是父级往子级？深度优先or广度优先？

![广度优先遍历](https://segmentfault.com/img/bVbqEv0?w=407&h=392)

答案是广度优先，因为对于尺寸来说，auto是受子元素的尺寸影响的，所以需要先计算子元素，要保证计算父级宽高时，子元素已经全部计算完毕。并且需要保证先计算左边的子元素，因为对于inline-block元素，我们需要计算换行。

考虑完后就可以开干了，对每一个元素进行宽高计算，这里自动宽高有两种情况，一种是容器元素，如view，它的宽高需要遍历所有子元素的宽高来计算，另一种则是text和image这种，他们的宽高通过计算自身的尺寸来计算，text需要考虑到换行最大行数等问题，这里就不展开，社区也有很多文章。

比较特殊的是inline-block以及flex元素，这里引入了line以及flexBox的概念，每一个inline-block元素计算宽高时会绑定到line上，line会记录父元素的宽度，如果line的宽度足够，则会绑定到上一个inline-block元素的line，否则会绑定到一个新的line，flexBox类似。

在遍历子元素宽高时也需要判断，如果是inline-block则只用考虑line的尺寸，以及过滤掉不在文档流的元素。

``` javascript
    if (isAuto(width) || isAuto(height)) {
      // 计算高度，不同元素有不同实现，text和image是根据内容计算，容器则根据子元素计算
      const layout = this._measureLayout()
      // 初始化宽度高度
      if (isAuto(width)) {
        this.renderStyles.contentWidth = layout.width
      }

      if (isAuto(height)) {
        // 不填就是auto
        this.renderStyles.contentHeight = layout.height
      }
    }

    this._refreshLayoutWithContent()

    if (this._InFlexBox()) {
      this.line.refreshWidthHeight(this)
    } else if (display === STYLES.DISPLAY.INLINE_BLOCK) {
      // 如果是inline-block  这里仅计算高度
      this._bindLine()
    }
```

## 计算位置
到这一步，每个元素的宽高都已经初始化好了，我们需要从父级往子级遍历初始化元素位置，子元素将自身高度累加，结合line判断是否换行，
这一步比较简单，贴上简单代码。
``` javascript
    if (this.renderStyles.display === STYLES.DISPLAY.INLINE_BLOCK) {
      // inline-block到line里计算
      this.line.refreshElementPosition(this)
    } else {
      this.x = parentContentX
      this.y = this._getPreLayout().y + this._getPreLayout().height
    }
```

## 绘制
到这里已经布局完毕了，每一个element都有了宽高以及位置，可以进行绘制了，将element树导入到render中进行绘制，这里需要进行深度优先遍历，下面会解释。

绘制分为几个步骤：
1. 绘制阴影 因为阴影是在外面的需要在裁剪之前绘制
2. 绘制裁剪以及边框
3. 绘制背景
4. 绘制内容，如text和image

``` javascript
    walk(element, (element, callContinue, callNext) => {
      if (element.isVisible()) {
        // 可见的才渲染
        this.paint(element)
      } else {
        // 跳过整个子节点
        callNext()
        this._helpParentRestoreCtx(element)
      }
    })
```

对树进行遍历，每一个元素都重复上面的步骤。新的问题来了，我们一个元素进行了clip，后面的元素都看不见了，怎么办？可能第一时间想到的就是每次绘制都进行ctx.save()，绘制完成后执行ctx.restore()，但是这样的话，子元素就无法被父元素包住了，也就是无法实现`overflow:hidden`效果

我们研究下这棵绘制树
![深度优先遍历](https://segmentfault.com/img/bVbqEoQ?w=432&h=391)

*overflow效果是对子元素生效的，也就是元素1的clip需要应用到下面所有元素的绘制，元素2的clip要应用到元素10绘制完成后，并且这也是我们需要深度优先遍历的原因。*

并且我们需要知道ctx的状态以栈的方式保存，每次save()会将当前状态压入栈，每次restore()会弹出，使用上一次的状态。

所以我们在绘制一个元素后，不能马上释放ctx栈，需要根据是否有子元素以及是否是树的末梢来判断是否闭合ctx栈,源码如下：
``` javascript
    // 第一步判断没有子元素，绘制完成即restore 有子元素需要子元素全部绘制完毕再restore
    // 这一次是restore自身的
    if (!element.hasChildren()) {
      this.getCtx().restore()
    }

    if ((element.isVisible() && !isEndNode(element)) || (!element.isVisible() && element.next)) return

    // restore父级以上
    let cur = element.parent
    while (cur && !cur.next) {
      // 如果父级也是同级最后一个，闭合上一个
      this.getCtx().restore()
      cur = cur.parent
    }

    // restore第一层父级
    if (cur && cur.next) {
      this.getCtx().restore()
    }
```
根据代码，我们在回顾上面的树：

下面的元素数字以上面深度优先遍历图为准

绘制元素1，save

...

绘制元素5，判断是末梢元素，restore 5，判断到4不是最后一个，restore 4

...

绘制7，判断是末梢，restore 7，判断6不是最后一个，restore 6

绘制8，判断是末梢，restore 8，判断8是最后一个，restore 2，判断2不是最后一个，restore 8

...

这样逐步释放ctx栈，实现对子元素应用父元素的clip

到这里已经能正常绘制出布局效果了，当然中间是有很多曲折的，在重构之前使用的都是深度遍历导致性能非常低，后面布局代码完整重新设计了一遍。



## 事件
主要是指用户操作的一些事件比如click等

我们都知道浏览器事件是有捕获和冒泡的过程的，还是以上面深度遍历图为例，点击元素2，依次会被1、2捕获到，然后又回通过2、1冒泡回来，并且元素9不会感知。

常规的事件管理会将回调方法都添加到一个数组中，触发后会遍历判断是否触发，但是这不能实现我们的需求。

正如我们看到的，视图可以抽象成一棵树，想想看，视图的事件是不是也可以抽象成一棵树呢，元素的事件按照元素在视图里的层级构造成一棵事件树，每次用户点击视图，从树顶端向下遍历，如果在当前元素内则执行捕获方法，并且向子节点继续遍历，直至该节点下没有子节点，而冒泡的实现则只需要在遍历时将命中的回调压入一个栈中，到达最后一个元素时依次弹出执行。

下面是相关代码：

``` javascript
// 构造事件树
addCallback(callback, element, tree, list, isCapture) {
    let parent = null
    let node = null
    // 寻找应该挂载的父节点
    for (let i = list.length - 1; i >= 0; i--) {
      if (element === list[i].element) {
        // 当前
        parent = list[i - 1]
        node = list[i]
        break
      }
      walkParent(element, (p, callBreak) => {
        if (p === list[i].element) {
          parent = list[i]
          callBreak()
        }
      })
      if (parent) {
        break
      }
    }

    // 如果不存在同样的元素节点
    if (!node) {
      node = new Callback(element, callback)
    }

    // 添加回调方法
    if (isCapture) {
      node.addCapture(callback)
    } else {
      node.addCallback(callback)
    }

    // 挂载节点
    if (parent) {
      parent.appendChild(node)
    } else {
      tree.appendChild(node)
    }

    // 缓存到list
    list.push(node)
  }

  // Callback继承于TreeNode，基于element的层级构造一棵回调树
  class Callback extends TreeNode {
    constructor(element) {
      super()
      this.element = element
      this.callbackList = []
      this.captureList = []
    }

    addCallback(callback) {
      this.callbackList.push(callback)
    }

    addCapture(callback) {
      this.captureList.push(callback)
    }

    runCallback(params) {
      this.callbackList.forEach(item => item(params))
    }

    runCapture(params) {
      this.captureList.forEach(item => item(params))
    }

  }

```

``` javascript
    // 执行捕获以及冒泡
    walk(tree, (node, callContinue, callBreak) => {
      if (node.element) {
        if (this.isPointInElement(e.relativeX, e.relativeY, node.element)) {
          node.runCapture(e)
          callbackList.unshift(node)
        } else {
          // 跳过当前子节点，遍历相邻节点
          callContinue()
        }
      }
    })

    /**
     * 执行on回调，从子到父
     */
    for (let i = 0; i < callbackList.length; i++) {
      if (!e.currentTarget) e.currentTarget = callbackList[i].element
      callbackList[i].runCallback(e)
      if (e.cancelBubble) break
    }
```

有了事件的支持，我们就可以来实现一个scroll-view了，实现的基本思路是scroll-view实例返回一个外层view，固定宽高，而内部view则根据内容撑开，初始化时内部向事件管理器注册事件，通过控制绘制translate值来实现滚动。

这个过程是很顺畅的，但当我点击scroll-view中的元素时发现问题了，由于scroll-view进行了translate转换，点击到的坐标点跟实际的元素其实不是重合的，也就是说点击到scroll-view里面的点也需要做translate转换，才能正确判断内部元素的位置。回顾事件捕获以及冒泡的过程，我们可以注册一个scroll-view的捕获事件，内部将坐标值根据滚动值进行转换。代码如下：

``` javascript
    this.getLayer().eventManager.onClick((e) => {
        e.relativeY -= this.currentScrollY
        e.relativeX -= this.currentScrollX
    }, this._scrollView, true) // 最后一个参数控制是捕获还是冒泡
```

终于可以愉快的滚动起来了～～

## 添加删除节点
添加删除节点实现很简单，只需要将节点添加到树后，对相应需要变化的节点进行重排重绘，直接贴代码：

``` javascript
  // 添加在最后
  appendChild(element) {
    super.appendChild(element)
    this.getLayer().onElementChange(element)
    return element
  }
```
## 性能
下面是使用easyCanvas渲染一个长表格的示例：

[渲染1000行数据，10000个元素](https://gitjinfeiyang.github.io/easy-canvas/example/table.html)

在第一版的设计中，有很多的性能问题，所以后面布局的代码被完全重构，在第二次的设计中保证了除了主循环外内部不会再进行循环计算，减少不必要的布局计算。

对于操作者真正能感知到的还是scroll-view在滚动的时候的流畅程度。在原生平台上，会有一些只绘制可视部分元素的实现，即虚拟列表，能大大提高绘制性能，在easyCanvas也有类似的实现。

如果scroll-view开启`renderOnDemand`，在第一次绘制之前会检查所以第一级子元素的可视情况，render会根据可视情况决定是否绘制该节点以及子节点。当scroll-view滚动后，会再次检查可视情况，这里有一个优化点是，内部会记录可视的边界index，每次只会计算边界前后的节点，避免每次遍历所有子节点。

后面还有个想法，如果标记了节点为静态节点，则在第一次绘制后保存节点的ImageData，后面只需要putImageData，不需要绘制子节点，但是试着实现了一下有一些问题，目前的性能也还够用，后面慢慢研究～～

## 感谢阅读