export default class EventManager {

  constructor(){
    this.clickList = []
    this.touchStartList = []
    this.touchMoveList = []
    this.touchEndList = []
  }

  click(x, y) {
    let event = new Event({x,y,type:'click'})
    this.clickList.forEach(item => {
      item(event)
    })
  }

  touchstart(x, y) {
    let event = new Event({x,y,type:'click'})
    this.touchStartList.forEach(item => {
      item(event)
    })
  }

  touchmove(x, y) {
    let event = new Event({x,y,type:'click'})
    this.touchMoveList.forEach(item => {
      item(event)
    })
  }

  touchend(x, y) {
    let event = new Event({x,y,type:'click'})
    this.touchEndList.forEach(item => {
      item(event)
    })
  }

  createEvent(x,y,type){

  }

  onClick(callback){
    // 为啥要unshift呢，因为元素是从父级往子集初始化的
    this.clickList.unshift(callback)
  }

  onTouchStart(callback){
    this.touchStartList.unshift(callback)
  }

  onTouchMove(callback){
    this.touchMoveList.unshift(callback)
  }

  onTouchEnd(callback){
    this.touchEndList.unshift(callback)
  }

}

class Event{
  constructor({x,y,type}){
    this.x = x
    this.y = y
    this.type = type
  }
}
