// pages/about/about.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    explain: '<p class="p">小程序创意来自以下开源项目，向其贡献者致敬：</p>',
    urls: [
      'https://github.com/shimohq/chinese-programmer-wrong-pronunciation',
      'https://github.com/lexrus/Huahui',
      'https://github.com/li-yu/Huahui-Android'
    ],
    projects: [
      '<dl class="dl"><dt class="dt">中国程序员容易发音错误的单词</dt><dd class="dd">https://github.com/shimohq/chinese-programmer-wrong-pronunciation</dd></dl>',
      '<dl class="dl"><dt class="dt">中国程序员常读错的英文单词的 App 之 iOS 版</dt><dd>https://github.com/lexrus/Huahui</dd></dl>',
      '<dl class="dl"><dt class="dt">中国程序员常读错的英文单词的 App 之 Android 版</dt><dd class="dd">https://github.com/li-yu/Huahui-Android</dd></dl>'
    ]
  },

  tap: function (e) {
    wx.setClipboardData({
      data: this.data.urls[e.currentTarget.dataset.index],
      success: function (res) {
        wx.showToast({ title: '网址复制完成', icon: 'success' })
      }
    })
  },

  github: function () {
    wx.setClipboardData({
      data: 'https://github.com/getive/huahui',
      success: function (res) {
        wx.showToast({ title: '网址复制完成', icon: 'success' })
      }
    })
  },

  clearCache: function () {
    wx.clearStorage()
    wx.getSavedFileList({
      success: function (res) {
        res.fileList.forEach(function (item) {
          wx.removeSavedFile({
            filePath: item.filePath,
            complete: function (res) {
            }
          })
        })
        wx.showToast({ title: '清空缓存完成', icon: 'success', duration: 2000 })
      }
    })
  }
})