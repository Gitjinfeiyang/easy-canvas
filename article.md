## 背景
一个常见的需求，在开发微信小程序时，前端需要生成海报图分享，目前已有的解决方案如下：
1. 使用`htmlCanvas`库，利用dom来生成图片
2. 前端使用canvas api一个一个的画出来
3. 利用`puppeteer`后端服务，打开相应界面截图

#### 缺点:
1. 这个库本身并不能在小程序使用，因为涉及到dom，在web端也有各种兼容性问题比如某个属性不支持
2. 这个方案，额。。。可能这就是程序员头发少的原因吧。费尽千辛万苦画好，万一视觉调整一下。。这个方案开发费时费力，不好维护。虽然web端有react-canvas，小程序也有一些工具，但目前都只是封装了绘制矩形、文字等方法，对于布局来说还是需要手动计算宽高以及位置，没有完全解决痛点。
3. 这种方案对前端来说是最完美的，也推荐大家有条件用这个方案，前端写好页面放到服务上，然后再挂一个服务访问这个页面来截图，因为开发和截图的都是chromium，基本不存在兼容性问题。但是这种方案会非常耗费服务器资源，每次截图都要打开一个新的浏览器tab，并且截图耗时比较长，对于一些公司来说可能无法接受。

## 简介
easy-canvas实现了在canvas中创建文档流，并且可以很轻松的支持组件化开发，并且没有第三方依赖，只要支持标准的canvas就可以使用，在实现基本功能的基础上添加了事件、scroll-view等支持。基础版支持小程序、web。

> 无图无真相 [DEMO](https://gitjinfeiyang.github.io/easy-canvas/example/)
>
> 项目地址[easy-canvas](https://github.com/Gitjinfeiyang/easy-canvas)
>
> vue组件版本[vue-easy-canvas](https://github.com/Gitjinfeiyang/vue-easy-canvas)

如果使用过render函数的肯定很熟悉使用方式了，相关属性在项目里以及示例里都有介绍，本篇文章就不过多介绍，基本使用如下：

``` bash
npm install easy-canvas-layout --save
```

``` javascript
    import easyCanvas from 'easy-canvas-layout'

    // 首先绑定图层
    const layer = easyCanvas.createLayer(ctx, {
      dpr: 2,
      width: 300,
      height: 600,
      canvas   // 小程序环境必传
    })

    // 创建node 
    // c(tag,options,children)
    const node = easyCanvas.createElement((c) => {
      return c('view', { 
        styles: { backgroundColor:'#000' }, // 样式
        attrs:{},                           // 属性 比如src
        on:{}                               // 事件 如click load 
      }, 
      [
        c('text',{color:'#fff'},'Hello World')
      ])
    })

    // mount
    node.mount(layer)

```

## vue中使用
另外在基础版本上，封装了相应的vue组件,相比render函数，要简洁易懂很多，基本使用如下:

``` bash
npm install vue-easy-canvas --save
```

``` javascript
import easyCanvas from 'vue-easy-canvas'
Vue.use(easyCanvas)
```

``` html
<ec-canvas :width="300" :height="600">
    <ec-scroll-view :styles="{height:600}">

    <ec-view :styles="styles.imageWrapper">
        <ec-image 
            src="https://tse1-mm.cn.bing.net/th/id/OIP.Dkj8fnK1SsPHIBmAN9XnUAHaNK?pid=Api&rs=1" 
            :styles="styles.image" 
            mode="aspectFill"></ec-image>
        <ec-view :styles="styles.homeTitleWrapper">
        <ec-text>easyCanvas</ec-text>
        </ec-view>
    </ec-view>

    <ec-view :styles="styles.itemWrapper" 
        v-for="(item,index) in examples" 
        :key="index"
        :on="{
        click(e){
            window.location.href = host + item.url
        }
        }">
        <ec-view :styles="styles.title">
        <ec-text>{{item.title}}</ec-text>
        </ec-view>
        <ec-view :styles="styles.desc">
        <ec-text>{{item.desc}}</ec-text>
        </ec-view>
    </ec-view>

    </ec-scroll-view>
</ec-canvas>
```

## Ending
本篇文章主要介绍项目背景以及基本使用，也是为了给自己打个广告吧:) 后面会写实现原理以及一些坑，欢迎各位交流，感谢阅读！  

