import View from './view'
import STYLES from './constants'
import { isExact, isAuto, isWX } from './utils'
import { getImage } from './weapp-adapter'

export default class $Image extends View {

  init() {
    super.init()
    this._imageInfo = {
      width: 0,
      height: 0,
      sx:0,
      sy:0,
      swidth:0,
      sheight:0,
      dx:0,
      dy:0,
      dwidth:0,
      dheight:0
    }
    this._image = null
    this._loadImage()
  }

  _loadImage() {
    return new Promise((resolve, reject) => {
      loadImage(this.options.attrs.src, this.getLayer().getCanvas())
        .then(({ info, image }) => {
          this._imageInfo = info
          this._image = image
          resolve()

          this._layoutImage()

          // // 重新布局绘制
          // this.getLayer().reflow()
          // this.getLayer().repaint()

          // call load callback
          if(this.options.on && this.options.on.load){
            this.options.on.load(this)
          }
        })
    })
  }

  _drawContent() {
    if (!this._image) return
    const { contentWidth, contentHeight } = this.renderStyles
    const {mode} = this.options.attrs
    const {sx,sy,swidth,sheight,dx,dy,dwidth,dheight,width:imageW,height:imageH} = this._imageInfo
    if(mode === 'aspectFill'){
      this.getCtx().drawImage(this._image,sx,sy,swidth,sheight, this.contentX, this.contentY, contentWidth, contentHeight)
    }else if(mode === 'aspectFit'){
      this.getCtx().drawImage(this._image,0,0,imageW,imageH,dx,dy,dwidth,dheight)
    }else{
      this.getCtx().drawImage(this._image, this.contentX, this.contentY, contentWidth, contentHeight)
    }
  }

  // 计算图片布局
  _layoutImage() {
    const { contentWidth, contentHeight } = this.renderStyles
    const {mode} = this.options.attrs
    const { width, height } = this.styles
    const {width:imageW,height:imageH} = this._imageInfo
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
    }else if(mode === 'aspectFill'){
      // 填充
      if((w/h) > (imageW/imageH)){
        this._imageInfo.swidth = imageW
        this._imageInfo.sheight = getHeightByWidth(imageW,w,h)
        this._imageInfo.sx = 0
        this._imageInfo.sy = (imageH - this._imageInfo.sheight)/2
      }else{
        this._imageInfo.sheight = imageH
        this._imageInfo.swidth = getWidthByHeight(imageH,contentWidth,contentHeight)
        this._imageInfo.sy = 0
        this._imageInfo.sx = (imageW - this._imageInfo.swidth)/2
      }
    }else if(mode === 'aspectFit'){
      if((w/h) > (imageW/imageH)){
        this._imageInfo.dwidth = getWidthByHeight(contentHeight,imageW,imageH)
        this._imageInfo.dheight = contentHeight
        this._imageInfo.dy = this.contentY
        this._imageInfo.dx = (contentWidth - this._imageInfo.dwidth)/2 + this.contentX
      }else{
        this._imageInfo.dheight = getHeightByWidth(contentWidth,imageW,imageH)
        this._imageInfo.dwidth = contentWidth
        this._imageInfo.dx = this.contentX
        this._imageInfo.dy = (contentHeight - this._imageInfo.dheight)/2 + this.contentY
      }
    }else {
      w = contentWidth
      h = contentHeight
    }
    this._layout = {width:w,h:height}
  }

  _measureLayout(){
    if(this._layout){
      return this._layout
    }else{
      return {
        width:this.renderStyles.width,
        height:this.renderStyles.height
      }
    }
  }

}

// canvas可能为空，小程序下必传
function loadImage(src, canvas) {

  return new Promise((resolve, reject) => {
    let image = null

    if (isWX()) {
      image = canvas.createImage()
    } else {
      image = new Image()
    }

    image.src = src
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

function getWidthByHeight(height, originWidth, originHeight) {
  return height / originHeight * originWidth
}

function getHeightByWidth(width, originWidth, originHeight) {
  return width / originWidth * originHeight
}
