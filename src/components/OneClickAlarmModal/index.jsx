import { useEffect, useMemo, useState } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import BottomSheetModal from '../BottomSheetModal';
import CountryPickerOverlay from '../CountryPickerOverlay';
import { PopLogin } from '../PopLogin';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import { jump2NoTab } from '../../utils/core';
import { createAlertConfig, modifyAlertConfig } from '../../api/user';
import { getSavedOpenId } from '../../utils/userHelper';
import {
  alertFrequencyFromApi,
  alertFlagToApi,
  isAlertFlagOn,
  MAX_WEBHOOK_URLS,
  parseWebhookUrlsFromConfig,
  validateWechatFields,
  validateWebhookUrls,
} from '../../utils/alertConfig';
import './index.less';

const ALERT_TEXT_ZH = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/mozi_public/images/new_detail/alert_text_zh.svg';
const ALERT_DECO_ICON = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/mozi_public/images/new_detail/alert.svg';
const ICON_CDN = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/mozi_public/icons';
const ICON_PHONE = `${ICON_CDN}/new_detail/telephone.svg`;
const ICON_SMS = `${ICON_CDN}/sms_alert.svg`;
const ICON_EMAIL = `${ICON_CDN}/new_detail/email.svg`;
const ICON_HOOK = `${ICON_CDN}/hook_alert.svg`;
const ICON_WECHAT = `${ICON_CDN}/wechat_alert.svg`;
const ICON_PHONE_INPUT = `${ICON_CDN}/new_detail/telephone_num.svg`;
const ICON_EMAIL_INPUT = `${ICON_CDN}/new_detail/email_num.svg`;
const ICON_DOWN_ARROW = `${ICON_CDN}/new_detail/down_arrow.svg`;

const LINK_INPUT_ICON_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M10 13a5 5 0 007.07 0l1.42-1.42a5 5 0 00-7.07-7.07L10 6M14 11a5 5 0 00-7.07 0L5.51 12.42a5 5 0 007.07 7.07L14 18' stroke='%236b7280' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundSize: '36px 36px',
};

const CONFIG_KEYS = ['priceRise', 'priceFall', 'risePercent', 'fallPercent'];

const LABELS = {
  priceRise: '价格涨至',
  priceFall: '价格跌至',
  risePercent: '日涨幅超',
  fallPercent: '日跌幅超',
  bigOrderDetect: '大单侦测',
};

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <View
      className={`one-click-toggle ${checked ? 'one-click-toggle-on' : 'one-click-toggle-off'} ${disabled ? 'one-click-toggle-disabled' : ''}`}
      onClick={() => {
        if (disabled) return;
        onChange?.(!checked);
      }}
    >
      <View className='one-click-toggle-thumb' />
    </View>
  );
}

function NotifyRow({ icon, label, sub, checked, onChange, disabled }) {
  return (
    <View className='one-click-notify-row'>
      <View className='one-click-notify-row-inner'>
        <View className='one-click-notify-row-left'>
          <View className='one-click-notify-icon-wrap'>
            <Image className='one-click-notify-icon' src={icon} mode='aspectFit' />
          </View>
          {sub ? (
            <View className='one-click-notify-text-col'>
              <Text className='one-click-row-label'>{label}</Text>
              <Text className='one-click-row-sub'>{sub}</Text>
            </View>
          ) : (
            <Text className='one-click-row-label'>{label}</Text>
          )}
        </View>
        <Toggle checked={checked} onChange={onChange} disabled={disabled} />
      </View>
    </View>
  );
}

function isNegativeChange(change) {
  return change && String(change).includes('-');
}

export default function OneClickAlarmModal({
  open = false,
  onClose,
  onConfirm,
  onSkip,
  mode = 'oneClick',
  symbol = 'BTC',
  title,
  subtitle,
  confirmText,
  skipText,
  initialValue,
}) {
  const init = useMemo(
    () => ({
      phoneEnabled: true,
      countryCode: '+86',
      phone: '',
      emailEnabled: false,
      email: '',
      smsEnabled: false,
      ...(initialValue || {}),
    }),
    [initialValue]
  );

  const [phoneEnabled, setPhoneEnabled] = useState(init.phoneEnabled);
  const [countryCode, setCountryCode] = useState(init.countryCode);
  const [phone, setPhone] = useState(init.phone);
  const [emailEnabled, setEmailEnabled] = useState(init.emailEnabled);
  const [email, setEmail] = useState(init.email);
  const [smsEnabled, setSmsEnabled] = useState(init.smsEnabled);
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookUrls, setWebhookUrls] = useState(['']);
  const [wechatEnabled, setWechatEnabled] = useState(false);
  const [openId, setOpenId] = useState('');
  const [alertFrequency, setAlertFrequency] = useState('daily');
  const [webhookError, setWebhookError] = useState('');
  const [openIdError, setOpenIdError] = useState('');
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [, setHideInputs] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [smsError, setSmsError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [configs, setConfigs] = useState({
    priceRise: { value: '', enabled: true, unit: '$', label: LABELS.priceRise },
    priceFall: { value: '', enabled: true, unit: '$', label: LABELS.priceFall },
    risePercent: { value: '10', enabled: true, unit: '%', label: LABELS.risePercent },
    fallPercent: { value: '10', enabled: false, unit: '%', label: LABELS.fallPercent },
    bigOrderDetect: { value: '', enabled: false, unit: '', label: LABELS.bigOrderDetect, type: 'switchOnly' },
    exchangeSpreadMonitor: { value: '', enabled: false, unit: '%', label: '交易所差价监控' },
  });
  const [coinData, setCoinData] = useState({ symbol, price: '--', change: '--', loading: true });

  useEffect(() => {
    if (!open || mode !== 'oneClick') return;

    const checkAlertConfig = () => {
      try {
        const userId = Taro.getStorageSync('userId');
        if (!userId) {
          setHideInputs(false);
          return;
        }

        const alertConfigStr = Taro.getStorageSync('alertConfig');
        if (alertConfigStr) {
          const alertConfig = JSON.parse(alertConfigStr);
          setHideInputs(true);

          if (alertConfig.alertPhoneCountryCode) {
            setCountryCode(String(alertConfig.alertPhoneCountryCode));
          }
          if (alertConfig.alertPhone) {
            const phoneStr = String(alertConfig.alertPhone);
            if (!alertConfig.alertPhoneCountryCode) {
              const match = phoneStr.match(/^(\+\d+)(.+)$/);
              if (match) {
                setCountryCode(match[1]);
                setPhone(match[2]);
              } else {
                setPhone(phoneStr);
              }
            } else {
              setPhone(phoneStr);
            }
          }
          if (alertConfig.alertEmail) setEmail(alertConfig.alertEmail);
          if (alertConfig.phoneEnabled !== undefined) setPhoneEnabled(isAlertFlagOn(alertConfig.phoneEnabled));
          if (alertConfig.emailEnabled !== undefined) setEmailEnabled(isAlertFlagOn(alertConfig.emailEnabled));
          if (alertConfig.smsEnabled !== undefined) setSmsEnabled(isAlertFlagOn(alertConfig.smsEnabled));
          if (alertConfig.webhookEnabled !== undefined) {
            setWebhookEnabled(isAlertFlagOn(alertConfig.webhookEnabled));
          }
          if (alertConfig.wechatEnabled !== undefined) {
            setWechatEnabled(isAlertFlagOn(alertConfig.wechatEnabled));
          }
          const configOpenId = alertConfig.openId != null ? String(alertConfig.openId).trim() : '';
          setOpenId(configOpenId || getSavedOpenId() || '');
          setWebhookUrls(parseWebhookUrlsFromConfig(alertConfig));
          setAlertFrequency(alertFrequencyFromApi(alertConfig.alertFrequency));
        } else {
          setHideInputs(false);
          try {
            const legacyRaw = Taro.getStorageSync('oneClickAlarmUi');
            if (legacyRaw) {
              const legacy = JSON.parse(legacyRaw);
              if (typeof legacy.webhookEnabled === 'boolean') setWebhookEnabled(legacy.webhookEnabled);
              const legacyUrls = parseWebhookUrlsFromConfig(legacy);
              if (legacyUrls.length > 1 || legacyUrls[0]) setWebhookUrls(legacyUrls);
              if (typeof legacy.wechatEnabled === 'boolean') setWechatEnabled(legacy.wechatEnabled);
              const legacyOpenId = legacy.openId ? String(legacy.openId).trim() : '';
              setOpenId(legacyOpenId || getSavedOpenId() || '');
              if (legacy.alertFrequency) {
                setAlertFrequency(alertFrequencyFromApi(legacy.alertFrequency));
              }
            } else {
              setOpenId(getSavedOpenId() || '');
            }
          } catch {
            setOpenId(getSavedOpenId() || '');
          }
        }
      } catch (error) {
        console.error('读取告警配置失败:', error);
        setHideInputs(false);
      }
    };

    checkAlertConfig();
  }, [open, mode]);

  useEffect(() => {
    if (!open || mode !== 'config') return;

    setBtnDisabled(false);
    setShowLogin(false);
    setCoinData({ symbol, price: '--', change: '--', loading: true });

    request({ url: Interface.coin_info, data: { symbol } }).then((res) => {
      if (res?.data) {
        const info = res.data;
        setCoinData({
          symbol,
          price: info.currentPrice || '--',
          change: info.priceChangePercentage_24h || '--',
          loading: false,
        });
        const currentPrice = parseFloat(info.currentPrice);
        if (currentPrice && !isNaN(currentPrice)) {
          const risePrice = (currentPrice * 1.1).toFixed(currentPrice < 1 ? 6 : 2);
          const fallPrice = (currentPrice * 0.9).toFixed(currentPrice < 1 ? 6 : 2);
          setConfigs((prev) => ({
            ...prev,
            priceRise: { ...prev.priceRise, value: risePrice },
            priceFall: { ...prev.priceFall, value: fallPrice },
          }));
        }
      } else {
        setCoinData((prev) => ({ ...prev, loading: false }));
      }
    }).catch(() => {
      setCoinData((prev) => ({ ...prev, loading: false }));
    });
  }, [open, mode, symbol]);

  const handleInputChange = (key, value) => {
    setConfigs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
        enabled: value === '' ? prev[key].enabled : true,
      },
    }));
  };

  const handleSwitchChange = (key, enabled) => {
    setConfigs((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled },
    }));
  };

  const updateWebhookUrl = (index, value) => {
    setWebhookUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
    if (webhookError) setWebhookError('');
  };

  const addWebhookUrlRow = () => {
    setWebhookUrls((prev) => (prev.length >= MAX_WEBHOOK_URLS ? prev : [...prev, '']));
  };

  const removeWebhookUrlRow = (index) => {
    if (index <= 0) return;
    setWebhookUrls((prev) => prev.filter((_, i) => i !== index));
    if (webhookError) setWebhookError('');
  };

  const getTrimmedWebhookUrls = () =>
    webhookUrls.map((u) => String(u || '').trim()).filter(Boolean);

  const webhookErrorMessage = (code) => {
    if (code === 'empty') return '请输入URL';
    if (code === 'max') return `Webhook URL 最多 ${MAX_WEBHOOK_URLS} 个`;
    return '请输入有效的 URL';
  };

  const canCompleteDailyTask = () => {
    const lastCompleteTime = Taro.getStorageSync('dailyAlarmTaskCompleteTime');
    if (!lastCompleteTime) return true;

    const lastTime = new Date(parseInt(lastCompleteTime, 10));
    const now = new Date();
    const today9am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
    const resetTime = now.getHours() < 9
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 9, 0, 0)
      : today9am;

    return lastTime < resetTime;
  };

  const completeDailyAlarmTask = async () => {
    if (!canCompleteDailyTask()) return;

    try {
      const res = await request({
        url: Interface.TASK_COMPLETE,
        method: 'POST',
        data: { taskCode: 'ALARM' },
      });

      if (res?.code === 0 && res?.data?.success) {
        Taro.setStorageSync('dailyAlarmTaskCompleteTime', Date.now().toString());
        if (res?.data?.message) {
          Taro.showToast({ title: res.data.message, icon: 'success' });
        }
      }
    } catch (error) {
      console.error('[OneClickAlarmModal] 完成告警任务接口异常:', error);
    }
  };

  const handleEnableAlarm = async () => {
    if (isLoading) return;

    try {
      setPhoneError('');
      setEmailError('');
      setSmsError('');
      setWebhookError('');
      setOpenIdError('');

      const userId = Taro.getStorageSync('userId');
      if (!userId) {
        Taro.showToast({ title: '请先登录', icon: 'none' });
        setShowLogin(true);
        return;
      }

      if (emailEnabled && (!email || email.trim() === '')) {
        setEmailError('请输入邮箱');
        return;
      }
      if (emailEnabled && email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          setEmailError('邮箱格式不正确');
          return;
        }
      }

      if (phoneEnabled && (!phone || phone.trim() === '')) {
        setPhoneError('请输入手机号');
        return;
      }
      if (smsEnabled && (!phone || phone.trim() === '' || !countryCode || !String(countryCode).trim())) {
        setSmsError('开启短信告警时请先填写国家区号与手机号（与电话告警共用）');
        return;
      }

      const webhookCheck = validateWebhookUrls(getTrimmedWebhookUrls(), webhookEnabled);
      if (!webhookCheck.ok) {
        setWebhookError(webhookErrorMessage(webhookCheck.error));
        return;
      }

      const wechatCheck = validateWechatFields({ wechatEnabled, openId });
      if (!wechatCheck.ok) {
        setOpenIdError(wechatCheck.message);
        return;
      }

      setIsLoading(true);

      const existingConfigStr = Taro.getStorageSync('alertConfig');
      const hasExistingConfig = existingConfigStr && existingConfigStr !== 'null';
      let defaultEnabled = 0;
      if (hasExistingConfig) {
        try {
          const existing = JSON.parse(existingConfigStr);
          if (existing?.defaultEnabled !== undefined) {
            defaultEnabled = alertFlagToApi(existing.defaultEnabled);
          }
        } catch {
          /* ignore */
        }
      }

      const alertConfig = {
        phoneEnabled: alertFlagToApi(phoneEnabled),
        emailEnabled: alertFlagToApi(emailEnabled),
        smsEnabled: alertFlagToApi(smsEnabled),
        defaultEnabled,
        webhookEnabled: alertFlagToApi(webhookEnabled),
        webhookUrls: webhookCheck.urls,
        alertFrequency,
        wechatEnabled: alertFlagToApi(wechatEnabled),
        openId: wechatCheck.openId,
      };

      if ((phoneEnabled || smsEnabled) && phone && String(phone).trim()) {
        alertConfig.alertPhone = String(phone).trim();
        alertConfig.alertPhoneCountryCode = countryCode || '+86';
      }
      if (emailEnabled && email) {
        alertConfig.alertEmail = email;
      }

      const result = hasExistingConfig
        ? await modifyAlertConfig(alertConfig)
        : await createAlertConfig(alertConfig);

      if (result.success) {
        Taro.setStorageSync('alertConfig', JSON.stringify(result.data));
        setHideInputs(true);

        onConfirm?.({
          phoneEnabled,
          countryCode,
          phone,
          emailEnabled,
          email,
          smsEnabled,
          wechatEnabled,
          openId: wechatCheck.openId,
        });

        const shouldNavigateWechatQrcode = wechatEnabled;

        setTimeout(() => {
          onClose?.();
          setIsLoading(false);
          if (shouldNavigateWechatQrcode) {
            jump2NoTab('wechatqrcode');
          }
        }, 500);
      } else {
        Taro.showToast({ title: result.error || '开启失败', icon: 'none' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('开启告警失败:', error);
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' });
      setIsLoading(false);
    }
  };

  const saveWarnings = async () => {
    setBtnDisabled(true);

    const userId = Taro.getStorageSync('userId');
    if (!userId) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      setBtnDisabled(false);
      setShowLogin(true);
      return;
    }

    const enabledConfigs = Object.entries(configs).filter(([, config]) => {
      if (!config.enabled) return false;
      return config.type === 'switchOnly' ? true : Boolean(config.value);
    });

    if (enabledConfigs.length === 0) {
      Taro.showToast({ title: '请至少启用一个告警条件', icon: 'none' });
      setBtnDisabled(false);
      return;
    }

    for (const [, config] of enabledConfigs) {
      if (config.type === 'switchOnly') continue;
      if (!/^[0-9]+(\.[0-9]+)?$/.test(String(config.value))) {
        Taro.showToast({ title: `${config.label}请输入有效数字`, icon: 'none' });
        setBtnDisabled(false);
        return;
      }
    }

    const content = enabledConfigs.reduce((acc, [key, config]) => {
      let fieldName = key;
      if (key === 'risePercent') fieldName = 'priceRiseChange24HPercent';
      if (key === 'fallPercent') fieldName = 'priceFallChange24HPercent';
      if (key === 'bigOrderDetect') fieldName = 'bigDeal';
      if (key === 'exchangeSpreadMonitor') fieldName = 'exchangeSpread';

      if (config.type === 'switchOnly') {
        acc[fieldName] = '';
        return acc;
      }

      acc[fieldName] = config.unit === '%' ? `${config.value}%` : config.value;
      return acc;
    }, {});

    try {
      const addRes = await request({
        url: Interface.ADD_ALARM || '/alarm/add',
        method: 'POST',
        data: { symbol, channel: 'miniapp', content },
      });

      setBtnDisabled(false);

      if (addRes?.code === 0 && addRes.data === true) {
        Taro.showToast({ title: '保存告警成功', icon: 'success' });
        await completeDailyAlarmTask();
        onClose?.();
        return;
      }

      Taro.showToast({ title: addRes?.errorMsg || '保存失败', icon: 'none' });
    } catch (error) {
      setBtnDisabled(false);
      console.error('[OneClickAlarmModal] 保存告警接口异常', error);
      Taro.showToast({ title: '网络错误，请稍后再试', icon: 'none' });
    }
  };

  const changeClass = isNegativeChange(coinData.change) ? 'negative' : 'positive';

  const configBody = coinData.loading ? (
    <View className='config-mode-wrap'>
      <View className='config-loading'>
        <View className='loading-spinner' />
        <Text className='loading-text'>加载中...</Text>
      </View>
    </View>
  ) : (
    <View className='config-mode-wrap'>
      <ScrollView scrollY enhanced showScrollbar={false} className='config-scroll'>
        <View className='price-info config-price-info'>
          <Text className='coin-symbol'>{coinData.symbol}</Text>
          <View className='price-details'>
            <Text className='price-label'>最新价</Text>
            <Text className={`price-value ${changeClass}`}>{coinData.price}</Text>
            <Text className={`price-change ${changeClass}`}>{coinData.change}</Text>
          </View>
        </View>

        <View className='config-card'>
          {CONFIG_KEYS.map((key) => {
            const config = configs[key];
            return (
              <View key={key} className='config-item'>
                <Text className='config-label'>{config.label}</Text>
                <View className='config-item-main'>
                  <View className='config-input-wrap'>
                    <Input
                      className='config-input'
                      type='digit'
                      value={config.value}
                      placeholder={config.value || '请输入数值'}
                      onInput={(e) => handleInputChange(key, e.detail.value)}
                    />
                    <Text className='config-unit'>{config.unit}</Text>
                  </View>
                  <Toggle
                    checked={config.enabled}
                    onChange={(enabled) => handleSwitchChange(key, enabled)}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View className='bottom-buttons config-bottom-buttons'>
        <View
          className={`save-button ${btnDisabled ? 'save-button-disabled' : ''}`}
          onClick={btnDisabled ? undefined : saveWarnings}
        >
          {btnDisabled ? '保存中...' : '保存告警'}
        </View>
        <View
          className='view-button'
          onClick={() => {
            onClose?.();
            jump2NoTab('mywarn');
          }}
        >
          查看已配置告警
        </View>
      </View>

      {showLogin ? <PopLogin show hideCb={() => setShowLogin(false)} /> : null}
    </View>
  );

  const oneClickBody = (
    <View className='one-click-content'>
      <View className='one-click-card'>
        <ScrollView scrollY enhanced showScrollbar={false} className='one-click-card-scroll'>
          <View className='one-click-card-scroll-inner'>
            <View className='one-click-notify-section'>
              <View className='one-click-input-row'>
                <Image className='one-click-input-icon' src={ICON_PHONE_INPUT} mode='aspectFit' />
                <View className='one-click-country-code-wrap'>
                  <View
                    className='one-click-country-picker-trigger'
                    onClick={() => setCountryPickerOpen(true)}
                  >
                    <Text className='one-click-country-picker-value'>{countryCode}</Text>
                    <Image className='one-click-country-picker-arrow' src={ICON_DOWN_ARROW} mode='aspectFit' />
                  </View>
                </View>
                <Input
                  className='one-click-phone-input'
                  type='number'
                  placeholder='请输入手机号'
                  value={phone}
                  onInput={(e) => {
                    setPhone(e.detail.value);
                    if (phoneError) setPhoneError('');
                    if (smsError) setSmsError('');
                  }}
                />
              </View>
              {(phoneError || smsError) ? (
                <Text className='one-click-error'>{phoneError || smsError}</Text>
              ) : null}

              <NotifyRow icon={ICON_PHONE} label='电话告警' checked={phoneEnabled} onChange={setPhoneEnabled} />
              <NotifyRow
                icon={ICON_SMS}
                label='短信告警'
                checked={smsEnabled}
                onChange={(v) => {
                  setSmsEnabled(v);
                  if (smsError) setSmsError('');
                }}
              />
            </View>

            <View className='one-click-below-inset'>
              <NotifyRow icon={ICON_EMAIL} label='邮件告警' checked={emailEnabled} onChange={setEmailEnabled} />
              <View className='one-click-input-row'>
                <Image className='one-click-input-icon one-click-input-icon-email' src={ICON_EMAIL_INPUT} mode='aspectFit' />
                <Input
                  className='one-click-email-input-inline'
                  placeholder='请输入邮箱'
                  value={email}
                  onInput={(e) => {
                    setEmail(e.detail.value);
                    if (emailError) setEmailError('');
                  }}
                />
              </View>
              {emailError ? <Text className='one-click-error'>{emailError}</Text> : null}

              <NotifyRow
                icon={ICON_HOOK}
                label='Web hook'
                checked={webhookEnabled}
                onChange={(v) => {
                  setWebhookEnabled(v);
                  if (webhookError) setWebhookError('');
                }}
              />
              <View className='one-click-webhook-url-list'>
                {webhookUrls.map((url, index) => (
                  <View key={`webhook-${index}`} className='one-click-webhook-input-group'>
                    <View className='one-click-input-row one-click-webhook-input-row'>
                      <View
                        className='one-click-input-icon one-click-input-icon-link'
                        style={LINK_INPUT_ICON_STYLE}
                      />
                      <Input
                        className='one-click-webhook-input'
                        placeholder='请输入URL'
                        value={url}
                        onInput={(e) => updateWebhookUrl(index, e.detail.value)}
                      />
                    </View>
                    <View className='one-click-webhook-row-actions'>
                      {index > 0 ? (
                        <View
                          className='one-click-webhook-remove-btn'
                          onClick={() => removeWebhookUrlRow(index)}
                        >
                          <Text className='one-click-webhook-btn-icon'>×</Text>
                        </View>
                      ) : null}
                      {index === webhookUrls.length - 1 ? (
                        <View
                          className={`one-click-webhook-add-btn ${webhookUrls.length >= MAX_WEBHOOK_URLS ? 'one-click-webhook-add-btn-disabled' : ''}`}
                          onClick={webhookUrls.length >= MAX_WEBHOOK_URLS ? undefined : addWebhookUrlRow}
                        >
                          <Text className='one-click-webhook-btn-icon'>+</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
              <Text className='one-click-field-hint'>警报触发时，向您指定的URL发送POST请求</Text>
              {webhookError ? <Text className='one-click-error'>{webhookError}</Text> : null}

              <NotifyRow
                icon={ICON_WECHAT}
                label='微信告警'
                sub='请开启微信通知，以便接收告警'
                checked={wechatEnabled}
                onChange={(v) => {
                  setWechatEnabled(v);
                  if (openIdError) setOpenIdError('');
                  if (v && !String(openId || '').trim()) {
                    setOpenId(getSavedOpenId() || '');
                  }
                }}
              />
              {wechatEnabled ? (
                <>
                  <View className='one-click-input-row'>
                    <Input
                      className='one-click-email-input-inline'
                      placeholder='请输入微信 openId'
                      value={openId}
                      onInput={(e) => {
                        setOpenId(e.detail.value);
                        if (openIdError) setOpenIdError('');
                      }}
                    />
                  </View>
                  {openIdError ? <Text className='one-click-error'>{openIdError}</Text> : null}
                </>
              ) : null}

              <View className='one-click-freq-section'>
                <Text className='one-click-freq-title'>预警频次</Text>
                {[
                  { id: 'continuous', title: '持续预警', desc: '每次触发都预警' },
                  { id: 'daily', title: '每日一次', desc: '每个交易日仅第一次触发时预警' },
                  { id: 'once', title: '仅提醒一次', desc: '仅第一个信息时提醒' },
                ].map((opt) => (
                  <View
                    key={opt.id}
                    className={`one-click-freq-option ${alertFrequency === opt.id ? 'one-click-freq-option-selected' : ''}`}
                    onClick={() => setAlertFrequency(opt.id)}
                  >
                    <Text className='one-click-freq-option-title'>{opt.title}</Text>
                    <Text className='one-click-freq-option-desc'>{opt.desc}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View className='one-click-footer-actions'>
          <View
            className={`one-click-primary-btn ${isLoading ? 'one-click-primary-btn-loading' : ''}`}
            onClick={isLoading ? undefined : handleEnableAlarm}
          >
            {isLoading ? (
              <View className='one-click-loading-spinner' />
            ) : (
              confirmText || '确认'
            )}
          </View>
          <View
            className='one-click-secondary-btn'
            onClick={() => {
              if (isLoading) return;
              onSkip?.();
              onClose?.();
            }}
          >
            {skipText || '取消'}
          </View>
        </View>
      </View>
    </View>
  );

  const sheetClass = mode === 'config' ? 'one-click-sheet-config' : 'one-click-sheet-oneclick';

  const topOverlay = (mode === 'config' || mode === 'oneClick') ? (
    <Image className='one-click-alert-deco' src={ALERT_DECO_ICON} mode='aspectFit' />
  ) : null;

  return (
    <>
      <BottomSheetModal
        open={open}
        onClose={onClose}
        mode={mode}
        topOverlay={topOverlay}
        sheetClassName={`one-click-sheet ${sheetClass}`}
        sheetInnerClassName='one-click-sheet-inner-mask'
        bodyClassName={mode === 'config' ? 'config-body' : 'one-click-body-no-padding'}
        height={mode === 'config' ? '85vh' : undefined}
        maxHeight={mode === 'config' ? '92vh' : '90vh'}
      >
        {mode === 'config' ? (
          <Image className='alert-text-image' src={ALERT_TEXT_ZH} mode='aspectFit' />
        ) : null}
        {mode === 'oneClick' ? (
          <View className='one-click-title-block'>
            <Text className='one-click-title'>{title || '一键告警'}</Text>
            <Text className='one-click-subtitle'>{subtitle || '实时监控 即时提醒'}</Text>
          </View>
        ) : null}
        {mode === 'config' ? configBody : oneClickBody}
      </BottomSheetModal>

      {mode === 'oneClick' ? (
        <CountryPickerOverlay
          open={countryPickerOpen}
          onClose={() => setCountryPickerOpen(false)}
          onSelect={(c) => setCountryCode(c.dialCode)}
        />
      ) : null}

      {mode === 'oneClick' && showLogin ? (
        <PopLogin show hideCb={() => setShowLogin(false)} />
      ) : null}
    </>
  );
}
