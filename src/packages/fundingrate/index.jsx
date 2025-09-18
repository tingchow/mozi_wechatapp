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
import isEmpty from 'lodash/isEmpty';
import './index.less';

// const ratioArr = ['人数多空比', '大账户人数多空比', '持仓多空比', '大账户持仓多空比', '主动买卖量比'];
// const coinArr = ['BTC', 'BANANE'];

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
  const [showChart, setShowChart] = useState(true);
  // const [hisPCRData, setHisPCRData] = useState({
  //   loading: true,
  //   close: false,
  //   data: null
  // });

  

  const chartRef = useRef(null)
  const chartData = useRef(null)

  // 监听图表显示状态，重新设置数据
  useEffect(() => {
    if (showChart && chartRef.current && chartData.current) {
      setTimeout(() => {
        try {
          const options = handleOptions(chartData.current.data, chartData.current.type);
          // 为资金费率图表添加特殊的 grid 配置
          if (chartData.current.type === 'updownbarline') {
            options.grid = {
              left: '17%',
              right: '17%',
              top: '5%',
              bottom: '25%',
              containLabel: false
            };
            // 去掉纵坐标的$符号，但保留其他单位
            options.yAxis[0].axisLabel.formatter = (value) => {
              const originalFormat = chartData.current.data.yAxisLeftSlot?.replace('{}', value) ?? value;
              return originalFormat.replace(/\$/g, '');
            };
            options.yAxis[1].axisLabel.formatter = (value) => {
              const originalFormat = chartData.current.data.yAxisRightSlot?.replace('{}', value) ?? value;
              return originalFormat.replace(/\$/g, '');
            };
          }
          chartRef.current.setOption(options);
          console.log('图表数据重新设置完成');
        } catch (error) {
          console.log('重新设置图表数据失败:', error);
        }
      }, 50);
    }
  }, [showChart]);

  useShareAppMessage(() => {
    return {
      title: '你能用微信盯盘啦！'
    };
  });

  const initChart = (canvas, width, height, dpr) => {
    console.log('初始化图表');
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // new
    });
    canvas.setChart(chart);

    chartRef.current = chart;
    
    // 如果有数据，立即设置
    if (chartData.current) {
      const options = handleOptions(chartData.current.data, chartData.current.type);
      // 为资金费率图表添加特殊的 grid 配置
      if (chartData.current.type === 'updownbarline') {
        options.grid = {
          left: '17%',
          right: '17%',
          top: '5%',
          bottom: '25%',
          containLabel: false
        };
        // 去掉纵坐标的$符号，但保留其他单位
        options.yAxis[0].axisLabel.formatter = (value) => {
          const originalFormat = chartData.current.data.yAxisLeftSlot?.replace('{}', value) ?? value;
          return originalFormat.replace(/\$/g, '');
        };
        options.yAxis[1].axisLabel.formatter = (value) => {
          const originalFormat = chartData.current.data.yAxisRightSlot?.replace('{}', value) ?? value;
          return originalFormat.replace(/\$/g, '');
        };
      }
      chart.setOption(options);
      console.log('图表初始化时设置数据完成');
    }

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

  const onExchangeTabClick = (exchange) => {
    setCexSelected(exchange);
    getData({exchange});
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

    const options = handleOptions(frHisData.data, 'updownbarline');
    // 为资金费率图表添加特殊的 grid 配置
    options.grid = {
      left: '17%',
      right: '17%',
      top: '5%',
      bottom: '25%',
      containLabel: false
    };
    // 去掉纵坐标的$符号，但保留其他单位
    options.yAxis[0].axisLabel.formatter = (value) => {
      const originalFormat = frHisData.data.yAxisLeftSlot?.replace('{}', value) ?? value;
      return originalFormat.replace(/\$/g, '');
    };
    options.yAxis[1].axisLabel.formatter = (value) => {
      const originalFormat = frHisData.data.yAxisRightSlot?.replace('{}', value) ?? value;
      return originalFormat.replace(/\$/g, '');
    };
    chartRef.current.setOption(options);
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
      <View className='currentRateTitle'>当前费率</View>
      <View className='currentPCR'>
          
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
              !showMore && <View className='show-more-btn' onClick={() => {
                setShowMore(true);
                // 先隐藏图表
                setShowChart(false);
                // 延迟1秒后重新显示图表
                setTimeout(() => {
                  setShowChart(true);
                }, 100);
              }}>
                <View className='more'>查看更多</View>
                <IconFont name='caret-down' />
              </View>
            }
            {
              showMore && <View className='show-more-btn' onClick={() => {
                setShowMore(false);
                // 先隐藏图表
                setShowChart(false);
                // 延迟1秒后重新显示图表
                setTimeout(() => {
                  setShowChart(true);
                }, 100);
              }}>
                <View className='more'>收起</View>
                <IconFont name='caret-up' />
              </View>
            }
          </Layout>
          
        </View>
      </View>
      <View className='currentRateTitle'>历史费率</View>
      
      {/* 历史费率的选择器 */}
      <View className='pickerList'>
        <View className='picker-item coin-picker-white'>
          <View className='picker-title'>币种</View>
          <Picker mode='selector' range={coinArr} onChange={onCoinChange}>
            <View className='pickerSelect'>
              <View className='selectIcon'>{coinSelected}</View>
              <IconFont name='caret-down' />
            </View>
          </Picker>
        </View>
      </View>
      
      {/* 交易所Tab切换 */}
      <View className='exchange-tabs'>
        {cexArr.map((exchange, index) => (
          <View 
            key={index} 
            className={`exchange-tab ${cexSelected === exchange ? 'active' : ''}`}
            onClick={() => onExchangeTabClick(exchange)}
          >
            {exchange}
          </View>
        ))}
      </View>
      
      <View className='currentPCR hisFR'>
          
        {showChart && (
          <View className='currentChart'>
            <View className='chart-arrawsalt' onClick={jump2Land}>
              <IconFont name='arrawsalt' size={30} color='#fff' />
            </View>
            <ec-canvas className='chart' canvas-id="mychart-updownbarline" ec={{onInit: initChart}}></ec-canvas>
          </View>
        )}
      </View>
    </View>
  )
}

