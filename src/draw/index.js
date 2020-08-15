
import { createElement, generateLayer} from './create-element'
import px from './px'


function getDrawer (ctx, options) {
  ctx.scale(options.dpr, options.dpr)
  // px.init(options)
  return function (model) {
    const vdom = createElement(model)
    console.log(vdom)
    const layer = generateLayer(ctx,vdom, options)
  }
}

let _global = window || global
if(_global){
  _global.getDrawer = getDrawer
}

export default getDrawer

