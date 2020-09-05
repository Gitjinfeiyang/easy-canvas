import Line from './line'
import { isExact } from './utils'

export default class FlexBox extends Line {
  constructor() {
    super()
    this.exactValue = 0
    this.flexTotal = 0
  }

  closeLine() {
    super.closeLine()
    this.calcFlex()
  }

  add(el) {
    if (isExact(el.styles.flex)) {
      this.flexTotal += el.styles.flex
    } else if (isExact(el.styles.width)) {
      this.exactValue += el.styles.width
    }
    super.add(el)
  }

  initHeight() {
    this.height = 0
  }

  calcFlex() {
    const { contentWidth: containerWidth } = this.container.renderStyles
    this.elements.forEach(child => {
      if (isExact(child.styles.flex)) {
        child.renderStyles.width = (child.styles.flex / this.flexTotal) * (containerWidth - this.exactValue)
        child._refreshContentWithLayout()
      }
    })
  }

  refreshXAlign() {
    if (!this.end.parent) return
    let offsetX = this.outerWidth - this.width
    if (this.end.parent.renderStyles.justifyContent === 'center') {
      offsetX = offsetX / 2
    } else if (this.end.parent.renderStyles.justifyContent === 'flex-start') {
      offsetX = 0
    }
    this.offsetX = offsetX
  }

  getOffsetY(el) {
    if (el.renderStyles.alignSelf === 'flex-end') {
      return (this.container.renderStyles.contentHeight - el.renderStyles.height)
    } else if (el.renderStyles.alignSelf === 'center') {
      return (this.container.renderStyles.contentHeight - el.renderStyles.height) / 2
    } else {
      return 0
    }
  }
}
