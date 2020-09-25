import TreeNode from './tree-node'
import { walkParent, walk } from './utils'
const events = ['click','touchstart','touchmove','touchend','mousewheel']
export default class EventManager {

  constructor({ simulateClick = true }) {
    this.clear()
    this.touchStartEvent = null
    this.simulateClick = simulateClick // 是否模拟移动端点击事件
  }

  clear() {
    events.forEach(eventName => {
      this[`${eventName}Tree`] = new TreeNode()
      this[`${eventName}List`] = []
    })
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

  mousewheel(x,y,deltaX,deltaY){
    let event = new Event({ x, y,deltaX,deltaY, type: 'mousewheel' })
    this._emit(event)
  }

  _emit(e) {
    let tree = this[`${e.type}Tree`]
    if(!tree) return

    /**
     * 遍历树，检查是否回调
     * 如果父级没有被触发，则子级也不需要检查，跳到下个同级节点
     * 执行capture回调，将on回调添加到stack
     */
    let callbackList = []
    let curArr = tree._getChildren()
    while (curArr.length) {
      walkArray(curArr, (node, callBreak, isEnd) => {
        if (node.element.isVisible() && this.isPointInElement(e.relativeX, e.relativeY, node.element)) {
          node.runCapture(e)
          callbackList.unshift(node)
          // 同级后面节点不需要执行了
          callBreak()
          curArr = node._getChildren()
        } else if (isEnd) {
          // 到最后一个还是没监测到，结束
          curArr = []
        }
      })
    }

    /**
     * 执行on回调，从子到父
     */
    for (let i = 0; i < callbackList.length; i++) {
      if (!e.currentTarget) e.currentTarget = callbackList[i].element
      callbackList[i].runCallback(e)
      if (e.cancelBubble) break
    }
  }

  // 待优化
  isPointInElement(x, y, element) {
    let a1 = x >= element.x
    let a2 = y >= element.y
    let a3 = (x <= (element.x + element.renderStyles.width))
    let a4 = (y <= (element.y + element.renderStyles.height))
    if (a1 && a2 && a3 && a4) {
      return true
    }
    return false
  }


  removeElement(element) {
    events.forEach(eventName => {
      this[`${eventName}List`] = this[`${eventName}List`].filter(item => {
        if (item.element === element) {
          item.remove()
        }
        return item.element !== element
      })
    })
  }

  addEventListener(type,callback,element,isCapture){
    const tree = this[`${type}Tree`]
    const list = this[`${type}List`]
    if(!tree){
      throw Error('Unknown event name [' + type+']')
    }
    this.addCallback(callback,element,tree,list,isCapture)
  }

  /**
   * 不在文档流中，提到relativeTo同级
   * 根据element树的层级关系构建一个监听回调树模型，提高性能
   * 有新的监听时，查找应该挂载在哪个节点
   * 如果节点已经存在，复用原节点
   * @param {Function} callback
   * @param {Element} element
   * @param {Callback} tree
   * @param {Array<Callback>} list
   * @param {Boolean} isCapture
   */
  addCallback(callback, element, tree, list, isCapture) {
    let parent = null
    let node = null
    // 寻找应该挂载的父节点
    let target = element
    for (let i = list.length - 1; i >= 0; i--) {
      // 寻找已存在节点
      if (element === list[i].element) {
        // 当前
        parent = list[i - 1]
        node = list[i]
        break
      }
      // 寻找应该挂载的父节点 通过对比当前父级最近的父级
      if (!element.isInFlow()) {
        target = element.relativeTo.parent
        if (!target) {
          break
        }
      }
      walkParent(target, (p, callBreak) => {
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
      // 用prepend是因为后来的层级上高于前面的，但是只有在absolute的元素才能感受到
      parent.prependChild(node)
    } else {
      tree.prependChild(node)
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
      if (distance < 5 && distance > -5) {
        this.click(endx, endy)
      }
    }
  }
}

class Event {
  constructor({ x, y, type,deltaX,deltaY }) {
    this.x = x
    this.y = y
    this.relativeX = x // scroll到每一层scrollview会不断变化
    this.relativeY = y
    this.type = type
    this.cancelBubble = false
    this.currentTarget = null // 第一个element

    if(type === 'mousewheel'){
      this.deltaX = deltaX
      this.deltaY = deltaY
    }
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
    this.callbackList.forEach(item => item.call(this.element,params))
  }

  runCapture(params) {
    this.captureList.forEach(item => item.call(this.element,params))
  }

}


function walkArray(arr, callback) {
  let _break = false
  const callBreak = () => _break = true
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], callBreak, i === arr.length - 1 ? true : false)
    if (_break) {
      break
    }
  }
}
