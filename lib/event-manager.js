import TreeNode from './tree-node'
import { walkParent, walk } from './utils'
export default class EventManager {

  constructor({ simulateClick = true }) {
    this.clickTree = new TreeNode()
    this.touchstartTree = new TreeNode()
    this.touchmoveTree = new TreeNode()
    this.touchendTree = new TreeNode()
    this.clickList = []
    this.touchstartList = []
    this.touchmoveList = []
    this.touchendList = []
    this.touchStartEvent = null
    this.simulateClick = simulateClick // 是否模拟移动端点击事件
  }

  clear() {
    this.clickTree = new TreeNode()
    this.touchstartTree = new TreeNode()
    this.touchmoveTree = new TreeNode()
    this.touchendTree = new TreeNode()
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
    let tree = []
    switch (e.type) {
      case 'click': tree = this.clickTree; break
      case 'touchstart': tree = this.touchstartTree; break
      case 'touchmove': tree = this.touchmoveTree; break
      case 'touchend': tree = this.touchendTree; break
    }

    // let emitList = []

    // for(let i = callbackList.length-1; i>=0; i--){
    //   if(this.isPointInElement())
    // }
    let callbackList = []
    walk(tree, (node, callContinue, callBreak) => {
      if (node.element) {
        if (this.isPointInElement(e.relativeX, e.relativeY, node.element)) {
          node.runCapture(e)
          callbackList.push(node)
        } else {
          // 跳过当前子节点，遍历相邻节点
          callContinue()
        }
      }
    })

    for (let i = 0; i < callbackList.length; i++) {
      if (!e.currentTarget) e.currentTarget = callbackList[i].element
      callbackList[i].runCallback(e)
      if (e.cancelBubble) break
    }
  }

  // 待优化
  isPointInElement(x, y, element) {
    if (x >= element.x && y >= element.y && (x <= element.x + element.renderStyles.width) && (y <= element.y + element.renderStyles.height)) {
      return true
    }
    return false
  }


  removeElement(element) {
    this.clickList = this.clickList.filter(item => item.element !== element)
    this.touchstartList = this.touchstartList.filter(item => item.element !== element)
    this.touchmoveList = this.touchmoveList.filter(item => item.element !== element)
    this.touchendList = this.touchendList.filter(item => item.element !== element)
  }

  onClick(callback, element, isCapture = false) {
    // 为啥要unshift呢，因为元素是从父级,往子集初始化的
    this.addCallback(callback, element, this.clickTree, this.clickList, isCapture)
  }

  onTouchStart(callback, element, isCapture = false) {
    this.addCallback(callback, element, this.touchstartTree, this.touchstartList, isCapture)

  }

  onTouchMove(callback, element, isCapture = false) {
    this.addCallback(callback, element, this.touchmoveTree, this.touchmoveList, isCapture)

  }

  onTouchEnd(callback, element, isCapture = false) {
    this.addCallback(callback, element, this.touchendTree, this.touchendList, isCapture)

  }

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
    this.relativeX = x // scroll到每一层scrollview会不断变化
    this.relativeY = y
    this.type = type
    this.cancelBubble = false
    this.currentTarget = null // 第一个element
  }

  // 阻止冒泡
  stopPropagation() {
    this.cancelBubble = true
  }
}

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
