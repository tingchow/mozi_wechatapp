import Taro from '@tarojs/taro';
import isEmpty from 'lodash/isEmpty';

// 需要走分包路径的页面
const SUBPACKAGE_PAGES = new Set(['addwarn', 'mywarn', 'list', 'tradevol', 'search', 'fundingrate', 'landscapechart', 'putcallratio', 'robot', 'mycomments', 'mylikes']);

// 跳转币种详情页
export const jump2Detail = (symbol) => {
  console.log(symbol)
  Taro.navigateTo({
    url: `/packages/detail/index?symbol=${symbol}`,
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
  Taro.navigateTo({ url: `/packages/list/index` });
};


const queryString = (params) => {
  return Object.entries(params)
   .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
   .join('&');
}

// 跳转非Tab页面
export const jump2NoTab = (pageName, params = {}) => {
  const basePath = SUBPACKAGE_PAGES.has(pageName)
    ? `/packages/${pageName}/index`
    : `/pages/${pageName}/index`;

  if (isEmpty(params)) {
    Taro.navigateTo({ url: basePath });
    return;
  }

  Taro.navigateTo({ url: `${basePath}?${queryString(params)}` });
};

// 跳转非Tab页面
export const jump2DataPage = (pageName, dataName, data = {}) => {
  const app = Taro.getApp();
  app[dataName] = data;
  const basePath = SUBPACKAGE_PAGES.has(pageName)
    ? `/packages/${pageName}/index`
    : `/pages/${pageName}/index`;
  Taro.navigateTo({ url: basePath });
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