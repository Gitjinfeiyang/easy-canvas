import Line from './line'
import { isExact, isAuto } from './utils'
import STYLES from './constants'

const KEY = {
  [STYLES.FLEX_DIRECTION.ROW]: {
    width: 'width',
    contentWidth: 'contentWidth',
    x: 'x',
    y: 'y',
    contentX: 'contentX',
    height: 'height',
    contentHeight: 'contentHeight'
  },
  [STYLES.FLEX_DIRECTION.COLUMN]: {
    width: 'height',
    contentWidth: 'contentHeight',
    x: 'y',
    y: 'x',
    contentX: 'contentY',
    height: 'width',
    contentHeight: 'contentWidth'
  }
}
// 目前flex是基于inline-block的简单实现，只支持row方向width + flex混用
export default class FlexBox extends Line {
  constructor() {
    super()
    this.exactValue = 0
    this.flexTotal = 0
    this.key = null
  }

  closeLine() {
    super.closeLine()
    this.calcFlex()
  }

  bind(el) {
    this.container = el.parent
    if (el.parent) {
      this.key = KEY[el.parent.renderStyles.flexDirection]
    }
    this.initHeight(el)
    this.outerWidth = el.parent && isAuto(el.parent.styles[this.key.width]) ? Infinity : el.parent.renderStyles[this.key.contentWidth]
    this.start = el
    this.add(el)
  }

  add(el) {
    if (isExact(el.styles.flex)) {
      this.flexTotal += el.styles.flex
    } else if (isExact(el.styles[this.key.width])) {
      this.exactValue += el.styles[this.key.width]
    }
    super.add(el)
  }

  initHeight() {
    this[this.key.height] = 0
  }

  refreshWidthHeight(el) {
    if (el.renderStyles[this.key.height] > this[this.key.height]) {
      this[this.key.height] = el.renderStyles[this.key.height]
    }

    this[this.key.width] += el.renderStyles[this.key.width]
  }

  initLayout(el) {
    this.right = el._getContainerLayout()[this.key.contentX]
    this[this.key.x] = el._getContainerLayout()[this.key.contentX]
    this[this.key.y] = this.getPreLine(el)[this.key.y]
  }

  refreshElementPosition(el) {
    if (this.start === el) {
      this.initLayout(el)
    }
    // 刷新位置，首先以左边计算
    el[this.key.x] = this.right + this.offsetX
    el[this.key.y] = this[this.key.y] + this.getOffsetY(el)
    // + (this.height - el.renderStyles.height) / 2
    this.right += el.renderStyles[this.key.width]

  }

  calcFlex() {
    const { [this.key.contentWidth]: containerWidth } = this.container.renderStyles
    this.elements.forEach(child => {
      if (isExact(child.styles.flex)) {
        child.renderStyles[this.key.width] = (child.styles.flex / this.flexTotal) * (containerWidth - this.exactValue)
        child._refreshContentWithLayout()
      }
    })
  }

  refreshXAlign() {
    if (!this.end.parent) return
    let offsetX = this.outerWidth - this[this.key.width]
    if (this.end.parent.renderStyles.justifyContent === 'center') {
      offsetX = offsetX / 2
    } else if (this.end.parent.renderStyles.justifyContent === 'flex-start') {
      offsetX = 0
    }
    this.offsetX = offsetX
  }

  getOffsetY(el) {
    if (el.renderStyles.alignSelf === 'flex-end') {
      return (this.container.renderStyles[this.key.contentHeight] - el.renderStyles[this.key.height])
    } else if (el.renderStyles.alignSelf === 'center') {
      return (this.container.renderStyles[this.key.contentHeight] - el.renderStyles[this.key.height]) / 2
    } else {
      return 0
    }
  }
}
