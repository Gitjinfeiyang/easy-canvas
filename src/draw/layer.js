import EventManager from './event-manager'

export default class Layer {
  constructor(ctx, node, options) {
    this.ctx = ctx
    this.node = node
    this.nodeList = []
    this.renderList = []
    this.options = options
    this.eventManager = new EventManager()
    this.initRender()
  }

  initRender() {
    this.node.layer = this
    this.node.container = this.options

    const nodes = this.nodeList = this.node.tree2List()


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

  reflow() {
    this.nodeList.forEach(item => {
      item._reflow()
    })
  }

  repaint() {
    this.ctx.clearRect(0, 0, this.options.width, this.options.height)

    // 这里通过ctx状态的stack实现了样式继承，比如overflow以及scrollview的滚动
    this.nodeList.forEach(item => {
      this.ctx.save()
      item._repaint()

      // 这里通过this.ctx栈实现了overflow
      // 第一步判断没有子元素，绘制完成即restore 有子元素需要子元素全部绘制完毕再restore
      if (!item.hasChildren()) {
        this.ctx.restore()
      }

      // 如果到了层级的最后一个 释放父级的stack
      if (item.parent && !item.next && !item.hasChildren()) {
        // 首先释放第一层父级
        this.ctx.restore()
        let cur = item.parent
        while (cur && !cur.next) {
          // 如果父级也是同级最后一个，再闭合上一个
          this.ctx.restore()
          cur = cur.parent
        }
      }
    })

    // 兼容小程序
    this.ctx.draw && this.ctx.draw()
  }
}
