import { COMMON_MSG, INTERFACE_URL } from './constants';
import { jump2Me } from './core';

export const request = async (options) => {
  let token = '';
  try {
    token = await getToken();
  } catch (err) {
    console.log(err);
  }
  
  try {
    // 判断是否为本地开发环境
    if (typeof window !== 'undefined' && window.location && window.location.href.indexOf('localhost') === -1) {
      options.url = `${INTERFACE_URL}${options.url}`;
    } else if (typeof window === 'undefined') {
      // 小程序环境或其他非浏览器环境，直接添加基础URL
      options.url = `${INTERFACE_URL}${options.url}`;
    }
    
    const { data = {} } = await uni.request({
      ...options,
      header: {
        authentication: token || '',
        'Content-Type': 'application/json',
        ...options.header
      }
    });
    
    // 可以根据业务需要处理登录状态
    // if (!data.isLogin) {
    //   jump2Me();
    //   return;
    // }
    
    return data;
  } catch (err) {
    console.log(err);
    uni.showToast({
      title: COMMON_MSG,
      icon: 'none',
      duration: 2000
    });
    throw err;
  }
};

export const getToken = () => {
  return new Promise((resolve, reject) => {
    uni.getStorage({
      key: 'token',
      success: (tokenRes) => {
        if (tokenRes && tokenRes.data) {
          resolve(tokenRes.data);
        } else {
          reject('');
        }
      },
      fail: (errRes) => {
        reject(errRes);
      }
    });
  });
};

// 设置token
export const setToken = (token) => {
  return new Promise((resolve, reject) => {
    uni.setStorage({
      key: 'token',
      data: token,
      success: () => {
        resolve(true);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 清除token
export const clearToken = () => {
  return new Promise((resolve, reject) => {
    uni.removeStorage({
      key: 'token',
      success: () => {
        resolve(true);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// GET请求封装
export const get = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
};

// POST请求封装
export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
};

// PUT请求封装
export const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
};

// DELETE请求封装
export const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
};

export default request;
