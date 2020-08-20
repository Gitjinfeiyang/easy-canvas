
import { createElement, createLayer, registerComponent } from './create-element'
import px from './px'
import './weapp-adapter'
import View from './view'
import Text from './text'
import Image from './image'
import Layer from './layer'
import ScrollView from './scroll-view'

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
  createElement,
  component: registerComponent,
  View,
  Text,
  Image,
  Layer,
  ScrollView
}

