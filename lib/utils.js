export function isExact(num) {
  return typeof num === "number";
}

export function isAuto(num) {
  return num === "auto";
}

export function isOuter(num) {
  if (typeof num !== "string") return;
  return num.match("%");
}

export function parseOuter(num) {
  let _n = parseInt(num.replace("%", ""));
  return isNaN(_n) || _n < 0 ? 0 : _n / 100;
}

export function walk(element, callback) {
  let _continue = false; // 是否跳过当前节点以及后面的节点
  let _next = false; // 是否跳过当前节点数，子元素都不会遍历
  const _callContinue = () => (_continue = true);
  const _callNext = () => (_next = true);
  if (element != null) {
    const stack = [];
    let item = null;
    let children = null;
    stack.push(element);
    while (stack.length != 0) {
      item = stack.pop();
      callback(item, _callContinue, _callNext);
      if (!_next) {
        children = item._getChildren();
        for (let i = children.length - 1; i >= 0; i--) {
          if (!_continue) {
            stack.push(children[i]);
          } else {
            // 复位
            _continue = false;
          }
        }
      } else {
        // 复位
        _next = false;
      }
    }
  }
}

export function walkParent(element, callback) {
  if (!element) return;
  let cur = element;
  let stop = false;
  const callbreak = () => {
    stop = true;
  };
  while (cur.parent) {
    callback(cur.parent, callbreak);
    if (stop) {
      break;
    }
    cur = cur.parent;
  }
}

export function findRelativeTo(element) {
  if (element.isInFlow()) return element.parent;
  if (element.renderStyles.position === "fixed") return element.root;
  let relativeTo = null;
  walkParent(element, (parent) => {
    if (parent.renderStyles.position !== "static" && !relativeTo) {
      relativeTo = parent;
    }
  });
  if (!relativeTo) {
    relativeTo = element.root;
  }
  return relativeTo;
}

//
const pow = Math.pow,
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
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
    : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
}

function easeInOutExpo(pos) {
  if (pos === 0) return 0;
  if (pos === 1) return 1;
  if ((pos /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (pos - 1));
  return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
}

export const isWX = (function () {
  try {
    return Boolean(wx.getSystemInfoSync);
  } catch (err) {
    return false;
  }
})();

export function isEndNode(el) {
  return el.parent && !el.next && !el.hasChildren();
}

export function breadthFirstSearch(node) {
  const nodes = [];

  if (node != null) {
    const queue = [];
    let item = null;
    let children = null;

    queue.unshift(node);

    while (queue.length != 0) {
      item = queue.shift();
      nodes.push(item._generateRender());

      children = item._getChildren();

      for (let i = 0; i < children.length; i++)
        queue.push(children[i]._generateRender());
    }
  }

  return nodes;
}

export function breadthFirstSearchRight(node) {
  const nodes = [];

  if (node != null) {
    const queue = [];
    let item = null;
    let children = null;
    queue.unshift(node);

    while (queue.length != 0) {
      item = queue.shift();
      nodes.push(item._generateRender());

      children = item._getChildren();

      for (let i = children.length - 1; i >= 0; i--)
        queue.push(children[i]._generateRender());
    }
  }

  return nodes.reverse();
}

export function needReflow(style) {
  return [
    "width",
    "height",
    "position",
    "display",
    "padding",
    "paddingTop",
    "paddingLeft",
    "paddingBottom",
    "paddingRight",
    "margin",
    "marginLeft",
    "marginTop",
    "marginBottom",
    "marginRight",
    "borderWidth",
    "flexDirection",
    "justifyContent",
    "alignItems",
    "textAlign",
    "left",
    "top",
    "right",
    "bottom",
  ].includes(style);
}

const mergeKeys = ["attrs", "styles", "on"];
export function mergeOptions(options, mergeOptions) {
  let mergedOptions = {};
  mergeKeys.forEach((key) => {
    if (!options[key]) options[key] = {};
    if (!mergeOptions[key]) mergeOptions[key] = {};
    mergedOptions[key] = Object.assign({}, options[key], mergedOptions[key]);
  });
  return mergedOptions;
}

export function floor(val) {
  return (0.5 + val) << 0;
}

export function qSort3(arr, callback) {
  //三路快排
  if (arr.length == 0) {
    return [];
  }
  var left = [];
  var center = [];
  var right = [];
  var pivot = arr[0]; //偷懒，直接取第一个,实际取值情况 参考[快速排序算法的优化思路总结]
  let val = 0;
  for (var i = 0; i < arr.length; i++) {
    val = callback(arr[i], pivot);
    if (val < 0) {
      left.push(arr[i]);
    } else if (val === 0) {
      center.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return [...qSort3(left, callback), ...center, ...qSort3(right, callback)];
}

export function getThrottle(threshold) {
  let timer;
  return function (fn) {
    if (!timer) {
      timer = setTimeout(function () {
        fn();
        timer = null;
      }, threshold);
    }
  };
}
