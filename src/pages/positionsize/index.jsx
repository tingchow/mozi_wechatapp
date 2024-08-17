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

export default function Positionsize() {

  const [ ratioSelected, setRatioSelected ] = useState(ratioArr[0]);
  
  

  const [exchangeList, setExchangeList] = useState([]);
  const [ exchangeSelected, setExchangeSelected ] = useState(exchangeList[0]);
  const [coinList, setCoinList] = useState([]);
  const [ coinSelected, setCoinSelected ] = useState(coinList[0]);

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
  const chartRef1 = useRef(null)

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

  const initChart1 = (canvas, width, height, dpr) => {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // new
    });
    canvas.setChart(chart);

    // console.log(handleOptions(hisData, 'samebar'));
    // canvas.setOption();
    // console.log('chartRef.current', chartRef.current);
    chartRef1.current = chart;

    return chart;
  }

  const ec1 = {
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
    setCoinSelected(coinList[e.detail.value]);
  };

  const onExchangeChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExchangeSelected(exchangesArr[e.detail.value]);
  };

  useLoad(() => {
    setTimeout(() => {

      setExchangeList(['binance', 'OKX']);
      setExchangeSelected('binance');

      setCoinList(['btc', 'eth']);
      setCoinSelected('btc');

      const data = [{
        name: 'BTC', // 交易所名称
        value: 20, // 实际数值
        valueDisplay: '$20', // value实际展示内容，比如$20M
        itemStyle: {
          color: '#02c076', // 展示红色还是绿色
        }
        
      }, {
        name: 'ETH', // 交易所名称
        value: 10, // 实际数值
        label: '$10',
        valueDisplay: '$10', // value实际展示内容，比如$20M
        itemStyle: {
          color: '#ff3333', // 展示红色还是绿色
        }
      }]
      chartRef.current.setOption(handleOptions(data, 'treemap'));


      const hisdata = {
        xAxisData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // 横坐标数据，靠近当天的index靠后
        yAxisLeftSlot: '', // 左侧坐标轴单位，比如${}B，需要替换的内容在{}中替换
        yAxisRightSlot: '', // 右侧坐标轴单位，比如${}K，需要替换的内容在{}中替换
        barData: [20,20,20,20,20,20,20],
        lineData: [20,20,20,20,20,20,20],
        barData: [{
         value: 20,
         toolTips: [{
           exchange: 'Binance', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
          },{
           exchange: 'OKX', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
         }]
        },{
         value: 20,
         toolTips: [{
           exchange: 'Binance', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
          },{
           exchange: 'OKX', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
         }]
        },{
         value: 20,
         toolTips: [{
           exchange: 'Binance', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
          },{
           exchange: 'OKX', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
         }]
        },{
         value: 20,
         toolTips: [{
           exchange: 'Binance', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
          },{
           exchange: 'OKX', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
         }]
        },{
         value: 20,
         toolTips: [{
           exchange: 'Binance', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
          },{
           exchange: 'OKX', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
         }]
        },{
         value: 20,
         toolTips: [{
           exchange: 'Binance', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
          },{
           exchange: 'OKX', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
         }]
        },{
         value: 20,
         toolTips: [{
           exchange: 'Binance', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
          },{
           exchange: 'OKX', // 名称
           url: 'xxxx', // 交易所icon
           value: 20, // 交易所币种数值
         }]
        }]
      }
      const lineOption = handleOptions(hisdata, 'linebar');
      console.log('lineOption', lineOption);
      chartRef1.current.setOption(lineOption);
    }, 5000);
  });

  

  return (
    <View className='pcrBox'>
      <TabBar className='pcrTab' activeKey={activeKey} onChange={activeClick}>
        <TabBar.Item key='currentRatio' title='当前持仓量' />
        <TabBar.Item key='historyRatio' title='历史持仓量' />
      </TabBar>
      <View className='currentPCR'>
        <View className='header'>
          <View>当前持仓量</View>
          <View className='pickerList'>
            <Picker mode='selector' range={exchangeList} onChange={onExchangeChange}>
              <View className='pickerSelect'>
                <View className='selectIcon'>{exchangeSelected}</View>
                <IconFont name='caret-down' />
              </View>
            </Picker>
          </View>
        </View>
          
        <View className='currentPCRChart'>
          <ec-canvas className='chart' canvas-id="mychart-ps" ec={ec1}></ec-canvas>
        </View>
      </View>
      <View className='currentPCR'>
        <View className='header'>
          <View>历史持仓量</View>
          <View className='pickerList'>
            <Picker mode='selector' range={coinList} onChange={onCoinChange}>
              <View className='pickerSelect'>
                <View className='selectIcon'>{coinSelected}</View>
                <IconFont name='caret-down' />
              </View>
            </Picker>
          </View>
        </View>
          
        <View className='currentPCRChart'>
          <ec-canvas className='chart' canvas-id="mychart-ps" ec={{onInit: initChart1}}></ec-canvas>
        </View>
      </View>
    </View>
  )
}

