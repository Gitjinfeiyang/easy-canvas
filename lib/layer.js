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

    this.flow()

    // flow 完成后监听effect完成
    this.render.onEffectFinished()
      .then((res) => this.lifecycle('onEffectSuccess', res))
      .catch((res) => this.lifecycle('onEffectFail', res))
    // .finally((res) => this.lifecycle('onEffectFinished', res))

    this.repaint()

    console.log(`渲染${this.p2cList.length}个元素 耗时 ${(Date.now() - startTime)} ms`)
  }

  initP2CList() {
    // 广度优先
    this.p2cList = breadthFirstSearch(this.node)
  }

  initC2PList() {
    this.c2pList = breadthFirstSearchRight(this.node)
  }


  flow(node = this.node) {
    for (let i = 0; i < this.p2cList.length; i++) {
      this.p2cList[i].init()
    }

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

  reflowElement(element) {
    // 如果有line，则需要重第一个开始
    let target = element
    while (target && target.line) {
      target = target.parent
    }
    const p2cList = breadthFirstSearch(target)
    for (let i = 0; i < p2cList.length; i++) {
      p2cList[i]._initStyles()
    }

    // 所有子元素
    const children = breadthFirstSearchRight(target)
    for (let i = 0; i < children.length; i++) {
      children[i]._initWidthHeight()
    }

    if (!element.isInFlow()) {
      for (let i = 0; i < p2cList.length; i++) {
        p2cList[i]._initPosition()
      }
      this.repaint()
    } else {
      this.onElementChange(target)
    }


  }

  onElementRemove(element) {
    this.eventManager.removeElement(element)
    this.initC2PList()
    this.initP2CList()
    this.reflowElement(element)
  }

  onElementAdd(element) {
    TreeNode.connectChildren(element)
    this.initC2PList()
    this.initP2CList()
    breadthFirstSearch(element).forEach(item => item.init())
    this.reflowElement(element)
  }

  // 元素变化后调用，尽可能少重排重绘
  onElementChange(element) {

    walkParent(element, (parent, callbreak) => {
      parent._initWidthHeight()
      if (parent.type === 'scroll-view') callbreak()
    })

    for (let i = 0; i < this.p2cList.length; i++) {
      this.p2cList[i]._initPosition()
    }
    this.repaint()
  }

  callBeforePaint() {
    for (let i = 0; i < this.p2cList.length; i++) {
      this.p2cList[i].beforePaint && this.p2cList[i].beforePaint()
    }
  }

  /**
   * 可以给定element，则只会重绘element所在的区域
   * @param {Element} element
   */
  repaint(element = this.node) {
    if (isWX()) {
      // 微信环境下始终重绘整个树
      element = this.node
    }
    if (!element.isInFlow()) element = this.node

    this.callBeforePaint()

    this.render.readyToRender(this.node)
  }

  animate() {
    console.warn('use [animate] option instead!')
  }

  getElementBy() {
    return this.node.getElementBy(...arguments)
  }

  lifecycle(name, arg) {
    if (this.options.lifecycle) {
      this.options.lifecycle[name] && this.options.lifecycle[name](arg)
    }
  }

}


