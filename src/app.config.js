import { useGlobalIconFont } from './components/iconfont/helper';


export default defineAppConfig({
  pages: [
    // 首页
    'pages/index/index',
    // 社区
    'pages/community/index',
    // 发现页
    'pages/find/index',
    // 通用列表页
    'pages/list/index',
    // 我的
    'pages/me/index',
    // 币种详情页（已迁移到分包 detail）
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
    // 配置告警页
    'pages/addwarn/index',
    // 我的告警页
    'pages/mywarn/index',
  ],
  subpackages: [
    {
      root: "packages/more",
      name: "more",
      pages: [
        "pointsrank/index"
      ]
    },
    {
      root: "packages/community",
      name: "community",
      pages: [
        "commentinfo/index",
        "topicinfo/index",
        "post/index",
        "topicsearch/index"
      ]
    },
    {
      root: "packages/detail",
      name: "detail",
      pages: [
        "index"
      ]
    }
  ],
  preloadRule: {
    "pages/me/index": {
      network: "all",
      packages: ["more"]
    },
    "pages/community/index": {
      network: "all",
      packages: ["community"]
    },
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
    // enablePullDownRefresh: true
  },
  tabBar: {
    color: '#cecece',
    selectedColor: '#11B787',
    backgroundColor: '#fff',
    borderStyle: 'black',
    iconWidth: '20px',
    iconHeight: '20px',
    list: [{
      pagePath: 'pages/index/index',
      iconPath: 'assets/icon/home-no-actived.png',
      selectedIconPath: 'assets/icon/home-actived.png',
      text: '首页',
    },
    {
      pagePath: 'pages/find/index',
      iconPath: 'assets/icon/find-no-actived.png',
      selectedIconPath: 'assets/icon/find-actived.png',
      text: '发现',
    },
    {
      pagePath: 'pages/community/index',
      iconPath: 'assets/icon/community-no-actived.png',
      selectedIconPath: 'assets/icon/community-actived.png',
      text: '社区',
    },
    {
      pagePath: 'pages/me/index',
      iconPath: 'assets/icon/me-no-actived.png',
      selectedIconPath: 'assets/icon/me-actived.png',
      text: '我的',
    }]
  },
  usingComponents: Object.assign(useGlobalIconFont(), ''),
  lazyCodeLoading: 'requiredComponents',
  
  // 为特定页面配置下拉刷新
  pagesSettings: {
    'pages/topicinfo/index': {
      enablePullDownRefresh: true,
      backgroundTextStyle: 'dark'
    }
  }
})
