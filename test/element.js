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

    it('should create a Image', (done) => {
      const view = easyCanvas.createElement((c) => c('image'))
      if (view instanceof easyCanvas.Image) {
        done()
      } else {
        done(new Error())
      }
    })

    it('should create a Text', (done) => {
      const view = easyCanvas.createElement((c) => c('text'))
      if (view instanceof easyCanvas.Text) {
        done()
      } else {
        done(new Error())
      }
    })

    it('should create a scroll-view', (done) => {
      const view = easyCanvas.createElement((c) => c('scroll-view', { styles: {} }))
      if (view.children[0] instanceof easyCanvas.ScrollView) {
        done()
      } else {
        done(new Error())
      }
    })

  });

});
