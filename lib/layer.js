import EventManager from './event-manager'
import { walk, breadthFirstSearch, breadthFirstSearchRight, walkParent, isWX } from './utils'
import TreeNode from './tree-node'
export default class Layer {
  constructor(ctx, options) {
    this.ctx = ctx
    this.node = null
    this.isAnimate = false
    this.nodeList = []
    this.p2cList = []
    this.c2pList = []
    this.renderList = []
    this.options = options
    this.eventManager = new EventManager(options)
  }

  update(ctx, options) {
    this.ctx = ctx
    this.options = options
    this.options.renderStyles = options
    this.node.container = this.options
  }

  mountNode(node) {
    this.node = node
    this.node.root = this.node
    this.node.layer = this
    this.node.container = this.options
    // 事件也清空一下，重新挂载
    this.eventManager.clear()
    this.initRender()
  }

  initRender() {
    TreeNode.connectChildren(this.node)
    this.p2cList = this.getP2CList(this.node)
    this.c2pList = breadthFirstSearchRight(this.node).reverse()
    // this.initPaintList()
    this.initNode()

    this.flow()

    // inline-block等还需要再重新排一次，待优化
    // this.reflow()

    this.repaint()

  }

  getP2CList(el) {
    // 广度优先
    return breadthFirstSearch(el)
  }


  initNode(node = this.node) {
    walk(node, item => {
      item.init()
    })
  }

  flow(node = this.node) {
    this.reflow()
  }

  initPaintList() {
    // 这里实现index
    this.renderList = this.nodeList
  }

  reflow(node = this.node) {
    for (let i = 0; i < this.c2pList.length; i++) {
      this.c2pList[i]._initWidthHeight()
    }

    for (let i = 0; i < this.p2cList.length; i++) {
      this.p2cList[i]._initPosition()
    }
  }


  // 元素变化后调用，尽可能少重排重绘
  onElementChange(element) {
    element._initWidthHeight()
    walkParent(element, (parent) => {
      parent._initWidthHeight()
    })
    for (let i = 0; i < this.p2cList.length; i++) {
      this.p2cList[i]._initPosition()
    }
    this.repaint()
  }

  _repaint(element = this.node) {
    if (!element.parent) {
      // root
      this.ctx.clearRect(0, 0, this.options.width, this.options.height)
    } else {
      this.ctx.clearRect(element.x, element.y, element.renderStyles.width, element.renderStyles.height)
    }
    walk(this.node, (element, callContinue, callNext) => {
      // 可见的才渲染
      element._repaint()
      element._afterPaint()
    })
    if (isWX()) {
      // 兼容小程序
      this.ctx.draw && this.ctx.draw()
    }
  }

  /**
   * 可以给定element，则只会重绘element所在的区域
   * @param {Element} element
   */
  repaint(element = this.node) {
    if (this.isAnimate) return
    if (isWX()) {
      // 微信环境下始终重绘整个树
      element = this.node
    }
    this._repaint(element)
  }

  // 小程序需要
  getCanvas() {
    return this.options && this.options.canvas
  }

  _animate() {
    this._repaint()
    if (!this.isAnimate) return
    window.requestAnimationFrame(() => this._animate())
  }

  animate() {
    this.isAnimate = true
    window.requestAnimationFrame(() => this._animate())
  }

  stopAnimate() {
    this.isAnimate = false
  }

}


