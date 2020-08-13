import View from './view'
import STYLES from './constants'
import { isExact, isAuto } from './utils'

export default class $Image extends View {

  init() {
    super.init()
    this._imageInfo = {
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0
    }
    this._image = null
    this._loadImage()
  }

  _loadImage() {
    return new Promise((resolve, reject) => {
      loadImage(this.options.attrs.src)
        .then(({ info, image }) => {
          this._imageInfo = info
          this._image = image
          resolve()

          this._layoutImage()

          // 重新布局绘制
          this.getRender().reflow()
          this.getRender().repaint()
        })
    })
  }

  _drawContent() {
    if (!this._image) return
    const { contentWidth, contentHeight } = this.renderStyles
    this.ctx.drawImage(this._image, this.contentX, this.contentY, contentWidth, contentHeight)
  }

  _layoutImage() {
    const { contentWidth, contentHeight } = this.renderStyles
    let { width, height } = this.styles
    // 根据用户设置判断图片宽高，目前支持widthfix、heightfix、平铺
    if (!isAuto(width) && isAuto(height)) {
      width = contentWidth
      height = getHeightByWidth(width, this._imageInfo.width, this._imageInfo.height)
    } else if (!isAuto(height) && isAuto(width)) {
      height = contentHeight
      width = getWidthByHeight(height, this._imageInfo.width, this._imageInfo.height)
    } else if (isAuto(width) && isAuto(height)) {
      width = this._imageInfo.width
      height = this._imageInfo.height
    } else {
      width = contentWidth
      height = contentHeight
    }
    this.renderStyles.contentWidth = width
    this.renderStyles.contentHeight = height
    this._calcLayoutWithContent()
  }


}

function loadImage(src) {
  const image = new Image()
  image.src = src
  return new Promise((resolve, reject) => {
    image.onload = function (e) {
      resolve({
        image,
        info: {
          width: e.path[0].width,
          height: e.path[0].height
        }
      })
    }

  })
}

function getWidthByHeight(height, originWidth, originHeight) {
  return height / originHeight * originWidth
}

function getHeightByWidth(width, originWidth, originHeight) {
  return width / originWidth * originHeight
}
