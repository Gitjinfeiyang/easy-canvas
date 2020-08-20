let _options = {
  dpr: 2,
  width: 0,
  height: 0
}

function init(options) {
  _options = options
}

/**
 * 只有在draw的时候需要转换px
 * @param {*} userPx
 */
function px(userPx) {
  return userPx
}

export default {
  init,
  px
}
