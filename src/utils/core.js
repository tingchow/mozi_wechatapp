import Taro from '@tarojs/taro';
import isEmpty from 'lodash/isEmpty';

// 分包路由映射（不改变现有页面实现，仅调整路径）
const pageRouteMap = {
  detail: '/packages/detail/detail/index',
  landscapechart: '/packages/detail/landscapechart/index',
  list: '/packages/listpkg/list/index',
  search: '/packages/misc/search/index',
  commentinfo: '/packages/misc/commentinfo/index',
  topicinfo: '/packages/misc/topicinfo/index',
  post: '/packages/misc/post/index',
  addwarn: '/packages/misc/addwarn/index',
  mywarn: '/packages/misc/mywarn/index',
  topicsearch: '/packages/misc/topicsearch/index',
  pointsrank: '/packages/misc/pointsrank/index',
  positionsize: '/packages/misc/positionsize/index',
  putcallratio: '/packages/misc/putcallratio/index',
  fundingrate: '/packages/misc/fundingrate/index',
  tradevol: '/packages/misc/tradevol/index',
  user: '/packages/misc/user/index',
};

// 跳转币种详情页
export const jump2Detail = (symbol) => {
  console.log(symbol)
  Taro.navigateTo({
    url: `${pageRouteMap.detail}?symbol=${symbol}`,
  });
}

// 跳转排行榜
export const jump2Market = (findType) => {
  const app = Taro.getApp();
  app.findType = findType;
  Taro.switchTab({
    url: `/pages/find/index`,
  });
};

export const jump2Me = () => {
  Taro.switchTab({
    url: `/pages/me/index`,
  });
};

// 跳转列表页
export const jump2List = (listParam) => {
  const app = Taro.getApp();
  app.listParam = listParam;
  Taro.navigateTo({
    url: pageRouteMap.list,
  });
};


const queryString = (params) => {
  return Object.entries(params)
   .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
   .join('&');
}

// 跳转非Tab页面
export const jump2NoTab = (pageName, params = {}) => {
  if (isEmpty(params)) {
    Taro.navigateTo({
      url: pageRouteMap[pageName] || `/pages/${pageName}/index`,
    });
  } else {
    Taro.navigateTo({
      url: `${pageRouteMap[pageName] || `/pages/${pageName}/index`}?${queryString(params)}`,
    });
  }
};

// 跳转非Tab页面
export const jump2DataPage = (pageName, dataName, data = {}) => {
  const app = Taro.getApp();
  app[dataName] = data;
  Taro.navigateTo({
    url: pageRouteMap[pageName] || `/pages/${pageName}/index`,
  });
};

// 返回当前类型
export const appType = () => {
  return process.env.TARO_ENV;
};


// 列表处理
// export const handleList = (oldList, listItemName) => {
//   if (!Array.isArray(oldList)) {
//     console.log('传入的数据不是数组');
//     return;
//   }

//   return oldList.map((item) => {
//     return {

//     };
//   });
// };