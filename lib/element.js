import STYLES from './constants'
import pxUtil from './px'
import { isExact, walk, isOuter, parseOuter, walkParent, isEndNode } from './utils'

/**
 * Element类实现盒模型以及定位，不具备绘制
 * 其他类继承实现
 *
 */




export default class Element {
  constructor(options, children) {
    this.options = Object.assign({ attrs: {}, styles: {}, on: {} }, options)
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
    // this.init()
  }

  init() {
    this._initStyles()
    this.initEvent()
  }

  initEvent() {
    const { click } = this.options.on
    if (click) {
      const { click } = this.options.on
      this.getLayer().eventManager.onClick(click, this)
    }
  }

  removeEvent() {
    this.getLayer().eventManager.removeElement(this)
  }

  getLayer() {
    return this.root.layer
  }

  mount(layer) {
    layer.mountNode(this)
  }

  _restore(callback) {
    this.getCtx().save()
    callback()
    this.getCtx().restore()
  }

  _path(callback) {
    this.getCtx().beginPath()
    callback()
    this.getCtx().closePath()
  }

  _initStyles() {
    this.styles = Object.assign({}, this._getDefaultStyles(), this._getParentStyles(), this.options.styles || {})

    this._completeStyles()

    this.renderStyles = { ...this.styles }
  }

  /**
   * 需要继承的styles放在这里
   */
  _getParentStyles() {
    let { textAlign, lineHeight, fontSize, color, fontFamily, alignItems } = this.parent && this.parent.styles || {}
    let extendStyles = {}
    // if (textAlign) extendStyles.textAlign = textAlign
    if (lineHeight) extendStyles.lineHeight = lineHeight
    if (fontSize) extendStyles.fontSize = fontSize
    if (color) extendStyles.color = color
    if (fontFamily) extendStyles.fontFamily = fontFamily
    return extendStyles
  }

  _completeStyles() {
    this._completeFlex()

    this._completeWidth()

    this._completeBorder()

    this._completeFont()

  }

  _completeFont() {
    if (this.styles.fontSize && !this.styles.lineHeight) {
      this.styles.lineHeight = this.styles.fontSize * 1.4
    } else if (!this.styles.lineHeight) {
      this.styles.lineHeight = 14
    }
  }

  /**
   * borderwidth到各个边
   */
  _completeBorder() {
    let { borderWidth, borderLeftWidth, borderRightWidth, borderBottomWidth, borderTopWidth, borderRadius } = this.styles
    if (!borderWidth) {
      this.styles.borderWidth = 0
      borderWidth = 0
    }
    if (Array.isArray(borderWidth)) {
      this.styles.borderTopWidth = borderWidth[0]
      this.styles.borderRightWidth = borderWidth[1]
      this.styles.borderBottomWidth = borderWidth[2]
      this.styles.borderLeftWidth = borderWidth[3]
    } else {
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
    if (borderRadius) {
      this.styles.overflow = 'hidden'
    }
  }

  _completeWidth() {
    if (!this.styles.width && !this.styles.flex) {
      if (this.styles.display === STYLES.DISPLAY.INLINE_BLOCK || this.styles.display === STYLES.DISPLAY.INLINE || !this.isInFlow()) {
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

  /**
   * 获取入口
   */
  tree2List() {
    this.root = this
    let list = this._connectChildren()
    return Array.isArray(list) ? list : [list]
  }


  // 遍历全部的子节点
  _connectChildren() {
    if (this.hasChildren()) {
      const childrenRender = this._getChildren().map((child, index) => {
        // 设置parent
        child._setParent(this)
        // 设置了上一个兄弟节点
        child._setSibling(this._getChildren()[index - 1], this._getChildren()[index + 1])
        return child._connectChildren()
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
    return this.hasChildren() ? this.children : []
  }

  // 获取文档流中的子节点
  _getChildrenInFlow() {
    return this._getChildren().filter(item => item.isInFlow())
  }

  // 是否在文档流中
  isInFlow() {
    const { position, display } = this.styles
    return position !== STYLES.POSITION.ABSOLUTE && position !== STYLES.POSITION.FIXED
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
    return this
  }

  getCtx() {
    return this.root.layer.ctx
  }

  /**
   * 实现文档流 需要知道上一个兄弟节点
   */
  _reflow() {
    // this._initClearWidthHeight()

    // 初始化尺寸 位置
    // 到这里renderstyles里的尺寸肯定是数字
    this._initStartingPoint()


    this._walkParentLayout()

    // 到这里 x ，y 肯定是数字

    this._calcContentLayout()

    if (isEndNode(this)) {
      // 节点最后一个，可以通知parent
      walkParent(this, (parent, callbreak) => {
        // 优化 如果parent也是同级最后一个
        if (parent.next) callbreak()
        parent._patchInlineBlockAlign()
      })

    }


  }

  // paint队列执行
  _repaint() {
    this.getCtx().save()

    this._drawBox()

    this._drawBackground()

    this._drawContent()

  }

  // 栈
  _afterPaint() {
    // 这里通过this.ctx栈实现了overflow
    // 第一步判断没有子元素，绘制完成即restore 有子元素需要子元素全部绘制完毕再restore
    if (!this.hasChildren()) {
      this.getCtx().restore()
    }

    // 如果到了层级的最后一个 释放父级的stack
    if (isEndNode(this)) {
      // 首先释放第一层父级
      this.getCtx().restore()
      let cur = this.parent
      while (cur && !cur.next) {
        // 如果父级也是同级最后一个，再闭合上一个
        this.getCtx().restore()
        cur = cur.parent
      }
    }
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
    this._calcContentLayout()

    // 到这里renderstyles里的尺寸肯定是数字

    this._walkParentLayout()

    this._initStartingPoint()

    // 到这里 x ，y 肯定是数字

    // this._initStartingPoint()

  }

  // 初始化起点
  _initStartingPoint() {
    // 初始化ctx位置
    if (!this.isInFlow()) {
      // 不在文档流中
      const { top, bottom, right, left, width, height } = this.renderStyles
      let { contentX, contentY, contentWidth, contentHeight } = this._getContainerLayout()
      if (isExact(top)) {
        this.y = contentY + top
      } else if (isExact(bottom)) {
        this.y = contentY + contentHeight - bottom - height
      }

      if (isExact(left)) {
        this.x = contentX + left
      } else if (isExact(right)) {
        this.x = contentX + contentWidth - right - width
      }
    } else if (this._needNewLine()) {
      // 另起一行
      this.x = this._getContainerLayout().contentX
      this.y = this._getPreLayout().y + this._getPreLineLayout().height
    } else {
      this.x = this._getPreLayout().x + this._getPreLayout().width
      this.y = this._getPreLayout().y
    }

  }

  /**
   *
   */
  _walkParentLayout() {
    // 不是最后一个不计算,判断末梢节点
    if (this.next || this.hasChildren()) return
    // 不在文档流中不计算
    if (!this.isInFlow()) return

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
    if (flex && this.parent && this.parent.renderStyles.display === STYLES.DISPLAY.FLEX) {
      // flex布局处理
      this.renderStyles.width = this._getFlexWidth()
    } else if (isOuter(width)) {
      // 不填默认当100% 百分比处理
      this.renderStyles.width = this._getContainerLayout().contentWidth * parseOuter(width)
    } else if (width === STYLES.WIDTH.AUTO) {
      //  自动 先计算自身
      this.renderStyles.width = layout.width
    } else if (isExact(width)) {
      // 设置了具体的数值
      this.renderStyles.width = width + marginLeft + marginRight
    }

    if (isOuter(height)) {
      // 不填就是auto
      this.renderStyles.height = this._getContainerLayout().contentHeight * parseOuter(height)
    } else if (height === STYLES.WIDTH.AUTO) {
      this.renderStyles.height = layout.height
    } else if (isExact(height)) {
      this.renderStyles.height = height + marginTop + marginBottom
    }

    // 处理borderWidth与content重叠,这里实现的是border重叠与margin的内侧
    this.renderStyles.marginTop = this.styles.borderTopWidth + this.styles.marginTop
    this.renderStyles.marginBottom = this.styles.borderBottomWidth + this.styles.marginBottom
    this.renderStyles.marginLeft = this.styles.borderLeftWidth + this.styles.marginLeft
    this.renderStyles.marginRight = this.styles.borderRightWidth + this.styles.marginRight
  }

  // 根据子元素计算宽高
  _calcLayoutWithChildren() {
    // 到这一步默认没有inline元素，因为inline元素内不允许其他element
    const { width, height } = this.styles
    if (width === STYLES.WIDTH.AUTO) {
      this.renderStyles.contentWidth = this._calcContentWidthWidthChildren()
    }
    if (height === STYLES.WIDTH.AUTO) {
      this.renderStyles.contentHeight = this._calcContentHeightWidthChildren()
    }
    this._calcLayoutWithContent()
  }

  // 父元素根据子元素撑开content后，再计算width
  _calcLayoutWithContent() {
    this.renderStyles.height = this.renderStyles.contentHeight + this.renderStyles.paddingTop + this.renderStyles.paddingBottom + this.renderStyles.marginTop + this.renderStyles.marginBottom
    this.renderStyles.width = this.renderStyles.contentWidth + this.renderStyles.paddingLeft + this.renderStyles.paddingRight + this.renderStyles.marginLeft + this.renderStyles.marginRight
  }

  // 宽高计算完后，初始化content-box宽度 这里是自身初始化的，上面的是子元素触发父元素计算
  _calcContentLayout() {
    const contentLayout = getContentLayout(this)
    // if (width !== STYLES.WIDTH.AUTO) {
    this.renderStyles.contentWidth = contentLayout.contentWidth
    // }
    // if (height !== STYLES.WIDTH.AUTO) {
    this.renderStyles.contentHeight = contentLayout.contentHeight
    // }
    this.contentX = contentLayout.contentX
    this.contentY = contentLayout.contentY

    // this._pathTextAlign('right')
  }

  /**
   * 获取一行的宽度，撑开父元素
   */
  _calcContentWidthWidthChildren() {
    // 需要考虑原本的宽度
    let max = 0
    let tempMax = max
    this._getChildrenInFlow().forEach(child => {
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

  /**
   * 计算flex的宽度
   */
  _getFlexWidth() {
    if (!this.renderStyles.flex) return 0
    const containerContentWidth = this._getContainerLayout().contentWidth
    let clearWidth = 0
    let totalFlexSum = 0
    this.parent._getChildrenInFlow().forEach(item => {
      if (isExact(item.styles.width)) {
        clearWidth += item.styles.width
      } else if (item.renderStyles.flex) {
        totalFlexSum += item.renderStyles.flex
      }
    })
    return (containerContentWidth - clearWidth) * (this.renderStyles.flex / totalFlexSum)
  }

  /**
   * 计算子元素高度，撑开父元素
   */
  _calcContentHeightWidthChildren() {
    // todo 没有考虑inline-block
    let complete = true
    let lineHeight = 0
    const heightArr = []
    this._getChildrenInFlow().forEach(child => {
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

  /**
   * 是否需要新起一行
   */
  _needNewLine() {
    const { display } = this.renderStyles
    const { whiteSpace } = this.parent && this.parent.renderStyles || {}
    if (!this.pre) return true
    // flex容器内
    if (this.parent && this.parent.renderStyles.display === STYLES.DISPLAY.FLEX && this.pre && this.parent.renderStyles.flexDirection === STYLES.FLEX_DIRECTION.ROW) {
      return false
    }

    // block等
    if (display === STYLES.DISPLAY.BLOCK || display === STYLES.DISPLAY.FLEX) {
      return true
    }

    // 到这里都是inline-block或者inline了
    if (whiteSpace === 'nowrap') return false
    if (this.pre) {
      let { width } = this.renderStyles
      if (width === STYLES.WIDTH.AUTO) width = 0
      const { display, width: preWidth } = this.pre.renderStyles
      const { width: containerWidth, x: containerX } = this._getContainerLayout()
      if (display === STYLES.DISPLAY.BLOCK || display === STYLES.DISPLAY.FLEX) {
        return true
      } else if ((preWidth + this.pre.x + width) > (containerX + containerWidth)) {
        // 这里将当前宽度等于上一个的宽度了 因为这里宽度还是0，暂时还没有好的解决方案
        // 如果inlineblock顶到右边，换行
        return true
      }

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

  // 这里前一个节点必须在文档流中
  _getPreLayout() {
    let cur = this.pre
    while (cur && !cur.isInFlow()) {
      cur = cur.pre
    }
    // 如果没有前一个或者前面的都不在文档流中，获取容器的
    if (cur) {
      return {
        width: cur.renderStyles.width,
        height: cur.renderStyles.height,
        x: cur.x,
        y: cur.y
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

  _getPreLineLayout() {
    let cur = this.pre
    while (cur && !cur.isInFlow()) {
      cur = cur.pre
    }
    if (cur) {
      return {
        width: 0, // TODO
        height: getLineHeight(cur),
        x: this._getContainerLayout().contentX,
        y: cur.y
      }
    } else {
      return this._getPreLayout()
    }
  }


  // 计算自身的高度
  _measureLayout() {
    return { width: 0, height: 0, x: 0, y: 0 }
  }

  _px(num) {
    // if (num && isExact(num)) {
    //   return num / this.root.container.dpr
    // }
    return num
  }

  // 原理 统一从左边往右移动 必须在正常排列完成后再次进行
  _patchInlineBlockAlign() {
    const { textAlign, contentWidth, lineHeight } = this.renderStyles
    const children = this._getChildrenInFlow()
    if (!children.length || children[0].renderStyles.display !== 'inline-block') return
    let rightOffset = 0
    let curLineHeight = 0
    const translateX = (element) => {
      let offsetY = 0
      if (element.renderStyles.verticalAlign === 'bottom') {
        offsetY = curLineHeight - element.renderStyles.height
      } else if (element.renderStyles.verticalAlign === 'middle') {
        offsetY = (curLineHeight - element.renderStyles.height) / 2
      }
      walk(element, (child) => {
        if (child.isInFlow()) {
          child.x += rightOffset
          child.contentX += rightOffset
          child.y += offsetY
          child.contentY += offsetY
        }
      })

    }
    const refreshX = (element) => {
      curLineHeight = getLineHeight(element)
      rightOffset = this.contentX + contentWidth - (element.x + element.renderStyles.width)
      if (textAlign === 'center') rightOffset = rightOffset / 2
    }
    let cur = null
    for (let i = children.length - 1; i >= 0; i--) {
      cur = children[i]
      if (!cur.next) {
        // 最后一个 只有一个也会走这里
        refreshX(cur)
        translateX(cur)
      } else if (!cur.pre) {
        // 第一个
        translateX(cur)
      } else if (cur.next._needNewLine()) {
        refreshX(cur)
        translateX(cur)
      } else {
        translateX(cur)
      }
    }
  }

  // 获取元素，只会找该元素子级
  getElementBy(key, value) {
    let match = []
    walk(this, (element) => {
      if (element.options.attrs[key] === value) {
        match.push(element)
      }
    })
    return match
  }

  // 添加在最后
  appendChild(element) {
    if (!element instanceof Element) throw Error('Unknown Element type')
    this.children.push(element)
    this._connectChildren()
    this.getLayer().initNode(element)
    this.getLayer().flow()
    this.getLayer().repaint()
    return element
  }

  //
  prependChild(element) {
    if (!element instanceof Element) throw Error('Unknown Element type')
    this.children.unshift(element)
    this._connectChildren()
    this.getLayer().initNode(element)
    this.getLayer().flow()
    this.getLayer().repaint()
    return element
  }

  removeChild(element) {
    if (!element instanceof Element) throw Error('Unknown Element type')
    const index = this._getChildren().indexOf(element)
    if (index < 0) throw Error('Element must be the child of parent')
    const pre = this._getChildren()[index - 1]
    const next = this._getChildren()[index + 1]
    if (pre) {
      pre._setSibling(pre.pre, next)
    }
    if (next) {
      next._setSibling(pre, next.next)
    }
    this.children.splice(index, 1)
    element.removeEvent()
    this.getLayer().reflow()
    this.getLayer().repaint()
  }

  append(element) {
    if (!element instanceof Element) throw Error('Unknown Element type')
    if (!this.parent) throw Error('Can not add element to root level!')
    let children = []
    this.parent.children.forEach(child => {
      children.push(child)
      if (child === this) {
        children.push(element)
      }
    })
    this.parent.children = children
    this.parent._connectChildren()
    this.getLayer().initNode(element)
    this.getLayer().flow()
    this.getLayer().repaint()
  }

  prepend(element) {
    if (!element instanceof Element) throw Error('Unknown Element type')
    if (!this.parent) throw Error('Can not add element to root level!')
    let children = []
    for (let i = this.parent.children.length - 1; i >= 0; i--) {
      children.unshift(this.parent.children[i])
      if (this.parent.children[i] === this) {
        children.unshift(element)
      }
    }
    this.parent.children = children
    this.parent._connectChildren()
    this.getLayer().initNode(element)
    this.getLayer().flow()
    this.getLayer().repaint()
  }

}

// 根据宽高获取内容高度 这里改变了原有宽高
function getContentLayout(element) {
  let width = element.renderStyles.width
  let height = element.renderStyles.height
  if (!isExact(width)) width = 0
  if (!isExact(height)) height = 0
  // 最大宽度判断
  if (element.renderStyles.minWidth && width < element.renderStyles.minWidth) width = element.renderStyles.width = element.renderStyles.minWidth
  if (element.renderStyles.maxWidth && width > element.renderStyles.maxWidth) width = element.renderStyles.width = element.renderStyles.maxWidth
  if (element.renderStyles.maxHeight && height > element.renderStyles.maxHeight) height = element.renderStyles.height = element.renderStyles.maxHeight
  if (element.renderStyles.minHeight && height > element.renderStyles.minHeight) height = element.renderStyles.height = element.renderStyles.minHeight
  return {
    contentWidth: width - element.renderStyles.paddingLeft - element.renderStyles.paddingRight - element.renderStyles.marginLeft - element.renderStyles.marginRight,
    contentHeight: height - element.renderStyles.paddingTop - element.renderStyles.paddingBottom - element.renderStyles.marginTop - element.renderStyles.marginBottom,
    contentX: element.x + element.renderStyles.paddingLeft + element.renderStyles.marginLeft,
    contentY: element.y + element.renderStyles.paddingTop + element.renderStyles.marginTop,
    width,
    height
  }
}


function getLineHeight(el) {
  if (el.renderStyles.display === 'block' || el.renderStyles.display === 'flex') return el.renderStyles.height
  // right
  let max = 0
  let cur = el
  while (cur && !cur._needNewLine()) {
    if (cur.renderStyles.height > max && cur.isInFlow()) {
      max = cur.renderStyles.height
    }
    cur = cur.next
  }
  // left
  cur = el
  while (cur && !cur._needNewLine()) {
    if (cur.renderStyles.height > max && cur.isInFlow()) {
      max = cur.renderStyles.height
    }
    cur = cur.pre
  }

  // 最后肯定剩下一个头
  if (cur.renderStyles.height > max) {
    max = cur.renderStyles.height
  }
  return max
}
