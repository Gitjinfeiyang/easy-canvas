import View from './view'
import { easeInOutElastic, isExact, isAuto } from './utils'
import STYLES from './constants'

export default class ScrollView extends View {

  constructor(options, children) {
    super(options, children)
    // 外面包裹一层容器，内层的滚动
    options.styles.overflow = 'hidden'
    this._scrollView = new View(options, [this])
    return this._scrollView
  }

  _getDefaultStyles() {
    return {
      ...STYLES.DEFAULT_STYLES,
      direction: 'y',
    }
  }

  init() {
    super.init()
    this.addEventListener()

    const { height, width, direction } = this.styles
    if (direction === 'y') {
      if (!isAuto(height)) {
        this.styles.height = 'auto'
        this.renderStyles.height = 'auto'
      } else {
        // 必须设置
        console.error('scroll-view 必须设置明确的高度')
      }
    } else if (direction === 'x') {
      if (!isAuto(width)) {
        this.styles.width = 'auto'
        this.renderStyles.width = 'auto'
      } else {
        // 必须设置
        console.error('scroll-view 必须设置明确的宽度')
      }
    }
  }

  addEventListener() {
    // 监听滚动
    this.currentScroll = 0
    let direction = this.styles.direction
    let start = 0
    let lastStart = 0
    let startMove = false
    let offset = 0
    let speed = 0
    let glideInterval = null
    let resistance = 1
    this.getLayer().eventManager.onTouchStart((e) => {
      e.stopPropagation()
      start = e[direction]
      lastStart = start
      startMove = true
      clearInterval(glideInterval)
    }, this)
    this.getLayer().eventManager.onTouchMove((e) => {
      if (startMove) {
        e.stopPropagation()
        offset = (e[direction] - start)
        if (this.scrollBy(offset)) {
          lastStart = start
          start = e[direction]
        }
      }
    }, this)
    this.getLayer().eventManager.onTouchEnd((e) => {
      if (startMove) {
        startMove = false
        speed = (e[direction] - lastStart) * 2
        resistance = -speed * 0.02
        clearInterval(glideInterval)
        glideInterval = setInterval(() => {
          if (!this.scrollBy(speed)) {
            clearInterval(glideInterval)
          }
          speed += resistance
          if (speed * speed <= 0.05) {
            speed = 0
            clearInterval(glideInterval)
          }
        }, 18)
      }
    }, this)
  }

  _repaint() {
    // 滚动实现 目前是计算一次重新绘制一次，有需要再优化
    const { direction } = this.renderStyles
    if (direction === 'y') {
      this.getCtx().translate(0, this.currentScroll)
    } else {
      this.getCtx().translate(this.currentScroll, 0)
    }
    super._repaint()
  }

  calcScrollBound(offset) {
    const { width: offsetWidth, height: offsetHeight } = this._scrollView.renderStyles
    const { width: scrollWidth, height: scrollHeight, direction } = this.renderStyles
    if (direction === 'y') {
      if ((offsetHeight - this.currentScroll - offset) > scrollHeight) {
        return false
      } else if (this.currentScroll + offset > 0) {
        return false
      }
    } else {
      if ((offsetWidth - this.currentScroll - offset) > scrollWidth) {
        return false
      } else if (this.currentScroll + offset > 0) {
        return false
      }
    }

    return true
  }

  scrollBy(offset) {
    if (this.calcScrollBound(offset)) {
      this.currentScroll += offset
      this.getLayer().repaint(this._scrollView)
      return true
    } else {
      return false
    }
  }

  scrollTo(pos) {

  }

}
