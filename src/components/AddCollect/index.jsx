import IconFont from '../iconfont';
import { Input, View, PageContainer, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState, useRef } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import { PopLogin } from '../PopLogin';
import './index.less';

let isClick = false;

export const AddCollect = (props) => {

  const [ isOwn, setOwn ] = useState(props.isOwn);
  const [showLogin, setShowLogin] = useState(false);


  const changeOwn = async (e) => {
    e.stopPropagation();
    if (isClick) return;
    isClick = true;
    console.log('开始添加自选');
    Taro.showLoading({
      title: '',
    });
    let url = isOwn? Interface.CANCEL_OWN: Interface.ADD_OWN;
    const changeOwnRes = await request({
      url,
      data: {
        coin: props.symbol
      }
    });
    console.log('changeOwnRes', changeOwnRes);
    Taro.hideLoading();
    if (changeOwnRes?.data?.isLogin === false) {
      // 未登录，引导登录
      // if (props.loginCb) props.loginCb();
      setShowLogin(true);
      isClick = false;
      return;
    }
    if (changeOwnRes?.data) {
      // 修改成功
      Taro.showToast({
        title: isOwn? '移除自选成功': '加入自选成功',
        icon: 'success',
        duration: 2000
      });
      setOwn(!isOwn);
    }
    isClick = false;
  };

  // const phoneLogin = (e)=> {
  //   hidePop();
  //   const phoneCode = e.detail.code || '';
  //   Taro.login({
  //     complete: async (res) => {
  //       if (res.code) {
  //         const openIdCode = res.code;

  //         const tokenInfo = await request({
  //           url: 'https://moziinnovations.com/user/login',
  //           data: {
  //             phoneCode,
  //             loginCode: openIdCode,
  //           },
  //           method: 'POST'
  //         });

  //         console.log('tokenInfo', tokenInfo);
  //         if (tokenInfo?.data?.token) {
  //           Taro.setStorageSync('token', tokenInfo?.data?.token);
  //           console.log('用户信息本地缓存成功');

  //           // todo 请求用户的信息
  //           // todo 成功后
  //           // 如果是登录，表示有用户信息
  //           // setUserInfo(userInfo);
  //           // Taro.setStorage('userInfo', userInfo);
  //           // props.loginCallback();
  //         } else {
  //           console.log('数据失败');
  //           Taro.showToast({
  //             title: '登录失败',
  //             icon: 'error',
  //             duration: 2000
  //           });
  //         }
  //       } else {
  //         console.log('登录失败！' + res.errMsg)
  //       }
  //     }
  //   })
  // };


  return (
    <View>
      <View className='collect' onClick={changeOwn} catchMove={true}>
        <IconFont name='heart-fill' color={isOwn? 'red': ''} size={40} />
      </View>
      { showLogin && <PopLogin hideCb={() => {setShowLogin(false)}} /> }
    </View>
  );
};