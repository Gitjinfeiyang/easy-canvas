import EventManager from './event-manager'
import { walk } from './utils'
export default class Layer {
  constructor(ctx, options) {
    this.ctx = ctx
    this.node = null
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
    this.connectChildren(this.node)
    this.p2cList = this.getP2CList(this.node)
    this.c2pList = breadthFirstSearchRight(this.node).reverse()
    // this.initPaintList()
    this.initNode()
    console.log(this.p2cList)


    this.flow()

    // inline-block等还需要再重新排一次，待优化
    // this.reflow()

    this.repaint()

  }

  getP2CList(el) {
    // 广度优先
    return breadthFirstSearch(el)

  }

  connectChildren(el) {
    if (el.hasChildren()) {
      let childrenRender = el._getChildren().map((child, index) => {
        // 设置parent
        child._setParent(el)
        // 设置了上一个兄弟节点
        child._setSibling(el._getChildren()[index - 1], el._getChildren()[index + 1])
        return this.connectChildren(child)
      }).reduce((sum, val) => [...sum, ...val])
      // childrenRender.reverse()
      return [el._generateRender(), ...childrenRender]
    } else {
      return [el._generateRender()]
    }
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

    // this.ctx.clearRect(this.container.x, this.node.y, this.node.renderStyles.width, this.node.renderStyles.height)
    this.ctx.clearRect(0, 0, this.options.width, this.options.height)
    walk(this.node, element => {
      element._repaint()
      element._afterPaint()
    })
    // 兼容小程序
    this.ctx.draw && this.ctx.draw()
  }

  // 小程序需要
  getCanvas() {
    return this.options && this.options.canvas
  }

}


function breadthFirstSearch(node, reverse = false) {

  var nodes = [];

  if (node != null) {

    var queue = [];

    queue.unshift(node);

    while (queue.length != 0) {

      var item = queue.shift();

      nodes.push(item._generateRender());

      var children = item._getChildren();

      for (var i = 0; i < children.length; i++)
        queue.push(children[i]._generateRender());

    }

  }

  return nodes;

}

function breadthFirstSearchRight(node) {

  var nodes = [];

  if (node != null) {

    var queue = [];

    queue.unshift(node);

    while (queue.length != 0) {

      var item = queue.shift();

      nodes.push(item._generateRender());

      var children = item._getChildren();

      for (var i = children.length - 1; i >= 0; i--)
        queue.push(children[i]._generateRender());

    }

  }

  return nodes;

}
