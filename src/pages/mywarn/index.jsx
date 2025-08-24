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
import { isEmpty } from 'lodash';
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
    setWarnData({
      ...warnData,
      sideData: warnData.data[Object.keys(warnData.data)[value]]
    });
  };

  const code2Content = {
    priceRise: '币值涨到',
    priceFall: '币值跌到',
    priceRiseChange24HPercent: '币值涨超',
    priceFallChange24HPercent: '币值跌超',
  };

  const startEdit = (item, index) => {
    // 提取数字部分
    const numericValue = item.content.replace('%', '');
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
    Taro.showLoading();
    const addRes = await request({
      url: Interface.ADD_WARN,
      method: 'POST',
      data: {
        symbol,
        content: {
          [code]: formattedValue
        }
      }
    });
    Taro.hideLoading();
    if (addRes.data === true) {
      // 更新本地数据
      const newWarnContent = warnData.sideData.warnContent.map((warnItem, warnIndex) => {
        if (index === warnIndex) {
          return {
            ...warnItem,
            content: formattedValue
          };
        }
        return warnItem;
      });
      
      setWarnData({
        ...warnData,
        sideData: {
          ...warnData.sideData,
          warnContent: newWarnContent
        }
      });
      
      
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
    let interfaceurl = Interface.CLOSE_WARN;
    if (!active) {
      interfaceurl = Interface.OPEN_WARN;
    }
    const { data } = await request({
      url: interfaceurl,
      data: {
        code,
        symbol: Object.keys(warnData.data)[activeKey]
      }
    });
    if (data) {
      const newWarnContent = warnData.sideData.warnContent.map((warnItem, warnIndex) => {
        const newWarnItem = {...warnItem};
        if (index === warnIndex) {
          newWarnItem.active = !active;
        }
        return newWarnItem;
      });
      setWarnData({
        ...warnData,
        sideData: {
          ...warnData.sideData,
          warnContent: newWarnContent
        }
      });
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
                {warnData.sideData?.warnContent?.length > 0 && warnData.sideData?.warnContent.map((item, index) => {
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
                              <IconFont name='check' size={40} color='#02c076' />
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
                        <Switch checked={item.active} onChange={() => switchChange(item.code, item.active, index)} />
                      </View>
                    )
                  })
                }
              </View>
            </View>
          )
        }
        
      </Layout>
    </View>
  )
}

