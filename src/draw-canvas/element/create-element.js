import View from './view'
import Text from './text'
import $Image from './image'

export default function createElement(createVNode) {
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
      _element = new $Image(options, children)
    }
    _element.linkChildren()

    return _element
  }


  const _vNode = createVNode(h)

  return _vNode
}
