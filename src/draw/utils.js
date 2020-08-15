export function isExact(num) {
  return typeof num === 'number'
}

export function isAuto(num) {
  return num === 'auto'
}

export function walk(element,callback){
  callback(element)
  if(element.hasChildren()){
    element._getChildren().forEach(child => {
      walk(child,callback)
    })
  }
}