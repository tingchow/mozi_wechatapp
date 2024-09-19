import { View, Text, Input, Button, Image, ScrollView, Picker } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro';
import ReactDOM, { useState, useEffect, useRef } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import { mock_hotjiaoyisuo, mock_hotbankuai, mock_hotheyue } from '../../utils/mock';
import { Card, List, Grid, TabBar } from 'antd-mobile';
import IconFont from '../../components/iconfont';
import { MoziCard } from '../../components/MoziCard';
import { Layout } from '../../components/Layout';
import { MoziGrid } from '../../components/MoziGrid';
import { SearchInput } from '../../components/SearchInput';
import { AddCollect } from '../../components/AddCollect';
import { HighlightArea } from '../../components/HighlightArea';
import { MoziPCRColChart } from '../../components/MoziChart/PCRColChart'; 
// import { Pie } from '../../components/Pie';
import { jump2Detail, jump2Market, jump2List, jump2DataPage } from '../../utils/core';
import { handleOptions } from '../../components/MoziChart/options';
import * as echarts from '../../components/MoziChart/ec-canvas/echarts';
import { isEmpty } from 'lodash';
import './index.less';

const ratioArr = ['主动买卖量比', '人数多空比', '大账户人数多空比', '持仓多空比', '大账户持仓多空比'];
const ratioTypeArr = ['but_sell_ratio', 'global_account_ratio', 'top_account_ratio', 'global_hold_ratio', 'top_hold_ratio'];

export default function Putcallratio() {

  const [ ratioSelected, setRatioSelected ] = useState(ratioArr[0]);
  const [ coinSelected, setCoinSelected ] = useState('');
  const [ cexSelected, setCexSelected ] = useState('');
  const [ coinArr, setCoinArr ] = useState([]);
  const [ cexArr, setCexArr ] = useState([]);


  const [activeKey, setActiveKey] = useState('currentRatio');
  const [curPCRData, setCurPCRData] = useState({
    loading: true,
    close: false,
    data: null
  });

  

  const chartRef = useRef(null)
  const chartData = useRef(null);

  const initChart = (canvas, width, height, dpr) => {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // new
    });
    canvas.setChart(chart);

    // console.log(handleOptions(hisData, 'samebar'));
    // canvas.setOption();
    // console.log('chartRef.current', chartRef.current);
    chartRef.current = chart;

    return chart;
  }

  const ec = {
    onInit: initChart
  }

  const activeClick = async (value) => {
    if ( value ===  activeKey) return;
    console.log(value);
    setActiveKey(value);
  };

  const onRatioChange = (e) => {
    console.log('e', e);
    e.preventDefault();
    e.stopPropagation();
    setRatioSelected(ratioArr[e.detail.value]);

    const ratioTypeSelected = ratioTypeArr[ratioArr.indexOf(ratioArr[e.detail.value])];
    getData({ratioTypeSelected});
  };

  const onCoinChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCoinSelected(coinArr[e.detail.value]);

    const ratioTypeSelected = ratioTypeArr[ratioArr.indexOf(ratioSelected)];
    getData({ratioTypeSelected, coin: coinArr[e.detail.value]});
  };

  const onExchangeChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCexSelected(cexArr[e.detail.value]);

    const ratioTypeSelected = ratioTypeArr[ratioArr.indexOf(ratioSelected)];
    getData({ratioTypeSelected, exchange: cexArr[e.detail.value], getType: 'his'});
  };

  useLoad(async () => {

    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment']
    });

    const allCoinData = await request({
      url: Interface.ALL_COIN,
    });

    setCoinArr(allCoinData.data);
    setCoinSelected(allCoinData.data[0]);

    const allCexData = await request({
      url: Interface.ALL_CEX,
    });

    setCexArr(allCexData.data);
    setCexSelected(allCexData.data[0]);



    const ratioTypeSelected = ratioTypeArr[ratioArr.indexOf(ratioSelected)];

    getData({ratioTypeSelected, coin: allCoinData.data[0], exchange: allCexData.data[0]});
  });

  const getData = async ({ratioTypeSelected, coin = coinSelected, exchange = cexSelected, getType = 'all'}) => {

    console.log('getType', getType);

    const pcrHisData = await request({
      url: Interface.PCR_HIS,
      data: {
        coin,
        exchange,
        type: ratioTypeSelected
      }
    });

    // console.log('pcrHisData?.data', pcrHisData?.data);

    // if (isEmpty(pcrHisData?.data)) {
    //   setHisPCRData({
    //     ...hisPCRData,
    //     loading: false,
    //     close: true
    //   });
    //   return;
    // }

    // console.log('chartRef', chartRef);
    console.log('pcrData', JSON.stringify(pcrHisData?.data));
    chartData.current = {
      data: pcrHisData?.data,
      type: 'samebar'
    };
    chartRef.current.setOption(handleOptions(pcrHisData?.data, 'samebar'));
    if (getType === 'his') {
      setCurPCRData({
        ...curPCRData,
        loading: false,
      });
      return;
    };

    const pcrCurData = await request({
      url: Interface.PCR_CUR,
      data: {
        coin,
        type: ratioTypeSelected
      }
    });
    if (isEmpty(pcrCurData?.data)) {
      setCurPCRData({
        ...curPCRData,
        loading: false,
        close: true
      });
      return;
    }

    setCurPCRData({
      ...curPCRData,
      loading: false,
      data: pcrCurData.data
    });
  };

  const jump2Land = () => {
    jump2DataPage('landscapechart', 'chartData', chartData.current);
  };

  

  return (
    <View className='pcrBox'>
      {/* <TabBar className='pcrTab' activeKey={activeKey} onChange={activeClick}>
        <TabBar.Item key='currentRatio' title='当前多空比' />
        <TabBar.Item key='historyRatio' title='历史多空比' />
      </TabBar> */}
      <View className='pickerList'>
        <View className='picker-item'>
          <View className='picker-title'>币种</View>
          <Picker mode='selector' range={coinArr} onChange={onCoinChange}>
            <View className='pickerSelect'>
              <View className='selectIcon'>{coinSelected}</View>
              <IconFont name='caret-down' />
            </View>
          </Picker>
        </View>
        <View className='picker-item'>
          <View className='picker-title'>类型</View>
          <Picker mode='selector' range={ratioArr} onChange={onRatioChange}>
            <View className='pickerSelect'>
              <View className='selectIcon'>{ratioSelected}</View>
              <IconFont name='caret-down' />
            </View>
          </Picker>
        </View>
      </View>
      <Layout isLoading={curPCRData.loading} isClose={curPCRData.close}>
        
        <View className='currentPCR'>
          <View className='header-title'>当前多空比</View>
          <MoziPCRColChart
            data={curPCRData.data?.list}
          />
        </View>
      </Layout>
      {/* <Layout isLoading={hisPCRData.loading} isClose={hisPCRData.close}> */}
        <View className='currentPCR'>
          <View className='header'>
            <View className='header-title'>历史多空比</View>
            <View>
              <Picker mode='selector' range={cexArr} onChange={onExchangeChange}>
                <View className='pickerSelect'>
                  <View className='selectIcon'>{cexSelected}</View>
                  <IconFont name='caret-down' />
                </View>
              </Picker>
            </View>
          </View>
          
          <View className='currentPCRChart'>
            <View className='chart-arrawsalt' onClick={jump2Land}>
              <IconFont name='arrawsalt' size={30} color='#fff' />
            </View>
            <ec-canvas className='chart' canvas-id="mychart-pcr" ec={ec}></ec-canvas>
          </View>
        </View>
      {/* </Layout> */}
    </View>
  )
}

