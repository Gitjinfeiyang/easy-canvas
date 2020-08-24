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
  function c(name, options = {}, children = []) {
    if (arguments.length < 3) {
      throw Error(`Element [${name}]: need 3 argument but get 2`)
    }
    let _element = null
    let _children = children
    if (elementFactory[name]) {
      // if (typeof children === 'string' && name !== 'text') {
      //   // 支持text简写
      //   _children = new Text({}, children)
      // } else if (!Array.isArray(children)) {
      //   throw Error(`Element [${name}]:Children must be type of Array!`)
      // }
      _element = elementFactory[name](options, _children, c)
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





