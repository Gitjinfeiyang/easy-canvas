import { isWX } from "./utils"

export function getImage(url){
  return new Promise((resolve,reject) => {
    wx.downloadFile({
      url,
      success(res){
        wx.getImageInfo({
          src:res.tempFilePath,
          success(res1){
            resolve({
              info:{
                width:res1.width,
                height:res1.height
              },
              image:res.tempFilePath
            })
          }
        })
      },
      fail(err){
        reject(err)
      }
    })
  })
}

