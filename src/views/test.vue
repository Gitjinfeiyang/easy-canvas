<template>
  <div style="width:100vw; height:100vh; backgroundColor:#000;">
    <canvas id="canvas" width="300" height="600" style="width:300px; height:600px;background:#fff;"
      @click.stop="onClick" @touchstart.stop="ontouchstart" @touchmove.stop="ontouchmove"
      @touchend.stop="ontouchend"></canvas>
  </div>
</template>
<script>
import ef from '../draw'
// import draw from '../draw-canvas'

export default {
  mounted() {
    const canvas = document.querySelector('#canvas')

    const ctx = canvas.getContext('2d')
    canvas.width = canvas.width * 2
    canvas.height = canvas.height * 2
    ctx.scale(2, 2)

    this.layer = ef.createLayer(ctx, { dpr: 2, width: 300, height: 600 })
    const node = ef.createElement((h) => {
      return h('view', {}, [
        // this.drawBox(h),
        this.drawSimple(h),
        // this.drawInlineBlock(h),
        this.drawCard(h),
        this.drawScrollView(h),
      ])
    })
    node.mount(this.layer)
  },
  methods: {
    drawSimple(h) {
      return h(
        'view',
        {
          attrs: {
            src: '',
          },
          styles: {},
        },
        [
          h(
            'view',
            {
              styles: {
                margin: 10,
              },
            },
            [
              h(
                'view',
                {
                  styles: {
                    display: 'flex',
                  },
                },
                [
                  h(
                    'view',
                    {
                      styles: {
                        flex: 1,
                        paddingLeft: 10,
                        borderLeftWidth: 10,
                        borderColor: '#8170ff',
                      },
                    },
                    [
                      h(
                        'text',
                        {
                          styles: {
                            fontSize: 30,
                            lineHeight: 30,
                          },
                        },
                        'Hello !'
                      ),
                    ]
                  ),
                  // h('view', { styles: { flex: 1, textAlign: 'right' } }, [
                  //   h('image', {
                  //     styles: {
                  //       height: 50,
                  //       width: 'auto',
                  //       display: 'inline-block',
                  //     },
                  //     attrs: {
                  //       src:
                  //         'data:image/jpeg;base64,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',
                  //     },
                  //   }),
                  // ]),
                ]
              ),
            ]
          ),
        ]
      )
    },
    drawListItem(h) {
      return h(
        'view',
        {
          styles: {
            borderBottomWidth: 1,
            borderColor: '#ccc',
            borderStyle: 'solid',
            display: 'flex',
            paddingTop: 5,
            paddingRight: 5,
            paddingBottom: 5,
            paddingLeft: 5,
            backgroundColor: '#f1f1f1',
            marginBottom: 10,
          },
          on: {
            click(e) {
              alert(e.type)
            },
          },
        },
        [
          h(
            'view',
            {
              styles: {
                width: 50,
              },
            },
            [
              h('image', {
                attrs: {
                  src:
                    'https://dss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1709216491,2536617744&fm=26&gp=0.jpg',
                },
                styles: {
                  borderRadius: 24,
                  shadowBlur: 10,
                  shadowColor: '#000',
                },
              }),
            ]
          ),
          h('view', { styles: { flex: 2, paddingLeft: 10 } }, [
            h('view', {}, [
              h('text', { styles: { fontSize: 16 } }, '开发指南'),
            ]),
            h(
              'view',
              {
                styles: {},
              },
              [
                h(
                  'text',
                  { styles: { fontSize: 12, color: '#666', maxLine: 2 } },
                  '小程序提供了一个简单、高效的应用开发框架和丰富的组件及API，帮助开发者在微信中开发具有原生 APP 体验的服务'
                ),
                this.drawInlineBlock(h),
              ]
            ),
          ]),
        ]
      )
    },
    drawButton(h, text = 'text', options = {}) {
      return h(
        'view',
        {
          styles: {
            height: 20,
            backgroundColor: options.backgroundColor || '#ff6c79',
            borderRadius: 10,
            borderColor: '#fff',
            margin: 2,
            display: 'inline-block',
            paddingLeft: 10,
            paddingRight: 10,
          },
        },
        [
          h(
            'text',
            {
              styles: {
                lineHeight: 20,
                color: options.color || '#fff',
                textAlign: 'center',
                fontSize: 11,
              },
            },
            text
          ),
        ]
      )
    },
    drawBox(h) {
      return h(
        'view',
        {
          styles: {},
        },
        [
          h(
            'view',
            {
              styles: {
                display: 'inline-block',
                width: 40,
                verticalAlign: 'middle',
              },
            },
            [h('text', {}, '事事顺遂遂')]
          ),
          h(
            'view',
            {
              styles: {
                display: 'inline-block',
                width: 40,
                verticalAlign: 'top',
              },
            },
            [h('text', {}, '事事')]
          ),
          h(
            'view',
            {
              styles: {
                display: 'inline-block',
                width: 40,
                verticalAlign: 'bottom',
              },
            },
            [h('text', {}, '事事顺遂事事顺遂')]
          ),
        ]
      )
    },
    drawInlineBlock(h) {
      let buttonList = [0, 0, 0, 0, 0, 0, 0].map((item, index) => {
        return h(
          'view',
          {
            styles: {
              height: 20,
              backgroundColor: '#ff6c79',
              borderRadius: 4,
              borderColor: '#fff',
              margin: 2,
              paddingLeft: 10,
              paddingRight: 10,
              display: 'inline-block',
            },
          },
          [
            h(
              'text',
              {
                styles: {
                  lineHeight: 20,
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: 11,
                },
              },
              `查看${index}`
            ),
          ]
        )
      })
      return h(
        'view',
        {
          styles: {
            borderTopWidth: 0.5,
            borderColor: '#ccc',
            paddingTop: 4,
            marginTop: 4,
          },
        },
        [...buttonList]
      )
    },
    drawCard(h) {
      return h(
        'view',
        {
          styles: {
            backgroundColor: '#ff6c79',
            margin: 10,
            padding: 10,
            borderRadius: 6,
            borderWidth: 0.5,
            borderColor: '#ff6c79',
            shadowColor: '#666',
            shadowBlur: 20,
          },
        },
        [
          h('view', {}, [
            h(
              'text',
              {
                styles: { color: '#fff' },
              },
              '总资产(元)'
            ),
          ]),
          h('view', { styles: { display: 'flex' } }, [
            h('view', { styles: { flex: 1 } }, [
              h(
                'text',
                { styles: { fontSize: 20, fontWeight: 700, color: '#Fff' } },
                '23.43'
              ),
            ]),
            h('view', { styles: { flex: 1, textAlign: 'right' } }, [
              this.drawButton(h, '我的信息', {
                backgroundColor: '#fff',
                color: '#ff6c79',
              }),
            ]),
          ]),
          h('view', {}, [
            h(
              'text',
              { styles: { color: '#fff', fontSize: 12, lineHeight: 20 } },
              '最新收益0.00'
            ),
            h(
              'view',
              {
                styles: {
                  display: 'inline-block',
                  marginLeft: 10,
                  marginTop: 3,
                  height: 16,
                  borderRadius: 8,
                  paddingLeft: 5,
                  paddingRight: 5,
                  backgroundColor: '#666',
                },
              },
              [
                h(
                  'text',
                  { styles: { fontSize: 10, color: '#fff' } },
                  '赠送权益'
                ),
              ]
            ),
          ]),
          h(
            'view',
            {
              styles: {
                display: 'flex',
                marginTop: 20,
                paddingTop: 20,
                borderTopWidth: 0.5,
                borderColor: '#fff',
              },
            },
            [
              h('view', { styles: { flex: 1, color: '#fff' } }, [
                h('text', { styles: { color: '#fff' } }, '风险评测'),
                h(
                  'text',
                  { styles: { color: '#fff' } },
                  '风险评测风险评测风险评测'
                ),
              ]),
              h(
                'view',
                {
                  styles: {
                    flex: 1,
                    textAlign: 'center',
                    verticalAlign: 'bottom',
                  },
                },
                [
                  h('text', { styles: { color: '#fff' } }, '我的定投'),
                  h('text', { styles: { color: '#fff' } }, '风险评测'),
                ]
              ),
              h(
                'view',
                {
                  styles: {
                    flex: 1,
                    textAlign: 'center',
                    verticalAlign: 'bottom',
                  },
                },
                [
                  h('text', { styles: { color: '#fff' } }, '优惠券'),
                  h('text', { styles: { color: '#fff' } }, '风险评测'),
                ]
              ),
            ]
          ),
        ]
      )
    },

    drawScrollView(h) {
      return h(
        'scrollview',
        {
          styles: { direction: 'y', height: 200 },
        },
        [
          this.drawListItem(h),
          this.drawListItem(h),
          this.drawListItem(h),
          this.drawListItem(h),
        ]
      )
    },

    ontouchstart(e) {
      e.preventDefault()
      this.layer.eventManager.touchstart(e.touches[0].pageX, e.touches[0].pageY)
    },
    ontouchmove(e) {
      e.preventDefault()
      this.layer.eventManager.touchmove(e.touches[0].pageX, e.touches[0].pageY)
    },
    ontouchend(e) {
      e.preventDefault()
      this.layer.eventManager.touchend(
        e.changedTouches[0].pageX,
        e.changedTouches[0].pageY
      )
    },
    onClick(e) {
      e.preventDefault()
      this.layer.eventManager.click(e.pageX, e.pageY)
    },
  },
}
</script>
