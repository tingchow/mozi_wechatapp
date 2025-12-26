import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import IconFont from '../iconfont';
import './index.less';

/**
 * 绑定邮箱弹窗组件
 * @param {boolean} visible - 是否显示弹窗
 * @param {function} onClose - 关闭弹窗回调
 * @param {function} onSuccess - 绑定成功回调
 */
export const BindEmailModal = ({ visible, onClose, onSuccess }) => {
  const [emailInput, setEmailInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
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

  // 关闭弹窗时清空输入
  useEffect(() => {
    if (!visible) {
      setEmailInput('');
      setVerificationCode('');
      setCountdown(0);
    }
  }, [visible]);

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
    try {
      const res = await request({
        url: Interface.SEND_EMAIL_CODE,
        method: 'POST',
        data: {
          email: emailInput
        }
      });

      if (res?.code === 0) {
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

    try {
      const res = await request({
        url: Interface.BIND_EMAIL,
        method: 'POST',
        data: {
          email: emailInput,
          code: verificationCode
        }
      });

      if (res?.code === 0) {
        Taro.showToast({
          title: '绑定成功',
          icon: 'success',
          duration: 2000
        });

        // 调用成功回调
        onSuccess && onSuccess(emailInput);

        // 关闭弹窗
        onClose && onClose();
      } else {
        Taro.showToast({
          title: res?.message || '绑定失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('绑定邮箱失败:', error);
      Taro.showToast({
        title: '绑定失败',
        icon: 'none',
        duration: 2000
      });
    }
  };

  if (!visible) return null;

  return (
    <View className='bind-email-mask' onClick={onClose}>
      <View className='bind-email-popup' onClick={(e) => e.stopPropagation()}>
        <View className='bind-email-header'>
          <Text className='bind-email-title'>绑定邮箱</Text>
        </View>

        <View className='bind-email-content'>
          <View className='bind-email-tip'>
            绑定邮箱后，可以在Telegram端使用相同账号登录
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
          <Button className='bind-email-cancel-btn' onClick={onClose}>
            取消
          </Button>
          <Button className='bind-email-confirm-btn' onClick={confirmBindEmail}>
            确认绑定
          </Button>
        </View>
      </View>
    </View>
  );
};

export default BindEmailModal;
