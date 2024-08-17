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
import { jump2Detail, jump2Market, jump2List } from '../../utils/core';
import { handleOptions } from '../../components/MoziChart/options';
import * as echarts from '../../components/MoziChart/ec-canvas/echarts';
import './index.less';

const ratioArr = ['人数多空比', '大账户人数多空比', '持仓多空比', '大账户持仓多空比', '主动买卖量比'];
const coinArr = ['BTC', 'BANANE'];
const exchangesArr = ['binance'];

const hisData = {
  xAxisData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // 横坐标数据，靠近当天的index靠后
  shortData: [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7], // 空比，为0-1的小数
  longData: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3], // 多比，为0-1的小数
  longShortData: [0.42, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42], // 多空比
};

export default function Putcallratio() {

  const [ ratioSelected, setRatioSelected ] = useState(ratioArr[0]);
  const [ coinSelected, setCoinSelected ] = useState(coinArr[0]);
  const [ exchangeSelected, setExchangeSelected ] = useState(exchangesArr[0]);

  const [activeKey, setActiveKey] = useState('currentRatio');
  const [curPCRData, setCurPCRData] = useState({
    loading: true,
    close: false,
    data: null
  });
  const [hisPCRData, setHisPCRData] = useState({
    loading: true,
    close: false,
    data: null
  });

  

  const chartRef = useRef(null)

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
  };

  const onCoinChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCoinSelected(coinArr[e.detail.value]);
  };

  const onExchangeChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExchangeSelected(exchangesArr[e.detail.value]);
  };

  useLoad(() => {
    setTimeout(() => {
      setCurPCRData({
        ...curPCRData,
        loading: false,
        data: {
          symbol: 'BTC',
          list: [{
            name: 'BTC',
            url: '', // 交易所icon/币种icon
            order: 0,
            short: '48.56%', // 空
            long: '48.56%', // 多
          }, {
            name: 'Binance',
            url: '', // 交易所icon
            order: 1,
            short: '48.56%', // 空
            long: '48.56%', // 多
          }, {
            name: 'Binance',
            url: '', // 交易所icon
            order: 2,
            short: '48.56%', // 空
            long: '48.56%', // 多
          }, {
            name: 'Binance',
            url: '', // 交易所icon
            order: 3,
            short: '48.56%', // 空
            long: '48.56%', // 多
          }]
        }
      });

      
      setHisPCRData({
        ...hisPCRData,
        loading: false,
        data: hisData
      });

      chartRef.current.setOption(handleOptions(hisData, 'samebar'));


      // var option = {
      //   title: {
      //     text: 'K 线图'
      //   },
      //   xAxis: {
      //     data: ['10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00']
      //   },
      //   yAxis: {},
      //   series: [{
      //     type: 'k',
      //     data: [
      //       [100, 200, 40, 250],
      //       [80, 90, 66, 100],
      //       [90, 40, 33, 110],
      //       [50, 60, 40, 80],
      //       [200, 180, 160, 200],
      //       [100, 200, 40, 250],
      //       [80, 90, 66, 100]
      //     ],
      //     itemStyle: {
      //       normal: {
      //         color: '#ff0000',
      //         color0: '#00ff00',
      //         borderWidth: 1,
      //         opacity: 1,
      //       }
      //     }
      //   }]
      // };

      // chartRef.current.setOption(option);
    }, 5000);
  });

  

  return (
    <View className='pcrBox'>
      <TabBar className='pcrTab' activeKey={activeKey} onChange={activeClick}>
        <TabBar.Item key='currentRatio' title='当前多空比' />
        <TabBar.Item key='historyRatio' title='历史多空比' />
      </TabBar>
      <View className='pickerList'>
        <Picker mode='selector' range={ratioArr} onChange={onRatioChange}>
          <View className='pickerSelect'>
            <View className='selectIcon'>{ratioSelected}</View>
            <IconFont name='caret-down' />
          </View>
        </Picker>
        <Picker mode='selector' range={coinArr} onChange={onCoinChange}>
          <View className='pickerSelect'>
            <View className='selectIcon'>{coinSelected}</View>
            <IconFont name='caret-down' />
          </View>
        </Picker>
      </View>
      <Layout isLoading={curPCRData.loading} isClose={curPCRData.close}>
        
        <View className='currentPCR'>
          <View>当前多空比</View>
          <MoziPCRColChart
            data={curPCRData.data?.list}
          />
        </View>
      </Layout>
      {/* <Layout isLoading={hisPCRData.loading} isClose={hisPCRData.close}> */}
        <View className='currentPCR'>
          <View className='header'>
            <View>历史多空比</View>
            <View className='pickerList'>
              <Picker mode='selector' range={exchangesArr} onChange={onExchangeChange}>
                <View className='pickerSelect'>
                  <View className='selectIcon'>{exchangeSelected}</View>
                  <IconFont name='caret-down' />
                </View>
              </Picker>
            </View>
          </View>
          
          <View className='currentPCRChart'>
            <ec-canvas className='chart' canvas-id="mychart-pcr" ec={ec}></ec-canvas>
          </View>
        </View>
      {/* </Layout> */}
    </View>
  )
}

