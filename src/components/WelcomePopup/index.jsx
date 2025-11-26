import { View, Image, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import './index.less';

// CDN图片资源
const pointModalBg = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/point/point_modal_bg.png';
const pointModalLogo = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/point/ponit_modal_logo.png';
const pointModalRightText = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/point/ponit_modal_right_text.png';

/**
 * 获取积分欢迎弹窗
 */
export const WelcomePopup = ({ visible, onClose, onConfirm }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      // 延迟显示，添加动画效果
      setTimeout(() => setShow(true), 50);
    } else {
      setShow(false);
    }
  }, [visible]);

  // 点击立即加入
  const handleJoinClick = () => {
    if (onConfirm) onConfirm();
    // 跳转到积分详情页
    Taro.navigateTo({
      url: '/packages/points/index'
    });
    onClose && onClose();
  };

  // 点击关闭
  const handleClose = () => {
    if (onConfirm) onConfirm();
    onClose && onClose();
  };

  // 点击遮罩层不关闭（防止误触）
  const handleOverlayClick = (e) => {
    e.stopPropagation();
  };

  if (!visible) return null;

  return (
    <View className={`welcome-popup-overlay ${show ? 'show' : ''}`} onClick={handleOverlayClick}>
      <View className={`welcome-popup-container ${show ? 'show' : ''}`}>
        {/* 主卡片 */}
        <View className='welcome-popup-card'>
          {/* 背景图片 */}
          <Image 
            className='popup-bg'
            src={pointModalBg}
            mode='aspectFill'
          />
          
          {/* Logo */}
          <Image 
            className='popup-logo'
            src={pointModalLogo}
            mode='aspectFit'
          />

          {/* 右上角积分提示卡片 */}
          <Image 
            className='popup-points-card'
            src={pointModalRightText}
            mode='aspectFit'
          />

          {/* 立即加入按钮 */}
          <View className='popup-join-btn' onClick={handleJoinClick}>
            <Text className='join-text'>立即加入</Text>
            <Text className='join-arrow'>→</Text>
          </View>
        </View>

        {/* 关闭按钮 */}
        <View className='popup-close-btn' onClick={handleClose}>
          <View className='close-icon'>
            <Text className='close-line close-line-1'></Text>
            <Text className='close-line close-line-2'></Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WelcomePopup;
