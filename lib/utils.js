export function isExact(num) {
  return typeof num === 'number'
}

export function isAuto(num) {
  return num === 'auto'
}

export function isOuter(num) {
  if (typeof num !== 'string') return
  return num.match('%')
}

export function parseOuter(num) {
  let _n = parseInt(num.replace('%', ''))
  return (isNaN(_n) || _n < 0) ? 0 : (_n / 100)
}


export function walk(element, callback) {
  callback(element)
  if (element.hasChildren()) {
    element._getChildren().forEach(child => {
      walk(child, callback)
    })
  }
}

export function walkParent(element, callback) {
  let cur = element
  while (cur.parent) {
    callback(cur.parent)
    cur = cur.parent
  }
}


//
var pow = Math.pow,
  sqrt = Math.sqrt,
  sin = Math.sin,
  cos = Math.cos,
  PI = Math.PI,
  c1 = 1.70158,
  c2 = c1 * 1.525,
  c3 = c1 + 1,
  c4 = (2 * PI) / 3,
  c5 = (2 * PI) / 4.5;

export function easeInOutElastic(x) {
  return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ?
    -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2 :
    pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5) / 2 + 1;
}

function easeInOutExpo(pos) {
  if (pos === 0) return 0;
  if (pos === 1) return 1;
  if ((pos /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (pos - 1));
  return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
}


export function isWX() {
  return !window
}
