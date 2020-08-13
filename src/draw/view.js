import Element from './element'
import STYLES from './constants'

export default class View extends Element {
  _getDefaultStyles() {
    return {
      ...STYLES.DEFAULT_STYLES,
      display: STYLES.DISPLAY.BLOCK
    }
  }

  _repaint() {
    super._repaint()
  }

  _afterPaint() {
    super._afterPaint()
  }

  _drawBox() {
    this._drawBorder()


    // debug
    // ctx.strokeStyle = 'green'
    // ctx.strokeRect(this.contentX, this.contentY, contentWidth, contentHeight)

    // ctx.strokeStyle = '#fff'
    // ctx.strokeText(`${parseInt(this.contentX)} ${parseInt(this.contentY)} ${contentWidth} ${contentHeight}`, this.contentX + 100, this.contentY + 10)

    //
  }

  _drawBorder() {
    const { backgroundColor, contentWidth, contentHeight, borderColor, borderStyle, borderWidth, borderRadius } = this.renderStyles
    const ctx = this.ctx

    this._drawRadiusBorder()



    // draw background
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor
      ctx.fill()
    }


  }

  _drawRadiusBorder() {
    const { contentWidth, contentHeight, paddingLeft, paddingTop,
      paddingRight, paddingBottom, boxShadowBlur, boxShadowColor,
      borderLeftWidth, borderRightWidth, borderTopWidth, borderBottomWidth } = this.renderStyles
    let x = this.contentX - this.renderStyles.paddingLeft
    let y = this.contentY - this.renderStyles.paddingTop
    let w = contentWidth + paddingLeft + paddingRight
    let h = contentHeight + paddingTop + paddingBottom
    const angle = Math.PI / 2
    let { borderRadius } = this.renderStyles
    if (borderRadius * 2 > contentWidth) {
      // 如果大于一半，则角不是90度，统一限制最大为一半
      borderRadius = contentWidth / 2
    }
    if (borderRadius * 2 > contentHeight) {
      borderRadius = contentHeight / 2
    }
    if (borderRadius < 0) borderRadius = 0


    const topBorder = () => {
      // 左上角开始
      this.ctx.moveTo(x, y + borderRadius)
      borderRadius && this.ctx.arc(x + borderRadius, y + borderRadius, borderRadius, 2 * angle, 3 * angle)
      this.ctx.lineTo(x + w - borderRadius, y)
    }
    const rightBorder = () => {
      // 右上角
      // this.ctx.moveTo(x + w - borderRadius, y)
      borderRadius && this.ctx.arc(x + w - borderRadius, y + borderRadius, borderRadius, 3 * angle, 4 * angle)
      this.ctx.lineTo(x + w, y + h - borderRadius)
    }

    const bottomBorder = () => {
      // 右下角
      // this.ctx.moveTo(x + w, y + h - borderRadius)
      borderRadius && this.ctx.arc(x + w - borderRadius, y + h - borderRadius, borderRadius, 0, angle)
      this.ctx.lineTo(x + borderRadius, y + h)
    }

    const leftBorder = () => {
      // 左下角
      borderRadius && this.ctx.arc(x + borderRadius, y + h - borderRadius, borderRadius, angle, angle * 2)
      this.ctx.lineTo(x, y + borderRadius)
    }

    this._path(() => {

      if (this.renderStyles.borderTopWidth) {
        topBorder()
      }
      if (this.renderStyles.borderRightWidth) {
        this.ctx.moveTo(x + w - borderRadius, y)
        rightBorder()
      }
      if (this.renderStyles.borderBottomWidth) {
        this.ctx.moveTo(x + w, y + h - borderRadius)
        bottomBorder()
      }
      if (this.renderStyles.borderLeftWidth) {
        this.ctx.moveTo(x + borderRadius, y + h)
        leftBorder()
      }

      // 有样式则绘制出来
      this.ctx.strokeStyle = this.renderStyles.borderColor
      this.ctx.lineWidth = this.renderStyles.borderWidth
      this.ctx.stroke()
    })

    this._path(() => {
      // x = this.contentX - this.renderStyles.paddingLeft - borderLeftWidth
      // y = this.contentY - this.renderStyles.paddingTop - borderTopWidth
      // w = contentWidth + paddingLeft + paddingRight + borderLeftWidth + borderRightWidth
      // h = contentHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth
      topBorder()
      rightBorder()
      bottomBorder()
      leftBorder()
    })

    // boxshadow todo
    // this._restore(() => {
    //   if (boxShadowColor) {
    //     this.ctx.shadowColor = boxShadowColor
    //     this.ctx.shadowBlur = boxShadowBlur
    //     this.ctx.stroke()
    //   }
    //   this.ctx.clip('nonzero')
    // })

    this.ctx.clip()




  }

}
