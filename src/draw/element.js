import STYLES from './constants'
import pxUtil from './px'
import { isExact } from './utils'

/**
 * inline-block block inline flex
 *
 * x
 * y
 * width
 * height
 * position
 *
 *
 */




export default class Element {
  constructor(options, children) {
    this.options = options
    this.children = children
    this.styles = null
    this.parent = null
    this.renderStyles = null
    this.x = 0
    this.y = 0
    this.pre = null
    this.next = null
    this.render = null
    this.root = null
    this.container = null
    this.init()
  }

  init() {
    this._initStyles()
  }

  getRender() {
    return this.root.render
  }

  _restore(callback) {
    this.ctx.save()
    callback()
    this.ctx.restore()
  }

  _path(callback) {
    this.ctx.beginPath()
    callback()
    this.ctx.closePath()
  }

  _initStyles() {
    this.styles = Object.assign({}, this._getDefaultStyles(), this.options.styles || {})

    this._completeStyles()

    this.renderStyles = { ...this.styles }
  }

  _completeStyles() {
    this._completeFlex()

    this._completeWidth()

    this._completeBorder()
  }

  /**
   * borderwidth到各个边
   */
  _completeBorder() {
    let { borderWidth, borderLeftWidth, borderRightWidth, borderBottomWidth, borderTopWidth } = this.styles
    if (!borderWidth) {
      this.styles.borderWidth = 0
      borderWidth = 0
    }
    if (!borderLeftWidth) {
      this.styles.borderLeftWidth = borderWidth
    }
    if (!borderRightWidth) {
      this.styles.borderRightWidth = borderWidth
    }
    if (!borderBottomWidth) {
      this.styles.borderBottomWidth = borderWidth
    }
    if (!borderTopWidth) {
      this.styles.borderTopWidth = borderWidth
    }
  }

  _completeWidth() {
    if (!this.styles.width && !this.styles.flex) {
      if (this.styles.display === STYLES.DISPLAY.INLINE_BLOCK) {
        this.styles.width = STYLES.WIDTH.AUTO
      } else if (this.styles.display === STYLES.DISPLAY.BLOCK || this.styles.display === STYLES.DISPLAY.FLEX) {
        this.styles.width = STYLES.WIDTH.OUTER
      } else {

      }
    }
  }

  _completeFlex() {
    if (this.parent && this.parent.styles.display === STYLES.DISPLAY.FLEX) {
      // flex布局内 width 和flex需要有一个
      if (!this.styles.width && !this.styles.flex) {
        this.styles.flex = 1
      }
    }
  }

  _getDefaultStyles() {
    return STYLES.DEFAULT_STYLES
  }

  generateRenderFunc() {
    this.root = this
    let list = this._generateElementFunc()
    return Array.isArray(list) ? list : [list]
  }

  _generateElementFunc() {
    if (this.hasChildren()) {
      const childrenRender = this._getChildren().map((child, index) => {
        // 设置parent
        child._setParent(this)
        // 设置了上一个兄弟节点
        child._setSibling(this._getChildren()[index - 1], this._getChildren()[index + 1])
        return child._generateElementFunc()
      }).reduce((sum, val) => [...sum, ...val])
      return [this._generateRender(), ...childrenRender]
    } else {
      return [this._generateRender()]
    }
  }

  hasChildren() {
    return Array.isArray(this.children) && this.children.length ? true : false
  }

  _getChildren() {
    return this.children
  }

  _setParent(element) {
    this.parent = element
    this.root = element.root
  }

  _setSibling(pre, next) {
    this.pre = pre
    this.next = next
  }

  _generateRender() {
    return (ctx) => {
      this.ctx = ctx
      return this
    }
  }

  /**
   * 实现文档流 需要知道上一个兄弟节点
   */
  _reflow() {
    // this._initClearWidthHeight()

    // 初始化尺寸 位置
    // 到这里renderstyles里的尺寸肯定是数字

    this._walkParentLayout()

    this._initStartingPoint()

    // 到这里 x ，y 肯定是数字

    this._calcContentLayout()
  }

  // paint队列执行
  _repaint() {
    this._drawBackground()

    this._drawContent()
    this._drawBox()

  }

  // 栈
  _afterPaint() {

  }

  _drawBox() {

  }

  _drawContent() {

  }

  _drawBackground() {

  }

  /**
   * 初始化宽度高度 ,顺序为 父到子，前往后
   * 1、初始化明确的宽度，100% 和数字
   * 2、后面就只剩下auto需要子元素去处理
   * 3、初始化绘制的起点，包括padding margin
   */
  _initLayout() {

    this._initClearWidthHeight()

    // 到这里renderstyles里的尺寸肯定是数字

    this._walkParentLayout()

    this._initStartingPoint()

    // 到这里 x ，y 肯定是数字

    this._calcContentLayout()
    // this._initStartingPoint()

  }

  // 初始化起点
  _initStartingPoint() {
    // 初始化ctx位置
    if (this._needNewLine()) {

      // 另起一行
      this.x = this._getContainerLayout().contentX
      this.y = this._getPreLayout().y + this._getPreLayout().height
    } else {
      this.x = this._getPreLayout().x + this._getPreLayout().width
      this.y = this._getPreLayout().y
    }
  }

  /**
   * 这个方法现在是父级先算，子再算，浪费了资源
   */
  _walkParentLayout() {
    // 不是最后一个不计算,判断末梢节点
    if (this.next) return

    let curElement = this
    // 循环设置父级尺寸
    while (curElement.parent) {
      // 将父级宽度初始化
      // 这里应该通知父级改，先直接改了吧
      if (curElement.parent.styles.width === STYLES.WIDTH.AUTO || curElement.parent.styles.height === STYLES.WIDTH.AUTO) {
        curElement.parent._calcLayoutWithChildren()
      } else {
        // 这里应该宽度高度分开循环
        break
      }
      curElement = curElement.parent
    }
  }

  // 将明确设置的初始化，如果是auto，先计算自身宽度，再等子元素计算
  _initClearWidthHeight() {
    const { width, height, display, flex, marginLeft, marginRight, marginTop, marginBottom } = this.styles
    const layout = this._measureLayout()

    // 初始化宽度高度
    if (width === STYLES.WIDTH.OUTER) {
      // 不填默认当100%
      this.renderStyles.width = this._getContainerLayout().contentWidth
    } else if (width === STYLES.WIDTH.AUTO) {
      //  否则先计算自身
      this.renderStyles.width = layout.width
    } else if (flex && this.parent && this.parent.renderStyles.display === STYLES.DISPLAY.FLEX) {
      this.renderStyles.width = this._getFlexWidth()
    } else if (isExact(width)) {
      this.renderStyles.width = width + marginLeft + marginRight
    }

    if (height === STYLES.WIDTH.OUTER) {
      // 不填就是auto
      this.renderStyles.height = this._getContainerLayout().contentHeight
    } else if (height === STYLES.WIDTH.AUTO) {
      this.renderStyles.height = layout.height
    } else if (isExact(height)) {
      this.renderStyles.height = height + marginTop + marginBottom
    }

    // 处理borderWidth与content重叠,这里实现的是border重叠与margin的内侧
    this.renderStyles.marginTop += this.renderStyles.borderTopWidth
    this.renderStyles.marginBottom += this.renderStyles.borderBottomWidth
    this.renderStyles.marginLeft += this.renderStyles.borderLeftWidth
    this.renderStyles.marginRight += this.renderStyles.borderRightWidth
  }

  // 根据子元素计算宽高
  _calcLayoutWithChildren() {
    // 到这一步默认没有inline元素，因为inline元素内不允许其他element
    const { width, height } = this.styles
    if (width === STYLES.WIDTH.AUTO) {
      this.renderStyles.contentWidth = this._getMaxChildrenWidth()
    }
    if (height === STYLES.WIDTH.AUTO) {
      this.renderStyles.contentHeight = this._getChildrenHeightSum()
    }
    this._calcLayoutWithContent()
  }

  _calcLayoutWithContent() {
    this.renderStyles.height = this.renderStyles.contentHeight + this.renderStyles.paddingTop + this.renderStyles.paddingBottom + this.renderStyles.marginTop + this.renderStyles.marginBottom
    this.renderStyles.width = this.renderStyles.contentWidth + this.renderStyles.paddingLeft + this.renderStyles.paddingRight + this.renderStyles.marginLeft + this.renderStyles.marginRight
  }

  // 宽高计算完后，初始化content-box宽度
  _calcContentLayout() {
    const { width, height } = this.styles
    const contentLayout = getContentLayout(this)
    // if (width !== STYLES.WIDTH.AUTO) {
    this.renderStyles.contentWidth = contentLayout.contentWidth
    // }
    // if (height !== STYLES.WIDTH.AUTO) {
    this.renderStyles.contentHeight = contentLayout.contentHeight
    // }
    this.contentX = contentLayout.contentX
    this.contentY = contentLayout.contentY

    // this._textAlign('right')
  }

  _getMaxChildrenWidth() {
    // 需要考虑原本的宽度
    let max = 0
    let tempMax = max
    this.children.forEach(child => {
      if (child._needNewLine()) {
        // 如果是新起一行，重新计算
        tempMax = 0
      }
      tempMax += child.renderStyles.width
      if (tempMax > max) {
        max = tempMax
      }
    })
    return max
  }

  _getFlexWidth() {
    const containerContentWidth = this._getContainerLayout().contentWidth
    let clearWidth = 0
    let totalFlexSum = 0
    this.parent._getChildren().forEach(item => {
      if (item.renderStyles.width > 0) {
        clearWidth += item.renderStyles.width
      } else if (item.renderStyles.flex) {
        totalFlexSum += item.renderStyles.flex
      }
    })
    return (containerContentWidth - clearWidth) * (this.renderStyles.flex / totalFlexSum)
  }

  _getChildrenHeightSum() {
    // todo 没有考虑inline-block
    let complete = true
    let lineHeight = 0
    const heightArr = []
    this.children.forEach(child => {
      // 如果还有没计算完成的，这里可以去掉了，全面通过是否有下一个元素判断好了
      if (!typeof child.renderStyles.height === 'number') {
        complete = false
      }
      // 如果是第一个元素需要纳入计算
      if (child._needNewLine()) {
        // 从一行到下一个新一行
        heightArr.push(lineHeight)
        lineHeight = child.renderStyles.height

      } else {
        // 如果是同一行，取最大的
        if (child.renderStyles.height > lineHeight) {
          lineHeight = child.renderStyles.height
        }
      }

      if (!child.next) {
        // 如果没有下一个了
        heightArr.push(lineHeight)
        lineHeight = 0
      }
    })

    return complete ? heightArr.reduce((sum, val) => sum + (val >= 0 ? val : 0)) : this.renderStyles.height

  }

  _needNewLine() {
    const { display } = this.renderStyles
    // flex容器内
    if (this.parent && this.parent.renderStyles.display === STYLES.DISPLAY.FLEX && this.pre) {
      return false
    }

    // block等
    if (display === STYLES.DISPLAY.BLOCK || display === STYLES.DISPLAY.FLEX) {
      return true
    }

    if (this.pre) {
      let { width } = this.renderStyles
      if (width === STYLES.WIDTH.AUTO) width = 0
      const { display, width: preWidth } = this.pre.renderStyles
      const { width: containerWidth, x: containerX } = this._getContainerLayout()
      if (display === STYLES.DISPLAY.BLOCK || display === STYLES.DISPLAY.FLEX) {
        return true
      } else if ((preWidth + this.pre.x + width) >= (containerX + containerWidth)) {
        // 这里将当前宽度等于上一个的宽度了 因为这里宽度还是0，暂时还没有好的解决方案
        // 如果inlineblock顶到右边，换行
        return true
      }

    } else {
      return true
    }

    return false

  }

  _getContainerLayout() {
    let container = this.parent
    if (this.styles.position === STYLES.POSITION.STATIC) {

    }
    if (!container) {
      // root
      container = {
        renderStyles: {
          width: this.container.width,
          height: this.container.height,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          marginLeft: 0,
          marginRight: 0,
          marginTop: 0,
          marginBottom: 0,
          contentWidth: this.container.width,
          contentHeight: this.container.height
        },
        x: 0,
        y: 0,
        contentX: 0,
        contentY: 0
      }
    }
    return {
      width: container.renderStyles.width,
      height: container.renderStyles.height,
      x: container.x,
      y: container.y,
      paddingTop: container.renderStyles.paddingTop,
      paddingBottom: container.renderStyles.paddingBottom,
      paddingLeft: container.renderStyles.paddingLeft,
      paddingRight: container.renderStyles.paddingRight,
      marginLeft: container.renderStyles.marginLeft,
      marginRight: container.renderStyles.marginRight,
      marginTop: container.renderStyles.marginTop,
      marginBottom: container.renderStyles.marginBottom,
      contentX: container.contentX,
      contentY: container.contentY,
      contentWidth: container.renderStyles.contentWidth,
      contentHeight: container.renderStyles.contentHeight
    }
  }

  _getPreLayout() {
    if (this.pre) {
      return {
        width: this.pre.renderStyles.width,
        height: this.pre.renderStyles.height,
        x: this.pre.x,
        y: this.pre.y
      }
    } else {
      return {
        width: 0,
        height: 0,
        x: this._getContainerLayout().contentX,
        y: this._getContainerLayout().contentY
      }
    }
  }

  _measureLayout() {
    return { width: 0, height: 0, x: 0, y: 0 }
  }

  // 原理 统一从左边往右移动
  _textAlign(direction) {
    let lineLast = null
    let children = null
    let lineDistance = 0
    let allowMove = true
    if (this.hasChildren()) {
      children = this._getChildren()
      lineLast = children[children.length - 1]
    } else {
      return
    }
    const refreshLine = (element) => {
      lineDistance = (this._getContainerLayout().contentX + this._getContainerLayout().contentWidth) - (element.renderStyles.x + element.renderStyles.width)
    }
    if (direction === 'right') {
      refreshLine(lineLast)
      for (let i = children.length - 1; i >= 0; i--) {

        if (children[i].renderStyles.display === STYLES.DISPLAY.INLINE || children[i].renderStyles.display === STYLES.DISPLAY.INLINE_BLOCK) {
          children[i].x -= lineDistance
          children[i].contentX -= lineDistance
        } else {
          allowMove = false
        }
        if (children[i]._needNewLine() && i > 0) {
          // 新起的一行
          allowMove = true
          lineLast = children[i - 1]
          refreshLine(lineLast)
        }
      }
    } else {

    }
  }

  _px(num) {
    // if (num && isExact(num)) {
    //   return num / this.root.container.dpr
    // }
    return num
  }


}

function getContentLayout(element) {
  let width = element.renderStyles.width
  let height = element.renderStyles.height
  if (width === STYLES.WIDTH.AUTO) width = 0
  if (height === STYLES.WIDTH.AUTO) height = 0
  return {
    contentWidth: width - element.renderStyles.paddingLeft - element.renderStyles.paddingRight - element.renderStyles.marginLeft - element.renderStyles.marginRight,
    contentHeight: height - element.renderStyles.paddingTop - element.renderStyles.paddingBottom - element.renderStyles.marginTop - element.renderStyles.marginBottom,
    contentX: element.x + element.renderStyles.paddingLeft + element.renderStyles.marginLeft,
    contentY: element.y + element.renderStyles.paddingTop + element.renderStyles.marginTop,
    width,
    height
  }
}
