import View from './view'
import Text from './text'
import Image from './image'
import Layer from './layer'

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

export function generateLayer(ctx,vdom, options) {
  return new Layer(ctx,vdom,options)
}





