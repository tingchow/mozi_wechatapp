import { View, Text, Image, Button, PageContainer, OfficialAccount, ScrollView, Input, Form } from '@tarojs/components';
import { List, Popup, Grid, Avatar } from 'antd-mobile';
import IconFont from '../../components/iconfont';
import Taro from '@tarojs/taro';
import { Login } from '../../components/Login';
import { useState, useEffect, useRef } from 'react';
import { useLoad, useShareTimeline, useRouter } from '@tarojs/taro';
import { jump2Detail, jump2Market } from '../../utils/core';
import { request } from '../../utils/request';
import { EMAIL, COINKEY } from '../../utils/constants';
// import '../../assets/wechat_account.jpg'
// import '../../assets/BTC.jpg'
// import '../../assets/ETH.jpg'
// import '../../assets/Tron.jpg'
import './index.less';

export default function User() {

  const [ userAvatar, setUserAvatar ] = useState(null);
  // const [ userName, setUserName ] = useState('请输入昵称');
  const [ newNickName, setNickName ] = useState('');
  // const [popVis, setPopVis] = useState(false);
  // const [popType, setPopType] = useState('');
  // const [reportScore, setScore] = useState(null);
  // const [isLogin, setIsLogin] = useState(false);

  const nickNamePass = useRef(false);

  // const avatar = useRef('');

  const { avatar = '', nickName = '' } = useRouter().params;


  useLoad(() => {
    console.log('Page loaded.')
    // Taro.showShareMenu({
    //   withShareTicket: true,
    //   showShareItems: ['wechatFriends', 'wechatMoment']
    // });

    // Taro.getStorage({
    //   key: 'userInfo',
    //   complete: (res) => {
    //     console.log(res);
    //     if (res.data) {
    //       // console.log('');
    //       // setIsLogin(true);
    //       // setUserInfo(res.data);
    //       setUserAvatar(res.data.avatar);
    //       setUserName(res.data.name);
    //     }
    //   },
    //   // fail: () => {}
    // })
    console.log('avatar', avatar);
    if (avatar) setUserAvatar(decodeURIComponent(avatar));
    // if (nickName) setUserName(decodeURIComponent(nickName));
    

    
  })

  const newAvatar = (e) => {
    console.log('avatar', e);
    const { avatarUrl = '' } = e?.detail 
    if (avatarUrl) {
      // todo 服务端上报
      // avatar.current = avatarUrl;
      setUserAvatar(avatarUrl);
    }
  };

  const nickNameReview = (e) => {
    nickNamePass.current = e.detail.pass;
  }

  const submit = (e) => {
    if (!nickNamePass.current || !e.detail.value?.nickName) {
      Taro.showToast({
        title: '抱歉，昵称不符合规定',
        icon: 'error',
        duration: 2000
      });
      return;
    }
    // todo 将头像和昵称上传给服务端，并本地缓存
    Taro.setStorageSync('userInfo', {
      avatar: userAvatar,
      nickName: e.detail.value?.nickName
    });
    Taro.showToast({
      title: '修改信息成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        Taro.navigateBack();
      }
    });
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
        
            <Input name='nickName' className='nickname-input' placeholder='请输入昵称' type='nickname' onNickNameReview={nickNameReview} />
          </View>
          <Button className='nickname-btn' formType='submit'>提交</Button>
        </Form>
      {/* </View> */}
    </View>
  )
}
