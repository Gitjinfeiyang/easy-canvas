import View from './view'
import {easeInOutElastic,isExact} from './utils'
import STYLES from './constants'

export default class ScrollView extends View {

    constructor(options,children){
        super(options,children)
        // 外面包裹一层容器，内层的滚动
        this._scrollView = new View(options,[this])
        return this._scrollView
    }

    _getDefaultStyles(){
        return {
            ...STYLES.DEFAULT_STYLES,
            direction:'y'
        }
    }

    init(){
        super.init()
        this.addEventListener()

        const {height,width,direction} = this.styles
        if(direction === 'y'){
            if(isExact(height)){
                this.styles.height = 'auto'
                this.renderStyles.height = 'auto'
            }else{
                // 必须设置
                console.error('scroll-view 必须设置明确的高度')
            }
        }else if(direction === 'x'){

        }
    }

    addEventListener(){
        // 监听滚动
        this.currentScroll = 0
        let start = 0
        let lastStart = 0
        let startMove = false
        let offset = 0
        let speed = 0
        let glideInterval = null
        let resistance = 1
        this.getLayer().eventManager.onTouchStart((e) => {
            start = e.y
            lastStart = start
            startMove = true
            clearInterval(glideInterval)
        })
        this.getLayer().eventManager.onTouchMove((e) => {
            if(startMove){
                offset = (e.y - start)
                if(this.scrollBy(offset)){
                    lastStart = start
                    start = e.y
                }
            }
        })
        this.getLayer().eventManager.onTouchEnd((e) => {
            startMove = false
            speed = (e.y - lastStart)
            resistance = -speed*0.05
            clearInterval(glideInterval)
            glideInterval = setInterval(() => {
                this.scrollBy(speed)
                speed +=resistance
                if(speed*speed <= 0.05){
                    speed = 0
                    clearInterval(glideInterval)
                }
            },18)
            e.y = 0
        })
    }

    _repaint(){
        // 滚动实现 目前是计算一次重新绘制一次，有需要再优化
        this.getCtx().translate(0,this.currentScroll)
        super._repaint()
    }

    calcScrollBound(offset){
        const {width:offsetWidth,height:offsetHeight} = this._scrollView.renderStyles
        const {width:scrollWidth,height:scrollHeight} = this.renderStyles
        if((offsetHeight- this.currentScroll - offset)>scrollHeight){
            return false
        }else if(this.currentScroll+offset>0){
            return false
        }

        return true
    }

    scrollBy(offset){
        if(this.calcScrollBound(offset)){
            this.currentScroll += offset
            this.getLayer().repaint()
            return true
        }else{
            return false
        }
    }

    scrollTo(pos){
        
    }

}