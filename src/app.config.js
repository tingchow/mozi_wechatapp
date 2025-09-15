import { useGlobalIconFont } from './components/iconfont/helper';


export default defineAppConfig({
  pages: [
    // 首页（主包）
    'pages/index/index',
    // 发现（主包）
    'pages/find/index',
    // 社区（主包）
    'pages/community/index',
    // 我的（主包）
    'pages/me/index',
  ],
  subpackages: [
    {
      root: 'packages/detail',
      name: 'detail',
      pages: [
        'detail/index',
        'landscapechart/index'
      ]
    },
    {
      root: 'packages/listpkg',
      name: 'listpkg',
      pages: [
        'list/index'
      ]
    },
    {
      root: 'packages/misc',
      name: 'misc',
      pages: [
        'search/index',
        'commentinfo/index',
        'topicinfo/index',
        'post/index',
        'addwarn/index',
        'mywarn/index',
        'topicsearch/index',
        'pointsrank/index',
        'positionsize/index',
        'putcallratio/index',
        'fundingrate/index',
        'tradevol/index',
        'user/index'
      ]
    }
  ],
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['detail']
    },
    'pages/community/index': {
      network: 'all',
      packages: ['detail']
    }
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
