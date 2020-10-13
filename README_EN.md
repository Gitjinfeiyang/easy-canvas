> EN | [中文](./README.md)

# Introduction
Use the render function to create a document flow in the canvas and quickly implement the layout.

> If there is a problem in use, check the code in the example, click to view [DEMO](https://gitjinfeiyang.github.io/easy-canvas/example/)
>
> [Try it in CodePen](https://codepen.io/Fiyoung/pen/pobvWRa?editors=1010)
>
> [Analysis of easyCanvas implementation principle](https://juejin.im/post/6871124987550531592)

- vue component [vue-easy-canvas](https://github.com/Gitjinfeiyang/vue-easy-canvas)
- Support document flow, refer to web, no need to set x, y, width and height
- Compatible with small programs and web, no third-party dependencies
- Support componentization, global components and local components
- Support events
- High performance, scroll-view supports dirty rectangles and only draws the visible part
- Support operation element, similar to operation dom to modify document flow

## Supporting elements
- [x] `view` basic element, similar to div
- [x] `text` text supports automatic line wrapping and over omitted functions, currently text is implemented as inline-block
- [x] ʻimage` image `src` `mode` supports aspectFit and aspectFill, other css features are the same as web support `load` event to monitor image loading and drawing completion
- [x] `scroll-view` scroll container, you need to set `direction` in the style to support x, y, xy, and set the specific size. Set `renderOnDemand` to draw only the visible part

## Styles
Use numbers where the attribute uses pixels

- [x] `display` block | inline-block | flex, text is inline by default
- [x] `width` auto 100% Number This box model uses border-box and cannot be modified
- [x] `height`
- [x] `flex` flex does not support auto, use width directly for fixed width
- [x] `minWidth` `maxWidth` `minHeight` `maxHeight` If the specific width is set, the height will not take effect
- [x] `margin` `marginLeft`,`marginRight`,`marginTop`,`marginBottom` margin supports array abbreviations such as [10,20] [10,20,10,20]
- [x] `paddingLeft`,`paddingRight`,`paddingTop`,`paddingBottom` Same as above
- [x] `backgroundColor`
- [x] `borderRadius`
- [x] `borderWidth` `borderTopWidth` ... Set the thin border directly to 0.5
- [x] `borderColor`
- [x] `lineHeight` font related only valid in text
- [x] `color`
- [x] `fontSize`
- [x] `textAlign` left right center
- [x] `textIndent` Number
- [x] `verticalAlign` top middle bottom
- [x] `justifyContent` flex-start center flex-end flex layout align horizontally
- [x] ʻalignItems` flex-start center flex-end flex layout align it vertically
- [x] `maxLine` maximum number of lines, exceeding the automatic ellipsis, only supports use in text
- [x] `whiteSpace` normal nowrap controls line breaks, not fonts
- [x] ʻoverflow` hidden If rounded corners are added, hidden will be added automatically
- [] `flexDirection`
- [x] `borderStyle` dash Array See ctx.setLineDash() for details
- [x] `shadowBlur` set the shadow will automatically add overflow:hidden;
- [x] `shadowColor`
- [x] `shadowOffsetX`
- [x] `shadowOffsetY`
- [x] `position` `static` ʻabsolute`
- [x] ʻopacity` `Number`


## Installation

``` bash
npm install easy-canvas-layout --save
```

## Usage

### Basic
``` javascript
    import easyCanvas from'easy-canvas-layout'

    // create a layer bind with ctx
    const layer = easyCanvas.createLayer(ctx, {
      dpr: 2,
      width: 300,
      height: 600,
    })

    // create a node tree
    // c(tag,options,children)
    const node = easyCanvas.createElement((c) => {
      return c('view', {
        styles: {backgroundColor:'#000' }, // style
        attrs:(), // attributes such as src
        on:{} // events such as click load
      },
      [
        c('text',{color:'#fff'},'Hello World')
      ])
    })

    // mount
    node.mount(layer)

```
### Register Component
``` javascript
    ...

    function button(c,text){
      return c(
        'view',
        {
          styles: {
            backgroundColor:'#ff6c79',
            borderRadius: 10,
            borderColor:'#fff',
            display:'inline-block',
            margin: 2,
            padding:[0,10]
          },
        },
        [
          c(
            'text',
            {
              styles: {
                lineHeight: 20,
                color:'#fff',
                textAlign:'center',
                fontSize: 11,
              },
            },
            text
          ),
        ]
      )
    }

    easyCanvas.component('button',(opt,children,c) => button(c,children))

    const node = easyCanvas.createElement((c) => {
      return c('view',{},[
        c('button',(),'This is a global component')
      ])
    })

    ...

```

## TodoList
* ~~Support position~~
* ~~inline-block line break and textAlign~~
* ~~Realize attribute inheritance through the stack~~
* ~~Support flex-direction~~
* ~~box-shadow to be optimized~~
* ~~Compatible with small program measuretext~~
* ~~Compatible with applet image~~
* ~~Packing problem solved~~
* ~~scroll-view nesting~~~~translate value inheritance~~
* Supplement other attributes
* ~~image supports mode~~
* ~~Release npm~~
* ~~max-width~~
* ~~vue template support~~
* ~~Scroll-view click area judgment optimization~~
* ~~Remove event when removing element~~
* ~~Scrolling optimization~~
* ~~Render on demand~~
* zIndex Hurry! ! !

### Known issues
* Linear-gradient must be created in the view to take effect
* If there is a problem with the element event judgment that is not in the document flow, it will be triggered together with the following elements

## MIT License

Copyright (c) 2020 Gitjinfeiyang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTW