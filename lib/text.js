import Element from './element'
import STYLES from './constants'
import { isExact, isAuto } from './utils'

export default class Text extends Element {
  constructor(options, children) {
    super(options, children)
    this._layout = null // layout用来保存计算的自身高度
    this._lines = []
    this.children += ''
    this.type = 'text'
  }

  _paint() {
    this.getRender()._drawBackground(this)
    this.getRender()._drawText(this)
    this.getRender()._drawBox(this)
  }

  _getDefaultStyles() {
    return {
      ...STYLES.DEFAULT_STYLES,
      display: STYLES.DISPLAY.INLINE_BLOCK,
      width: STYLES.WIDTH.AUTO,
      textAlign: 'left',
    }
  }

  _measureLayout() {
    this._layout = this.getRender().measureText(this, this.children)
    this._layout.fontHeight = this.renderStyles.fontSize * 0.8
    this._layout.height = this.renderStyles.lineHeight
    this._calcLine()
    return this._layout
  }

  _getFont() {
    const { fontSize, fontWeight, fontFamily } = this.renderStyles
    return `${fontWeight} ${fontSize}px ${fontFamily}`
  }

  _calcLine() {
    if (!this.parent || !this.children) return
    const { width: textWidth, height: textHeight } = this._layout
    let { contentWidth: parentContentWidth } = this.parent.renderStyles
    const { width: parentWidth } = this.parent.styles
    if (!isAuto(this.styles.width)) parentContentWidth = this.renderStyles.width
    // 如果一行宽度够，或者父级宽度是auto
    if ((isExact(parentContentWidth) && parentContentWidth >= textWidth) || parentWidth === STYLES.WIDTH.AUTO) {
      this._lines = [{
        text: this.children,
        layout: this._layout
      }]
    } else {
      this._lines = []
      let lineIndex = 1
      let lineText = ''
      let _layout = null
      let lastLayout = null
      for (let i = 0; i < this.children.length; i++) {
        _layout = this.getRender().measureText(this, lineText + this.children[i])
        if (_layout.width > parentContentWidth) {
          if (lineIndex >= this.renderStyles.maxLine) {
            // 最大行数限制 以及maxline省略号实现
            lineText = lineText.substring(0, lineText.length - 2) + '...'
            break
          }
          // 超出了
          this._lines.push({
            text: lineText,
            layout: lastLayout || layout
          })
          lineText = ''
          lineIndex += 1

        }

        lineText += this.children[i]

        lastLayout = _layout
      }
      this._layout.width = parentContentWidth
      this._lines.push({
        text: lineText,
        layout: this.getRender().measureText(this, lineText)
      })
      // 根据lineheihgt更新height
      this._layout.height = this._lines.length * this.renderStyles.lineHeight
    }
  }

  getInnerText() {
    return this.children
  }

  setInnerText(val) {
    if (val === undefined) return
    if (val === this.children) return
    this.children = val
    this.getLayer().reflowElement(this)
  }
}
