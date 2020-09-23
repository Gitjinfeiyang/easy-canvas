export default class TreeNode {

  static connectChildren(el) {
    if (el.hasChildren()) {
      el._getChildren().map((child, index) => {
        // 设置parent
        child._setParent(el)
        // 设置了上一个兄弟节点
        child._setSibling(el._getChildren()[index - 1], el._getChildren()[index + 1])
        TreeNode.connectChildren(child)
      })
    } else {
    }
  }

  constructor(children) {
    this.children = children || []
    this.parent = null
    this.root = null
    this.pre = null
    this.next = null
  }



  hasChildren() {
    return Array.isArray(this.children) && this.children.length ? true : false
  }

  _getChildren() {
    return this.hasChildren() ? this.children : []
  }

  _setParent(element) {
    this.parent = element
    this.root = element.root
  }

  _setSibling(pre, next) {
    this.pre = pre || null
    this.next = next || null
  }


  // 添加在最后
  appendChild(treeNode) {
    if (!treeNode instanceof TreeNode) throw Error('Unknown treeNode type')
    const pre = this._getChildren()[this._getChildren().length - 1]
    pre && pre._setSibling(pre.pre,treeNode)
    this.children.push(treeNode)
    treeNode._setParent(this)
    treeNode._setSibling(pre, null)
    // return treeNode
  }

  //
  prependChild(treeNode) {
    if (!treeNode instanceof TreeNode) throw Error('Unknown treeNode type')
    const next = this._getChildren()[0]
    next && next._setSibling(treeNode,next.next)
    this.children.unshift(treeNode)
    treeNode._setParent(this)
    treeNode._setSibling(null, next)
    // return treeNode
  }

  removeChild(treeNode) {
    if (!treeNode instanceof TreeNode) throw Error('Unknown treeNode type')
    const index = this._getChildren().indexOf(treeNode)
    if (index < 0) throw Error('treeNode must be the child of parent')
    const pre = this._getChildren()[index - 1]
    const next = this._getChildren()[index + 1]
    if (pre) {
      pre._setSibling(pre.pre, next)
    }
    if (next) {
      next._setSibling(pre, next.next)
    }
    this.children.splice(index, 1)
  }

  remove() {
    if (!this.parent) {
      throw Error('Can not remove root node')
    }
    this.parent.removeChild(this)
  }

  append(treeNode) {
    if (!treeNode instanceof TreeNode) throw Error('Unknown treeNode type')
    if (!this.parent) throw Error('Can not add treeNode to root level!')
    let children = []
    treeNode._setParent(this.parent)
    this.parent.children.forEach((child, index) => {
      children.push(child)
      if (child === this) {
        treeNode._setSibling(child, this.parent.children[index + 1])
        children.push(treeNode)
      }
    })
    this.parent.children = children
  }

  prepend(treeNode) {
    if (!treeNode instanceof TreeNode) throw Error('Unknown treeNode type')
    if (!this.parent) throw Error('Can not add treeNode to root level!')
    let children = []
    treeNode._setParent(this.parent)
    for (let i = this.parent.children.length - 1; i >= 0; i--) {
      children.unshift(this.parent.children[i])
      if (this.parent.children[i] === this) {
        treeNode._setSibling(this.parent.children[i - 1], this.parent.children[i])
        children.unshift(treeNode)
      }
    }
    this.parent.children = children
  }


}
