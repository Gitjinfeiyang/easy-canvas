import Element from './element'
import STYLES from './constants'
import { isExact, isAuto } from './utils'

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
      display: STYLES.DISPLAY.INLINE_BLOCK,
      width: STYLES.WIDTH.AUTO,
      textAlign: 'left',
    }
  }

  _completeStyles() {
    super._completeStyles()
  }

  _completeWidth() {
    super._completeWidth()

    if (this.styles.textAlign !== 'left' && this.parent && !isAuto(this.parent.styles.width)) {
      this.styles.width = '100%'
    }
  }

  _initLayout() {

    super._initLayout()
  }

  _measureLayout() {
    this._restore(() => {
      this.getCtx().font = this._getFont()
      const { width } = this.getCtx().measureText(this.children)
      this._layout = { width }
      // 微信 夸克 有兼容性问题
      // this._layout.fontHeight = this._layout.actualBoundingBoxAscent || this.renderStyles.fontSize
      this._layout.fontHeight = this.renderStyles.fontSize * 0.8
      this._layout.height = this.renderStyles.lineHeight
      this._calcLine()
    })
    return this._layout
  }

  _drawContent() {
    const { color, contentWidth, lineHeight, textAlign, textIndent } = this.renderStyles
    let x = this.contentX
    this.getCtx().fillStyle = color
    this.getCtx().textAlign = textAlign
    this.getCtx().font = this._getFont()
    if (textAlign === STYLES.TEXT_ALIGN.RIGHT) {
      x = this.contentX + contentWidth
    } else if (textAlign === STYLES.TEXT_ALIGN.CENTER) {
      x = this.contentX + (contentWidth / 2)
    }
    let _x = x
    this._lines.forEach((line, index) => {
      if (index === 0 && textIndent) {
        // 第一行实现textIndent
        _x = x + textIndent
      } else {
        _x = x
      }
      this.getCtx().fillText(line, _x, (this.contentY + ((lineHeight + this._layout.fontHeight) / 2) + lineHeight * index))
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
      this._layout.width = parentContentWidth
      this._lines.push(lineText)
      // 根据lineheihgt更新height
      this._layout.height = this._lines.length * this.renderStyles.lineHeight
    }
  }
}
