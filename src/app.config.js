export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/rank/index',
    'pages/community/index',
    'pages/me/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#cecece',
    selectedColor: '#45e87f',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [{
      pagePath: 'pages/index/index',
      text: '首页',
    }, {
      pagePath: 'pages/rank/index',
      text: '排行榜',
    }, {
      pagePath: 'pages/community/index',
      text: '社区',
    }, {
      pagePath: 'pages/me/index',
      text: '我的',
    }]
  }
})
