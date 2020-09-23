import View from './view'
import { easeInOutElastic, isExact, isAuto } from './utils'
import STYLES from './constants'

export default class ScrollView extends View {

  constructor(options, children) {
    super(options, children)
    // 外面包裹一层容器，内层的滚动
    options.styles.overflow = 'hidden'
    this.type = 'scroll-view'
    this._scrollView = new View(options, [this])
    this._scrollView.type = 'scroll-view-container'
    this.visibleIndex = null
    this.renderOnDemand = options.attrs && options.attrs.renderOnDemand || false
    return this._scrollView
  }

  _getDefaultStyles() {
    return {
      ...STYLES.DEFAULT_STYLES,
      direction: 'y',
    }
  }

  beforePaint() {
    this.initChildrenVisible()
  }

  _initWidthHeight(){
    super._initWidthHeight()
    // 这里需要父级款高度，但是外层必须是exact
    this.initScroll()
  }

  _paint() {
    this.getRender()._drawBackground(this)
    this.getRender()._drawScroll(this)
    this.getRender()._drawBox(this)
  }

  init() {
    super.init()
    this.addEventListener()

    const { height, width, direction } = this.styles
    if (direction.match('y')) {
      if (isAuto(height)) {
        // 必须设置
        console.error('scroll-view 必须设置明确的高度')
      } else {
        this.styles.height = 'auto'
        this.renderStyles.height = 'auto'
      }
    }
    if (direction.match('x')) {
      if (isAuto(width)) {
        // 必须设置
        console.error('scroll-view 必须设置明确的宽度')
      } else {
        this.styles.width = 'auto'
        this.renderStyles.width = 'auto'
      }
    }
  }

  addEventListener() {
    // 监听滚动
    this.currentScrollX = 0
    this.currentScrollY = 0
    let direction = this.styles.direction
    let startX = 0
    let startY = 0
    let lastStartX = 0
    let lastStartY = 0
    let startMove = false
    let offsetX = 0
    let offsetY = 0
    let speedX = 0
    let speedY = 0
    let glideInterval = null
    let resistanceX = 1
    let resistanceY = 1

    this.getLayer().eventManager.onClick((e) => {
      if (direction.match('y')) {
        e.relativeY -= this.currentScrollY
      }
      if (direction.match('x')) {
        e.relativeX -= this.currentScrollX
      }
    }, this._scrollView, true)

    this.getLayer().eventManager.onTouchStart((e) => {
      e.stopPropagation()
      startX = e.x
      startY = e.y
      lastStartX = startX
      lastStartY = startY
      startMove = true
      clearInterval(glideInterval)
    }, this._scrollView)
    this.getLayer().eventManager.onTouchMove((e) => {
      if (startMove) {
        e.stopPropagation()
        offsetX = (e.x - startX)
        offsetY = (e.y - startY)
        if (this.scrollBy(offsetX, offsetY)) {
          lastStartX = startX
          lastStartY = startY
          startX = e.x
          startY = e.y
        }
      }
    }, this._scrollView)
    this.getLayer().eventManager.onTouchEnd((e) => {
      if (startMove) {
        startMove = false

        speedX = (e.x - lastStartX)
        speedY = (e.y - lastStartY)
        resistanceX = -speedX * 0.02
        resistanceY = -speedY * 0.02
        clearInterval(glideInterval)
        glideInterval = setInterval(() => {
          if (!this.scrollBy(speedX, speedY)) {
            clearInterval(glideInterval)
          }
          speedX += resistanceX
          speedY += resistanceY
          if (speedX * speedX <= 0.05 && speedY * speedY <= 0.05) {
            speedX = 0
            speedY = 0
            clearInterval(glideInterval)
          }
        }, 17)
      }
    }, this._scrollView)
  }

  initScroll(){
    const { contentWidth: offsetWidth, contentHeight: offsetHeight } = this._scrollView.renderStyles
    const { width: scrollWidth, height: scrollHeight, direction } = this.renderStyles
    this.maxScrollX = scrollWidth - offsetWidth
    this.maxScrollY = scrollHeight - offsetHeight
  }

  calcScrollBoundX(offsetX) {
      if ((- this.currentScrollX - offsetX) > this.maxScrollX) {
        return false
      } else if (this.currentScrollX + offsetX > 0) {
        return false
      }

    return true
  }

  calcScrollBoundY(offsetY) {
      if ((- this.currentScrollY - offsetY) > this.maxScrollY) {
        return false
      } else if (this.currentScrollY + offsetY > 0) {
        return false
      }

    return true
  }

  scrollByX(offsetX) {
    if (!this.renderStyles.direction.match('x')) return false
    if (this.calcScrollBoundX(offsetX)) {
      this.currentScrollX += offsetX
      return true
    } else {
      return false
    }
  }

  scrollByY(offsetY) {
    if (!this.renderStyles.direction.match('y')) return false
    if (this.calcScrollBoundY(offsetY)) {
      this.currentScrollY += offsetY
      this.calcChildrenVisible()
      // this.getLayer().repaint(this._scrollView)
      return true
    } else {
      return false
    }
  }

  scrollBy(offsetX, offsetY) {
    // 这里要两个都运行，所以不要用短路
    if (this.scrollByX(offsetX) | this.scrollByY(offsetY)) {
      this.getLayer().repaint(this._scrollView)
      return true
    }
    return false
  }

  scrollTo({x,y}) {
    if(isExact(x)){
      x= x
      if(x>this.maxScrollX) x = this.maxScrollX
      this.currentScrollX = -x
    }
    if(isExact(y)){
      y= y
      if(y>this.maxScrollY) y = this.maxScrollY
      this.currentScrollY = -y
    }
    this.initChildrenVisible()
    this.getLayer().repaint(this._scrollView)
  }

  // TODO:
  initChildrenVisible() {
    if (!this.renderOnDemand) return

    // console.log('==============')
    const children = this._getChildrenInFlow()
    // 左
    for (let i = 0; i < children.length; i++) {
      if (this.isElementInViewport(children[i])) {
        this.visibleIndex = [i, -1]
        break
      } else {
        children[i].visible = false
      }
    }

    // 右
    for (let i = children.length - 1; i >= 0; i--) {
      if (this.isElementInViewport(children[i])) {
        this.visibleIndex[1] = i
        break
      } else {
        children[i].visible = false
      }
    }

    // 中间
    for (let i = this.visibleIndex[0]; i <= this.visibleIndex[1]; i++) {
      children[i].visible = true
    }
  }

  // 只用计算两头
  // 数据量时能显著提高效率
  // 滚动太快会有问题，暂时使用上面的init
  calcChildrenVisible() {
    if (!this.renderOnDemand) return
    const children = this._getChildrenInFlow()
    const head = generateSiblingNodeIndex(this.visibleIndex[0], 5)
    const foot = generateSiblingNodeIndex(this.visibleIndex[1], 5)
    let visibleIndex = []
    for (let i = head[0]; i <= head[head.length - 1]; i++) {
      if (children[i]) {
        if (this.isElementInViewport(children[i])) {
          children[i].visible = true
          if (!visibleIndex.length) {
            visibleIndex.push(i)
          }
        } else {
          children[i].visible = false
        }
      }
    }
    for (let i = foot[foot.length - 1]; i >= foot[0]; i--) {
      if (children[i]) {
        if (this.isElementInViewport(children[i])) {
          children[i].visible = true
          if (visibleIndex.length === 1) {
            visibleIndex.push(i)
          }
        } else {
          children[i].visible = false
        }
      }
    }
    this.visibleIndex = visibleIndex
  }

  isElementInViewport(element) {
    if (this.styles.direction.match('y')) {
      return ((element.y + element.renderStyles.height + this.currentScrollY) > this._scrollView.contentY)
        && ((element.y + this.currentScrollY) < this._scrollView.contentY + this._scrollView.renderStyles.contentHeight)
    } else {
      return true
      // return ((element.x + element.renderStyles.width + this.currentScroll) > this._scrollView.contentX)
      // && ((element.x + this.currentScroll) < this._scrollView.contentX + this._scrollView.renderStyles.contentWidth)
    }
  }

}


function generateSiblingNodeIndex(index, offset) {
  let start = index - offset
  let end = index + offset
  let list = []
  for (let i = start; i <= end; i++) {
    list.push(i)
  }
  return list
}
