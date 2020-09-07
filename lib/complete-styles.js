import { isExact, isAuto, isOuter } from './utils'
import STYLES from './constants'


export default function (element) {
  _completeFlex(element)

  _completeWidth(element)

  _completeBorder(element)

  _completeFont(element)

  _completePaddingMargin(element)
}


function _completePaddingMargin(element) {
  if (element.styles.padding) {
    if (isExact(element.styles.padding)) {
      element.styles.paddingLeft = element.styles.padding
      element.styles.paddingBottom = element.styles.padding
      element.styles.paddingRight = element.styles.padding
      element.styles.paddingTop = element.styles.padding
    } else if (Array.isArray(element.styles.padding)) {
      // 支持数组[10,20]相当于padding:10px 20px;
      if (element.styles.padding.length === 2) {
        element.styles.paddingLeft = element.styles.paddingRight = element.styles.padding[1]
        element.styles.paddingBottom = element.styles.paddingTop = element.styles.padding[0]
      } else if (element.styles.padding.length === 4) {
        element.styles.paddingLeft = element.styles.padding[3]
        element.styles.paddingBottom = element.styles.padding[2]
        element.styles.paddingRight = element.styles.padding[1]
        element.styles.paddingTop = element.styles.padding[0]
      }
    }
  }

  if (isExact(element.styles.margin)) {
    element.styles.marginLeft = element.styles.margin
    element.styles.marginBottom = element.styles.margin
    element.styles.marginRight = element.styles.margin
    element.styles.marginTop = element.styles.margin
  } else if (Array.isArray(element.styles.margin)) {
    // 支持数组[10,20]相当于padding:10px 20px;
    if (element.styles.margin.length === 2) {
      element.styles.marginLeft = element.styles.marginRight = element.styles.margin[1]
      element.styles.marginBottom = element.styles.marginTop = element.styles.margin[0]
    } else if (element.styles.margin.length === 4) {
      element.styles.marginLeft = element.styles.margin[3]
      element.styles.marginBottom = element.styles.margin[2]
      element.styles.marginRight = element.styles.margin[1]
      element.styles.marginTop = element.styles.margin[0]
    }
  }
}

/**
 * borderwidth到各个边
 */
function _completeBorder(element) {
  let { borderWidth, borderLeftWidth, borderRightWidth, borderBottomWidth, borderTopWidth, borderRadius } = element.styles
  if (!borderWidth) {
    element.styles.borderWidth = 0
    borderWidth = 0
  }
  if (Array.isArray(borderWidth)) {
    element.styles.borderTopWidth = borderWidth[0]
    element.styles.borderRightWidth = borderWidth[1]
    element.styles.borderBottomWidth = borderWidth[2]
    element.styles.borderLeftWidth = borderWidth[3]
  } else {
    if (!borderLeftWidth) {
      element.styles.borderLeftWidth = borderWidth
    }
    if (!borderRightWidth) {
      element.styles.borderRightWidth = borderWidth
    }
    if (!borderBottomWidth) {
      element.styles.borderBottomWidth = borderWidth
    }
    if (!borderTopWidth) {
      element.styles.borderTopWidth = borderWidth
    }
  }
  if (borderRadius) {
    element.styles.overflow = 'hidden'
  }
}

function _completeWidth(element) {
  if (!element.styles.width) {
    if (element.styles.display === STYLES.DISPLAY.INLINE_BLOCK || element.styles.display === STYLES.DISPLAY.INLINE || !element.isInFlow()) {
      element.styles.width = STYLES.WIDTH.AUTO
    } else if (element.styles.display === STYLES.DISPLAY.BLOCK || element.styles.display === STYLES.DISPLAY.FLEX) {
      element.styles.width = STYLES.WIDTH.OUTER
    } else {
      element.styles.width = 0
    }
  }

  if (isOuter(element.styles.width)) {
    if (element.parent && isAuto(element.parent.styles.width)) {
      element.styles.width = STYLES.WIDTH.AUTO
    }
  }

  if (isOuter(element.styles.height)) {
    if (element.parent && isAuto(element.parent.styles.height)) {
      element.styles.height = STYLES.WIDTH.AUTO
    }
  }
}

function _completeFont(element) {
  if (element.styles.fontSize && !element.styles.lineHeight) {
    element.styles.lineHeight = element.styles.fontSize * 1.4
  } else if (!element.styles.lineHeight) {
    element.styles.lineHeight = 14
  }
}

function _completeFlex(element) {
  if (element.parent && element.parent.styles.display === STYLES.DISPLAY.FLEX) {
    // flex布局内 width 和flex需要有一个
    if (!element.styles.width && !element.styles.flex) {
      element.styles.flex = 1
    }
  }
}
