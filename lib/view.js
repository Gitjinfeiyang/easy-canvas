import Element from './element'
import STYLES from './constants'
import { isExact } from './utils'

export default class View extends Element {
  _getDefaultStyles() {
    return {
      ...STYLES.DEFAULT_STYLES,
      display: STYLES.DISPLAY.BLOCK
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
    const { backgroundColor, contentWidth, contentHeight, paddingLeft, paddingRight, paddingTop, paddingBottom, opacity } = this.renderStyles
    const ctx = this.getCtx()

    if (isExact(opacity)) {
      // 绘制透明图
      ctx.globalAlpha = opacity
    }

    this._clip()
    // draw background
    if (backgroundColor) {
      this.getCtx().fillStyle = this._parseBackground(backgroundColor)
      this.getCtx().fillRect(this.contentX - paddingLeft, this.contentY - paddingTop, contentWidth + paddingLeft + paddingRight, contentHeight + paddingTop + paddingBottom)
    }

    // for debug
    if (this.getLayer().options && this.getLayer().options.debug) {
      this.getCtx().strokeStyle = this.debugColor || 'green'
      this.getCtx().strokeRect(this.contentX, this.contentY, this.renderStyles.contentWidth, this.renderStyles.contentHeight)
      // ctx.strokeStyle = '#fff'
      // ctx.strokeText(`${parseInt(this.contentX)} ${parseInt(this.contentY)} ${contentWidth} ${contentHeight}`, this.contentX + 100, this.contentY + 10)

      //
    }
  }

  _drawBox() {

    this._drawRadiusBorder()

  }

  _drawRadiusBorder() {
    if (!(this.renderStyles.borderColor || this.renderStyles.shadowBlur)) return
    const { contentWidth, contentHeight, paddingLeft, paddingTop, borderStyle,
      paddingRight, paddingBottom, shadowBlur, shadowColor, backgroundColor, shadowOffsetX, shadowOffsetY,
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

    // 实现虚线
    if (borderStyle && borderStyle !== 'solid') {
      if (Array.isArray(borderStyle)) {
        this.getCtx().setLineDash(borderStyle)
      } else {
        this.getCtx().setLineDash([5, 5])
      }
    }

    const stroke = (borderWidth) => {
      // 有样式则绘制出来
      this.getCtx().lineWidth = borderWidth
      this.getCtx().stroke()
    }
    // 绘制boxshadow
    if (shadowColor && shadowBlur) {
      this._restore(() => {
        this._path(() => {
          topBorder()
          rightBorder()
          bottomBorder()
          leftBorder()
        })
        if (isExact(shadowOffsetX)) {
          this.getCtx().shadowOffsetX = shadowOffsetX
        }
        if (isExact(shadowOffsetY)) {
          this.getCtx().shadowOffsetY = shadowOffsetY
        }
        this.getCtx().shadowBlur = shadowBlur
        this.getCtx().shadowColor = shadowColor
        this.getCtx().fillStyle = shadowColor
        this.getCtx().fill()
      })
    }
    this._restore(() => {
      this._path(() => {

        x = this.contentX - this.renderStyles.paddingLeft - borderLeftWidth / 2
        y = this.contentY - this.renderStyles.paddingTop - borderTopWidth / 2
        w = contentWidth + paddingLeft + paddingRight + (borderLeftWidth + borderRightWidth) / 2
        h = contentHeight + paddingTop + paddingBottom + (borderTopWidth + borderBottomWidth) / 2
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
    })






  }

  _clip() {
    if (this.renderStyles.overflow !== 'hidden') return
    const { contentWidth, contentHeight, paddingLeft, paddingTop,
      paddingRight, paddingBottom, shadowBlur, shadowColor, backgroundColor,
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

  _parseBackground(color) {
    if (Array.isArray(color)) {
      const gradient = this.getCtx().createLinearGradient(this.contentX, this.contentY, this.renderStyles.contentWidth, this.renderStyles.contentHeight)
      for (let i = 0; i < color.length; i++) {
        if (i === 0) {
          gradient.addColorStop(0, color[0])
        } else {
          gradient.addColorStop(i / (color.length - 1), color[i])
        }
      }
      return gradient
    } else {
      return color
    }
  }



}
