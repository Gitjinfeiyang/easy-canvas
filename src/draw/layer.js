export default class Layer {
    constructor(ctx,node,options){
        this.ctx = ctx
        this.node = node
        this.nodeList = []
        this.renderList = []
        this.options = options
        this.initRender()
    }

    initRender(){
        const nodes = this.nodeList = this.node.tree2List()
        // bind ctx

        function flow() {
            nodes.forEach(item => {
                item._initLayout()
            })
        }

        function repaint() {
            let stack = []
            ctx.clearRect(0, 0, this.options.width, this.options.height)
            nodes.forEach(item => {
            ctx.save()

            item._repaint()

            // 这里通过ctx栈实现了overflow
            if (!item.hasChildren()) {
                ctx.restore()
            }
            if (item.parent && !item.next) {
                // 最后一个
                ctx.restore()
            }
            })
        }

        this.node.layer = this
        this.node.container = this.options

        flow()

        // inline-block等还需要再重新排一次，后面再优化
        this.reflow()

        this.repaint()

    }

    reflow(){
        this.nodeList.forEach(item => {
            item._reflow()
        })
    }

    repaint(){
        this.ctx.clearRect(0, 0, this.options.width, this.options.height)
        this.nodeList.forEach(item => {
        this.ctx.save()

        item._repaint()

        // 这里通过this.ctx栈实现了overflow
        if (!item.hasChildren()) {
            this.ctx.restore()
        }
        if (item.parent && !item.next) {
            // 最后一个
            this.ctx.restore()
        }
        })
    }
}