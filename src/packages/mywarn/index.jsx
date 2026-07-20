import { View, Text, Input, Button, Image, ScrollView, Canvas, Switch } from '@tarojs/components'
import Taro, { useLoad, getCurrentInstance, useRouter, useUnload, useShareAppMessage } from '@tarojs/taro';
import { useEffect, useState, useRef } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import { PageLogin } from '../../components/PageLogin';
import { SideBar } from 'antd-mobile'
import IconFont from '../../components/iconfont';
import { MoziCard } from '../../components/MoziCard';
import { MoziGrid } from '../../components/MoziGrid';
import { Layout } from '../../components/Layout';
import { Error } from '../../components/Error';
import { handleOptions } from '../../components/MoziChart/options';
import { HighlightArea } from '../../components/HighlightArea';
import { AddCollect } from '../../components/AddCollect';
import { jump2List, jump2DataPage } from '../../utils/core';
import './index.less';
import { PopLogin } from '../../components/PopLogin';
import isEmpty from 'lodash/isEmpty';
// import '~taro-parse/dist/style/main.scss'
// import TaroParser from 'taro-parse'




export default function Mywarn() {

  const [activeKey, setActiveKey] = useState('0');
  const [warnData, setWarnData] = useState({
    loading: true,
    error: false,
    needLogin: false,
    data: {},
    sideData: null,
  });
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editValue, setEditValue] = useState('');

  // const data = {
  //   BTC: {
  //     url: "https://coinlogo-1317406749.cos.ap-shanghai.myqcloud.com/coin_logo2_0907/BTC.png", // 币icon图
  //     warnContent: [{
  //       code: '', // 配置code，可用作取消告警入参
  //       content: '涨超5%', // 具体的告警内容，比如 涨超 5%
  //       active: false, // 是否激活
  //     }, {
  //       code: '', // 配置code，可用作取消告警入参
  //       content: '涨到10112', // 具体的告警内容，比如 涨超 5%
  //       active: true, // 是否激活
  //     }]
  //   },
  //   ETH: {
  //     url: "https://coinlogo-1317406749.cos.ap-shanghai.myqcloud.com/coin_logo1115/ETH.png", // 币icon图
  //     warnContent: [{
  //       code: '', // 配置code，可用作取消告警入参
  //       content: '跌超5%', // 具体的告警内容，比如 涨超 5%
  //       active: false, // 是否激活
  //     }, {
  //       code: '', // 配置code，可用作取消告警入参
  //       content: '跌倒10123123', // 具体的告警内容，比如 涨超 5%
  //       active: true, // 是否激活
  //     }]
  //   },
  // };

  useLoad(() => {
    init();
  });

  const init = async () => {
    const { data } = await request({
      url: Interface.MY_WARN,
      data: {
        channel: 'miniapp'
      }
    });

    if (isEmpty(data)) {
      // todo 错误提示
      setWarnData({
        ...warnData,
        error: true,
        loading: false,
      });
    }
    if (data.isLogin === false) {
      setWarnData({
        ...warnData,
        loading: false,
        needLogin: true
      });
      return;
    }
    setWarnData({
      ...warnData,
      loading: false,
      needLogin: false,
      data,
      sideData: data[Object.keys(data)[activeKey]]
    });
  };

  const changeSide = (value) => {
    setActiveKey(value);
    setEditingIndex(-1);
    setEditValue('');
    setWarnData({
      ...warnData,
      sideData: warnData.data[Object.keys(warnData.data)[value]]
    });
  };

  const updateCurrentCoinWarnContent = (newWarnContent) => {
    const symbol = Object.keys(warnData.data)[activeKey];
    setWarnData({
      ...warnData,
      data: {
        ...warnData.data,
        [symbol]: {
          ...warnData.data[symbol],
          warnContent: newWarnContent,
        },
      },
      sideData: {
        ...warnData.sideData,
        warnContent: newWarnContent,
      },
    });
  };

  const code2Content = {
    priceRise: '币值涨到',
    priceFall: '币值跌到',
    priceRiseChange24HPercent: '币值涨超',
    priceFallChange24HPercent: '币值跌超',
  };

  // 固定的四个报警条件配置（按顺序显示）
  const fixedWarningCodes = [
    { code: 'priceRise', defaultContent: '--', unit: '$' },
    { code: 'priceFall', defaultContent: '--', unit: '$' },
    { code: 'priceRiseChange24HPercent', defaultContent: '10%', unit: '%' },
    { code: 'priceFallChange24HPercent', defaultContent: '10%', unit: '%' }
  ];

  // 获取标准化的告警列表（始终返回四个条件）
  const getStandardizedWarnContent = () => {
    const backendContent = warnData.sideData?.warnContent || [];
    
    return fixedWarningCodes.map(fixed => {
      // 从后端数据中查找对应的条目
      const backendItem = backendContent.find(item => item.code === fixed.code);
      
      if (backendItem) {
        // 如果后端有数据，使用后端的数据
        return backendItem;
      } else {
        // 如果后端没有数据，返回默认配置
        return {
          code: fixed.code,
          content: fixed.defaultContent,
          active: false
        };
      }
    });
  };

  // /alarm/add 为全量更新，需提交当前币种所有已设置告警值
  const buildFullAlarmContent = (standardizedContent, overrides = {}) => {
    return standardizedContent.reduce((acc, item) => {
      const value = overrides[item.code] ?? item.content;
      if (value && value !== '--') {
        acc[item.code] = value;
      }
      return acc;
    }, {});
  };

  const saveFullAlarmContent = async (symbol, standardizedContent, overrides = {}) => {
    const content = buildFullAlarmContent(standardizedContent, overrides);
    if (Object.keys(content).length === 0) {
      return { success: false, errorMsg: '请先设置告警值' };
    }
    return request({
      url: Interface.ADD_WARN,
      method: 'POST',
      data: {
        symbol,
        channel: 'miniapp',
        content,
      },
    });
  };

  const startEdit = (item, index) => {
    // 提取数字部分，如果是默认值 '--' 则设为空
    let numericValue = item.content.replace(/[%$]/g, '').trim();
    if (numericValue === '--') {
      numericValue = '';
    }
    setEditValue(numericValue);
    setEditingIndex(index);
  };

  const confirmEdit = async (code, index) => {
    setEditingIndex(-1);
    if (!/^[0-9]+(\.?[0-9]+)?$/.test(editValue)) {
      Taro.showToast({
        title: '请输入数字',
        icon: 'error',
        duration: 2000,
        mask: true
      });
      return;
    }

    const symbol = Object.keys(warnData.data)[activeKey];
    const sideKey = ['priceRise', 'priceFall', 'priceRiseChange24HPercent', 'priceFallChange24HPercent'];
    const codeIndex = sideKey.indexOf(code);
    const formattedValue = (codeIndex === 0 || codeIndex === 1) ? editValue : `${editValue}%`;
    const standardizedContent = getStandardizedWarnContent();
    Taro.showLoading();
    const addRes = await saveFullAlarmContent(symbol, standardizedContent, {
      [code]: formattedValue,
    });
    Taro.hideLoading();
    if (addRes.data === true) {
      // 更新本地数据
      const currentItem = standardizedContent[index];
      
      // 检查这个条目是否已存在于后端数据中
      const backendContent = warnData.sideData.warnContent || [];
      const existingIndex = backendContent.findIndex(item => item.code === currentItem.code);
      
      let newWarnContent;
      if (existingIndex >= 0) {
        // 如果存在，更新它
        newWarnContent = backendContent.map((item, idx) => {
          if (idx === existingIndex) {
            return {
              ...item,
              content: formattedValue
            };
          }
          return item;
        });
      } else {
        // 如果不存在，添加新条目
        newWarnContent = [
          ...backendContent,
          {
            code: currentItem.code,
            content: formattedValue,
            active: currentItem.active
          }
        ];
      }
      
      updateCurrentCoinWarnContent(newWarnContent);
      
      
      setEditValue('');
      
      Taro.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 2000,
        mask: true
      });
    } else {
      Taro.showToast({
        title: addRes.errorMsg || '修改失败',
        icon: 'error',
        duration: 2000,
        mask: true
      });
    }
  };

  const switchChange = async (code, active, index) => {
    const standardizedContent = getStandardizedWarnContent();
    const currentItem = standardizedContent[index];
    let backendContent = warnData.sideData.warnContent || [];
    const backendItem = backendContent.find(item => item.code === currentItem.code);
    const hasValidValue = currentItem.content && currentItem.content !== '--';
    const symbol = Object.keys(warnData.data)[activeKey];

    // 要开启时，必须已有有效告警值（-- 表示未设置）
    if (!active && !hasValidValue) {
      Taro.showToast({
        title: '请先设置告警值',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return;
    }

    // 后端尚无该告警项，但界面有默认/已填值时，先全量保存再开启
    if (!backendItem && !active) {
      Taro.showLoading();
      const addRes = await saveFullAlarmContent(symbol, standardizedContent);
      Taro.hideLoading();
      if (addRes?.data !== true) {
        Taro.showToast({
          title: addRes?.errorMsg || '启动失败',
          icon: 'error',
          duration: 2000,
          mask: true
        });
        return;
      }
      backendContent = [
        ...backendContent,
        {
          code: currentItem.code,
          content: currentItem.content,
          active: false
        }
      ];
      updateCurrentCoinWarnContent(backendContent);
    }

    const interfaceurl = !active ? Interface.OPEN_WARN : Interface.CLOSE_WARN;
    const { data } = await request({
      url: interfaceurl,
      data: {
        code,
        symbol,
        channel: 'miniapp'
      }
    });
    if (data) {
      const newWarnContent = backendContent.map((warnItem) => {
        if (warnItem.code === code) {
          return {
            ...warnItem,
            active: !active
          };
        }
        return warnItem;
      });

      updateCurrentCoinWarnContent(newWarnContent);
      Taro.showToast({
        title: active? '关闭成功': '启动成功',
        icon: 'success',
        duration: 2000,
        mask: true
      });
    } else {
      Taro.showToast({
        title: active? '关闭失败': '启动失败',
        icon: 'error',
        duration: 2000,
        mask: true
      });
    }
  };

  // 删除当前币种的所有告警
  const deleteCoinAllWarns = async () => {
    const symbol = Object.keys(warnData.data)[activeKey];
    
    // 显示确认对话框
    const res = await Taro.showModal({
      title: '确认删除',
      content: `确定要删除 ${symbol} 的所有告警吗？`,
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#FA5F5F'
    });

    if (!res.confirm) {
      return;
    }

    Taro.showLoading({ title: '删除中...' });
    
    try {
      // 与原项目联调一致：使用 DELETE 方法，symbol 和 channel 作为 Query String
      const response = await request({
        url: `${Interface.DELETE_ALARM}?symbol=${symbol}&channel=miniapp`,
        method: 'DELETE',
      });
      
      Taro.hideLoading();
      
      // 响应判断与原项目一致：code 为 0 或 200，且 data 为 true
      if ((response.code === 0 || response.code === 200) && response.data === true) {
        // 从数据中移除该币种
        const newData = { ...warnData.data };
        delete newData[symbol];
        
        // 切换到第一个币种（如果还有的话）
        const symbols = Object.keys(newData);
        let newActiveKey = '0';
        let newSideData = null;
        
        if (symbols.length > 0) {
          // 如果删除的不是第一个，且当前激活的索引大于0，则激活索引减1
          if (parseInt(activeKey) > 0) {
            newActiveKey = (parseInt(activeKey) - 1).toString();
          }
          // 确保激活索引不超出范围
          if (parseInt(newActiveKey) >= symbols.length) {
            newActiveKey = (symbols.length - 1).toString();
          }
          newSideData = newData[symbols[newActiveKey]];
        }
        
        setWarnData({
          ...warnData,
          data: newData,
          sideData: newSideData
        });
        setActiveKey(newActiveKey);
        
        Taro.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 2000,
          mask: true
        });
      } else {
        Taro.showToast({
          title: response.message || '删除失败',
          icon: 'error',
          duration: 2000,
          mask: true
        });
      }
    } catch (error) {
      console.error('删除币种告警失败:', error);
      Taro.hideLoading();
      Taro.showToast({
        title: '删除失败',
        icon: 'error',
        duration: 2000,
        mask: true
      });
    }
  };

  return (
    <View className='box'>
      <Layout isLoading={warnData?.loading} isError={warnData.error} needLogin={warnData.needLogin} loginCallback={() => init()}>
        {
          Object.keys(warnData.data).length === 0 && (
            <View className='errorBox'>
              <Error errMsg='您暂未设置告警' />
            </View>
          )
        }
        {
          Object.keys(warnData.data).length > 0 && (
            <View className='side-box'>
              <View className='side'>
                <SideBar className='sidebar' activeKey={activeKey} onChange={changeSide}>
                  {Object.keys(warnData?.data||{}).map((dataItem, dataIndex) => (
                    <SideBar.Item key={dataIndex} title={
                      <View className='sidebar-item'>
                        <Image className='sidebar-icon' mode='aspectFill' src={warnData?.data[dataItem].url} />
                        <View>{dataItem}</View>
                      </View>
                    } />
                  ))}
                </SideBar>
              </View>
              <View className='main'>
                {warnData.sideData && getStandardizedWarnContent().map((item, index) => {
                    return (
                      <View className='main-item' key={index}>
                        {editingIndex === index ? (
                          <View className='edit-container'>
                            <Text className='content-label'>
                              {code2Content[item.code]}
                            </Text>
                            <Input 
                              className='edit-input'
                              value={editValue}
                              onInput={(e) => setEditValue(e.detail.value)}
                              placeholder='请输入数字'
                              type='digit'
                            />
                            <View className='confirm-btn' onClick={() => confirmEdit(item.code, index)}>
                              <IconFont name='check' size={40} color='#11B787' />
                            </View>
                            {/* <Button 
                              className='confirm-btn'
                              size='mini'
                              type='primary'
                              onClick={() => confirmEdit(item.code, index)}
                            >
                              ✔️
                            </Button> */}
                          </View>
                        ) : (
                          <View className='content-wrapper'>
                            <Text className='content-label'>
                              {code2Content[item.code]}
                            </Text>
                            <Text 
                              className='content-text'
                              onClick={() => startEdit(item, index)}
                            >
                              {item.content}
                            </Text>
                          </View>
                        )}
                        <Switch checked={item.active} onChange={() => switchChange(item.code, item.active, index)} className='warn-switch' color='#11B787' />
                      </View>
                    )
                  })
                }
                {/* 删除整个币种的按钮 */}
                {warnData.sideData && (
                  <View className='delete-coin-btn' onClick={deleteCoinAllWarns}>
                    <Text className='delete-coin-text'>删除 {Object.keys(warnData.data)[activeKey]}</Text>
                  </View>
                )}
              </View>
            </View>
          )
        }
        
      </Layout>
    </View>
  )
}

