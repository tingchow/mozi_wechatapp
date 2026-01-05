import { View, Text, Image, Button } from '@tarojs/components';
import { useState } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import './index.less';

export default function MemberCenter() {
  const [userInfo, setUserInfo] = useState({
    nickname: '游客',
    avatar: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/avatar.png',
    vipLevel: 0,
    vipName: '普通用户'
  });
  const [systemInfo, setSystemInfo] = useState({ statusBarHeight: 44 });

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
    
    // 获取用户信息
    const token = Taro.getStorageSync('token');
    if (token) {
      const userInfoData = Taro.getStorageSync('userInfo');
      if (userInfoData) {
        setUserInfo({
          ...userInfo,
          nickname: userInfoData.nickName || '用户',
          avatar: userInfoData.avatar || userInfo.avatar
        });
      }
    }
  });

  // VIP等级配置
  const vipLevels = [
    { level: 0, name: '普通用户', color: '#8C8C8C', icon: '👤' },
    { level: 1, name: 'VIP会员', color: '#FA8C16', icon: '⭐' },
    { level: 2, name: '高级VIP', color: '#1890FF', icon: '💎' },
    { level: 3, name: '至尊VIP', color: '#722ED1', icon: '👑' }
  ];

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
    Taro.showToast({
      title: '敬请期待',
      icon: 'none',
      duration: 2000
    });
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
        <View className='user-header'>
          <Image className='user-avatar' src={userInfo.avatar} mode='aspectFill' />
          <View className='user-info'>
            <Text className='user-nickname'>{userInfo.nickname}</Text>
            <View className='vip-badge' style={{ backgroundColor: vipLevels[userInfo.vipLevel].color }}>
              <Text className='vip-icon'>{vipLevels[userInfo.vipLevel].icon}</Text>
              <Text className='vip-text'>{vipLevels[userInfo.vipLevel].name}</Text>
            </View>
          </View>
        </View>
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
