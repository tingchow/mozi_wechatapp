import { View, Text, Input, Button, Image, ScrollView, Picker } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro';
import ReactDOM, { useState, useEffect, useRef } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import { mock_hotjiaoyisuo, mock_hotbankuai, mock_hotheyue } from '../../utils/mock';
import { Card, List, Grid, TabBar } from 'antd-mobile';
import IconFont from '../../components/iconfont';
import { MoziCard } from '../../components/MoziCard';
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
const pcrArr = [{
  name: '币安',
  data: [
    { value: 1048, name: 'Search Engine' },
    { value: 735, name: 'Direct' },
    { value: 580, name: 'Email' },
    { value: 484, name: 'Union Ads' },
    { value: 300, name: 'Video Ads' }
  ]
}, {
  name: '币安',
  data: [
    { value: 1048, name: 'Search Engine' },
    { value: 735, name: 'Direct' },
    { value: 580, name: 'Email' },
    { value: 484, name: 'Union Ads' },
    { value: 300, name: 'Video Ads' }
  ]
}, {
  name: '币安',
  data: [
    { value: 1048, name: 'Search Engine' },
    { value: 735, name: 'Direct' },
    { value: 580, name: 'Email' },
    { value: 484, name: 'Union Ads' },
    { value: 300, name: 'Video Ads' }
  ]
}, {
  name: '币安',
  data: [
    { value: 1048, name: 'Search Engine' },
    { value: 735, name: 'Direct' },
    { value: 580, name: 'Email' },
    { value: 484, name: 'Union Ads' },
    { value: 300, name: 'Video Ads' }
  ]
}, {
  name: '币安',
  data: [
    { value: 1048, name: 'Search Engine' },
    { value: 735, name: 'Direct' },
    { value: 580, name: 'Email' },
    { value: 484, name: 'Union Ads' },
    { value: 300, name: 'Video Ads' }
  ]
}, {
  name: '币安',
  data: [
    { value: 1048, name: 'Search Engine' },
    { value: 735, name: 'Direct' },
    { value: 580, name: 'Email' },
    { value: 484, name: 'Union Ads' },
    { value: 300, name: 'Video Ads' }
  ]
}];

export default function Putcallratio() {

  const [ ratioSelected, setRatioSelected ] = useState(ratioArr[0]);
  const [ coinSelected, setCoinSelected ] = useState(coinArr[0]);
  const [activeKey, setActiveKey] = useState('currentRatio');

  // const chartRef = useRef(null)
  // const chartRef1 = useRef(null)
  // const chartRef2 = useRef(null)
  // const chartRef3 = useRef(null)
  // const chartRef4 = useRef(null)
  // const chartRef5 = useRef(null)
  // const chartRef6 = useRef(null)


  // const ecList = [{
  //   onInit: (canvas, width, height, dpr) => {
  //     const chart = echarts.init(canvas, null, {
  //       width: width,
  //       height: height,
  //       devicePixelRatio: dpr // new
  //     });
  //     canvas.setChart(chart);
  
  
  //     chartRef1.current = chart;
  
  //     return chart;
  //   }
  // }, {
  //   onInit: (canvas, width, height, dpr) => {
  //     const chart = echarts.init(canvas, null, {
  //       width: width,
  //       height: height,
  //       devicePixelRatio: dpr // new
  //     });
  //     canvas.setChart(chart);
  
  
  //     chartRef2.current = chart;
  
  //     return chart;
  //   }
  // }, {
  //   onInit: (canvas, width, height, dpr) => {
  //     const chart = echarts.init(canvas, null, {
  //       width: width,
  //       height: height,
  //       devicePixelRatio: dpr // new
  //     });
  //     canvas.setChart(chart);
  
  
  //     chartRef3.current = chart;
  
  //     return chart;
  //   }
  // }, {
  //   onInit: (canvas, width, height, dpr) => {
  //     const chart = echarts.init(canvas, null, {
  //       width: width,
  //       height: height,
  //       devicePixelRatio: dpr // new
  //     });
  //     canvas.setChart(chart);
  
  
  //     chartRef4.current = chart;
  
  //     return chart;
  //   }
  // }, {
  //   onInit: (canvas, width, height, dpr) => {
  //     const chart = echarts.init(canvas, null, {
  //       width: width,
  //       height: height,
  //       devicePixelRatio: dpr // new
  //     });
  //     canvas.setChart(chart);
  
  
  //     chartRef5.current = chart;
  
  //     return chart;
  //   }
  // }, {
  //   onInit: (canvas, width, height, dpr) => {
  //     const chart = echarts.init(canvas, null, {
  //       width: width,
  //       height: height,
  //       devicePixelRatio: dpr // new
  //     });
  //     canvas.setChart(chart);
  
  
  //     chartRef6.current = chart;
  
  //     return chart;
  //   }
  // }]

  const activeClick = async (value) => {
    if ( value ===  activeKey) return;
    console.log(value);
    setActiveKey(value);
  };

  const onRatioChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRatioSelected(ratioArr[e.detail.value]);
  };

  const onCoinChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRatioSelected(setCoinSelected[e.detail.value]);
  };

  useLoad(() => {
    // pcrArr.forEach((pcrItem, pcrIndex) => {
    //   console.log(ecList[`onInit${pcrIndex + 1}`]);
    //   chartRef.current.setOption(handleOptions(pcrItem.data, 'pie'));
    // })
    // chartRef1.current.setOption(handleOptions(coin_line1.data, 'pie'));
    // setTimeout(() => {
    //   console.log(chartRef1);
    //   chartRef1.current.setOption(handleOptions(pcrArr[0].data, 'pie'));
    //   chartRef2.current.setOption(handleOptions(pcrArr[1].data, 'pie'));
    //   chartRef3.current.setOption(handleOptions(pcrArr[2].data, 'pie'));
    //   chartRef4.current.setOption(handleOptions(pcrArr[3].data, 'pie'));
    //   chartRef5.current.setOption(handleOptions(pcrArr[4].data, 'pie'));
    //   chartRef6.current.setOption(handleOptions(pcrArr[5].data, 'pie'));
    // }, 2000);
  });

  

  return (
    <View className='pcrBox'>
      <TabBar className='pcrTab' activeKey={activeKey} onChange={activeClick}>
        <TabBar.Item key='currentRatio' title='当前多空比' />
        <TabBar.Item key='historyRatio' title='历史多空比' />
      </TabBar>
      <View className='currentPCR'>
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
        <View className='currentPCRChart'>
          <MoziPCRColChart
            data={
              [{
                name: 'Binance',
                left: '49%',
                right: '51%'
              }, {
                name: 'OKX',
                left: '51%',
                right: '49%'
              }]
            }
          />
          {/* {
            pcrArr.map((pcrItem, pcrIndex) => {
              return (
                <View className='pcrItem'>
                  <View>{pcrItem.name}</View>
                  <ec-canvas canvas-id="mychart-pie" ec={ecList[pcrIndex]}></ec-canvas>
                </View>
              )
            })
          } */}
        </View>
      </View>
    </View>
  )
}

