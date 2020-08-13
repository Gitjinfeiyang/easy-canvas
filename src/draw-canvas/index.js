import createElement from './element/create-element'
import doRender from './render'
import doLayout from './layout'

export default function (ctx, renderFn) {
  const vNode = createElement(renderFn)
  doLayout(vNode)
}
