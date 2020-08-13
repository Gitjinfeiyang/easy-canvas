export default class Element {
  constructor(options, children) {
    this.options = options
    this.children = children
    this.parent = null
  }

  linkChildren() {
    if (this.hasChildrenElement()) {
      this.children.forEach(child => child.setParent(this))
    }
  }

  hasChildrenElement() {
    return Array.isArray(this.children) && this.children.length
  }

  setParent(element) {
    this.parent = element
  }
}
