import Element from './element'
import STYLES from './constants'
import pxUtil from './px'
const px = pxUtil.px

export default class Text extends Element {
  constructor(options, children) {
    super(options, children)
    this._layout = null // layout用来保存计算的自身高度
    this._lines = []
    this.children += ''
  }

  _getDefaultStyles() {
    return {
      ...STYLES.DEFAULT_STYLES,
      display: STYLES.DISPLAY.INLINE,
      width: STYLES.WIDTH.AUTO
    }
  }

  _completeStyles() {
    super._completeStyles()
    this._completeFont()
  }

  _completeFont() {
    if (this.styles.fontSize && !this.styles.lineHeight) {
      this.styles.lineHeight = this.styles.fontSize * 1.4
    } else {
      this.styles.lineHeight = 14
    }
  }

  _initLayout() {
    this._restore(() => {
      this.ctx.font = this._getFont()
      this._layout = this.ctx.measureText(this.children)
      this._layout.fontHeight = this._layout.actualBoundingBoxAscent
      this._layout.height = this.renderStyles.lineHeight
      this._calcLine()
    })
    super._initLayout()
  }

  _measureLayout() {
    return this._layout
  }

  _drawContent() {
    const { color, width, lineHeight } = this.renderStyles
    this.ctx.fillStyle = color
    this.ctx.font = this._getFont()
    this._lines.forEach((line, index) => {
      this.ctx.fillText(line, px(this.contentX), px(this.contentY + this._layout.fontHeight + ((lineHeight - this._layout.fontHeight) / 2) + lineHeight * index))
    })
  }

  _getFont() {
    const { fontSize, fontWeight, fontFamily } = this.renderStyles
    return `${fontWeight} ${px(fontSize)}px ${fontFamily}`
  }

  _calcLine() {
    if (!this.parent || !this.children) return
    const { width: textWidth, height: textHeight } = this._layout
    const { contentWidth } = this.parent.renderStyles
    // 如果一行宽度够，或者父级宽度是auto
    if (contentWidth >= textWidth || typeof contentWidth !== 'number') {
      this._lines = [this.children]
    } else {
      this._lines = []
      let lineIndex = 1
      let lineText = ''
      let _layout = null
      for (let i = 0; i < this.children.length; i++) {
        _layout = this.ctx.measureText(lineText + this.children[i])
        if (_layout.width > contentWidth) {
          // 超出了
          this._lines.push(lineText)
          lineText = ''
          lineIndex += 1
        }

        lineText += this.children[i]
      }
      this._lines.push(lineText)
    }
    // 根据lineheihgt更新height
    this._layout.height = this._lines.length * this.renderStyles.lineHeight
  }
}
