import EventManager from './event-manager'
import { walk, breadthFirstSearch, breadthFirstSearchRight, walkParent, isWX } from './utils'
import TreeNode from './tree-node'
import CanvasRender from './canvas-render'
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
    this.render = new CanvasRender(this)
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
    // for 打印耗时
    const startTime = Date.now()

    TreeNode.connectChildren(this.node)
    this.initP2CList()
    this.initC2PList()
    // this.initPaintList()
    this.initNode()

    this.flow()

    // inline-block等还需要再重新排一次，待优化
    // this.reflow()

    this.repaint()

    console.log(`渲染${this.p2cList.length}个元素 耗时 ${(Date.now() - startTime)} ms`)
  }

  initP2CList() {
    // 广度优先
    this.p2cList = breadthFirstSearch(this.node)
  }

  initC2PList() {
    this.c2pList = breadthFirstSearchRight(this.node).reverse()
  }


  initNode(node = this.node) {
    for (let i = 0; i < this.p2cList.length; i++) {
      this.p2cList[i].init()
    }
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

  onElementRemove(element) {
    this.eventManager.removeElement(element)
    this.initC2PList()
    this.initP2CList()
    this.onElementChange(element)
  }

  onElementAdd(element) {
    TreeNode.connectChildren(element)
    this.initC2PList()
    this.initP2CList()
    breadthFirstSearch(element).forEach(item => item.init())
    this.onElementChange(element)
  }

  // 元素变化后调用，尽可能少重排重绘
  onElementChange(element) {
    // 所有子元素
    const children = breadthFirstSearchRight(element.parent || element).reverse()
    for (let i = 0; i < children.length; i++) {
      children[i]._initWidthHeight()
    }

    walkParent(element, (parent) => {
      parent._initWidthHeight()
    })
    
    for (let i = 0; i < this.p2cList.length; i++) {
      this.p2cList[i]._initPosition()
    }
    this.repaint()
  }

  _repaint(element = this.node) {
    this.render.render(element)
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
    if (!element.isInFlow()) element = this.node

    for (let i = 0; i < this.p2cList.length; i++) {
      this.p2cList[i].beforePaint && this.p2cList[i].beforePaint()
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

  getElementBy(){
    return this.node.getElementBy(...arguments)
  }

}


