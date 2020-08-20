import View from './view'
import Text from './text'
import Image from './image'
import Layer from './layer'
import ScrollView from './scroll-view'

/**
 * 生成一个element tree
 * @param {String} name
 * @param {Function} options
 */

const elementFactory = {}
//
registerComponent('view', (options, children) => new View(options, children))
registerComponent('text', (options, children) => new Text(options, children))
registerComponent('image', (options, children) => new Image(options, children))
registerComponent('scroll-view', (options, children) => new ScrollView(options, children))
registerComponent('scrollview', (options, children) => new ScrollView(options, children))

export function createElement(model) {
  // 生成树
  function c(name, options, children = []) {
    let _element = null
    if (elementFactory[name]) {
      _element = elementFactory[name](options, children, c)
    } else {
      throw Error(`Unknown tag name [${name}] !`)
    }
    return _element
  }
  const _model = model(c)
  // 挂载children
  return _model
}

export function createLayer(ctx, options) {
  return new Layer(ctx, options)
}

// 注册全局组件
export function registerComponent(name, factory) {
  if (elementFactory[name]) {
    throw Error(`Already exist tag name [${name}] !`)
  }
  elementFactory[name] = factory
}





