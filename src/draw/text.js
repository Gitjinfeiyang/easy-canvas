import Element from './element'
import STYLES from './constants'
import { isExact } from './utils'

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
    } else if (!this.styles.lineHeight) {
      this.styles.lineHeight = 14
    }
  }

  _initLayout() {
    this._restore(() => {
      this.getCtx().font = this._getFont()
      this._layout = this.getCtx().measureText(this.children)
      // 微信 夸克 有兼容性问题
      this._layout.fontHeight = this._layout.actualBoundingBoxAscent || this.renderStyles.fontSize
      this._layout.height = this.renderStyles.lineHeight
      this._calcLine()
    })
    super._initLayout()
  }

  _measureLayout() {
    return this._layout
  }

  _drawContent() {
    const { color, contentWidth, lineHeight, textAlign } = this.renderStyles
    let x = this.contentX
    this.getCtx().fillStyle = color
    this.getCtx().textAlign = textAlign
    this.getCtx().font = this._getFont()
    if (textAlign === STYLES.TEXT_ALIGN.RIGHT) {
      x = this.contentX + contentWidth
    } else if (textAlign === STYLES.TEXT_ALIGN.CENTER) {
      x = this.contentX + (contentWidth / 2)
    }
    this._lines.forEach((line, index) => {
      this.getCtx().fillText(line, x, this.contentY + this._layout.fontHeight + ((lineHeight - this._layout.fontHeight) / 2) + lineHeight * index)
    })
  }

  _getFont() {
    const { fontSize, fontWeight, fontFamily } = this.renderStyles
    return `${fontWeight} ${fontSize}px ${fontFamily}`
  }

  _calcLine() {
    if (!this.parent || !this.children) return
    const { width: textWidth, height: textHeight } = this._layout
    const { contentWidth: parentContentWidth } = this.parent.renderStyles
    const { width: parentWidth } = this.parent.styles
    // 如果一行宽度够，或者父级宽度是auto
    if ((isExact(parentContentWidth) && parentContentWidth >= textWidth) || parentWidth === STYLES.WIDTH.AUTO) {
      this._lines = [this.children]
    } else {
      this._lines = []
      let lineIndex = 1
      let lineText = ''
      let _layout = null
      for (let i = 0; i < this.children.length; i++) {
        _layout = this.getCtx().measureText(lineText + this.children[i])
        if (_layout.width > parentContentWidth) {
          if (lineIndex >= this.renderStyles.maxLine) {
            // 最大行数限制 以及maxline省略号实现
            lineText = lineText.substring(0, lineText.length - 2) + '...'
            break
          }
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
