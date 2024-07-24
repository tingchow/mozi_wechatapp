import IconFont from '../iconfont';
import { Input, View, PageContainer, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import './index.less';

let isClick = false;

export const AddCollect = (props) => {

  const [ isOwn, setOwn ] = useState(props.isOwn);
  const [ popVis, setPopVis ] = useState(false);


  const changeOwn = async (e) => {
    e.stopPropagation();
    if (isClick) return;
    isClick = true;
    console.log('开始添加自选');
    Taro.showLoading({
      title: '',
    });
    const changeOwnRes = await request({
      url: Interface.ADD_OWN,
      data: {
        coin: props.symbol
      }
    });
    console.log('changeOwnRes', changeOwnRes);
    Taro.hideLoading();
    if (changeOwnRes?.data?.isLogin === false) {
      // 未登录，引导登录
      setPopVis(true);
    }
    if (changeOwnRes?.data) {
      // 修改成功
      setOwn(!isOwn);
    }
    isClick = false;
  };

  const phoneLogin = (e)=> {
    setPopVis(false);
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


  return (
    <View>
      <View className='collect' onClick={changeOwn} catchMove={true}>
        <IconFont name='heart-fill' color={isOwn? 'red': ''} size={40} />
        
      </View>
      <PageContainer
          show={popVis}
          onAfterLeave={() => {
            setPopVis(false);
          }}
          closeOnSlideDown={true}
          round={true}
          forceRender={true}
          position='bottom'
        >
          <View className='login-box'>
            <View>您还未登录</View>
            <Button className='login-btn' openType='getPhoneNumber' onGetPhoneNumber={phoneLogin}>登录/注册</Button>
          </View>
        </PageContainer>
    </View>
  );
};