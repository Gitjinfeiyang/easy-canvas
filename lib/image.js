import View from './view'
import STYLES from './constants'
import { isExact, isAuto, isWX } from './utils'
import { getImage } from './weapp-adapter'

export default class $Image extends View {

  constructor(options, children) {
    super(options, children)
    this.type = 'image'
    this._imageInfo = {
      width: 0,
      height: 0,
      sx: 0,
      sy: 0,
      swidth: 0,
      sheight: 0,
      dx: 0,
      dy: 0,
      dwidth: 0,
      dheight: 0
    }
    this.debugColor = 'blue'
    this._image = null
    this._layout = null
  }

  init() {
    super.init()
    if(this.options && this.options.attrs && this.options.attrs.timeout){
      setTimeout(() => {
        this._loadImage()
      },this.options.attrs.timeout || 0)
    }else{
      this._loadImage()
    }
  }

  _paint() {
    this.getRender()._drawBackground(this)
    this.getRender()._drawImage(this)
    this.getRender()._drawBox(this)
  }

  _loadImage() {
    const { mode } = this.options.attrs

    return new Promise((resolve, reject) => {
      this.getRender().getImageInstance(this.options.attrs.src)
        .then(({ info, image }) => {
          this._imageInfo = info
          this._image = image
          resolve()

          this._layoutImage()

          if (this.isVisible()) {
            // if (mode === 'aspectFill' || mode === 'aspectFit') {
            //   // this.getLayer().onElementChange(this)
            //   this.getLayer().repaint(this)
            // } else {
            // // 重新布局绘制
              this.getLayer().reflowElement(this)
            // }
          }

          // call load callback
          if (this.options.on && this.options.on.load) {
            this.options.on.load(this)
          }
        })
        .catch(err => {
          // call error callback
          if (this.options.on && this.options.on.error) {
            this.options.on.error(err)
          }
        })
    })
  }

  // 计算图片布局
  _layoutImage() {
    const { contentWidth, contentHeight } = this.renderStyles
    const { mode } = this.options.attrs
    const { width, height } = this.styles
    const { width: imageW, height: imageH } = this._imageInfo
    // 根据用户设置判断图片宽高，目前支持widthfix、heightfix、平铺
    let w = contentWidth
    let h = contentHeight
    if (!isAuto(width) && isAuto(height)) {
      // width fix
      w = contentWidth
      h = getHeightByWidth(w, imageW, imageH)
    } else if (!isAuto(height) && isAuto(width)) {
      // height fix
      h = contentHeight
      w = getWidthByHeight(h, imageW, imageH)
    } else if (isAuto(width) && isAuto(height)) {
      // auto
      w = imageW
      h = imageH
    } else if (mode === 'aspectFill') {
      // 填充
      if ((w / h) > (imageW / imageH)) {
        this._imageInfo.swidth = imageW
        this._imageInfo.sheight = getHeightByWidth(imageW, w, h)
        this._imageInfo.sx = 0
        this._imageInfo.sy = (imageH - this._imageInfo.sheight) / 2
      } else {
        this._imageInfo.sheight = imageH
        this._imageInfo.swidth = getWidthByHeight(imageH, contentWidth, contentHeight)
        this._imageInfo.sy = 0
        this._imageInfo.sx = (imageW - this._imageInfo.swidth) / 2
      }
    } else if (mode === 'aspectFit') {
      if ((w / h) > (imageW / imageH)) {
        this._imageInfo.dwidth = getWidthByHeight(contentHeight, imageW, imageH)
        this._imageInfo.dheight = contentHeight
        this._imageInfo.dy = this.contentY
        this._imageInfo.dx = (contentWidth - this._imageInfo.dwidth) / 2 + this.contentX
      } else {
        this._imageInfo.dheight = getHeightByWidth(contentWidth, imageW, imageH)
        this._imageInfo.dwidth = contentWidth
        this._imageInfo.dx = this.contentX
        this._imageInfo.dy = (contentHeight - this._imageInfo.dheight) / 2 + this.contentY
      }
    } else {
      w = contentWidth
      h = contentHeight
    }
    this._layout = { width: w, height: h }
  }

  _measureLayout() {
    if (this._layout) {
      return this._layout
    } else {
      return {
        width: this.renderStyles.width,
        height: this.renderStyles.height
      }
    }
  }

}


function getWidthByHeight(height, originWidth, originHeight) {
  return height / originHeight * originWidth
}

function getHeightByWidth(width, originWidth, originHeight) {
  return width / originWidth * originHeight
}
