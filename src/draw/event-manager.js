export default class EventManager {

  constructor(){
    this.clickList = []
    this.touchstartList = []
    this.touchmoveList = []
    this.touchendList = []
  }

  click(x, y) {
    let event = new Event({x,y,type:'click'})
    this._emit(event)
  }

  touchstart(x, y) {
    let event = new Event({x,y,type:'touchstart'})
    this._emit(event)
  }

  touchmove(x, y) {
    let event = new Event({x,y,type:'touchmove'})
    this._emit(event)
  }

  touchend(x, y) {
    let event = new Event({x,y,type:'touchend'})
    this._emit(event)
  }

  _emit(e){
    let callbackList = []
    switch(e.type){
      case 'click': callbackList= this.clickList;break
      case 'touchstart':callbackList = this.touchstartList;break
      case 'touchmove':callbackList = this.touchmoveList;break
      case 'touchend':callbackList = this.touchendList;break
    }
    for(let i = 0; i<callbackList.length; i++){
      if(this.isPointInElement(e.x,e.y,callbackList[i].element)){
        if(!e.currentTarget) e.currentTarget = callbackList[i].element
        callbackList[i].callback(e)
        if(e.cancelBubble) break
      }
    }
  }

  isPointInElement(x,y,element){
    const {width,height} = element.renderStyles
    if(x>=element.x && y>=element.y && (x<=element.x+width) && (y<=element.y+height)){
      return true
    }
    return false
  }

  createEvent(x,y,type){

  }

  onClick(callback,element){
    // 为啥要unshift呢，因为元素是从父级,往子集初始化的
    this.clickList.unshift({callback,element})
  }

  onTouchStart(callback,element){
    this.touchstartList.unshift({callback,element})
  }

  onTouchMove(callback,element){
    this.touchmoveList.unshift({callback,element})
  }

  onTouchEnd(callback,element){
    this.touchendList.unshift({callback,element})
  }

}

class Event{
  constructor({x,y,type}){
    this.x = x
    this.y = y
    this.type = type
    this.cancelBubble = false
    this.currentTarget = null // 第一个element
  }

  // 阻止冒泡
  stopPropagation(){
    this.cancelBubble = true
  }
}
