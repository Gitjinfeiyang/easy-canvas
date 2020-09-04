import {isExact,isAuto} from './utils'

export default class Line {
    constructor(){
        this.width = 0
        this.height = 0
        this.right = 0 // 右边界
        this.y = 0 // 上
        this.doorClosed = false // 是否允许加入
        this.outerWidth = 0
        this.container = null
        this.elements = []
        this.start = null // 起点，行最左边第一个
        this.end = null // 结束
    }

    bind(el){
        this.container = el.parent
        this.height = el.parent && el.parent.renderStyles.lineHeight || 0
        this.outerWidth = el.parent && isAuto(el.parent.styles.width) ?Infinity: el.parent.renderStyles.contentWidth
        this.right = el._getContainerLayout().contentX
        this.y = this.getPreLineBottom(el)
        this.start = el
        this.add(el)
    }

    add(el){
        this.elements.push(el)
        el.line = this
        this.refreshWidthHeight(el)
    }

    refreshWidthHeight(el){
        if(el.renderStyles.height>this.height){
            this.height = el.renderStyles.height
        }

        // 刷新位置，首先以左边计算
        el.x = this.right
        el.y = this.y + (this.height - el.renderStyles.contentHeight)/2

        this.width += el.renderStyles.width
        this.right += el.renderStyles.width
    }

    canIEnter(el){
        if((el.renderStyles.width + this.width) >this.outerWidth){
            // new line
            this.end = this.elements[this.elements.length-1]
            this.refreshXAlign()
            return false
        }else{
            return true
        }
    }

    getPreLineBottom(el){
        if(el.pre){
            if(el.pre.line){
                return el.pre.line.height + el.pre.line.y
            }else{
                return el._getPreLayout().y + el._getPreLayout().height
            }
        }else{
            return el._getContainerLayout().contentY
        }
    }

    refreshXAlign(){
        if(this.outerWidth > 5000) return
        if(!this.end.parent) return
        let offsetX = this.outerWidth - this.end.x-this.end.renderStyles.width
        if(this.end.parent.textAlign === 'center'){
            offsetX = offsetX/2
        }else if(this.end.parent.textAlign === 'left'){
            offsetX = 0
        }
        this.elements.forEach(child => {
            child.x += offsetX
            child.contenX += offsetX
        })
    }
}