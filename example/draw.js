


let layer = null

function drawSimple(h) {
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
                alignItems: 'center'
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
              h('view', { styles: { flex: 1, textAlign: 'right' } }, [
                h('image', {
                  styles: {
                    height: 50,
                    width: 50,
                    display: 'inline-block',
                    borderRadius:4
                  },
                  attrs: {
                    mode: 'aspectFill',
                    src:
                      'data:image/jpeg;base64,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',
                  },
                }),
              ]),
            ]
          ),
        ]
      ),
    ]
  )
}
function drawListItem(h, tag) {
  return h(
    'view',
    {
      data: {
        tag
      },
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
          alert(e.currentTarget.options.data.tag)
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
            drawInlineBlock(h),
          ]
        ),
      ]),
    ]
  )
}
function drawButton(h, text = 'text', options = {}) {
  return h(
    'view',
    Object.assign({
      styles: {
        height: 20,
        backgroundColor: '#ff6c79',
        borderRadius: 10,
        borderColor: '#fff',
        margin: 2,
        display: 'inline-block',
        paddingLeft: 10,
        paddingRight: 10,
        verticalAlign:'middle'
      },
      on:{
        click(e){
          console.log(e)
        }
      }
    }, options),
    [
      h(
        'text',
        {
          styles: {
            lineHeight: 16,
            color: options.color || '#fff',
            textAlign: 'center',
            fontSize: 11,
          },
        },
        text
      ),
    ]
  )
}
function drawBox(h) {
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
}
function drawInlineBlock(h) {
  let buttonList = [0, 0, 0, 0, 0, 0, 0].map((item, index) => {
    return h(
      'view',
      {
        styles: {
          height: 20,
          backgroundColor: '#ff6c79',
          borderRadius: 2,
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
              lineHeight: 16,
              color: '#fff',
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
        textAlign: 'right'
      },
    },
    [
      ...buttonList,
    ]
  )
}
function drawCard(h) {
  return h(
    'view',
    {
      styles: {
        backgroundColor: '#ff6c79',
        margin: 10,
        padding: [10, 20],
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ff6c79',
        borderStyle: 'dash',
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
      h('view', { styles: { display: 'flex', justifyContent: 'flex-start' } }, [
        h('view', { styles: { flex: 1 } }, [
          h(
            'text',
            { styles: { fontSize: 20, fontWeight: 700, color: '#Fff' } },
            '23.43'
          ),
        ]),
        h('view', { styles: { flex: 1, textAlign: 'right' } }, [
          h(
            'view',
            {
              styles: {
                height: 20,
                backgroundColor: '#fff',
                borderRadius: 10,
                borderColor: '#fff',
                margin: 2,
                display: 'inline-block',
                paddingLeft: 10,
                paddingRight: 10
              },
              on:{
                click(e){
                  console.log(e)
                }
              }
            },
            [
              h(
                'text',
                {
                  styles: {
                    lineHeight: 16,
                    color: '#ff6c79',
                    textAlign: 'center',
                    fontSize: 11,
                  },
                },
                '我的信息'
              ),
            ]
          )
        ]),
      ]),
      h('view', { styles: { lineHeight: 30 } }, [
        h(
          'text',
          { styles: { color: '#fff', fontSize: 12, lineHeight: 20, verticalAlign: 'middle' } },
          '最新收益0.00'
        ),
        h(
          'view',
          {
            styles: {
              display: 'inline-block',
              marginLeft: 10,
              height: 16,
              borderRadius: 8,
              paddingLeft: 5,
              paddingRight: 5,
              backgroundColor: '#666',
              verticalAlign: 'middle'
            },
          },
          [
            h(
              'text',
              { styles: { fontSize: 10, lineHeight: 16, color: '#fff' } },
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
            alignItems: 'flex-end',
            color: 'yellow'
          },
        },
        [
          h('view', { styles: { flex: 1 } }, [
            h('text', { styles: {} }, '风险评测'),
            h(
              'text',
              { styles: {} },
              '风险评测风险评测风险评测'
            ),
          ]),
          h(
            'view',
            {
              styles: {
                flex: 1,
                textAlign: 'center',
              },
            },
            [
              h('text', { styles: { textAlign: 'center', width: '100%' } }, '我的定投'),
              h('text', { styles: {} }, '风险评测'),
            ]
          ),
          h(
            'view',
            {
              styles: {
                flex: 1,
                textAlign: 'center',
                verticalAlign: 'middle',
              },
            },
            [
              h('text', { styles: { textAlign: 'center' } }, '优惠券'),
              h('text', { styles: {} }, '风险评测'),
            ]
          ),
        ]
      ),
    ]
  )
}
function drawScrollView(h) {
  return h(
    'scrollview',
    {
      styles: { direction: 'y', height: 200 },
    },
    [
      drawListItem(h, 'list1'),
      drawListItem(h, 'list2'),
      drawListItem(h, 'list3'),
      drawListItem(h, 'list4'),
    ]
  )
}
function drawScrollViewX(h) {
  return h(
    'scrollview',
    {
      styles: {
        direction: 'x',
        whiteSpace: 'nowrap',
      },
    },
    [0, 0, 0, 0, 0, 0, 0, 0, 0].map((item, index) => {
      return h(
        'view',
        {
          styles: {
            display: 'inline-block',
            padding: 10,
          },
        },
        [h('text', {}, '导航' + index)]
      )
    })
  )
}
function drawAbsolute(h) {
  return h('view', { styles: { position: 'absolute', top: 10, left: 10, zIndex: 10 } }, [drawButton(h, 'Absolute')])
}

function Dialog(h, options) {
  return h('view', {
    attrs: { className: 'dialog' }, styles: {
      position: 'absolute', top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }
  }, [
    h('view', {
      styles: {
        width: 300,
        padding: 20,
        borderRadius: 4,
        backgroundColor: '#fff',
      },

    }, [
      h('view', { styles: { textAlign: 'center', fontWeight: 'bold', fontSize: 20, borderBottomWidth: 0.5, borderColor: '#ccc' } }, [h('text', {}, options.title || 'Notice')]),
      h('view', { styles: { paddingTop: 20, color: '#666' } }, [h('text', {}, options.content || '')])
    ])
  ])
}


function setLayer(_layer) {
  layer = _layer
}
function ontouchstart(e) {
  e.preventDefault()
  layer.eventManager.touchstart(e.touches[0].pageX, e.touches[0].pageY)
}
function ontouchmove(e) {
  e.preventDefault()
  layer.eventManager.touchmove(e.touches[0].pageX, e.touches[0].pageY)
}
function ontouchend(e) {
  e.preventDefault()
  layer.eventManager.touchend(
    e.changedTouches[0].pageX,
    e.changedTouches[0].pageY
  )
}
function onClick(e) {
  e.preventDefault()
  layer.eventManager.click(e.pageX, e.pageY)
}

