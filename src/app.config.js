import { useGlobalIconFont } from './components/iconfont/helper';


export default defineAppConfig({
  pages: [
    // 首页
    'pages/index/index',
    // 社区
    'pages/community/index',
    // 发现页
    'pages/find/index',
    // 通用列表页（已迁移到分包 list）
    // 我的
    'pages/me/index',
    // 币种详情页（已迁移到分包 detail）
    // 搜索页（已迁移到分包 search）
    // 用户信息
    'pages/user/index',
    // 多空比（已迁移到分包 putcallratio）
    // 持仓量
    'pages/positionsize/index',
    // 资金费率（已迁移到分包 fundingrate）
    // 持仓量（已迁移到分包 tradevol）
    // 横向图表（已迁移到分包 landscapechart）
    // 配置告警页（已迁移到分包 addwarn）
    // 我的告警页（已迁移到分包 mywarn）
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
      root: "packages/points",
      name: "points",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/pointshistory",
      name: "pointshistory",
      pages: [
        "index"
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
    },
    {
      root: "packages/addwarn",
      name: "addwarn",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/mywarn",
      name: "mywarn",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/robot",
      name: "robot",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/list",
      name: "list",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/tradevol",
      name: "tradevol",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/search",
      name: "search",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/fundingrate",
      name: "fundingrate",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/landscapechart",
      name: "landscapechart",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/putcallratio",
      name: "putcallratio",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/videolearn",
      name: "videolearn",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/kyc",
      name: "kyc",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/mycomments",
      name: "mycomments",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/mylikes",
      name: "mylikes",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/mynotices",
      name: "mynotices",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/theme",
      name: "theme",
      pages: [
        "index"
      ]
    },
    {
      root: "packages/member",
      name: "member",
      pages: [
        "index",
        "upgrade/index"
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
