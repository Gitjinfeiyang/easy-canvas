export default class EventManager {

  constructor({ simulateClick = true }) {
    this.clickList = []
    this.touchstartList = []
    this.touchmoveList = []
    this.touchendList = []
    this.touchStartEvent = null
    this.simulateClick = simulateClick // 是否模拟移动端点击事件
  }

  clear() {
    this.clickList = []
    this.touchstartList = []
    this.touchmoveList = []
    this.touchendList = []
  }

  click(x, y) {
    let event = new Event({ x, y, type: 'click' })
    this._emit(event)
  }

  touchstart(x, y) {
    let event = new Event({ x, y, type: 'touchstart' })
    this.touchStartEvent = event
    this._emit(event)
  }

  touchmove(x, y) {
    let event = new Event({ x, y, type: 'touchmove' })
    this._emit(event)
  }

  touchend(x, y) {
    let event = new Event({ x, y, type: 'touchend' })
    this._emit(event)
    this.checkClick(event)
  }

  _emit(e) {
    let callbackList = []
    switch (e.type) {
      case 'click': callbackList = this.clickList; break
      case 'touchstart': callbackList = this.touchstartList; break
      case 'touchmove': callbackList = this.touchmoveList; break
      case 'touchend': callbackList = this.touchendList; break
    }
    for (let i = 0; i < callbackList.length; i++) {
      if (this.isPointInElement(e.x, e.y, callbackList[i].element)) {
        if (!e.currentTarget) e.currentTarget = callbackList[i].element
        callbackList[i].callback(e)
        if (e.cancelBubble) break
      }
    }
  }

  isPointInElement(x, y, element) {
    const { width, height } = element.renderStyles
    let _x = x // 根据scroll-view做转换
    let _y = y
    let cur = element.parent
    while (cur) {
      if (cur.type === 'scroll-view') {
        if (cur.styles.direction === 'x') {
          _x -= cur.currentScroll
        } else {
          _y -= cur.currentScroll
        }
      }
      cur = cur.parent
    }
    if (_x >= element.x && _y >= element.y && (_x <= element.x + width) && (_y <= element.y + height)) {
      return true
    }
    return false
  }

  createEvent(x, y, type) {

  }

  onClick(callback, element) {
    // 为啥要unshift呢，因为元素是从父级,往子集初始化的
    this.clickList.unshift({ callback, element })
  }

  onTouchStart(callback, element) {
    this.touchstartList.unshift({ callback, element })
  }

  onTouchMove(callback, element) {
    this.touchmoveList.unshift({ callback, element })
  }

  onTouchEnd(callback, element) {
    this.touchendList.unshift({ callback, element })
  }

  // 这里利用touchstart和touchend实现了移动端click事件
  checkClick(event) {
    if (this.touchStartEvent && this.simulateClick) {
      // 判断两点距离
      let { x: startx, y: starty } = this.touchStartEvent
      let { x: endx, y: endy } = event
      let distance = ((endy * endy + endx * endx) - (starty * starty + startx * startx))
      if (distance < 10 && distance > -10) {
        this.click(endx, endy)
      }
    }
  }
}

class Event {
  constructor({ x, y, type }) {
    this.x = x
    this.y = y
    this.type = type
    this.cancelBubble = false
    this.currentTarget = null // 第一个element
  }

  // 阻止冒泡
  stopPropagation() {
    this.cancelBubble = true
  }
}
