import { View, Button } from '@tarojs/components';
import { useState } from 'react';
import { GardenLoading } from '../Loading';
import Taro from '@tarojs/taro';
import { request } from '../../utils/request';
import { Error } from '../Error';
import './index.less';

export const Layout = (props) => {

  const phoneLogin = (e)=> {
    const phoneCode = e.detail.code || '';
    Taro.login({
      complete: async (res) => {
        if (res.code) {
          const openIdCode = res.code;

          const tokenInfo = await request({
            url: 'https://moziinnovations.com/user/login',
            data: {
              phoneCode,
              loginCode: openIdCode,
            },
            method: 'POST'
          });

          console.log('tokenInfo', tokenInfo);
          if (tokenInfo?.data?.token) {
            Taro.setStorageSync('token', tokenInfo?.data?.token);
            console.log('用户信息本地缓存成功');

            // todo 请求用户的信息
            // todo 成功后
            // 如果是登录，表示有用户信息
            // setUserInfo(userInfo);
            // Taro.setStorage('userInfo', userInfo);
            props.loginCallback();
          } else {
            console.log('数据失败');
            Taro.showToast({
              title: '登录失败',
              icon: 'error',
              duration: 2000
            });
          }
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  };


  if (props.isError) {
    return (
      <View className='errorBox'>
        <Error />
      </View>
    )
  }
  if (props.isLoading) {
    return (
      <View className='loadingBox'>
        <GardenLoading />
      </View>
    )
  }
  if (props.needLogin) {
    return (
      <View className='login-box'>
        <View>您还未登录</View>
        <Button className='login-btn' openType='getPhoneNumber' onGetPhoneNumber={phoneLogin}>登录/注册</Button>
      </View>
    );
  }

  if (props.isClose) {
    return null;
  }

  return (
    <View className='box'>
      {props.children}
    </View>
  )
	
}