// pages/index/index.js

//获取应用实例
const app = getApp()

Page({
  data: {
    words: [],
    activeIndex: -1,
    opacity: 1
  },
  onLoad: function () {
    try {
      let the = this
      let now = Date.parse(new Date())
      let storage = wx.getStorageSync('huahui_words') || require('../../assets/data/words')
      if (storage && now - storage.timestamp <= 86400000) {
        the.setData({ words: storage.words })
        wx.showToast({
          icon: 'none',
          title: '本地共加载 ' + storage.words.length + ' 个单词',
          duration: 2000
        })
      } else {
        wx.getNetworkType({
          success: function (res) {
            if (res.networkType !== 'none') {
              the.getWordList((words)=>{
                let now = Date.parse(new Date())
                the.setData({ words: words })
                wx.setStorageSync('huahui_words', { words: words, timestamp: now })
              })
            }
          },
          fail: function (res) {
            wx.showModal({
              title: '获取网络类型失败',
              content: res.errMsg,
              showCancel: false
            })
          },
          complete: function (res) {
            if (!the.data.words.length) {
              the.setData({ words: storage.words })
            }
          }
        })
      }
    } catch (e) {
      wx.showModal({
        title: '有错误发生',
        content: JSON.stringify(e),
        showCancel: false
      })
    }
  },
  getWordList: function (callback) {
    let the = this
    wx.showLoading({ title: '加载中' })
    wx.request({
      url: 'https://github.com/shimohq/chinese-programmer-wrong-pronunciation/blob/master/README.md',
      success: function (res) {
        const regex = new RegExp('<td>([\\(\\) A-Za-z]+)(.*)</td>\\s*<td>.+?emoji>\s*(.+)</td>\\s*<td>(.*)</td>', 'gi');
        let matches = null
        let words = []
        while ((matches = regex.exec(res.data)) != null) {
          words.push({
            word: matches[1],
            voice: the.extractUrl(matches[2]),
            correct: matches[3],
            error: the.extractPronounce(matches[4])
          })
        }
        typeof callback == "function" && callback(words)
      },
      fail: function (res) {
        wx.showModal({ title: '有错误发生', content: res.errMsg })
      },
      complete: function (res) {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '共加载 ' + the.data.words.length + ' 个单词',
          duration: 2000
        })
      }
    })
  },
  extractPronounce: function (str) {
    let match = /\[.+\]/.exec(str)
    return match ? match[0] : ''
  },
  extractUrl: function (str) {
    let match = /<a href="(.+)" rel="nofollow">.+<\/a>/.exec(str)
    match = match ? match[1].replace('http://', 'https://') : ''
    return match.search('dict.youdao.com') > 0 ? match : ''
  },
  onTap: function (e) {
    try {
      let the = this
      let activeIndex = e.currentTarget.dataset.index
      the.setData({ activeIndex: activeIndex })
      let word = the.data.words[activeIndex]
      let url = word.voice
      let path = wx.getStorageSync(word.word)
      if (path) {
        the.playLocalVoice(path)
      } else if (url) {
        wx.getNetworkType({
          success: function (res) {
            if (res.networkType === 'none') {
              wx.showToast({ icon: 'none', title: '无网络无法播放音频', duration: 2000 })
            } else {
              the.downloadVoice(word.word, url, the.playLocalVoice)
            }
          }
        })
      }
    } catch (e) {
    }
  },
  onShareAppMessage: function () {
    return {
      path: '/pages/index/index'
    }
  },
  downloadVoice: function (word, url, callback) {
    wx.showToast({ icon: 'none', title: '下载音频'})
    let the = this
    wx.downloadFile({
      url: url,
      success: function (res) {
        if (res.statusCode === 200) {
          the.saveVoice(word, res.tempFilePath, callback)
        }
      },
      fail: function (res) {
        wx.showModal({
          title: '有错误发生',
          content: res.errMsg,
          showCancel: false
        })
      }
    })        
  },
  playLocalVoice: function (path) {
    let the = this
    let interval = null
    let innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true
    innerAudioContext.src = path
    innerAudioContext.onError((res) => {
      wx.showModal({
        title: '有错误发生',
        content: res.errMsg
      })
    })
    innerAudioContext.onPlay(() => {
      interval = setInterval(() => {
        the.setData({ opacity: the.data.opacity === 1 ? 0 : 1 })
      }, 300)
    })
    innerAudioContext.onEnded(() => {
      the.setData({ opacity: 1 })
      clearInterval(interval)
    })
  },
  saveVoice: function (word, path, callback) {
    wx.saveFile({
      tempFilePath: path,
      success: function (res) {
        wx.setStorage({ key: word, data: res.savedFilePath })
        typeof callback == "function" && callback(res.savedFilePath)
      }
    })
  }
})