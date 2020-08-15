# 简介
使用render函数，在canvas中创建文档流，实现静态布局。

## 支持元素
- [x] view 基本元素，类似div
- [x] text
- [x] image

## 支持属性
属性使用像素的地方统一使用数字

- [x] display `block` `inline-block` `flex` text默认是inline的
- [x] width `auto` `100%` `Number` 这里盒模型使用border-box，不可修改
- [x] height
- [x] marginLeft,marginRight,marginTop,marginBottom
- [x] paddingLeft,paddingRight,paddingTop,paddingBottom
- [x] backgroundColor
- [x] borderRadius
- [x] borderWidth borderTopWidth ... 细边框直接设置0.5
- [x] borderColor
- [x] lineHeight 字体相关的只在text内有效
- [x] color
- [x] fontSize
- [x] textAlign `left` `right` `center`
- [x] maxLine 最大行数，超出自动省略号，支持在text中使用
- [ ] borderStyle
- [ ] boxShadowBlur
- [ ] boxShadowColor



## Usage
``` javascript
    const canvas = document.querySelector('#canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.width * 2
    canvas.height = canvas.height * 2

    const draw = getDraw(ctx, { dpr: 2, width: 300, height: 600 })
    draw((h) => {
        return h(
        'view',
        {
            styles: {},
        },
        [
            this.drawListItem(h),
        ]
        )
    })

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
        },
        [
          h(
            'view',
            {
              styles: {
                width: 50,
                boxShadowBlur: 10,
                boxShadowColor: '#000',
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
    }

```

## Screenshot
![1](screenshot/01.png)

## TodoList
* 支持position
* ~~inline-block换行以及textAlign~~
* 通过栈实现属性继承
* 支持flex-direction
* box-shadow
