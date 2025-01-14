import { View, Text, Input, Button, Image, ScrollView, Canvas, PageContainer } from '@tarojs/components'
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
import { handleOptions } from '../../components/MoziChart/options';
import { HighlightArea } from '../../components/HighlightArea';
import { AddCollect } from '../../components/AddCollect';
import { jump2List, jump2DataPage, jump2NoTab } from '../../utils/core';
import './index.less';
import { PopLogin } from '../../components/PopLogin';
import { isEmpty } from 'lodash';
// import '~taro-parse/dist/style/main.scss'
// import TaroParser from 'taro-parse'




export default function Addwarn() {

  const [activeKey, setActiveKey] = useState('0');
  const [inputValue, setInputValue] = useState('');
  const [ showPop, setShowPop ] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const symbol = useRouter().params.symbol;

  const data = {
    '币值涨到': {
      content: {
        title: '币值涨到',
        placeholder: '请输入币值涨超数值',
      }
    },
    '币值跌到': {
      content: {
        title: '币值跌到',
        placeholder: '请输入币值跌超数值',
      }
    },
    '币值涨超': {
      content: {
        title: '币值涨超',
        placeholder: '请输入币值涨超数值',
        unit: '%'
      }
    },
    '币值跌超': {
      content: {
        title: '币值跌超',
        placeholder: '请输入币值跌超数值',
        unit: '%'
      }
    },
  };

  const dataItem = data[Object.keys(data)[activeKey]];

  const onChange = (e) => {
    // if (e.detail.value) setCloseColor('#000');
    setInputValue(e.detail.value);
    // console.log(e);
  };

  const addwarn = async() => {
    if (!/^[0-9]+(\.[0-9]+)?$/.test(inputValue)) {
      Taro.showToast({
        title: '请输入数字',
        icon: 'error',
        duration: 2000,
        mask: true
      });
      return;
    }
    setBtnDisabled(true);
    const sideKey =  ['priceRise', 'priceFall', 'priceRiseChange24HPercent', 'priceFallChange24HPercent'];
    const addRes = await request({
      url: Interface.ADD_WARN,
      method: 'POST',
      data: {
        symbol,
        content: {
          [sideKey[activeKey]]: activeKey === '0' || activeKey === '1'? inputValue: `${inputValue}%`
        }
      }
    });

    setBtnDisabled(false);
    if (addRes.data === true) {
      Taro.showToast({
        title: '添加告警成功',
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

  return (
    <View className='box'>
      <View className='side-box'>
        <View className='side'>
          <SideBar className='sidebar' activeKey={activeKey} onChange={setActiveKey}>
            {Object.keys(data).map((dataItem, dataIndex) => (
              <SideBar.Item className='sidebar-item' key={dataIndex} title={dataItem} />
            ))}
          </SideBar>
        </View>
        <View className='main'>
          <View className='main-title'>{dataItem.content.title}</View>
          <View className='main-content'>
            <Input className='main-input' type='numberpad' placeholder={dataItem.content.placeholder} value={inputValue} onInput={onChange} focus/>
            { dataItem.content.unit && <View>{dataItem.content.unit}</View> }
          </View>
          <Button className={`warn-btn ${Boolean(inputValue)? 'show': 'hide'}`} disabled={btnDisabled} onClick={addwarn}>设置告警</Button>
        </View>
      </View>
      <View className='footer' onClick={() => {jump2NoTab('mywarn')}}>
        查看已配置告警
        {/* <Button className='footer-btn'></Button> */}
      </View>
      <PageContainer
        show={showPop}
        // onClickOverlay={() => {
        //   setShowPop(false)
        // }}
        onAfterLeave={() => {
          setShowPop(false)
        }}
        // bodyStyle={{ height: '40vh' }}
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
            // style='width: 300px;height: 100px;background: #fff;'
            src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/wechat_account.jpg'
          />
        </View>
      </PageContainer>
      { showLogin && <PopLogin hideCb={() => {setShowLogin(false)}} /> }
    </View>
  )
}




