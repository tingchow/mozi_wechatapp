import { View, Text, Input, Button, Image, ScrollView, Canvas, PageContainer, Switch } from '@tarojs/components'
import Taro, { useLoad, getCurrentInstance, useRouter, useUnload, useShareAppMessage } from '@tarojs/taro';
import { useEffect, useState, useRef } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import { PageLogin } from '../../components/PageLogin';
import IconFont from '../../components/iconfont';
import { jump2List, jump2DataPage, jump2NoTab } from '../../utils/core';
import './index.less';
import { PopLogin } from '../../components/PopLogin';
// import '~taro-parse/dist/style/main.scss'
// import TaroParser from 'taro-parse'




export default function Addwarn() {

  const [ showPop, setShowPop ] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const symbol = useRouter().params.symbol;

  // 配置项状态管理
  const [configs, setConfigs] = useState({
    priceRise: { value: '', enabled: true, unit: '$', placeholder: '价格涨至' },
    priceFall: { value: '', enabled: true, unit: '$', placeholder: '价格跌至' },
    risePercent: { value: '10', enabled: true, unit: '%', placeholder: '日涨幅超' },
    fallPercent: { value: '10', enabled: false, unit: '%', placeholder: '日跌幅超' }
  });

  // 币价数据状态
  const [coinData, setCoinData] = useState({
    symbol: symbol || 'BTC',
    price: '--',
    change: '--',
    loading: true
  });

  // 获取币种价格信息
  const fetchCoinData = async () => {
    if (!symbol) return;
    
    try {
      const res = await request({
        url: Interface.coin_info,  // 使用详情页接口
        data: {
          symbol: symbol
        }
      });
      
      if (res?.data) {
        const coinInfo = res.data;
        setCoinData({
          symbol: symbol,
          price: coinInfo.currentPrice || '--',
          change: coinInfo.priceChangePercentage_24h || '--',
          loading: false
        });

        // 根据当前价格设置默认告警值
        const currentPrice = parseFloat(coinInfo.currentPrice);
        if (currentPrice && !isNaN(currentPrice)) {
          const risePrice = (currentPrice * 1.1).toFixed(currentPrice < 1 ? 6 : 2);
          const fallPrice = (currentPrice * 0.9).toFixed(currentPrice < 1 ? 6 : 2);
          
          setConfigs(prev => ({
            ...prev,
            priceRise: { ...prev.priceRise, value: risePrice },
            priceFall: { ...prev.priceFall, value: fallPrice }
          }));
        }
      } else {
        setCoinData(prev => ({
          ...prev,
          loading: false
        }));
      }
    } catch (error) {
      console.error('获取币种数据失败:', error);
      setCoinData(prev => ({
        ...prev,
        loading: false
      }));
    }
  };

  // 页面加载时获取币种数据
  useEffect(() => {
    fetchCoinData();
  }, [symbol]);

  // 输入值变化处理
  const handleInputChange = (key, value) => {
    setConfigs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: value
      }
    }));
  };

  // 开关状态变化处理
  const handleSwitchChange = (key, enabled) => {
    setConfigs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: enabled
      }
    }));
  };

  // 保存告警
  const saveWarnings = async() => {
    setBtnDisabled(true);
    
    // 验证所有启用的配置项
    const enabledConfigs = Object.entries(configs).filter(([key, config]) => config.enabled && config.value);
    
    if (enabledConfigs.length === 0) {
      Taro.showToast({
        title: '请至少启用一个告警条件',
        icon: 'error',
        duration: 2000,
        mask: true
      });
      setBtnDisabled(false);
      return;
    }

    // 验证输入值格式
    for (const [key, config] of enabledConfigs) {
      if (!/^[0-9]+(\.[0-9]+)?$/.test(config.value)) {
        Taro.showToast({
          title: `${config.placeholder}请输入有效数字`,
          icon: 'error',
          duration: 2000,
          mask: true
        });
        setBtnDisabled(false);
        return;
      }
    }

    // 构建API数据
    const apiData = enabledConfigs.reduce((acc, [key, config]) => {
      let fieldName = key;
      if (key === 'risePercent') fieldName = 'priceRiseChange24HPercent';
      if (key === 'fallPercent') fieldName = 'priceFallChange24HPercent';
      
      acc[fieldName] = config.unit === '%' ? `${config.value}%` : config.value;
      return acc;
    }, {});

    const addRes = await request({
      url: Interface.ADD_WARN,
      method: 'POST',
      data: {
        symbol,
        content: apiData
      }
    });

    setBtnDisabled(false);
    if (addRes.data === true) {
      Taro.showToast({
        title: '保存告警成功',
        icon: 'success',
        duration: 2000,
        mask: true
      });
      setShowPop(true);
      return;
    }
    if (addRes.data?.isLogin === false) {
      setShowLogin(true);
      return;
    } else {
      Taro.showToast({
        title: addRes.errorMsg,
        icon: 'error',
        duration: 2000,
        mask: true
      });
      return;
    }
  };

  // 返回上一页
  const goBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className='container'>
      {/* 顶部标题栏 */}
      {/* <View className='header'>
        <View className='header-left' onClick={goBack}>
          <IconFont name='left-arrow' size={40} />
        </View>
        <View className='header-title'></View>
        <View className='header-right'>
          <IconFont name='more' size={40} />
          <IconFont name='refresh' size={40} />
        </View>
      </View> */}

      {coinData.loading ? (
        /* 页面中心Loading */
        <View className='page-loading'>
          <View className='loading-spinner'></View>
          <Text className='loading-text'>加载中...</Text>
        </View>
      ) : (
        <>
          {/* 币种价格信息 */}
          <View className='price-info'>
            <View className='coin-symbol'>{coinData.symbol}</View>
            <View className='price-details'>
              <Text className='price-label'>最新价</Text>
              <Text className={`price-value ${coinData.change && coinData.change.toString().includes('-') ? 'negative' : 'positive'}`}>
                {coinData.price}
              </Text>
              <Text className={`price-change ${coinData.change && coinData.change.toString().includes('-') ? 'negative' : 'positive'}`}>
                {coinData.change}
              </Text>
            </View>
          </View>

          {/* 配置项卡片 */}
      <View className='config-card'>
        {Object.entries(configs).map(([key, config]) => (
          <View key={key} className='config-item'>
            <View className='config-label'>{config.placeholder}</View>
            <View className='config-input-container'>
              <Input
                className='config-input'
                type='number'
                value={config.value}
                onInput={(e) => handleInputChange(key, e.detail.value)}
                placeholder={config.value}
              />
              <Text className='config-unit'>{config.unit}</Text>
            </View>
            <Switch
              className='config-switch'
              checked={config.enabled}
              onChange={(e) => handleSwitchChange(key, e.detail.value)}
              color='#11B787'
            />
          </View>
        ))}
      </View>

      {/* 底部按钮区域 */}
      <View className='bottom-buttons'>
        <Button 
          className='save-button' 
          disabled={btnDisabled} 
          onClick={saveWarnings}
        >
          保存告警
        </Button>
        <Button 
          className='view-button' 
          onClick={() => {jump2NoTab('mywarn')}}
        >
          查看已配置告警
        </Button>
      </View>

      {/* 弹窗 */}
      <PageContainer
        show={showPop}
        onAfterLeave={() => {
          setShowPop(false)
        }}
        closeOnSlideDown={true}
        round={true}
        forceRender={true}
        position='bottom'
      >
        <View className='popContainer'>
          <Text className='contactTitle'>请关注公众号接受告警信息</Text>
          <Image
            className='attendPic'
            mode='aspectFit'
            lazyLoad={true}
            showMenuByLongpress={true}
            src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/wechat_account.jpg'
          />
        </View>
      </PageContainer>
        </>
      )}
      
      { showLogin && <PopLogin hideCb={() => {setShowLogin(false)}} /> }
    </View>
  )
}




