import { isExact, walk, isEndNode, isWX, getThrottle, floor } from "./utils";
import STYLES from "./constants";
import { getImage } from "./weapp-adapter";

const angle = Math.PI / 2;

/**
 * 封装图形api
 */
export default class CanvasRender {
  constructor(layer) {
    this.layer = layer;
    this.imageBus = {};
    this.isAnimate = false;
    this.lastPaintTime = 0;
    this.lastFrameComplete = false;
    this.throttle = getThrottle(16);
  }

  isDebug() {
    return this.getLayer().options && this.getLayer().options.debug;
  }

  getCtx() {
    return this.layer.ctx;
  }

  getLayer() {
    return this.layer;
  }

  _restore(callback) {
    this.getCtx().save();
    callback();
    this.getCtx().restore();
  }

  _path(callback) {
    this.getCtx().beginPath();
    callback();
    this.getCtx().closePath();
  }

  paint(element) {
    this.getCtx().save();

    element._paint(this.lastPaintTime);

    this.afterPaint(element);
  }

  afterPaint(element) {
    // 这里通过this.ctx栈实现了overflow
    // 第一步判断没有子元素，绘制完成即restore 有子元素需要子元素全部绘制完毕再restore
    if (!element.hasChildren() || element.type === "text") {
      this.getCtx().restore();
    }

    // 如果到了层级的最后一个 释放父级的stack
    this._helpParentRestoreCtx(element);
  }

  _helpParentRestoreCtx(element) {
    if (
      (element.isVisible() && !isEndNode(element)) ||
      (!element.isVisible() && element.next)
    )
      return;
    this.getCtx().restore();
    let cur = element.parent;
    while (cur && !cur.next) {
      // 如果父级也是同级最后一个，再闭合上一个
      this.getCtx().restore();
      cur = cur.parent;
    }
  }

  topBorder({ x, y, borderRadius, w, h }) {
    // 左上角开始
    this.getCtx().moveTo(x, y + borderRadius);
    borderRadius &&
      this.getCtx().arc(
        x + borderRadius,
        y + borderRadius,
        borderRadius,
        2 * angle,
        3 * angle
      );
    this.getCtx().lineTo(x + w - borderRadius, y);
  }

  rightBorder({ x, y, borderRadius, w, h }) {
    // 右上角
    // this.getCtx().moveTo(x + w - borderRadius, y)
    borderRadius &&
      this.getCtx().arc(
        x + w - borderRadius,
        y + borderRadius,
        borderRadius,
        3 * angle,
        4 * angle
      );
    this.getCtx().lineTo(x + w, y + h - borderRadius);
  }

  bottomBorder({ x, y, borderRadius, w, h }) {
    // 右下角
    // this.getCtx().moveTo(x + w, y + h - borderRadius)
    borderRadius &&
      this.getCtx().arc(
        x + w - borderRadius,
        y + h - borderRadius,
        borderRadius,
        0,
        angle
      );
    this.getCtx().lineTo(x + borderRadius, y + h);
  }

  leftBorder({ x, y, borderRadius, w, h }) {
    // 左下角
    borderRadius &&
      this.getCtx().arc(
        x + borderRadius,
        y + h - borderRadius,
        borderRadius,
        angle,
        angle * 2
      );
    this.getCtx().lineTo(x, y + borderRadius);
  }

  _drawBox(element) {
    if (!(element.renderStyles.borderColor || element.renderStyles.shadowBlur))
      return;
    const {
      contentWidth,
      contentHeight,
      paddingLeft,
      paddingTop,
      borderStyle,
      paddingRight,
      paddingBottom,
      borderLeftWidth,
      borderRightWidth,
      borderTopWidth,
      borderBottomWidth,
      borderWidth,
    } = element.renderStyles;

    let borderRadius = getBorderRadius(element);

    // 这里是计算画border的位置，起点位置是在线条中间，所以要考虑线条宽度
    let x =
      element.contentX - element.renderStyles.paddingLeft - borderLeftWidth / 2;
    let y =
      element.contentY - element.renderStyles.paddingTop - borderTopWidth / 2;
    let w =
      contentWidth +
      paddingLeft +
      paddingRight +
      (borderLeftWidth + borderRightWidth) / 2;
    let h =
      contentHeight +
      paddingTop +
      paddingBottom +
      (borderTopWidth + borderBottomWidth) / 2;

    this.getCtx().lineCap = element.renderStyles.lineCap;
    this.getCtx().strokeStyle = element.renderStyles.borderColor;
    this.getCtx().lineJoin = "round";

    // 实现虚线
    if (borderStyle && borderStyle !== "solid") {
      if (Array.isArray(borderStyle)) {
        this.getCtx().setLineDash(borderStyle);
      } else {
        this.getCtx().setLineDash([5, 5]);
      }
    }

    const stroke = (borderWidth) => {
      // 有样式则绘制出来
      this.getCtx().lineWidth = borderWidth;
      this.getCtx().stroke();
    };
    this._restore(() => {
      this._path(() => {
        if (element.renderStyles.borderTopWidth) {
          this.topBorder({
            x,
            y,
            borderRadius: borderRadius
              ? borderRadius + element.renderStyles.borderTopWidth / 2
              : 0,
            w,
            h,
          });
          // 判断borderwidth 如果都是一样宽，只需要最后一次性绘制，提高性能
          !borderWidth && stroke(element.renderStyles.borderTopWidth);
        }
        if (element.renderStyles.borderRightWidth) {
          this.getCtx().moveTo(
            x +
              w -
              borderRadius -
              (borderRadius ? element.renderStyles.borderTopWidth / 2 : 0),
            y
          );
          this.rightBorder({
            x,
            y,
            borderRadius: borderRadius
              ? borderRadius + element.renderStyles.borderRightWidth / 2
              : 0,
            w,
            h,
          });
          !borderWidth && stroke(element.renderStyles.borderRightWidth);
        }
        if (element.renderStyles.borderBottomWidth) {
          this.getCtx().moveTo(
            x + w,
            y +
              h -
              borderRadius -
              (borderRadius ? element.renderStyles.borderRightWidth / 2 : 0)
          );
          this.bottomBorder({
            x,
            y,
            borderRadius: borderRadius
              ? borderRadius + element.renderStyles.borderBottomWidth / 2
              : 0,
            w,
            h,
          });
          !borderWidth && stroke(element.renderStyles.borderBottomWidth);
        }
        if (element.renderStyles.borderLeftWidth) {
          this.getCtx().moveTo(
            x +
              borderRadius +
              (borderRadius ? element.renderStyles.borderBottomWidth / 2 : 0),
            y + h
          );
          this.leftBorder({
            x,
            y,
            borderRadius: borderRadius
              ? borderRadius + element.renderStyles.borderLeftWidth / 2
              : 0,
            w,
            h,
          });
          stroke(element.renderStyles.borderLeftWidth);
        }
      });
    });
  }

  _drawBackground(element) {
    const {
      backgroundColor,
      contentWidth,
      contentHeight,
      shadowColor,
      shadowBlur,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      opacity,
      shadowOffsetX,
      shadowOffsetY,
      borderLeftWidth,
      borderRightWidth,
      borderTopWidth,
      borderBottomWidth,
    } = element.renderStyles;
    const ctx = this.getCtx();

    let borderRadius = getBorderRadius(element);

    // 这里是计算画border的位置，起点位置是在线条中间，所以要考虑线条宽度
    let x =
      element.contentX - element.renderStyles.paddingLeft - borderLeftWidth;
    let y = element.contentY - element.renderStyles.paddingTop - borderTopWidth;
    let w =
      contentWidth +
      paddingLeft +
      paddingRight +
      (borderLeftWidth + borderRightWidth);
    let h =
      contentHeight +
      paddingTop +
      paddingBottom +
      (borderTopWidth + borderBottomWidth);

    if (isExact(opacity)) {
      // 绘制透明图
      ctx.globalAlpha = opacity;
    }

    // 绘制boxshadow
    // 需要在clip之前
    if (shadowColor && shadowBlur) {
      this._restore(() => {
        this._path(() => {
          this.topBorder({ x, y, borderRadius, w, h });
          this.rightBorder({ x, y, borderRadius, w, h });
          this.bottomBorder({ x, y, borderRadius, w, h });
          this.leftBorder({ x, y, borderRadius, w, h });
        });
        if (isExact(shadowOffsetX)) {
          this.getCtx().shadowOffsetX = shadowOffsetX;
        }
        if (isExact(shadowOffsetY)) {
          this.getCtx().shadowOffsetY = shadowOffsetY;
        }
        this.getCtx().shadowBlur = shadowBlur;
        this.getCtx().shadowColor = shadowColor;
        this.getCtx().fillStyle = shadowColor;
        this.getCtx().fill();
      });
    }

    this._clip(element);

    // draw background
    if (backgroundColor) {
      this.getCtx().fillStyle = this._parseBackground(backgroundColor, element);
      this.getCtx().fillRect(
        element.contentX - paddingLeft,
        element.contentY - paddingTop,
        contentWidth + paddingLeft + paddingRight,
        contentHeight + paddingTop + paddingBottom
      );
    }

    // for debug
    if (this.isDebug()) {
      this.getCtx().strokeStyle = element.debugColor || "green";
      this.getCtx().strokeRect(
        element.contentX,
        element.contentY,
        element.renderStyles.contentWidth,
        element.renderStyles.contentHeight
      );
      // ctx.strokeStyle = '#fff'
      // ctx.strokeText(`${parseInt(this.contentX)} ${parseInt(this.contentY)} ${contentWidth} ${contentHeight}`, this.contentX + 100, this.contentY + 10)

      //
    }
  }

  _clip(element) {
    if (element.renderStyles.overflow !== "hidden") return;
    const {
      contentWidth,
      contentHeight,
      paddingLeft,
      paddingTop,
      paddingRight,
      paddingBottom,
      borderLeftWidth,
      borderRightWidth,
      borderTopWidth,
      borderBottomWidth,
    } = element.renderStyles;

    let borderRadius = getBorderRadius(element);

    const borderBase = 0.7;
    // 为了把border也切进去
    let x =
      element.contentX -
      element.renderStyles.paddingLeft -
      borderLeftWidth * borderBase;
    let y =
      element.contentY -
      element.renderStyles.paddingTop -
      borderTopWidth * borderBase;
    let w =
      contentWidth +
      paddingLeft +
      paddingRight +
      (borderLeftWidth + borderRightWidth) * borderBase;
    let h =
      contentHeight +
      paddingTop +
      paddingBottom +
      (borderTopWidth + borderBottomWidth) * borderBase;

    this._path(() => {
      this.topBorder({ x, y, borderRadius, w, h });
      this.rightBorder({ x, y, borderRadius, w, h });
      this.bottomBorder({ x, y, borderRadius, w, h });
      this.leftBorder({ x, y, borderRadius, w, h });
    });

    this.getCtx().clip();
  }

  _parseBackground(color, element) {
    if (Array.isArray(color)) {
      const gradient = this.getCtx().createLinearGradient(
        element.contentX,
        element.contentY,
        element.contentX + element.renderStyles.contentWidth,
        element.contentY + element.renderStyles.contentHeight
      );
      for (let i = 0; i < color.length; i++) {
        if (i === 0) {
          gradient.addColorStop(0, color[0]);
        } else {
          gradient.addColorStop(i / (color.length - 1), color[i]);
        }
      }
      return gradient;
    } else {
      return color;
    }
  }

  _drawText(element) {
    const {
      color,
      contentWidth,
      lineHeight,
      textAlign,
      textIndent,
      textDecoration,
    } = element.renderStyles;
    let x = element.contentX;
    this.getCtx().fillStyle = color;
    this.getCtx().textAlign = textAlign;
    this.getCtx().font = element._getFont();
    this.getCtx().textBaseline = "middle";
    if (textAlign === STYLES.TEXT_ALIGN.RIGHT) {
      x = element.contentX + contentWidth;
    } else if (textAlign === STYLES.TEXT_ALIGN.CENTER) {
      x = element.contentX + contentWidth / 2;
    }
    let _x = x;
    let _y = 0;
    let line;
    for (let index = 0; index < element._lines.length; index++) {
      line = element._lines[index];
      if (index === 0 && textIndent) {
        // 第一行实现textIndent
        _x = x + textIndent;
      } else {
        _x = x;
      }
      _y = element.contentY + lineHeight / 2 + lineHeight * index + 0.5;

      this.getCtx().fillText(line.text, _x, _y);

      if (isWX && element.renderStyles.fontWeight !== 400) {
        // 小程序 字体加粗不生效
        const offset = element.renderStyles.fontSize * 0.001;
        this.getCtx().fillText(line.text, _x - offset, _y);
      }

      // draw decoration
      if (textDecoration) {
        const decorationType = textDecoration[0];
        _y += 1;
        this._restore(() => {
          this._path(() => {
            let decorationY = _y;
            if (decorationType === "underline") {
              decorationY = _y + element._layout.fontHeight / 2;
            } else if (decorationType === "line-through") {
              decorationY = _y;
            }
            this.getCtx().moveTo(_x, decorationY);
            this.getCtx().lineTo(_x + line.layout.width, decorationY);
          });
          this.getCtx().strokeStyle = color;
          this.getCtx().stroke();
        });
      }
    }
  }

  /**
   * @param {String} text
   * @return {Object<width,height>}
   */
  measureText(element, text) {
    let w = 0;
    let h = 0;
    this._restore(() => {
      this.getCtx().font = element._getFont();
      const { width, actualBoundingBoxAscent } =
        this.getCtx().measureText(text);
      w = width;
      h = actualBoundingBoxAscent || element.renderStyles.fontSize * 0.7;
    });
    return {
      width: w,
      fontHeight: h + 1,
    };
  }

  _drawImage(element) {
    if (!element._image) return;
    const { contentWidth, contentHeight } = element.renderStyles;
    const { mode } = element.options.attrs;
    const {
      sx,
      sy,
      swidth,
      sheight,
      dx,
      dy,
      dwidth,
      dheight,
      width: imageW,
      height: imageH,
    } = element._imageInfo;
    if (mode === "aspectFill") {
      this.getCtx().drawImage(
        element._image,
        sx,
        sy,
        swidth,
        sheight,
        element.contentX,
        element.contentY,
        contentWidth,
        contentHeight
      );
    } else if (mode === "aspectFit") {
      this.getCtx().drawImage(
        element._image,
        0,
        0,
        imageW,
        imageH,
        dx,
        dy,
        dwidth,
        dheight
      );
    } else {
      this.getCtx().drawImage(
        element._image,
        element.contentX,
        element.contentY,
        contentWidth,
        contentHeight
      );
    }
  }

  _drawScroll(element) {
    this.getCtx().translate(element.currentScrollX, element.currentScrollY);
  }

  /**
   * 这里应该保证onload src等接口
   */
  getImageInstance(src) {
    let image = null;

    // 同样的路径返回缓存
    if (this.imageBus[src]) {
      image = this.imageBus[src];
    } else {
      if (isWX) {
        if (this.getCanvas()) {
          image = this.getCanvas().createImage();
        } else {
          console.warn("小程序请使用设置canvas参数以创建图片");
          image = getImage(src);
        }
      } else {
        image = new Image();
      }

      if (src) {
        this.imageBus[src] = new Promise((resolve, reject) => {
          image.onload = (e) => {
            resolve({
              image: isWX && !this.getCanvas() ? e.image : image,
              info: {
                width: isWX ? image.width : e.target.width,
                height: isWX ? image.height : e.target.height,
              },
            });
          };
          image.onerror = (err) => {
            reject(err);
          };
        });
      }

      image.src = src;
    }
    return this.imageBus[src];
  }

  render(node) {
    this.lastFrameComplete = false;
    this.lastPaintTime = Date.now();
    if (!node.parent) {
      // root
      this.getCtx().clearRect(
        0,
        0,
        this.getLayer().options.width,
        this.getLayer().options.height
      );
    } else {
      this.getCtx().clearRect(
        node.x,
        node.y,
        node.renderStyles.width,
        node.renderStyles.height
      );
    }
    let element = null;
    walk(node, (renderNode, callContinue, callNext) => {
      if (renderNode.isVisible()) {
        // 可见的才渲染
        this.paint(renderNode);
      } else {
        // 跳过整个子节点
        callNext();
        this._helpParentRestoreCtx(renderNode);
      }
    });
    if (isWX) {
      // 兼容小程序
      this.getCtx().draw && this.getCtx().draw();
    }

    this.lastFrameComplete = true;
  }

  renderFPS() {}

  readyToRender(element) {
    // this.element = generateRenderTree(element)
    this.element = element;

    const options = this.getLayer().options;

    this.lastPaintTime = Date.now();

    if (options && options.animate) {
      this.animate();
    } else {
      this.render(this.element);
    }
  }

  requestRepaint(element) {
    if (this.isAnimate) return;
    // 如果已经有frame在排队等待了 忽略
    // if(!this.lastFrameComplete) return
    // let nextFrameTime = Date.now() - this.lastPaintTime
    // if(nextFrameTime < 16){
    //   setTimeout(() => this.render(this.element),nextFrameTime)
    // }else{
    this.render(this.element);
    // }
  }

  // could be null
  getCanvas() {
    const options = this.getLayer().options;
    return (options && options.canvas) || null;
  }

  _animate(preTime) {
    const now = Date.now();
    this.render(this.element);
    if (!this.isAnimate) return;
    window.requestAnimationFrame(() => this._animate(now));
  }

  /**
   * 不建议使用了
   */
  animate() {
    this.isAnimate = true;
    window.requestAnimationFrame(() => this._animate());
  }

  stopAnimate() {
    this.isAnimate = false;
  }

  // 所有副作用完成
  // 图片加载异步请求
  onEffectFinished() {
    const list = Object.keys(this.imageBus).map((key) => {
      return this.imageBus[key];
    });
    return Promise.all(list);
  }
}

function getBorderRadius(element) {
  const { paddingWidth, paddingHeight } = element.renderStyles;
  let { borderRadius } = element.renderStyles;
  if (borderRadius * 2 > paddingWidth) {
    // 如果大于一半，则角不是90度，统一限制最大为一半
    borderRadius = paddingWidth / 2;
  }
  if (borderRadius * 2 > paddingHeight) {
    borderRadius = paddingHeight / 2;
  }
  if (borderRadius < 0) borderRadius = 0;
  return floor(borderRadius);
}

// function generateRenderTree(element){
//   const _root = new RenderNode(element)
//   let preZ = 0
//   let pivotZ = 0
//   let cur = null
//   let stack = [_root]
//   while(stack.length){
//     cur = stack.pop()
//     if(cur.element.hasChildren()){
//       cur.children = cur.element._getChildren().map(item => new RenderNode(item))
//       // sort by zIndex
//       cur.children = qSort3(cur.children,(pre,pivot) => {
//         preZ = pre.element.renderStyles.zIndex || 0
//         pivotZ = pivot.element.renderStyles.zIndex || 0
//         return preZ - pivotZ
//       })
//       Array.prototype.push.apply(stack,cur.children)
//     }
//   }
//   TreeNode.connectChildren(_root)
//   return _root
// }

// class RenderNode extends TreeNode {
//   constructor(element){
//     super()
//     this.element = element
//   }
// }
