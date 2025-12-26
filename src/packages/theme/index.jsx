import { View, Text, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { request } from '../../utils/request';
import './index.less';

export default function ThemeCenter() {
  const [currentTheme, setCurrentTheme] = useState('default');

  // 主题配置
  const themes = [
    {
      id: 'default',
      name: '默认主题',
      description: '清新绿色，经典配色',
      primaryColor: '#11B787',
      bgColor: '#EEF0F3',
      themeColor: 1, // GREEN
      preview: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/image/me-bg.png'
    },
    {
      id: 'silver',
      name: '钛合银',
      description: '科技质感，银灰配色',
      primaryColor: '#8C8C8C',
      bgColor: '#F5F5F5',
      themeColor: 3, // SILVER
      preview: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/image/me-bg.png'
    },
    {
      id: 'blue',
      name: '海洋蓝',
      description: '沉稳大气，专业配色',
      primaryColor: '#1890FF',
      bgColor: '#E6F7FF',
      themeColor: 4, // PINK
      preview: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/image/me-bg.png'
    },
    {
      id: 'purple',
      name: '梦幻紫',
      description: '优雅神秘，时尚配色',
      primaryColor: '#722ED1',
      bgColor: '#F9F0FF',
      themeColor: 5, // PURPLE
      preview: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/image/me-bg.png'
    },
    {
      id: 'orange',
      name: '活力橙',
      description: '热情洋溢，活力配色',
      primaryColor: '#FA8C16',
      bgColor: '#FFF7E6',
      themeColor: 2, // ORANGE
      preview: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/image/me-bg.png'
    },
    {
      id: 'red',
      name: '中国红',
      description: '喜庆热烈，传统配色',
      primaryColor: '#F5222D',
      bgColor: '#FFF1F0',
      themeColor: 6, // RED
      preview: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/image/me-bg.png'
    },
    {
      id: 'dark',
      name: '暗黑模式',
      description: '护眼舒适，夜间专属',
      primaryColor: '#177DDC',
      bgColor: '#141414',
      themeColor: 7, // BLACK
      preview: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/image/me-bg.png'
    }
  ];

  useEffect(() => {
    // 从本地存储读取当前主题
    const savedTheme = Taro.getStorageSync('app_theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // 选择主题
  const handleSelectTheme = async (themeId) => {
    // 如果不是默认主题，显示敬请期待
    if (themeId !== 'default') {
      Taro.showToast({
        title: '敬请期待',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 找到对应的主题配置
    const selectedTheme = themes.find(theme => theme.id === themeId);
    if (!selectedTheme) return;

    // 获取用户ID
    const userInfo = Taro.getStorageSync('userInfo');
    if (!userInfo || !userInfo.userId) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    try {
      // 显示加载提示
      Taro.showLoading({
        title: '切换中...',
        mask: true
      });

      // 调用接口保存主题设置
      const result = await request({
        url: '/user/editUserTheme',
        method: 'POST',
        data: {
          userId: userInfo.userId,
          themeColor: selectedTheme.themeColor
        }
      });

      Taro.hideLoading();

      if (result && result.code === 0) {
        // 更新本地状态
        setCurrentTheme(themeId);
        
        // 保存到本地存储
        Taro.setStorageSync('app_theme', themeId);
        
        // 显示成功提示
        Taro.showToast({
          title: '主题已切换',
          icon: 'success',
          duration: 2000
        });

        // 延迟重新加载页面以应用主题
        setTimeout(() => {
          Taro.reLaunch({
            url: '/pages/me/index'
          });
        }, 1500);
      } else {
        Taro.showToast({
          title: result?.errorMsg || '切换失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      Taro.hideLoading();
      console.error('切换主题失败:', error);
      Taro.showToast({
        title: '切换失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  };

  return (
    <View className='theme-center'>
      <View className='theme-header'>
        <Text className='header-title'>选择你喜欢的主题</Text>
      </View>

      <View className='theme-list'>
        {themes.map((theme) => (
          <View
            key={theme.id}
            className={`theme-item ${currentTheme === theme.id ? 'active' : ''}`}
            onClick={() => handleSelectTheme(theme.id)}
          >
            <View className='theme-preview' style={{ backgroundColor: theme.bgColor }}>
              <View className='preview-top' style={{ backgroundColor: theme.primaryColor }}>
                <View className='preview-icon' />
                <View className='preview-text' />
              </View>
              <View className='preview-card' />
              <View className='preview-card' />
            </View>

            <View className='theme-info'>
              <View className='theme-name-row'>
                <Text className='theme-name'>{theme.name}</Text>
                {currentTheme === theme.id && (
                  <View className='current-badge'>当前</View>
                )}
              </View>
              <Text className='theme-description'>{theme.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

