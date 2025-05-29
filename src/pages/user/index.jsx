import { View, Text, Image, Button, PageContainer, OfficialAccount, ScrollView, Input, Form } from '@tarojs/components';
import { List, Popup, Grid, Avatar } from 'antd-mobile';
import IconFont from '../../components/iconfont';
import Taro from '@tarojs/taro';
import { useState, useEffect, useRef } from 'react';
import { useLoad, useShareTimeline, useRouter } from '@tarojs/taro';
import { jump2Detail, jump2Market } from '../../utils/core';
import { request } from '../../utils/request';
import { EMAIL, COINKEY, Interface } from '../../utils/constants';
import './index.less';

export default function User() {

  const [ userAvatar, setUserAvatar ] = useState(null);
  const [ userNickName, setUserNickName ] = useState('');

  const nickNamePass = useRef(false);
  const handleNewAvatar = useRef(false);

  const { avatar = '', nickName = '' } = useRouter().params;


  useLoad(() => {
    if (avatar) setUserAvatar(decodeURIComponent(avatar));
    if (nickName) setUserNickName(decodeURIComponent(nickName));
  })

  const newAvatar = (e) => {
    console.log('avatar', e);
    const { avatarUrl = '' } = e?.detail 
    if (avatarUrl) {
      setUserAvatar(avatarUrl);
      handleNewAvatar.current = true;
    }
  };

  const nickNameReview = (e) => {
    nickNamePass.current = e.detail.pass;
  }

  const submit = async (e) => {
    if (!e.detail.value?.nickName || e.detail.value?.nickName.length >= 50 || e.detail.value?.nickName === decodeURIComponent(avatar)) {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'error',
        duration: 2000
      });
      return;
    }
    setUserNickName(e.detail.value?.nickName);
    Taro.showLoading({
      title: '',
    });
    // 生成base64头像
    let newAvatar = userAvatar;
    console.log('当前设置的是', userAvatar);
    console.log('传入的事', decodeURIComponent(avatar));
    if (handleNewAvatar.current) {
      newAvatar = 'data:image/jpeg;base64,' + Taro.getFileSystemManager().readFileSync(userAvatar, 'base64');
    }

    const infoRes = await request({
      url: Interface.MOZI_USER,
      data: {
        avatar: newAvatar,
        nickName: e.detail.value?.nickName,
      },
      method: 'POST'
    });

    if (infoRes?.data) {
      Taro.setStorageSync('userInfo', {
        avatar: infoRes?.data,
        nickName: e.detail.value?.nickName,
      });
      Taro.hideLoading();
      Taro.showToast({
        title: '修改信息成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            Taro.navigateBack();
          }, 2000);
        }
      });
    } else {
      Taro.hideLoading();
      Taro.showToast({
        title: '修改信息失败',
        icon: 'error',
        duration: 2000,
      });
    }


    
  };

  return (
    <View className='user'>
      <Button className='avatar-box' openType='chooseAvatar' onChooseAvatar={newAvatar}>
        <Image className='avatar' src={userAvatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'} />
        
      </Button>
      {/* <View className='nickname-box'> */}
        <Form className='nickname-form' onSubmit={submit}>
          <View className='nickname-content'>
            <View>昵称</View>
        
            <Input name='nickName' className='nickname-input' placeholder={decodeURIComponent(nickName) || '请输入昵称'} type='nickname' onNickNameReview={nickNameReview} value={userNickName} />
          </View>
          <Button className='nickname-btn' formType='submit'>提交</Button>
        </Form>
      {/* </View> */}
    </View>
  )
}
