import * as utils from '../lib/utils'

describe('use utils', () => {

  describe('isExact', () => {
    const num = [-1, 0, 1]
    const invalidNum = [null, undefined, '0', {}, [], true]

    num.forEach(item => {
      it('should return true', (done) => {
        if (utils.isExact(item) === true) {
          done()
        } else {
          done(new Error())
        }
      })
    })

    invalidNum.forEach(item => {
      it('should return false', (done) => {
        if (utils.isExact(item) === false) {
          done()
        } else {
          done(new Error())
        }
      })
    })

  });


});
