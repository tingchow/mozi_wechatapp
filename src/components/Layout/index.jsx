import { View, Button } from '@tarojs/components';
import { useState } from 'react';
import { GardenLoading } from '../Loading';
import { Interface } from '../../utils/constants';
import Taro from '@tarojs/taro';
import { request } from '../../utils/request';
import { Error } from '../Error';
import './index.less';

export const Layout = (props) => {

  const phoneLogin = (e)=> {
    const phoneCode = e.detail.code || '';
    // 点击登录时立即展示 Loading，防止用户误以为无响应
    try { Taro.showLoading({ title: '登录中...', mask: true }); } catch (err) {}
    Taro.login({
      complete: async (res) => {
        if (res.code) {
          const openIdCode = res.code;

          const tokenInfo = await request({
            url: Interface.MOZI_LOGIN,
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
            // 写入用户信息（若后端返回），供“我的”页展示
            try {
              const userInfo = tokenInfo?.data?.userInfo;
              if (userInfo?.avatar && userInfo?.nickName) {
                Taro.setStorageSync('userInfo', {
                  avatar: userInfo.avatar,
                  nickName: userInfo.nickName,
                  userId: tokenInfo?.data?.userId
                });
              }
            } catch (e) {}

            // todo 请求用户的信息
            // todo 成功后
            // 如果是登录，表示有用户信息
            // setUserInfo(userInfo);
            // Taro.setStorage('userInfo', userInfo);
            if (props?.needAccount) {
              try { Taro.hideLoading(); } catch (err) {}
              registerAccount();
              return;
            }
            try { Taro.hideLoading(); } catch (err) {}
            props.loginCallback();
          } else {
            console.log('数据失败');
            try { Taro.hideLoading(); } catch (err) {}
            Taro.showToast({
              title: '登录失败',
              icon: 'error',
              duration: 2000
            });
          }
        } else {
          console.log('登录失败！' + res.errMsg)
          try { Taro.hideLoading(); } catch (err) {}
        }
      }
    })
  };

  const registerAccount = () => {
    // todo 开通会员
    console.log('开通回调');
    props.accountCallback();
  };


  if (props.isError) {
    return (
      <View className='errorBox'>
        <Error errMsg={props.errMsg} />
      </View>
    )
  }

  if (props.needAccount) {
    return (
      <View className='login-box'>
        <View>您还不是会员，请开通会员体验</View>
        { 
          props?.needLogin? 
          <Button className='login-btn' openType='getPhoneNumber' onGetPhoneNumber={phoneLogin}>开通会员</Button>:
          <Button className='login-btn' onClick={registerAccount}>开通会员</Button>
        }
      </View>
    );
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
      <View className='login-box reverse'>
        <Button className='login-btn' openType='getPhoneNumber' onGetPhoneNumber={phoneLogin}>登录/注册</Button>
        <View className='login-tips'>您还未登录，登录可享受更多权益</View>
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