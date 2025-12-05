import { PageContainer, View, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import { Interface } from "../../utils/constants";
import { request } from "../../utils/request";

export const PageLogin = ({show = false, hideCb}) => {
  // const [popVis, setPopVis] = useState(show);

  console.log('show', show);

  const phoneLogin = (e)=> {
    // hidePop();
    const phoneCode = e.detail.code || '';
    Taro.login({
      complete: async (res) => {
        if (res.code) {
          const openIdCode = res.code;

          const tokenInfo = await request({
            url: Interface.MOZI_LOGIN,
            data: {
              chanel:1, 
              type:'login',
              phoneCode,
              loginCode: openIdCode,
            },
            method: 'POST'
          });

          console.log('tokenInfo', tokenInfo);
          if (tokenInfo?.data?.token) {
            Taro.setStorageSync('token', tokenInfo?.data?.token);
            // 单独保存 userId 供订阅等功能使用
            if (tokenInfo?.data?.userId) {
              Taro.setStorageSync('userId', tokenInfo?.data?.userId);
            }
            // 设置登录成功标记，用于社区页面刷新
            Taro.setStorageSync('justLoggedIn', true);
            console.log('用户信息本地缓存成功');
            
            // 获取并保存用户详细数据（包括邀请码）
            const { fetchAndSaveUserData } = require('../../utils/userHelper');
            await fetchAndSaveUserData();
            
            // 登录成功后，自动上报每日登录任务
            console.log('🔍 [PageLogin] 准备上报每日登录任务');
            try {
              const { reportDailyLogin } = require('../../utils/taskHelper');
              await reportDailyLogin();
              console.log('✅ [PageLogin] 每日登录任务上报完成');
            } catch (error) {
              console.error('❌ [PageLogin] 每日登录任务上报失败:', error);
            }
            
            const title = tokenInfo.data.type === 'login'? '登录成功': '注册成功';
            Taro.showToast({
              title,
              icon: 'success',
              duration: 2000
            });

            // todo 请求用户的信息
            // todo 成功后
            // 如果是登录，表示有用户信息
            // setUserInfo(userInfo);
            // Taro.setStorage('userInfo', userInfo);
            // props.loginCallback();
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

    hidePop();
  };


  const hidePop = () => {
    // setPopVis(false);
    hideCb();
  };

  return (
    <PageContainer
      show={show}
      onAfterLeave={() => {
        hidePop()
      }}
      closeOnSlideDown={true}
      round={true}
      // forceRender={true}
      position='bottom'
    >
      <View className='login-container'>
        <View>您还未登录</View>
        <Button className='login-btn' openType='getPhoneNumber' onGetPhoneNumber={phoneLogin}>登录/注册</Button>
      </View>
    </PageContainer>
  );
};