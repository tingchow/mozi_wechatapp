import Taro from '@tarojs/taro';

// 跳转币种详情页
export const jump2Detail = (symbol) => {
  console.log(symbol)
  Taro.navigateTo({
    url: `/pages/detail/index?symbol=${symbol}`,
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
    url: `/pages/list/index`,
  });
};


const queryString = (params) => {
  return Object.entries(params)
   .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
   .join('&');
}

// 跳转非Tab页面
export const jump2NoTab = (pageName, params = {}) => {
  Taro.navigateTo({
    url: `/pages/${pageName}/index?${queryString(params)}`,
  });
};

// 跳转非Tab页面
export const jump2DataPage = (pageName, dataName, data = {}) => {
  const app = Taro.getApp();
  app[dataName] = data;
  Taro.navigateTo({
    url: `/pages/${pageName}/index`,
  });
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