import { isWX } from "./utils"

// 只支持小程序最新的支持同层渲染的canvas api,
// 不用了
export function getImage(url) {
  const instance = {onload: () => {}}
  new Promise((resolve, reject) => {
    wx.downloadFile({
      url:url,
      success(res) {
        wx.getImageInfo({
          src: res.tempFilePath,
          success(res1) {
            resolve({
              target: {
                width: res1.width,
                height: res1.height
              },
              image: res.tempFilePath
            })
          }
        })
      },
      fail(err) {
        reject(err)
      }
    })
  })
  .then((res) => {
    instance.onload(res)
  })
  .catch(err => {

  })
  return instance
}

