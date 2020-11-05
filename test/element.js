import easyCanvas from '../lib/index'
// const easyCanvas = require('../lib/index')

describe('Element', () => {
  describe('create a Element', () => {
    it('should create a View', (done) => {
      const view = easyCanvas.createElement((c) => c('view'))
      if (view instanceof easyCanvas.View) {
        done()
      } else {
        done(new Error())
      }
    })

  });

});
