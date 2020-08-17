import Element from './element'
import STYLES from './constants'

export default class View extends Element {
  _getDefaultStyles() {
    return {
      ...STYLES.DEFAULT_STYLES,
      display: STYLES.DISPLAY.BLOCK
    }
  }

  _completeStyles() {
    super._completeStyles()
    this._completePaddingMargin()
  }

  _completePaddingMargin() {
    if (this.styles.padding) {
      this.styles.paddingLeft = this.styles.padding
      this.styles.paddingBottom = this.styles.padding
      this.styles.paddingRight = this.styles.padding
      this.styles.paddingTop = this.styles.padding
    }

    if (this.styles.margin) {
      this.styles.marginLeft = this.styles.margin
      this.styles.marginBottom = this.styles.margin
      this.styles.marginRight = this.styles.margin
      this.styles.marginTop = this.styles.margin
    }
  }

  _reflow() {
    super._reflow()
  }

  _repaint() {
    super._repaint()
  }

  _afterPaint() {
    super._afterPaint()
  }

  _drawBackground() {
    const { backgroundColor, contentWidth, contentHeight, paddingLeft, paddingRight, paddingTop, paddingBottom } = this.renderStyles
    const ctx = this.getCtx()

    this._clip()
    // draw background
    if (backgroundColor) {
      this.getCtx().fillStyle = backgroundColor
      this.getCtx().fillRect(this.contentX - paddingLeft, this.contentY - paddingTop, contentWidth + paddingLeft + paddingRight, contentHeight + paddingTop + paddingBottom)
    }
  }

  _drawBoxShadow() {

  }

  _drawBox() {

    this._drawRadiusBorder()


    // debug
    // this.getCtx().strokeStyle = 'green'
    // this.getCtx().strokeRect(this.contentX, this.contentY, this.renderStyles.contentWidth, this.renderStyles.contentHeight)

    // ctx.strokeStyle = '#fff'
    // ctx.strokeText(`${parseInt(this.contentX)} ${parseInt(this.contentY)} ${contentWidth} ${contentHeight}`, this.contentX + 100, this.contentY + 10)

    //
  }

  _drawRadiusBorder() {
    const { contentWidth, contentHeight, paddingLeft, paddingTop,
      paddingRight, paddingBottom, boxShadowBlur, boxShadowColor, backgroundColor,
      borderLeftWidth, borderRightWidth, borderTopWidth, borderBottomWidth } = this.renderStyles

    const angle = Math.PI / 2
    let borderRadius = this._getBorderRadius()


    // 这里是计算画border的位置，起点位置是在线条中间，所以要考虑线条宽度
    let x = this.contentX - this.renderStyles.paddingLeft - borderLeftWidth / 2
    let y = this.contentY - this.renderStyles.paddingTop - borderTopWidth / 2
    let w = contentWidth + paddingLeft + paddingRight + (borderLeftWidth + borderRightWidth) / 2
    let h = contentHeight + paddingTop + paddingBottom + (borderTopWidth + borderBottomWidth) / 2


    const topBorder = () => {
      // 左上角开始
      this.getCtx().moveTo(x, y + borderRadius)
      borderRadius && this.getCtx().arc(x + borderRadius, y + borderRadius, borderRadius, 2 * angle, 3 * angle)
      this.getCtx().lineTo(x + w - borderRadius, y)
    }
    const rightBorder = () => {
      // 右上角
      // this.getCtx().moveTo(x + w - borderRadius, y)
      borderRadius && this.getCtx().arc(x + w - borderRadius, y + borderRadius, borderRadius, 3 * angle, 4 * angle)
      this.getCtx().lineTo(x + w, y + h - borderRadius)
    }

    const bottomBorder = () => {
      // 右下角
      // this.getCtx().moveTo(x + w, y + h - borderRadius)
      borderRadius && this.getCtx().arc(x + w - borderRadius, y + h - borderRadius, borderRadius, 0, angle)
      this.getCtx().lineTo(x + borderRadius, y + h)
    }

    const leftBorder = () => {
      // 左下角
      borderRadius && this.getCtx().arc(x + borderRadius, y + h - borderRadius, borderRadius, angle, angle * 2)
      this.getCtx().lineTo(x, y + borderRadius)
    }

    this.getCtx().lineCap = this.renderStyles.lineCap
    this.getCtx().strokeStyle = this.renderStyles.borderColor

    const stroke = (borderWidth) => {
      // 有样式则绘制出来
      this.getCtx().lineWidth = borderWidth
      this.getCtx().stroke()
    }

    this._path(() => {

      x = this.contentX - this.renderStyles.paddingLeft - borderLeftWidth / 2
      y = this.contentY - this.renderStyles.paddingTop - borderTopWidth / 2
      w = contentWidth + paddingLeft + paddingRight + (borderLeftWidth + borderRightWidth) / 2
      h = contentHeight + paddingTop + paddingBottom + (borderTopWidth + borderBottomWidth) / 2
      if (boxShadowBlur) {
        this.getCtx().shadowBlur = boxShadowBlur
        this.getCtx().shadowColor = boxShadowColor
      }
      if (this.renderStyles.borderTopWidth) {
        topBorder()
        stroke(this.renderStyles.borderTopWidth)
      }
      if (this.renderStyles.borderRightWidth) {
        this.getCtx().moveTo(x + w - borderRadius, y)
        rightBorder()
        stroke(this.renderStyles.borderRightWidth)
      }
      if (this.renderStyles.borderBottomWidth) {
        this.getCtx().moveTo(x + w, y + h - borderRadius)
        bottomBorder()
        stroke(this.renderStyles.borderBottomWidth)
      }
      if (this.renderStyles.borderLeftWidth) {
        this.getCtx().moveTo(x + borderRadius, y + h)
        leftBorder()
        stroke(this.renderStyles.borderLeftWidth)
      }




    })




  }

  _clip() {
    const { contentWidth, contentHeight, paddingLeft, paddingTop,
      paddingRight, paddingBottom, boxShadowBlur, boxShadowColor, backgroundColor,
      borderLeftWidth, borderRightWidth, borderTopWidth, borderBottomWidth } = this.renderStyles

    const angle = Math.PI / 2

    let borderRadius = this._getBorderRadius()

    // 为了把border也切进去
    let x = this.contentX - this.renderStyles.paddingLeft - borderLeftWidth
    let y = this.contentY - this.renderStyles.paddingTop - borderTopWidth
    let w = contentWidth + paddingLeft + paddingRight + borderLeftWidth + borderRightWidth
    let h = contentHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth

    const topBorder = () => {
      // 左上角开始
      this.getCtx().moveTo(x, y + borderRadius)
      borderRadius && this.getCtx().arc(x + borderRadius, y + borderRadius, borderRadius, 2 * angle, 3 * angle)
      this.getCtx().lineTo(x + w - borderRadius, y)
    }
    const rightBorder = () => {
      // 右上角
      // this.getCtx().moveTo(x + w - borderRadius, y)
      borderRadius && this.getCtx().arc(x + w - borderRadius, y + borderRadius, borderRadius, 3 * angle, 4 * angle)
      this.getCtx().lineTo(x + w, y + h - borderRadius)
    }

    const bottomBorder = () => {
      // 右下角
      // this.getCtx().moveTo(x + w, y + h - borderRadius)
      borderRadius && this.getCtx().arc(x + w - borderRadius, y + h - borderRadius, borderRadius, 0, angle)
      this.getCtx().lineTo(x + borderRadius, y + h)
    }

    const leftBorder = () => {
      // 左下角
      borderRadius && this.getCtx().arc(x + borderRadius, y + h - borderRadius, borderRadius, angle, angle * 2)
      this.getCtx().lineTo(x, y + borderRadius)
    }

    this._path(() => {

      topBorder()
      rightBorder()
      bottomBorder()
      leftBorder()
    })


    this.getCtx().clip()

  }

  _getBorderRadius() {
    const { contentWidth, contentHeight } = this.renderStyles
    let { borderRadius } = this.renderStyles
    if (borderRadius * 2 > contentWidth) {
      // 如果大于一半，则角不是90度，统一限制最大为一半
      borderRadius = contentWidth / 2
    }
    if (borderRadius * 2 > contentHeight) {
      borderRadius = contentHeight / 2
    }
    if (borderRadius < 0) borderRadius = 0
    return borderRadius
  }



}
