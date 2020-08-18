
import { createElement, createLayer } from './create-element'
import px from './px'
import './weapp-adapter'
import Layer from './layer'

function getDrawer(ctx, options) {
  // px.init(options)
  return function (model) {
    const vdom = createElement(model)
    console.log(vdom)
    const layer = createLayer(ctx, options)
    return layer
  }
}

let _global = window || global
if (_global) {
  _global.getDrawer = getDrawer
}

export default {
  createLayer,
  createElement
}

