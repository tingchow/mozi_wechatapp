import Taro from '@tarojs/taro'
import {  Toast } from 'antd-mobile';
import { COMMON_MSG, INTERFACE_URL } from './constants';
import { jump2Me } from './core';

export const request = async (options) => {
  let token = '';
  try {
    token = await getToken();
  } catch (err) {
    console.log(err);
  }
  // const token = await getToken();
  try {
    if (location.href.indexOf('localhost') === -1) {
      options.url = `${INTERFACE_URL}${options.url}`
    }
    const { data = {} } = await Taro.request({
      ...options,
      header: {
        authentication: token || ''
      }
    });
    // if (!data.isLogin) {
    //   jump2Me();
    //   return;
    // }
    return data;
  } catch (err) {
    console.log(err);
    Toast.show({
      content: COMMON_MSG
    });
  }
};

export const getToken = () => {
  return new Promise((resolve, reject) => {
    Taro.getStorage({
      key: 'token',
      success: (tokenRes) => {
        console.log('token', tokenRes);
        if (tokenRes && tokenRes.data) {
          resolve(tokenRes.data);
        } else {
          reject('');
        }
      },
      fail: (errRes) => {
        reject(errRes);
      }
    })
  });
}