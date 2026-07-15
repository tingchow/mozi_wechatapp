import React, { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import { Interface } from '../../utils/constants'
import { request } from '../../utils/request'

import './index.less'

const INIT_DATA = { mobile: '', randCode: '' }

export const PopLogin = ({ show = false, hideCb }) => {
    // const [codeText, setCodeText] = useState('获取验证码')
    // const [formData, setFormData] = useState(INIT_DATA)
    // const { title, subTitle, description, onConfirm, onCancel } = props

    const phoneLogin = (e)=> {
        e.stopPropagation()
        Taro.showLoading({
          title: '',
        });
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
                  channel:'miniapp'
                },
                method: 'POST'
              });
              Taro.hideLoading();
              console.log('tokenInfo', tokenInfo);
              if (tokenInfo?.data?.token) {
                Taro.setStorageSync('token', tokenInfo?.data?.token);
                // 单独保存 userId 供订阅等功能使用
                if (tokenInfo?.data?.userId) {
                  Taro.setStorageSync('userId', tokenInfo?.data?.userId);
                }
                const { saveOpenIdFromLogin } = require('../../utils/userHelper');
                saveOpenIdFromLogin(tokenInfo.data);
                // 新增：保存登录返回的 subscribeAnnouncement 字段到本地
                if (typeof tokenInfo?.data?.subscribeAnnouncement !== 'undefined') {
                  Taro.setStorageSync('subscribeAnnouncement', tokenInfo.data.subscribeAnnouncement);
                }
                // 设置登录成功标记，用于社区页面刷新
                Taro.setStorageSync('needRefreshCommunity', true);
                console.log('用户信息本地缓存成功');
                
                // 获取并保存用户详细数据（包括邀请码）
                const { fetchAndSaveUserData } = require('../../utils/userHelper');
                await fetchAndSaveUserData();
                
                // 登录成功后，自动上报每日登录任务
                console.log('🔍 [PopLogin] 准备上报每日登录任务');
                try {
                  const { reportDailyLogin } = require('../../utils/taskHelper');
                  await reportDailyLogin();
                  console.log('✅ [PopLogin] 每日登录任务上报完成');
                } catch (error) {
                  console.error('❌ [PopLogin] 每日登录任务上报失败:', error);
                }
                
                const title = tokenInfo.data.type === 'login'? '登录成功': '注册成功';
                hidePop();
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
                hidePop();
                Taro.showToast({
                  title: '登录失败',
                  icon: 'error',
                  duration: 2000
                });
              }
            } else {
              Taro.hideLoading();
              hidePop();
              console.log('登录失败！' + res.errMsg)
            }
          }
        })
    
        // hidePop();
      };
    
    
      const hidePop = () => {
        // setPopVis(false);
        hideCb();
      };

      const handleMask = (e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {hidePop()}
      }
    return (
      <View className="popup-wrap" onClick={handleMask}>
        <View className='login-container'>
          <Image
            className='login-warn-icon'
            src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/login_warn.png'
            mode='aspectFit'
          />
          <View className='login-title'>您还未登录</View>
          <Button className='login-btn' openType='getPhoneNumber' onGetPhoneNumber={phoneLogin}>登录/注册</Button>
        </View>
      </View>
    )
}