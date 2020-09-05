import { isExact, isAuto } from './utils'

export default class Line {
  constructor() {
    this.width = 0
    this.height = 0
    this.contentWidth = 0 // 右边界
    this.y = 0 // 上
    this.doorClosed = false // 是否允许加入
    this.outerWidth = 0
    this.container = null
    this.elements = []
    this.start = null // 起点，行最左边第一个
    this.end = null // 结束
    this.offsetX = 0
    this.id = Math.random()
  }

  bind(el) {
    this.container = el.parent
    this.initHeight(el)
    this.outerWidth = el.parent && isAuto(el.parent.styles.width) ? Infinity : el.parent.renderStyles.contentWidth

    this.start = el
    this.add(el)
  }

  initHeight(el) {
    this.height = el.parent && el.parent.renderStyles.lineHeight || 0
  }

  initLayout(el) {
    this.right = el._getContainerLayout().contentX
    this.y = this.getPreLineBottom(el)
  }

  refreshElementPosition(el) {
    if (this.start === el) {
      this.initLayout(el)
    }
    // 刷新位置，首先以左边计算
    el.x = this.right + this.offsetX
    el.y = this.y + this.getOffsetY(el)
    // + (this.height - el.renderStyles.height) / 2
    this.right += el.renderStyles.width

  }

  getOffsetY(el) {
    if (el.renderStyles.verticalAlign === 'bottom') {
      return (this.height - el.renderStyles.height)
    } else if (el.renderStyles.verticalAlign === 'middle') {
      return (this.height - el.renderStyles.height) / 2
    } else {
      return 0
    }
  }


  add(el) {
    this.elements.push(el)
    el.line = this
    this.refreshWidthHeight(el)

    if (!el.next) {
      this.closeLine()
    }
  }

  refreshWidthHeight(el) {
    if (el.renderStyles.height > this.height) {
      this.height = el.renderStyles.height
    }

    this.width += el.renderStyles.width
  }

  canIEnter(el) {
    if ((el.renderStyles.width + this.width) > this.outerWidth) {
      this.closeLine()
      return false
    } else {
      return true
    }
  }

  closeLine() {
    // new line
    this.end = this.elements[this.elements.length - 1]
    this.refreshXAlign()

  }

  getPreLineBottom(el) {
    if (el.pre) {
      if (el.pre.line) {
        return el.pre.line.height + el.pre.line.y
      } else {
        return el._getPreLayout().y + el._getPreLayout().height
      }
    } else {
      return el._getContainerLayout().contentY
    }
  }

  refreshXAlign() {
    if (this.outerWidth > 5000) return
    if (!this.end.parent) return
    let offsetX = this.outerWidth - this.width
    if (this.end.parent.renderStyles.textAlign === 'center') {
      offsetX = offsetX / 2
    } else if (this.end.parent.renderStyles.textAlign === 'left') {
      offsetX = 0
    }
    this.offsetX = offsetX
  }
}
