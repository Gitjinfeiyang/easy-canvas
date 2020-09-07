export default class TreeNode {
  constructor(children) {
    this.children = children
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
    this.pre = pre
    this.next = next
  }
}
