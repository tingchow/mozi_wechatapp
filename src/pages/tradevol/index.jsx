import { View, Text, Input, Button, Image, ScrollView, Picker } from '@tarojs/components'
import Taro, { useLoad, useShareAppMessage } from '@tarojs/taro';
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
import './index.less';

export default function Tradevol() {
  const [ cexArr, setCexArr ] = useState([]);
  const [ cexSelected, setCexSelected ] = useState('');
  const [ coinArr, setCoinArr] = useState([]);
  const [ coinSelected, setCoinSelected ] = useState('');

  const [activeKey, setActiveKey] = useState('currentRatio');
  // const [curPCRData, setCurPCRData] = useState({
  //   loading: true,
  //   close: false,
  //   data: null
  // });
  // const [hisPCRData, setHisPCRData] = useState({
  //   loading: true,
  //   close: false,
  //   data: null
  // });

  useShareAppMessage(() => {
    return {
      title: '你能用微信盯盘啦！'
    };
  });

  const chartRef = useRef(null)
  const chartRef1 = useRef(null)
  const chartData = useRef({
    cur: null,
    his: null
  });


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


  const onCoinChange = (e) => {
    console.log();
    e.preventDefault();
    e.stopPropagation();
    setCoinSelected(coinArr[e.detail.value]);

    getData({coin: coinArr[e.detail.value]});
  };

  const onExchangeChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCexSelected(cexArr[e.detail.value]);

    getData({exchange: cexArr[e.detail.value]});
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

    getData({coin: allCoinData.data[0], exchange: allCexData.data[0]});
  });

  const getData = async ({coin = coinSelected, exchange = cexSelected}) => {
    const traCurData = await request({
      url: Interface.TRA_CUR,
      data: {
        exchange
      }
    });

    const traTmpData = traCurData?.data.map((item) => {
      return {
        ...item,
        itemStyle: {
          color: item.state === 1? '#02c076': '#ff3333'
        }
      };
    });

    console.log('tremapData', traTmpData);

    chartData.current.cur = {
      data: traTmpData,
      msg: '成交量',
      type: 'treemap'
    };

    chartRef.current.setOption(handleOptions(traTmpData, 'treemap', '成交量'));

    const traHisData = await request({
      url: Interface.TRA_HIS,
      data: {
        coin,
        exchange
      }
    });

    chartData.current.his = {
      data: traHisData.data,
      type: 'linebar'
    };
    chartRef1.current.setOption(handleOptions(traHisData.data, 'linebar', '成交额'));
  };

  const jump2Land = (type) => {
    jump2DataPage('landscapechart', 'chartData', chartData.current[type]);
  };

  return (
    <View className='pcrBox'>
      {/* <TabBar className='pcrTab' activeKey={activeKey} onChange={activeClick}>
        <TabBar.Item key='currentRatio' title='当前成交额' />
        <TabBar.Item key='historyRatio' title='历史成交额' />
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
          <View className='picker-title'>交易所</View>
          
          <Picker mode='selector' range={cexArr} onChange={onExchangeChange}>
            <View className='pickerSelect'>
              <View className='selectIcon'>{cexSelected}</View>
              <IconFont name='caret-down' />
            </View>
          </Picker>
        </View>
      </View>
      <View className='currentPCR'>
        <View className='header'>当前成交额</View>
          
        <View className='currentPCRChart'>
          <View className='chart-arrawsalt' onClick={() => {jump2Land('cur')}}>
            <IconFont name='arrawsalt' size={30} color='#fff' />
          </View>
          <ec-canvas className='chart' canvas-id="mychart-pscur" ec={ec1}></ec-canvas>
        </View>
      </View>
      <View className='currentPCR'>
        <View className='header'>历史成交额
          {/* <View></View> */}
          {/* <View className='pickerList'> */}
            
            {/* <Picker mode='selector' range={coinList} onChange={onCoinChange}>
              <View className='pickerSelect'>
                <View className='selectIcon'>{coinSelected}</View>
                <IconFont name='caret-down' />
              </View>
            </Picker> */}
          {/* </View> */}
        </View>
          
        <View className='currentPCRChart'>
          <View className='chart-arrawsalt' onClick={() => {jump2Land('cur')}}>
            <IconFont name='arrawsalt' size={30} color='#fff' />
          </View>
          <ec-canvas className='chart' canvas-id="mychart-pshis" ec={{onInit: initChart1}}></ec-canvas>
        </View>
      </View>
    </View>
  )
}

