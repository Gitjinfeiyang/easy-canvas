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
    return this._scrollView
  }

  _getDefaultStyles() {
    return {
      ...STYLES.DEFAULT_STYLES,
      direction: 'y',
    }
  }

  beforePaint(){
    this.initChildrenVisible()
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

    this.getLayer().eventManager.onClick((e) => {
      if (direction === 'y') {
        e.relativeY -= this.currentScroll
      } else {
        e.relativeX -= this.currentScroll
      }
    }, this._scrollView, true)

    this.getLayer().eventManager.onTouchStart((e) => {
      e.stopPropagation()
      start = e[direction]
      lastStart = start
      startMove = true
      clearInterval(glideInterval)
    }, this._scrollView)
    this.getLayer().eventManager.onTouchMove((e) => {
      if (startMove) {
        e.stopPropagation()
        offset = (e[direction] - start)
        if (this.scrollBy(offset)) {
          lastStart = start
          start = e[direction]
        }
      }
    }, this._scrollView)
    this.getLayer().eventManager.onTouchEnd((e) => {
      if (startMove) {
        startMove = false

        speed = (e[direction] - lastStart) * 1.5
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
        }, 17)
      }
    }, this._scrollView)
  }

  calcScrollBound(offset) {
    const { contentWidth: offsetWidth, contentHeight: offsetHeight } = this._scrollView.renderStyles
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
      this.calcChildrenVisible()
      this.getLayer().repaint()
      // this.getLayer().repaint(this._scrollView)
      return true
    } else {
      return false
    }
  }

  scrollTo(pos) {

  }

  // TODO:
  initChildrenVisible() {
    // console.log('==============')
    const children = this._getChildrenInFlow()
    // 左
    for (let i = 0; i < children.length; i++) {
      if (this.isElementInViewport(children[i])) {
        this.visibleIndex = [i,-1]
        break
      }else{
        children[i].visible = false
      } 
    }

    // 右
    for(let i = children.length-1; i>=0; i--){
      if (this.isElementInViewport(children[i])) {
        this.visibleIndex[1] = i
        break
      }else{
        children[i].visible = false
      } 
    }

    // 中间
    for(let i = this.visibleIndex[0]; i<=this.visibleIndex[1]; i++){
      children[i].visible = true
    }
  }

  // 只用计算两头
  calcChildrenVisible(){
    const children = this._getChildrenInFlow()
    const head = [this.visibleIndex[0]-1,this.visibleIndex[0],this.visibleIndex[0] + 1]
    const foot = [this.visibleIndex[1] - 1,this.visibleIndex[1],this.visibleIndex[1]+1]
    let visibleIndex = []
    for(let i = head[0]; i<=head[2]; i++){
      if (children[i]){
        if(this.isElementInViewport(children[i])){
          children[i].visible = true
          if(!visibleIndex.length){
            visibleIndex.push(i)
          }
        }else{
          children[i].visible = false
        }
      }
    }
    for(let i = foot[2]; i>=foot[0]; i--){
      if (children[i]){
        if(this.isElementInViewport(children[i])){
          children[i].visible = true
          if(visibleIndex.length ===1){
            visibleIndex.push(i)
          }
        }else{
          children[i].visible = false
        }
      }
    }
    this.visibleIndex = visibleIndex
  }

  isElementInViewport(element){
    if(this.styles.direction === 'y'){
      return ((element.y + element.renderStyles.height + this.currentScroll) > this._scrollView.contentY)
      && ((element.y + this.currentScroll) < this._scrollView.contentY + this._scrollView.renderStyles.contentHeight)
    }else{
      return ((element.x + element.renderStyles.width + this.currentScroll) > this._scrollView.contentX)
      && ((element.x + this.currentScroll) < this._scrollView.contentX + this._scrollView.renderStyles.contentWidth)
    }
  }

}
