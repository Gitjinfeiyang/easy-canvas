import { isExact, walk, isOuter, parseOuter, walkParent, isEndNode, isAuto, isWX } from './utils'
import STYLES from './constants'
const angle = Math.PI / 2

export default class CanvasRender {
  constructor(layer) {
    this.layer = layer
    this.imageBus = {}
  }

  getCtx() {
    return this.layer.ctx
  }

  getLayer() {
    return this.layer
  }

  _restore(callback) {
    this.getCtx().save()
    callback()
    this.getCtx().restore()
  }

  _path(callback) {
    this.getCtx().beginPath()
    callback()
    this.getCtx().closePath()
  }

  paint(element) {
    this.getCtx().save()

    element._paint()

    this.afterPaint(element)
  }

  afterPaint(element) {
    // 这里通过this.ctx栈实现了overflow
    // 第一步判断没有子元素，绘制完成即restore 有子元素需要子元素全部绘制完毕再restore
    if (!element.hasChildren() || element.type === 'text') {
      this.getCtx().restore()
    }

    // 如果到了层级的最后一个 释放父级的stack
    this._helpParentRestoreCtx(element)
  }

  _helpParentRestoreCtx(element) {
    if ((element.isVisible() && !isEndNode(element)) || (!element.isVisible() && element.next)) return
    let cur = element.parent
    while (cur && !cur.next) {
      // 如果父级也是同级最后一个，再闭合上一个
      this.getCtx().restore()
      cur = cur.parent
    }

    if (cur && cur.next) {
      // 当前子节点全部闭合
      this.getCtx().restore()
    }

  }

  topBorder({ x, y, borderRadius, w, h }) {
    // 左上角开始
    this.getCtx().moveTo(x, y + borderRadius)
    borderRadius && this.getCtx().arc(x + borderRadius, y + borderRadius, borderRadius, 2 * angle, 3 * angle)
    this.getCtx().lineTo(x + w - borderRadius, y)
  }

  rightBorder({ x, y, borderRadius, w, h }) {
    // 右上角
    // this.getCtx().moveTo(x + w - borderRadius, y)
    borderRadius && this.getCtx().arc(x + w - borderRadius, y + borderRadius, borderRadius, 3 * angle, 4 * angle)
    this.getCtx().lineTo(x + w, y + h - borderRadius)
  }

  bottomBorder({ x, y, borderRadius, w, h }) {
    // 右下角
    // this.getCtx().moveTo(x + w, y + h - borderRadius)
    borderRadius && this.getCtx().arc(x + w - borderRadius, y + h - borderRadius, borderRadius, 0, angle)
    this.getCtx().lineTo(x + borderRadius, y + h)
  }

  leftBorder({ x, y, borderRadius, w, h }) {
    // 左下角
    borderRadius && this.getCtx().arc(x + borderRadius, y + h - borderRadius, borderRadius, angle, angle * 2)
    this.getCtx().lineTo(x, y + borderRadius)
  }

  _drawBox(element) {
    if (!(element.renderStyles.borderColor || element.renderStyles.shadowBlur)) return
    const { contentWidth, contentHeight, paddingLeft, paddingTop, borderStyle,
      paddingRight, paddingBottom, shadowBlur, shadowColor, backgroundColor, shadowOffsetX, shadowOffsetY,
      borderLeftWidth, borderRightWidth, borderTopWidth, borderBottomWidth } = element.renderStyles

    let borderRadius = getBorderRadius(element)


    // 这里是计算画border的位置，起点位置是在线条中间，所以要考虑线条宽度
    let x = element.contentX - element.renderStyles.paddingLeft - borderLeftWidth / 2
    let y = element.contentY - element.renderStyles.paddingTop - borderTopWidth / 2
    let w = contentWidth + paddingLeft + paddingRight + (borderLeftWidth + borderRightWidth) / 2
    let h = contentHeight + paddingTop + paddingBottom + (borderTopWidth + borderBottomWidth) / 2

    this.getCtx().lineCap = element.renderStyles.lineCap
    this.getCtx().strokeStyle = element.renderStyles.borderColor
    this.getCtx().lineJoin = 'round'

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

    this._restore(() => {
      this._path(() => {

        if (element.renderStyles.borderTopWidth) {
          this.topBorder({ x, y, borderRadius:borderRadius + (element.renderStyles.borderTopWidth/2), w, h })
          stroke(element.renderStyles.borderTopWidth)
        }
        if (element.renderStyles.borderRightWidth) {
          this.getCtx().moveTo(x + w - borderRadius- (element.renderStyles.borderTopWidth/2), y)
          this.rightBorder({ x, y,  borderRadius:borderRadius + element.renderStyles.borderRightWidth/2, w, h })
          stroke(element.renderStyles.borderRightWidth)
        }
        if (element.renderStyles.borderBottomWidth) {
          this.getCtx().moveTo(x + w, y + h - borderRadius- (element.renderStyles.borderRightWidth/2))
          this.bottomBorder({ x, y,  borderRadius:borderRadius + (element.renderStyles.borderBottomWidth/2), w, h })
          stroke(element.renderStyles.borderBottomWidth)
        }
        if (element.renderStyles.borderLeftWidth) {
          this.getCtx().moveTo(x + borderRadius+ element.renderStyles.borderBottomWidth/2, y + h)
          this.leftBorder({ x, y,  borderRadius:borderRadius + (element.renderStyles.borderLeftWidth/2), w, h })
          stroke(element.renderStyles.borderLeftWidth)
        }
      })
    })

  }

  _drawBackground(element) {
    const { backgroundColor, contentWidth, contentHeight, shadowColor, shadowBlur,
      paddingLeft, paddingRight, paddingTop, paddingBottom, opacity, shadowOffsetX, shadowOffsetY,
      borderLeftWidth, borderRightWidth, borderTopWidth, borderBottomWidth } = element.renderStyles
    const ctx = this.getCtx()

    let borderRadius = getBorderRadius(element)


    // 这里是计算画border的位置，起点位置是在线条中间，所以要考虑线条宽度
    let x = element.contentX - element.renderStyles.paddingLeft - borderLeftWidth
    let y = element.contentY - element.renderStyles.paddingTop - borderTopWidth
    let w = contentWidth + paddingLeft + paddingRight + (borderLeftWidth + borderRightWidth)
    let h = contentHeight + paddingTop + paddingBottom + (borderTopWidth + borderBottomWidth)

    if (isExact(opacity)) {
      // 绘制透明图
      ctx.globalAlpha = opacity
    }

    // 绘制boxshadow
    // 需要在clip之前
    if (shadowColor && shadowBlur) {
      this._restore(() => {
        this._path(() => {
          this.topBorder({ x, y, borderRadius, w, h })
          this.rightBorder({ x, y, borderRadius, w, h })
          this.bottomBorder({ x, y, borderRadius, w, h })
          this.leftBorder({ x, y, borderRadius, w, h })
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

    this._clip(element)



    // draw background
    if (backgroundColor) {
      this.getCtx().fillStyle = this._parseBackground(backgroundColor, element)
      this.getCtx().fillRect(element.contentX - paddingLeft, element.contentY - paddingTop, contentWidth + paddingLeft + paddingRight, contentHeight + paddingTop + paddingBottom)
    }

    // for debug
    if (this.getLayer().options && this.getLayer().options.debug) {
      this.getCtx().strokeStyle = 'green'
      this.getCtx().strokeRect(element.contentX, element.contentY, element.renderStyles.contentWidth, element.renderStyles.contentHeight)
      // ctx.strokeStyle = '#fff'
      // ctx.strokeText(`${parseInt(this.contentX)} ${parseInt(this.contentY)} ${contentWidth} ${contentHeight}`, this.contentX + 100, this.contentY + 10)

      //
    }
  }

  _clip(element) {
    if (element.renderStyles.overflow !== 'hidden') return
    const { contentWidth, contentHeight, paddingLeft, paddingTop,
      paddingRight, paddingBottom, shadowBlur, shadowColor, backgroundColor,
      borderLeftWidth, borderRightWidth, borderTopWidth, borderBottomWidth } = element.renderStyles

    const angle = Math.PI / 2

    let borderRadius = getBorderRadius(element)

    // 为了把border也切进去
    let x = element.contentX - element.renderStyles.paddingLeft - borderLeftWidth
    let y = element.contentY - element.renderStyles.paddingTop - borderTopWidth
    let w = contentWidth + paddingLeft + paddingRight + borderLeftWidth + borderRightWidth
    let h = contentHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth

    this._path(() => {
      this.topBorder({ x, y, borderRadius, w, h })
      this.rightBorder({ x, y, borderRadius, w, h })
      this.bottomBorder({ x, y, borderRadius, w, h })
      this.leftBorder({ x, y, borderRadius, w, h })
    })


    this.getCtx().clip()

  }

  _parseBackground(color, element) {
    if (Array.isArray(color)) {
      const gradient = this.getCtx().createLinearGradient(element.contentX, element.contentY, element.renderStyles.contentWidth, element.renderStyles.contentHeight)
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

  _drawContent(element) {
    switch (element.type) {
      case 'text': this._drawText(element); break
      case 'image': this._drawImage(element); break
      case 'scroll-view': this._drawScroll(element); break
    }
  }

  _drawText(element) {
    const { color, contentWidth, lineHeight, textAlign, textIndent } = element.renderStyles
    let x = element.contentX
    this.getCtx().fillStyle = color
    this.getCtx().textAlign = textAlign
    this.getCtx().font = element._getFont()
    if (textAlign === STYLES.TEXT_ALIGN.RIGHT) {
      x = element.contentX + contentWidth
    } else if (textAlign === STYLES.TEXT_ALIGN.CENTER) {
      x = element.contentX + (contentWidth / 2)
    }
    let _x = x
    element._lines.forEach((line, index) => {
      if (index === 0 && textIndent) {
        // 第一行实现textIndent
        _x = x + textIndent
      } else {
        _x = x
      }
      this.getCtx().fillText(line, _x, (element.contentY + ((lineHeight + element._layout.fontHeight) / 2) + lineHeight * index))
    })
  }

  /**
   * @param {String} text
   * @return {Object<width,height>}
   */
  measureText(element, text) {
    let w = 0
    this._restore(() => {
      this.getCtx().font = element._getFont()
      const { width } = this.getCtx().measureText(text)
      w = width
    })
    return {
      width: w
    }
  }

  _drawImage(element) {
    if (!element._image) return
    const { contentWidth, contentHeight } = element.renderStyles
    const { mode } = element.options.attrs
    const { sx, sy, swidth, sheight, dx, dy, dwidth, dheight, width: imageW, height: imageH } = element._imageInfo
    if (mode === 'aspectFill') {
      this.getCtx().drawImage(element._image, sx, sy, swidth, sheight, element.contentX, element.contentY, contentWidth, contentHeight)
    } else if (mode === 'aspectFit') {
      this.getCtx().drawImage(element._image, 0, 0, imageW, imageH, dx, dy, dwidth, dheight)
    } else {
      this.getCtx().drawImage(element._image, element.contentX, element.contentY, contentWidth, contentHeight)
    }
  }

  _drawScroll(element) {
    this.getCtx().translate(element.currentScrollX, element.currentScrollY)
  }

  /**
   * 这里应该保证onload src等接口
   */
  getImageInstance(src) {
    let image = null

    // 同样的路径返回缓存
    if (this.imageBus[src]) {
      image = this.imageBus[src]
    } else {

      if (isWX()) {
        // 微信环境下必须传canvas
        if (!this.getLayer().options.canvas) {
          throw Error('微信小程序中需要在options中设置canvas以创建图片')
        }
        image = this.getLayer().options.canvas.createImage()
      } else {
        image = new Image()
      }

      if (src) {
        this.imageBus[src] = new Promise((resolve, reject) => {
          image.onload = function (e) {
            resolve({
              image,
              info: {
                width: e.target.width,
                height: e.target.height
              }
            })
          }
        })
      }

      image.src = src
    }
    return this.imageBus[src]
  }

  render(element) {
    if (!element.parent) {
      // root
      this.getCtx().clearRect(0, 0, this.getLayer().options.width, this.getLayer().options.height)
    } else {
      this.getCtx().clearRect(element.x, element.y, element.renderStyles.width, element.renderStyles.height)
    }
    walk(element, (element, callContinue, callNext) => {
      if (element.isVisible()) {
        // 可见的才渲染
        this.paint(element)
      } else {
        // 跳过整个子节点
        callNext()
        this._helpParentRestoreCtx(element)
      }
    })
    if (isWX()) {
      // 兼容小程序
      this.getCtx().draw && this.getCtx().draw()
    }
  }



}

function getBorderRadius(element) {
  const { contentWidth, contentHeight } = element.renderStyles
  let { borderRadius } = element.renderStyles
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
