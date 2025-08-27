import { isEmpty } from './index';

// 跳转币种详情页
export const jump2Detail = (symbol) => {
  console.log(symbol);
  uni.navigateTo({
    url: `/pages/detail/index?symbol=${symbol}`,
  });
};

// 跳转排行榜
export const jump2Market = (findType) => {
  // 在uni-app中可以使用全局数据存储
  const app = getApp();
  if (app) {
    app.globalData = app.globalData || {};
    app.globalData.findType = findType;
  }
  uni.switchTab({
    url: `/pages/find/index`,
  });
};

export const jump2Me = () => {
  uni.switchTab({
    url: `/pages/me/index`,
  });
};

// 跳转列表页
export const jump2List = (listParam) => {
  const app = getApp();
  if (app) {
    app.globalData = app.globalData || {};
    app.globalData.listParam = listParam;
  }
  uni.navigateTo({
    url: `/pages/list/index`,
  });
};

const queryString = (params) => {
  return Object.entries(params)
   .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
   .join('&');
};

// 跳转非Tab页面
export const jump2NoTab = (pageName, params = {}) => {
  if (isEmpty(params)) {
    uni.navigateTo({
      url: `/pages/${pageName}/index`,
    });
  } else {
    uni.navigateTo({
      url: `/pages/${pageName}/index?${queryString(params)}`,
    });
  }
};

// 跳转非Tab页面（带数据传递）
export const jump2DataPage = (pageName, dataName, data = {}) => {
  const app = getApp();
  if (app) {
    app.globalData = app.globalData || {};
    app.globalData[dataName] = data;
  }
  uni.navigateTo({
    url: `/pages/${pageName}/index`,
  });
};

// 返回当前平台类型
export const appType = () => {
  // uni-app中获取平台类型
  const systemInfo = uni.getSystemInfoSync();
  return systemInfo.platform;
};

// 获取当前运行环境
export const getCurrentPlatform = () => {
  // #ifdef H5
  return 'h5';
};

// 显示loading
export const showLoading = (title = '加载中...') => {
  uni.showLoading({
    title,
    mask: true
  });
};

// 隐藏loading
export const hideLoading = () => {
  uni.hideLoading();
};

// 显示提示
export const showToast = (title, icon = 'none', duration = 2000) => {
  uni.showToast({
    title,
    icon,
    duration
  });
};

// 显示确认对话框
export const showModal = (title, content) => {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
};

// 复制到剪贴板
export const copyToClipboard = (data) => {
  return new Promise((resolve, reject) => {
    uni.setClipboardData({
      data,
      success: () => {
        showToast('复制成功');
        resolve(true);
      },
      fail: (err) => {
        showToast('复制失败');
        reject(err);
      }
    });
  });
};

// 获取页面参数
export const getPageParams = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  return currentPage.options || {};
};

// 返回上一页
export const goBack = (delta = 1) => {
  uni.navigateBack({
    delta
  });
};
