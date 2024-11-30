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
import { isEmpty } from 'lodash';
import './index.less';

import * as h5echartscore from 'echarts/core';
// 引入柱状图图表，图表后缀都为 Chart
import { BarChart, LineChart } from 'echarts/charts';
// 引入标题，提示框，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers';

export default function Fundingrate() {
  const [coinList, setCoinList] = useState([]);

  const [cexArr, setCexArr] = useState([]);
  const [ cexSelected, setCexSelected ] = useState('');
  const [coinArr, setCoinArr] = useState([]);
  const [ coinSelected, setCoinSelected ] = useState('');

  const [activeKey, setActiveKey] = useState('currentRatio');
  const [curFundData, setCurFundData] = useState({
    loading: true,
    close: false,
    data: null
  });

  const [showMore, setShowMore] = useState(false);
  // const [hisPCRData, setHisPCRData] = useState({
  //   loading: true,
  //   close: false,
  //   data: null
  // });

  

  const chartRef = useRef(null)
  const chartData = useRef(null)
  const h5chartNode = useRef(null);

  useShareAppMessage(() => {
    return {
      title: '你能用微信盯盘啦！'
    };
  });

  const initChart = (canvas, width, height, dpr) => {
    console.log('初始化');
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // new
    });
    canvas.setChart(chart);

    // console.log(handleOptions(hisData, 'samebar'));
    // canvas.setOption();
    
    chartRef.current = chart;
    console.log('chartRef.current', chartRef.current);

    return chart;
  }


  const ec = {
    onInit: initChart
  }

  const activeClick = async (value) => {
    if ( value ===  activeKey) return;
    console.log(value);
    setActiveKey(value);
    Taro.pageScrollTo({
      selector: '.hisFR'
    });
  };

  // const onRatioChange = (e) => {
  //   console.log('e', e);
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setRatioSelected(ratioArr[e.detail.value]);
  // };

  const onCoinChange = (e) => {
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

    if (process.env.TARO_ENV === 'h5') {
      h5echartscore.use([
        BarChart,
        LineChart,
        LegendComponent,
        TooltipComponent,
        GridComponent,
        DataZoomComponent,
        CanvasRenderer
      ]);

      chartRef.current = h5echartscore.init(h5chartNode.current);
    }

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
    const frCurData = await request({
      url: Interface.FR_CUR
    });

    if (isEmpty(frCurData?.data)) {
      setCurFundData({
        ...curFundData,
        loading: false,
        close: true
      });
      return;
    }

    const tmpFundData = {...frCurData?.data};
    
    const tmpList = tmpFundData.list.map((item) => {
      item.data.unshift({
        symbol: item.symbol,
        url: item.url
      })
      return {
        ...item,
        data: item.data
      }
    });

    console.log('tmpList', tmpList);

    tmpFundData.exchange.unshift({
      name: '币种'
    });
    tmpFundData.list = [...tmpList];
    

    setCurFundData({
      ...curFundData,
      loading: false,
      data: tmpFundData
    });


    const frHisData = await request({
      url: Interface.FR_HIS,
      data: {
        coin,
        exchange
      }
    });

    chartData.current = {
      data: frHisData.data,
      type: 'updownbarline'
    };

    chartRef.current.setOption(handleOptions(frHisData.data, 'updownbarline'));
  };

  const jump2Land = () => {
    jump2DataPage('landscapechart', 'chartData', chartData.current);
  };

  return (
    <View className='pcrBox'>
      <TabBar className='pcrTab' activeKey={activeKey} onChange={activeClick}>
        <TabBar.Item key='currentRatio' title='当前费率' />
        <TabBar.Item key='historyRatio' title='历史费率' />
      </TabBar>
      <View className='currentPCR'>
        <View className='header'>
          <View>当前费率</View>
          {/* <View className='pickerList'>
            <Picker mode='selector' range={exchangeList} onChange={onExchangeChange}>
              <View className='pickerSelect'>
                <View className='selectIcon'>{exchangeSelected}</View>
                <IconFont name='caret-down' />
              </View>
            </Picker>
          </View> */}
        </View>
          
        <View className='currentPCRChart'>
          <Layout isLoading={curFundData.loading} isClose={curFundData.close}>
            <ScrollView className='scroll' scrollX scrollWithAnimation style={{whiteSpace: 'nowrap'}} enablePassive={true}>
              <View className='fund-list fund-title'>
                {
                  curFundData.data?.exchange.map((fundItem, fundIdx) => {
                    if (fundIdx === 0) {
                      return <View className='fund-item fund-item-first'>{fundItem.name}</View>
                    }
                    return (
                      <View className='fund-item'>
                        <Image className='fund-url' mode='aspectFit' src={fundItem.url} />
                        <View className='fund-name'>{fundItem.name}</View>
                      </View>
                    )
                  })
                }
              </View>
              <View className={`fund-detail-box show-more-${showMore}`}>
              {
                curFundData.data?.list.map((listItem, listIdx) => {
                  return (
                    <View className='fund-list list-detail' key={listIdx}>
                      {
                        listItem?.data.map((gridItem, gridIdx) => {
                          if (gridIdx === 0) {
                            return (
                              <View className='fund-item fund-item-first' key={gridIdx}>
                                <Image className='fund-url' mode='aspectFit' src={gridItem.url} />
                                <View className='fund-name'>{gridItem.symbol}</View>
                              </View>
                            )
                          }
                          return <View className={`fund-item ${Number(gridItem.slice(0, gridItem.length - 1)) > 0.01 ? 'red': ''} ${Number(gridItem.slice(0, gridItem.length - 1)) < 0.005 ? 'green': ''}`}>{gridItem}</View>
                        })
                      }
                    </View>
                  )
                })
              }
              </View>
            </ScrollView>
            {
              !showMore && <View className='show-more-btn' onClick={() => {setShowMore(true)}}>
                <View className='more'>查看更多</View>
                <IconFont name='caret-down' />
              </View>
            }
          </Layout>
          
        </View>
      </View>
      <View className='currentPCR hisFR'>
        <View className='header'>
          <View>历史费率</View>
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
        </View>
          
        <View className='currentChart'>
          <View className='chart-arrawsalt' onClick={jump2Land}>
            <IconFont name='arrawsalt' size={30} color='#fff' />
          </View>
          { process.env.TARO_ENV === 'weapp' && <ec-canvas className='chart' canvas-id="mychart-updownbarline" ec={{onInit: initChart}}></ec-canvas> }
          { process.env.TARO_ENV === 'h5' && <div ref={h5chartNode} id="chart"></div> }
        </View>
      </View>
    </View>
  )
}

