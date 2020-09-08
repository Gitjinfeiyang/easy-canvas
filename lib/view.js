import Element from './element'
import STYLES from './constants'
import { isExact } from './utils'

export default class View extends Element {

  constructor(options, children) {
    super(options, children)
    this.type = 'view'
  }

  _getDefaultStyles() {
    return {
      ...STYLES.DEFAULT_STYLES,
      display: STYLES.DISPLAY.BLOCK
    }
  }


}
