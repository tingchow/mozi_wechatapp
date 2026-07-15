import { View, Text, Image, Button } from '@tarojs/components';
import { useState } from 'react';
import Taro, { useLoad, useDidShow } from '@tarojs/taro';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import './index.less';

// VIP等级配置 - 移到组件外部，避免访问顺序问题
const vipLevels = [
  { level: 0, name: '普通用户', color: '#8C8C8C', icon: '👤' },
  { level: 1, name: 'VIP会员', color: '#FA8C16', icon: '⭐' },
  { level: 2, name: '高级VIP', color: '#1890FF', icon: '💎' },
  { level: 3, name: '至尊VIP', color: '#722ED1', icon: '👑' }
];

export default function MemberCenter() {
  const [userInfo, setUserInfo] = useState({
    nickname: '游客',
    avatar: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/avatar.png',
    vipLevel: 0,
    vipName: '普通用户'
  });
  const [systemInfo, setSystemInfo] = useState({ statusBarHeight: 44 });
  const [isLogin, setIsLogin] = useState(false);

  useLoad(() => {
    console.log('会员中心页面加载');
    
    // 获取系统信息
    Taro.getSystemInfo({
      success: (res) => {
        setSystemInfo({
          statusBarHeight: res.statusBarHeight || 44
        });
      }
    });
    
    // 初始加载用户信息
    loadUserInfo();
  });

  useDidShow(() => {
    console.log('会员中心页面显示，重新加载用户信息');
    // 每次页面显示时都重新加载
    loadUserInfo();
  });

  const loadUserInfo = () => {
    // 获取用户信息
    const token = Taro.getStorageSync('token');
    console.log('loadUserInfo - token:', token);
    
    if (token) {
      setIsLogin(true);
      const userInfoData = Taro.getStorageSync('userInfo');
      
      // 获取VIP等级
      const savedVipLevel = Taro.getStorageSync('vipLevel');
      const vipLevel = savedVipLevel !== null && savedVipLevel !== undefined 
        ? savedVipLevel 
        : (userInfoData?.vipLevel || 0);
      
      console.log('loadUserInfo - vipLevel:', vipLevel);
      console.log('loadUserInfo - userInfoData:', userInfoData);
      
      // 确保 vipLevel 在有效范围内
      const safeVipLevel = (vipLevel >= 0 && vipLevel < vipLevels.length) ? vipLevel : 0;
      
      const newUserInfo = {
        nickname: userInfoData?.nickName || '用户',
        avatar: userInfoData?.avatar || 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/avatar.png',
        vipLevel: safeVipLevel,
        vipName: vipLevels[safeVipLevel]?.name || '普通用户'
      };
      
      console.log('loadUserInfo - newUserInfo:', newUserInfo);
      setUserInfo(newUserInfo);
    } else {
      setIsLogin(false);
      // 重置为游客状态
      setUserInfo({
        nickname: '游客',
        avatar: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/avatar.png',
        vipLevel: 0,
        vipName: '普通用户'
      });
    }
  };

  // 手机号登录
  const phoneLogin = (e) => {
    console.log('phoneLogin 被调用', e);
    const phoneCode = e.detail.code || '';
    
    // 检查用户是否拒绝授权
    if (!phoneCode) {
      console.log('用户拒绝了手机号授权');
      Taro.showToast({
        title: '需要手机号授权才能登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    Taro.login({
      complete: async (res) => {
        if (res.code) {
          Taro.showLoading({
            title: '登录中...',
            mask: true
          });
          const openIdCode = res.code;
          console.log('openIdCode', openIdCode);
          
          try {
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

            console.log('tokenInfo', tokenInfo);
            Taro.hideLoading();
            
            if (tokenInfo?.data?.token) {
              Taro.setStorageSync('token', tokenInfo?.data?.token);
              console.log('用户信息本地缓存成功');

              // 保存用户信息
              const userInfoData = tokenInfo?.data?.userInfo;
              const userId = tokenInfo?.data?.userId;

              const { saveOpenIdFromLogin, fetchAndSaveUserData } = require('../../utils/userHelper');
              saveOpenIdFromLogin(tokenInfo.data);
              
              // 单独保存 userId
              if (userId) {
                Taro.setStorageSync('userId', userId);
              }
              
              if (userInfoData?.avatar && userInfoData?.nickName) {
                Taro.setStorageSync('userInfo', {
                  avatar: userInfoData?.avatar,
                  nickName: userInfoData?.nickName,
                  userId: userId
                });
                
                // 立即更新状态
                setIsLogin(true);
                setUserInfo({
                  nickname: userInfoData?.nickName,
                  avatar: userInfoData?.avatar,
                  vipLevel: 0,
                  vipName: '普通用户'
                });
              } else {
                // 如果没有头像和昵称，也要更新登录状态
                setIsLogin(true);
              }

              // 获取并保存用户详细数据
              try {
                await fetchAndSaveUserData();
              } catch (error) {
                console.error('获取用户详细数据失败:', error);
              }
              
              // 登录成功后，自动上报每日登录任务
              try {
                const { reportDailyLogin } = require('../../utils/taskHelper');
                await reportDailyLogin();
              } catch (error) {
                console.error('每日登录任务上报失败:', error);
              }
              
              Taro.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 2000
              });
            } else {
              console.log('登录失败 - 没有返回token');
              Taro.showToast({
                title: tokenInfo?.errorMsg || '登录失败，请重试',
                icon: 'none',
                duration: 2000
              });
            }
          } catch (error) {
            console.error('登录请求失败:', error);
            Taro.hideLoading();
            Taro.showToast({
              title: '网络错误，请重试',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          console.log('登录失败！' + res.errMsg);
          Taro.showToast({
            title: '登录失败：' + res.errMsg,
            icon: 'none',
            duration: 2000
          });
        }
      }
    })
  };

  // 处理头像点击（仅在已登录时调用）
  const handleAvatarClick = () => {
    console.log('头像被点击，显示编辑选项');
    // 显示编辑选项
    Taro.showActionSheet({
      itemList: ['修改头像', '修改昵称'],
      success: (res) => {
        if (res.tapIndex === 0) {
          handleChooseAvatar();
        } else if (res.tapIndex === 1) {
          handleEditNickname();
        }
      }
    });
  };

  // 选择头像
  const handleChooseAvatar = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // 这里应该上传到服务器，暂时只更新本地
        const newUserInfo = {
          ...userInfo,
          avatar: tempFilePath
        };
        setUserInfo(newUserInfo);
        
        // 更新本地存储
        const storedUserInfo = Taro.getStorageSync('userInfo') || {};
        Taro.setStorageSync('userInfo', {
          ...storedUserInfo,
          avatar: tempFilePath
        });
        
        Taro.showToast({
          title: '头像已更新',
          icon: 'success',
          duration: 2000
        });
      }
    });
  };

  // 编辑昵称
  const handleEditNickname = () => {
    Taro.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      content: userInfo.nickname,
      success: (res) => {
        if (res.confirm && res.content) {
          const newNickname = res.content.trim();
          if (newNickname === '') {
            Taro.showToast({
              title: '昵称不能为空',
              icon: 'none',
              duration: 2000
            });
            return;
          }

          const newUserInfo = {
            ...userInfo,
            nickname: newNickname
          };
          setUserInfo(newUserInfo);
          
          // 更新本地存储
          const storedUserInfo = Taro.getStorageSync('userInfo') || {};
          Taro.setStorageSync('userInfo', {
            ...storedUserInfo,
            nickName: newNickname
          });
          
          Taro.showToast({
            title: '昵称已更新',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  };

  // 会员特权列表
  const privileges = [
    { icon: '🎯', title: '专属标识', desc: 'VIP专属身份标识' },
    { icon: '🚀', title: '优先体验', desc: '新功能优先体验' },
    { icon: '📊', title: '高级数据', desc: '更多数据分析功能' },
    { icon: '🎁', title: '专属福利', desc: '定期专属福利活动' },
    { icon: '💬', title: '专属客服', desc: 'VIP专属客服通道' },
    { icon: '🔔', title: '消息推送', desc: '重要消息优先推送' }
  ];

  const handleUpgrade = () => {
    console.log('立即升级按钮被点击');
    try {
      Taro.navigateTo({
        url: '/packages/member/upgrade/index',
        success: () => {
          console.log('跳转成功');
        },
        fail: (err) => {
          console.error('跳转失败:', err);
          Taro.showToast({
            title: '页面跳转失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    } catch (error) {
      console.error('跳转异常:', error);
    }
  };

  return (
    <View className='member-center-container'>
      {/* 自定义导航栏 - 无返回按钮 */}
      <View className='custom-navbar' style={{ paddingTop: `${systemInfo.statusBarHeight}px` }}>
        <View className='navbar-content'>
          <Text className='navbar-title'>会员中心</Text>
        </View>
      </View>
      
      {/* 内容区域 */}
      <View className='content-wrapper' style={{ paddingTop: `${systemInfo.statusBarHeight + 44}px` }}>
        {/* 顶部用户信息卡片 */}
        <View className='user-card'>
          {!isLogin ? (
            // 未登录状态 - 使用 Button 组件，不显示编辑图标
            <Button className='user-header-btn' openType='getPhoneNumber' onGetPhoneNumber={phoneLogin}>
              <View className='user-header'>
                <View className='avatar-wrapper'>
                  <Image className='user-avatar' src={userInfo.avatar} mode='aspectFill' />
                </View>
                <View className='user-info'>
                  <Text className='user-nickname'>{userInfo.nickname}</Text>
                  <View className='vip-badge' style={{ backgroundColor: (vipLevels[userInfo.vipLevel] || vipLevels[0]).color }}>
                    <Text className='vip-icon'>{(vipLevels[userInfo.vipLevel] || vipLevels[0]).icon}</Text>
                    <Text className='vip-text'>{(vipLevels[userInfo.vipLevel] || vipLevels[0]).name}</Text>
                  </View>
                </View>
              </View>
            </Button>
          ) : (
            // 已登录状态 - 使用 View 组件，显示编辑图标
            <View className='user-header' onClick={handleAvatarClick}>
              <View className='avatar-wrapper'>
                <Image className='user-avatar' src={userInfo.avatar} mode='aspectFill' />
                <View className='avatar-edit-badge'>
                  <Text className='edit-icon'>✏️</Text>
                </View>
              </View>
              <View className='user-info'>
                <Text className='user-nickname'>{userInfo.nickname}</Text>
                <View className='vip-badge' style={{ backgroundColor: (vipLevels[userInfo.vipLevel] || vipLevels[0]).color }}>
                  <Text className='vip-icon'>{(vipLevels[userInfo.vipLevel] || vipLevels[0]).icon}</Text>
                  <Text className='vip-text'>{(vipLevels[userInfo.vipLevel] || vipLevels[0]).name}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

      {/* VIP等级展示 */}
      <View className='vip-levels'>
        <Text className='section-title'>会员等级</Text>
        <View className='levels-list'>
          {vipLevels.map((vip, index) => (
            <View 
              key={index} 
              className={`level-item ${userInfo.vipLevel === vip.level ? 'active' : ''}`}
              style={{ borderColor: vip.color }}
            >
              <Text className='level-icon'>{vip.icon}</Text>
              <Text className='level-name' style={{ color: vip.color }}>{vip.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 会员特权 */}
      <View className='privileges-section'>
        <Text className='section-title'>会员特权</Text>
        <View className='privileges-grid'>
          {privileges.map((item, index) => (
            <View key={index} className='privilege-item'>
              <Text className='privilege-icon'>{item.icon}</Text>
              <Text className='privilege-title'>{item.title}</Text>
              <Text className='privilege-desc'>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 底部按钮 */}
      <View className='action-section'>
        <View className='upgrade-btn' onClick={handleUpgrade}>
          <Text className='upgrade-text'>立即升级</Text>
        </View>
        <Button className='contact-btn-wrapper' openType='contact'>
          <View className='contact-btn'>
            <Text className='contact-text'>联系客服</Text>
          </View>
        </Button>
      </View>

      {/* 提示信息 */}
      <View className='tips'>
        <Text className='tips-text'>💡 升级会员，解锁更多专属特权</Text>
      </View>
      </View>
    </View>
  );
}
