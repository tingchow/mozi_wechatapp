import { View, Text, Input, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import IconFont from '../iconfont';
import './index.less';

const BindEmailModal = ({ visible, onClose, onSuccess }) => {
  const [emailInput, setEmailInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isBinding, setIsBinding] = useState(false); // 添加绑定中的状态
  const [countdown, setCountdown] = useState(0);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送验证码
  const sendVerificationCode = async () => {
    if (!emailInput || !emailInput.trim()) {
      Taro.showToast({
        title: '请输入邮箱地址',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      Taro.showToast({
        title: '邮箱格式不正确',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    setIsSendingCode(true);
    Taro.showLoading({
      title: '发送中...',
      mask: true
    });
    
    try {
      // 获取当前语言设置，默认为中文
      const language = 'zh'; // 小程序默认使用中文

      console.log('准备发送验证码，邮箱:', emailInput, '语言:', language);

      const res = await request({
        url: Interface.SEND_EMAIL_CODE,
        method: 'POST',
        data: {
          email: emailInput,
          language: language
        }
      });

      console.log('发送验证码响应:', res);

      Taro.hideLoading();

      if (res?.code === 200 || res?.success) {
        Taro.showToast({
          title: '验证码已发送',
          icon: 'success',
          duration: 2000
        });

        // 开始倒计时
        setCountdown(60);
      } else {
        Taro.showToast({
          title: res?.message || '发送失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      Taro.hideLoading();
      Taro.showToast({
        title: '发送失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  // 确认绑定邮箱
  const confirmBindEmail = async () => {
    if (!emailInput || !emailInput.trim()) {
      Taro.showToast({
        title: '请输入邮箱地址',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (!verificationCode || !verificationCode.trim()) {
      Taro.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    setIsBinding(true);
    Taro.showLoading({
      title: '绑定中...',
      mask: true
    });

    try {
      const res = await request({
        url: Interface.BIND_EMAIL,
        method: 'POST',
        data: {
          email: emailInput,
          code: verificationCode
        }
      });

      Taro.hideLoading();

      if (res?.code === 0 || res?.code === 200 || res?.success) {
        Taro.showToast({
          title: '绑定成功',
          icon: 'success',
          duration: 2000
        });

        // 调用成功回调
        if (onSuccess) {
          onSuccess(emailInput);
        }

        // 关闭弹窗并清空输入
        handleClose();
      } else {
        Taro.showToast({
          title: res?.message || '绑定失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('绑定邮箱失败:', error);
      Taro.hideLoading();
      Taro.showToast({
        title: '绑定失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      setIsBinding(false);
    }
  };

  // 关闭弹窗并清空状态
  const handleClose = () => {
    setEmailInput('');
    setVerificationCode('');
    setCountdown(0);
    if (onClose) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <View className='bind-email-mask' onClick={handleClose}>
      <View className='bind-email-popup' onClick={(e) => e.stopPropagation()}>
        <View className='bind-email-header'>
          <Text className='bind-email-title'>绑定邮箱</Text>
          <View className='bind-email-close' onClick={handleClose}>
            <IconFont name='close' size={40} color='#999' />
          </View>
        </View>

        <View className='bind-email-content'>
          <View className='bind-email-tip'>
            绑定邮箱后，可以在Telegram端使用相同账号登录
          </View>
          
          {/* 添加链接区域 */}
          <View className='bind-email-links'>
            <View 
              className='bind-email-link'
              onClick={() => {
                Taro.setClipboardData({
                  data: 'https://t.me/Moziinovations_bot',
                  success: () => {
                    Taro.showToast({
                      title: 'Tg链接已复制',
                      icon: 'success',
                      duration: 2000
                    });
                  }
                });
              }}
            >
              <Image 
                className='link-icon-img' 
                src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/bind_email_telegram.png'
                mode='aspectFit'
              />
              <Text className='link-text'>Telegram Bot</Text>
            </View>
            
            <View 
              className='bind-email-link'
              onClick={() => {
                Taro.setClipboardData({
                  data: 'https://moziinnovations-production.up.railway.app/',
                  success: () => {
                    Taro.showToast({
                      title: '官网链接已复制',
                      icon: 'success',
                      duration: 2000
                    });
                  }
                });
              }}
            >
              <Image 
                className='link-icon-img' 
                src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/bind_email_internet.png'
                mode='aspectFit'
              />
              <Text className='link-text'>官方网站</Text>
            </View>
          </View>

          <View className='bind-email-input-group'>
            <Text className='bind-email-label'>邮箱地址</Text>
            <Input
              className='bind-email-input'
              type='text'
              placeholder='请输入邮箱地址'
              value={emailInput}
              onInput={(e) => setEmailInput(e.detail.value)}
            />
          </View>

          <View className='bind-email-input-group'>
            <Text className='bind-email-label'>验证码</Text>
            <View className='bind-email-code-row'>
              <Input
                className='bind-email-input bind-email-code-input'
                type='text'
                placeholder='请输入验证码'
                value={verificationCode}
                onInput={(e) => setVerificationCode(e.detail.value)}
              />
              <Button
                className='bind-email-send-btn'
                disabled={isSendingCode || countdown > 0}
                onClick={sendVerificationCode}
              >
                {countdown > 0 ? `${countdown}s` : '发送验证码'}
              </Button>
            </View>
          </View>
        </View>

        <View className='bind-email-footer'>
          <Button className='bind-email-cancel-btn' onClick={handleClose}>
            取消
          </Button>
          <Button 
            className='bind-email-confirm-btn' 
            onClick={confirmBindEmail}
            disabled={isBinding}
          >
            {isBinding ? '绑定中...' : '确认绑定'}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default BindEmailModal;
