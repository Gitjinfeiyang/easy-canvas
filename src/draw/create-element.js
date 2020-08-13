import View from './view'
import Text from './text'
import Image from './image'

/**
 * 生成一个element tree
 * @param {String} name
 * @param {Function} options
 */

export function createElement(model) {
  let callbacks = []
  // 生成树
  function h(name, options, children = []) {
    // if (name === 'text') {
    //     // text组件 children只能为string
    //     if (typeof options === 'string') {
    //         children = options
    //         options = {}
    //     }
    // }
    let _element = null
    if (name === 'view') {
      _element = new View(options, children)
    } else if (name === 'text') {
      _element = new Text(options, children)
    } else if (name == 'image') {
      _element = new Image(options, children)
    }
    return _element
  }
  const _model = model(h)
  // 挂载children
  return _model
}

export function generateFunc(vdom, options) {
  let renderList = vdom.generateRenderFunc()
  return (ctx) => render(ctx, renderList, options)
}



function render(ctx, funcList, options) {
  const nodes = funcList.map(item => item(ctx))

  function reflow() {
    nodes.forEach(item => {
      item._reflow()
    })
  }

  function flow() {
    nodes.forEach(item => {
      item._initLayout()
    })
  }

  function repaint() {
    ctx.clearRect(0, 0, options.width, options.height)
    nodes.forEach(item => {
      item._repaint()
    })
  }

  nodes[0].render = {
    reflow,
    repaint
  }
  nodes[0].container = options

  flow()

  repaint()




}



