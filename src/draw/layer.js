import EventManager from './event-manager'
import { walk } from './utils'
export default class Layer {
  constructor(ctx, options) {
    this.ctx = ctx
    this.node = null
    this.nodeList = []
    this.renderList = []
    this.options = options
    this.eventManager = new EventManager(options)
  }

  mountNode(node) {
    this.node = node
    this.node.layer = this
    this.node.container = this.options
    // 事件也清空一下，重新挂载
    this.eventManager.clear()
    this.initRender()
  }

  initRender() {
    const nodes = this.nodeList = this.node.tree2List()

    this.initPaintList()

    nodes.forEach(item => {
      item.init()
    })
    function flow() {
      nodes.forEach(item => {
        item._initLayout()
      })
    }

    flow()

    // inline-block等还需要再重新排一次，待优化
    this.reflow()

    this.repaint()

  }

  initPaintList() {
    // 这里实现index
    this.renderList = this.nodeList.sort((a, b) => {
      // 父子不能比较
      if (b.parent === a || !a.next) return 0
      return b.zIndex - a.zIndex
    })
  }

  reflow() {
    this.nodeList.forEach(item => {
      item._reflow()
    })
  }

  /**
   * 可以给定element，则只会重绘element所在的区域
   * @param {Element} element
   */
  repaint(element = this.node) {
    // let width = element.renderStyles.width
    // let height = element.renderStyles.height
    // let x = element.x
    // let y = element.y
    // this.ctx.clearRect(x, y, width, height)
    // walk(element, (item) => {
    //   item._repaint()
    //   item._afterPaint()
    // })

    this.ctx.clearRect(this.node.x, this.node.y, this.node.renderStyles.width, this.node.renderStyles.height)
    this.renderList.forEach(element => {
      element._repaint()
      element._afterPaint()
    })
    // 兼容小程序
    this.ctx.draw && this.ctx.draw()
  }

}
