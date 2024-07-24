import { Button, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { request } from '../../utils/request';
import './index.less';

export const Login = (props) => {

  const phoneLogin = (e) => {
    const phoneCode = e.detail.code || '';
    Taro.login({
      complete: async (res) => {
        if (res.code) {
          const openIdCode = res.code;

          const userInfo = await request({
            url: 'https://moziinnovations.com/user/login',
            data: {
              phoneCode,
              loginCode: openIdCode,
            },
            method: 'POST'
          });

          console.log('userInfo', userInfo);
          if (userInfo?.data?.token) {
            Taro.setStorageSync('token', userInfo?.data?.token);
            console.log('用户信息本地缓存成功');

            Taro.getUserProfile({
              desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
              success: (res) => {
                // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
                console.log('登录后res',res)
              }
            })
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
    // <Button className='loginBox' openType='getPhoneNumber' onGetPhoneNumber={phoneLogin}>
    //   {props.children}
    // </Button>
    <View>
      
    </View>
  );
};