import { useGlobalIconFont } from './components/iconfont/helper';


export default defineAppConfig({
  pages: [
    // 发现页
    'pages/find/index',
    
    // 首页
    'pages/index/index',
    // 通用列表页
    'pages/list/index',
    // 我的
    'pages/me/index',
    
    
    // 币种详情页
    'pages/detail/index',
    // 搜索页
    'pages/search/index',
    // 用户信息
    'pages/user/index',
    // 多空比
    'pages/putcallratio/index',
    // 持仓量
    'pages/positionsize/index',
    // 资金费率
    'pages/fundingrate/index',
    // 持仓量
    'pages/tradevol/index',
    // 横向图表
    'pages/landscapechart/index',
    // 社区
    'pages/community/index',
    
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
    // enablePullDownRefresh: true
  },
  tabBar: {
    color: '#cecece',
    selectedColor: '#45e87f',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [{
      pagePath: 'pages/find/index',
      iconPath: 'assets/icon/shouye-default.png',
      selectedIconPath: 'assets/icon/shouye-select.png',
      text: '首页',
    }, {
      pagePath: 'pages/index/index',
      iconPath: 'assets/icon/chengguo-default.png',
      selectedIconPath: 'assets/icon/chengguo-select.png',
      text: '发现',
    },
    // {
    //   pagePath: 'pages/community/index',
    //   iconPath: 'assets/icon/xiaoxi-default.png',
    //   selectedIconPath: 'assets/icon/xiaoxi-select.png',
    //   text: '社区',
    // },
    {
      pagePath: 'pages/me/index',
      iconPath: 'assets/icon/huiyuan-default.png',
      selectedIconPath: 'assets/icon/huiyuan-select.png',
      text: '我的',
    }]
  },
  usingComponents: Object.assign(useGlobalIconFont(), ''),
  lazyCodeLoading: 'requiredComponents',
})
