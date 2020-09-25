import STYLES from './constants'
import pxUtil from './px'
import { isExact, walk, isOuter, parseOuter, walkParent, isEndNode, isAuto, findRelativeTo, needReflow } from './utils'
import Line from './line'
import FlexBox from './flex-box'
import TreeNode from './tree-node'
import completeStyles from './complete-styles'

/**
 * Element类实现盒模型以及定位，不具备绘制
 * 其他类继承实现
 *
 */




export default class Element extends TreeNode {
  constructor(options, children) {
    super(children)
    this.options = Object.assign({ attrs: {}, styles: {}, on: {} }, options)
    this.styles = null
    this.renderStyles = null
    this.x = 0
    this.y = 0
    this.render = null
    this.container = null
    this.visible = true
  }

  init() {
    this._initStyles()
    this.initEvent()
  }

  initEvent() {
    const { click } = this.options.on
    if (click) {
      const { click } = this.options.on
      this.getLayer().eventManager.addEventListener('click',click, this)
    }
  }

  removeEvent() {
    this.getLayer().eventManager.removeElement(this)
  }

  getLayer() {
    return this.root.layer
  }

  getRender() {
    return this.root.layer.render
  }

  _paint() {

  }

  mount(layer) {
    layer.mountNode(this)
  }

  _initStyles() {
    this.styles = Object.assign({}, this._getDefaultStyles(), this._getParentStyles(this.options.styles), this.options.styles || {})

    this._completeStyles()

    this._initRenderStyles()
  }

  _initRenderStyles() {
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

    if (!renderStyles.width) renderStyles.width = 0
    if (!renderStyles.height) renderStyles.height = 0


    // 初始化contentWidth
    renderStyles.contentWidth = renderStyles.width - renderStyles.paddingLeft - renderStyles.paddingRight - renderStyles.marginLeft - renderStyles.marginRight - this._getTotalBorderWidth(renderStyles)
    renderStyles.contentHeight = renderStyles.height - renderStyles.paddingTop - renderStyles.paddingBottom - renderStyles.marginTop - renderStyles.marginBottom - this._getTotalBorderHeight(renderStyles)
    this.renderStyles = renderStyles

    if (this._InFlexBox()) {
      this._bindFlexBox()
    } else if (!this.isInFlow()) {
      this.relativeTo = findRelativeTo(this)
    }


  }

  /**
   * 需要继承的styles放在这里
   */
  _getParentStyles(curStyles) {
    let { textAlign, lineHeight, fontSize, color, fontFamily, alignItems, visible = true } = this.parent && this.parent.renderStyles || {}
    let extendStyles = {}
    if (textAlign) extendStyles.textAlign = textAlign
    if (fontSize) extendStyles.fontSize = fontSize
    if (color) extendStyles.color = color
    if (fontFamily) extendStyles.fontFamily = fontFamily
    if (alignItems && !curStyles.alignSelf) extendStyles.alignSelf = alignItems
    extendStyles.visible = visible
    return extendStyles
  }

  _completeStyles() {
    completeStyles(this)
  }

  _getDefaultStyles() {
    return STYLES.DEFAULT_STYLES
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

  isVisible() {
    return this.renderStyles.visible && this.visible
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


  }

  _initWidthHeight() {
    const { width, height, display, flex, marginLeft, marginRight, marginTop, marginBottom } = this.styles
    if (isAuto(width) || isAuto(height)) {
      // 这一步需要遍历，判断一下
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
  }

  _initPosition() {
    let { contentX } = this._getContainerLayout()
    const { paddingLeft, paddingTop, borderLeftWidth, borderTopWidth, marginLeft, marginTop } = this.renderStyles
    // 初始化ctx位置
    if (!this.isInFlow()) {
      // 不在文档流中
      let { contentX, contentY, contentWidth, contentHeight } = this._getContainerLayout(this.relativeTo)
      let { top, bottom, right, left, width, height } = this.renderStyles
      if (isOuter(top)) top = parseOuter(top) * contentHeight
      if (isOuter(bottom)) bottom = parseOuter(bottom) * contentHeight
      if (isOuter(left)) left = parseOuter(left) * contentWidth
      if (isOuter(right)) right = parseOuter(right) * contentWidth
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
    } else if (this._InFlexBox()) {
      this.line.refreshElementPosition(this)
    } else if (this.renderStyles.display === STYLES.DISPLAY.INLINE_BLOCK) {
      // inline-block到line里计算
      // this._bindLine()
      this.line.refreshElementPosition(this)
    } else {
      this.x = contentX
      this.y = this._getPreLayout().y + this._getPreLayout().height
    }
    this.contentX = this.x + paddingLeft + borderLeftWidth + marginLeft
    this.contentY = this.y + paddingTop + borderTopWidth + marginTop
  }

  _InFlexBox() {
    if (!this.isInFlow()) return false
    if (!this.parent) return false
    if (this.parent && this.parent.renderStyles.display === STYLES.DISPLAY.FLEX) return true
  }


  // 父元素根据子元素撑开content后，再计算width
  _refreshLayoutWithContent() {
    this.renderStyles.height = this.renderStyles.contentHeight + this.renderStyles.paddingTop + this.renderStyles.paddingBottom + this.renderStyles.marginTop + this.renderStyles.marginBottom + this._getTotalBorderHeight()
    this.renderStyles.width = this.renderStyles.contentWidth + this.renderStyles.paddingLeft + this.renderStyles.paddingRight + this.renderStyles.marginLeft + this.renderStyles.marginRight + this._getTotalBorderWidth()
  }

  // 父元素根据子元素撑开content后，再计算width
  _refreshContentWithLayout() {
    this.renderStyles.contentHeight = this.renderStyles.height - this.renderStyles.paddingTop - this.renderStyles.paddingBottom - this.renderStyles.marginTop - this.renderStyles.marginBottom - this._getTotalBorderHeight()
    this.renderStyles.contentWidth = this.renderStyles.width - this.renderStyles.paddingLeft - this.renderStyles.paddingRight - this.renderStyles.marginLeft - this.renderStyles.marginRight - this._getTotalBorderWidth()
  }

  _getTotalBorderWidth(renderStyles = this.renderStyles) {
    return renderStyles.borderLeftWidth + renderStyles.borderRightWidth
  }

  _getTotalBorderHeight(renderStyles = this.renderStyles) {
    return renderStyles.borderTopWidth + renderStyles.borderBottomWidth
  }

  _bindLine() {
    if (this.pre && this.pre.line && this.pre.line.canIEnter(this)) {
      this.pre.line.add(this)
    } else {
      // 新行
      new Line().bind(this)
    }
  }

  _bindFlexBox() {
    if (this.pre && this.pre.line) {
      this.pre.line.add(this)
    } else {
      // 新行
      new FlexBox().bind(this)
    }
  }

  _getContainerLayout(container = this.parent) {
    if (!container) {
      // root
      if (!this.container) {
        debugger
      }
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

  // 计算自身的高度
  _measureLayout() {
    let width = 0 // 需要考虑原本的宽度
    let height = 0
    this._getChildrenInFlow().forEach(child => {
      if (child.line) {
        if (child.line.start === child) {
          if (child.line.width > width) {
            width = child.line.width
          }
          height += child.line.height
        }
      } else if (child.renderStyles.width > width) {
        width = child.renderStyles.width
        height += child.renderStyles.height
      } else {
        height += child.renderStyles.height
      }
    })

    return { width, height }
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
    super.appendChild(element)
    this.getLayer().onElementAdd(element)
    return element
  }

  //
  prependChild(element) {
    super.prependChild(element)
    this.getLayer().onElementAdd(element)
    return element
  }

  removeChild(element) {
    super.removeChild(element)
    this.getLayer().onElementRemove(element)
  }

  append(element) {
    super.append(element)
    this.getLayer().onElementAdd(element)
  }

  prepend(element) {
    super.prepend(element)
    this.getLayer().onElementAdd(element)
  }

  setStyles(styles) {
    let _needReflow = false
    Object.keys(styles).forEach(key => {
      if (needReflow(key)) {
        _needReflow = true
      } else {
        this.renderStyles[key] = styles[key]
      }
    })
    if (_needReflow) {
      Object.keys(styles).forEach(key => {
        this.options.styles[key] = styles[key]
      })
      this.getLayer().reflowElement(this)
      console.warn('实验性功能')
    } else {
      this.getRender().requestRepaint()
    }
  }

}
