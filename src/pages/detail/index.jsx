import { View, Text, Input, Button, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad, getCurrentInstance, useRouter, useUnload } from '@tarojs/taro';
import { useEffect, useState, useRef } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import { PageLogin } from '../../components/PageLogin';
import { Card, List, Grid, CapsuleTabs, Tabs, TabBar } from 'antd-mobile';
import IconFont from '../../components/iconfont';
import { MoziCard } from '../../components/MoziCard';
import { MoziGrid } from '../../components/MoziGrid';
import { Layout } from '../../components/Layout';
import { handleOptions } from '../../components/MoziChart/options';
import { HighlightArea } from '../../components/HighlightArea';
import { AddCollect } from '../../components/AddCollect';
import { jump2List, jump2DataPage } from '../../utils/core';
import './index.less';
import * as echarts from '../../components/MoziChart/ec-canvas/echarts';
// import * as towxml from '../../components/towxml/towxml';
import towxml from '../../towxml';
import { isEmpty } from 'lodash';
// import '~taro-parse/dist/style/main.scss'
// import TaroParser from 'taro-parse'


const lineData = {
  hour: null,
  day: null,
  week: null,
  month: null,
};

// const aiData = {
//   hour: null,
//   day: null,
//   week: null,
//   month: null,
// };


export default function Detail() {

  const [activeKey, setActiveKey] = useState('hour');
  const [pageActiveKey, setPageActiveKey] = useState('chart');

  const [coinInfo, setCoinInfo] = useState(null);
  // const [coinLine, setCoinLine] = useState([]);
  // const [infoShowLeft, setInfoShowLeft] = useState([]);
  // const [infoShowRight, setInfoShowRight] = useState([]);
  // const [infoShowLeft, setInfoShowLeft] = useState([]);
  // const [infoShowLeft, setInfoShowLeft] = useState([]);

  const [coinInfoLeft, setCoinInfoLeft] = useState([]);
  const [coinInfoRight, setCoinInfoRight] = useState([]);
  const [coinMarket, setCoinMarket] = useState({
    length: 0,
    data: null
  });
  const [ai, setAi] = useState({
    loading: true,
    error: false,
    data: null
  });

  const [userStatus, setUserStatus] = useState('needAccount');

  const aiData = useRef({
    hour: null,
    day: null,
    week: null,
    month: null,
  });

  const chartData = useRef({
    hour: null,
    day: null,
    week: null,
    month: null,
    active: 'hour',
  });


  // 控制展开收起
  const [infoShow, setInfoShow] = useState(false);
  const [ popVis, setPopVis ] = useState(false);

  const chartRef = useRef(null)

  const initChart = (canvas, width, height, dpr) => {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // new
    });
    canvas.setChart(chart);


    chartRef.current = chart;

    return chart;
  }

  const ec = {
    onInit: initChart
  }
  


  
  console.log('useRouter().params.symbol', useRouter().params);
  const symbol = useRouter().params.symbol;

  useLoad(async () => {
    console.log('Page loaded.');
    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment']
    });
    // 头部信息
    const coin_info = await cardRequest(Interface.coin_info, {
      symbol
    });

    const coin_info_data = coin_info.data;

    // 动态设置标题
    Taro.setNavigationBarTitle({
      title: coin_info_data.name
    });

    const headerInfoLeft = [{
      name: '24H最高价',
      value: coin_info_data.high_24h
    },{
      name: '24H最低价',
      value: coin_info_data.low_24h
    },{
      name: '稀释市值',
      value: coin_info_data.fullyDilutedValuation
    },{
      name: '24H市值变化',
      value: coin_info_data.marketCapChange_24h
    },{
      name: '24H市值变化百分比',
      value: coin_info_data.marketCapChangePercentage_24h
    },{
      name: '历史最高价时间',
      value: coin_info_data.athDate
    },{
      name: '历史最低价时间',
      value: coin_info_data.atlDate
    }];

    const headerInfoRight = [{
      name: '24H成交额',
      value: coin_info_data.totalVolume
    },{
      name: '总供应量',
      value: coin_info_data.totalSupply
    },{
      name: '流通供应量',
      value: coin_info_data.circulatingSupply
    },{
      name: '历史最高价',
      value: coin_info_data.ath
    },{
      name: '历史最高价百分比',
      value: coin_info_data.athChangePercentage
    },{
      name: '历史最低价',
      value: coin_info_data.atl
    },{
      name: '历史最低价百分比',
      value: coin_info_data.atlChangePercentage
    }];

    setCoinInfoLeft(headerInfoLeft);
    setCoinInfoRight(headerInfoRight);

    setCoinInfo(coin_info.data);

    console.log('coin_info', coin_info);

    // k线图
    const coin_line1 = await cardRequest(Interface.coin_line, {
      symbol,
      type: 1
    });
    // setCoinLine(coin_line1.data);
    chartData.current.hour = {
      data: coin_line1.data,
      type: 'kline'
    };
    chartRef.current.setOption(handleOptions(coin_line1.data, 'kline'));
    lineData.hour = coin_line1.data;

    const coin_line2 = await cardRequest(Interface.coin_line, {
      symbol,
      type: 2
    });
    chartData.current.day = {
      data: coin_line2.data,
      type: 'kline'
    };
    lineData.day = coin_line2.data;
    const coin_line3 = await cardRequest(Interface.coin_line, {
      symbol,
      type: 3
    });
    chartData.current.week = {
      data: coin_line3.data,
      type: 'kline'
    };
    lineData.week = coin_line3.data;
    const coin_line4 = await cardRequest(Interface.coin_line, {
      symbol,
      type: 4
    });
    chartData.current.month = {
      data: coin_line4.data,
      type: 'kline'
    };
    lineData.month = coin_line4.data;

    // 市场
    const marketRes = await request({
      url: Interface.COIN_MARKET,
      data: {
        symbol
      }
    });

    if (!isEmpty(marketRes?.data)) {
      const tempData = marketRes.data.map((item) => {
        return {
          title: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{item.exchanges}</View>,
          last: item.last,
          price24h: <HighlightArea value={item.price24h} />,
          vol: item.vol,
          usd: item.usd
        }
      });

      setCoinMarket({
        length: tempData.length,
        data: tempData
      });
    }

    console.log('getAi数据');
    getAiData({});
  });

  useUnload(() => {
    chartRef.current.dispose();
  });

  const cardRequest = async (url, data) => {
    const res = await request({
      url,
      data,
    });
    // setHotIndustry(res.data);
    // console.log('响应信息', res);
    return res;
  };

  const changeShow = () => {
    setInfoShow(!infoShow);
  };

  const activeClick = async (value) => {
    if ( value ===  activeKey) return;
    console.log(value);
    chartData.current.active = value;
    setActiveKey(value);

    // console.log('coinLine', JSON.stringify(coinLineData));
    console.log('lineData', lineData);
    // setCoinLine(lineData[value]);
    chartRef.current.setOption(handleOptions(lineData[value], 'kline'));
    getAiData({activeKey: value});
  };

  const pageActiveClick = (value) => {
    console.log(value);
    setPageActiveKey(value);
    // if (value === 'ai') {
      
    //   return;
    // }
    
    let scrollClass = '';
    if (value === 'chart') {
      scrollClass = '.f2Box';
    } else if (value === 'ai') {
      scrollClass = '.ai-box';
    } else if (value === 'market') {
      scrollClass = '.marketBox';
    }
    Taro.pageScrollTo({
      selector: scrollClass
    });
  };

  const getAiData = async ({activeKey = 'hour'}) => {
    // if (isAccount === true) {
    //   setUserStatus(null);
    // } else {
    //   if (userStatus === 'needAccount') return;
    // }
    
    const typeObj = {
      hour: 1,
      day: 2,
      week: 3,
      month: 4
    };
    console.log('aiData.current', aiData.current);
    if (aiData.current[activeKey] !== null) {
      setAi({
        ...ai,
        loading: false,
        data: aiData.current[activeKey]
      });
      console.log('切换数据');
      return;
    } else {
      setAi({
        ...ai,
        loading: true,
      });
    }
    const aiRes = await cardRequest(Interface.AI_COIN, {
      symbol,
      type: typeObj[activeKey]
    });
    if (isEmpty(aiRes?.data)) {
      setAi({
        ...ai,
        loading: false,
        close: true,
      });
      return;
    }
    let mdRes = towxml(aiRes?.data,'markdown',{});
    aiData.current[activeKey] = mdRes;
    console.log('aiData[activeKey]', aiData.current[activeKey]);
    
    setAi({
      loading: false,
      data: mdRes
    });
  };

  const jump2Land = () => {
    jump2DataPage('landscapechart', 'chartData', chartData.current);
  };

  return (
    <View className='indexBox'>
      {/* 头部详情 */}
      <View className='box'>
        {
          coinInfo && (
            <View className='header'>
              <View className='headerBox'>
                <div className='left'>
                  <View className='coinInfo'>
                    <Image className='coinIcon' src={coinInfo.url} mode='aspectFit' />
                    <View className='coin-symbol'>{coinInfo.symbol}</View>
                    <View className='coin-price'>{coinInfo.currentPrice}</View>
                  </View>
                  {coinInfo.priceChange_24h.includes('-') ? (
                    <div className='caretBox'>
                      <IconFont name='caret-down' size={50} color='#ff3333' />
                      <View className='downPercent precentBox'>
                        <View className='priceItem'>{coinInfo.priceChange_24h}</View>
                        <View>({coinInfo.priceChangePercentage_24h})</View>
                        </View>
                    </div>
                    ): (
                      <div className='caretBox'>
                        <IconFont name='caret-up' size={50} color='#02c076' />
                        <View className='upPercent precentBox'>
                          <View className='priceItem'>{coinInfo.priceChange_24h}</View>
                          <View>({coinInfo.priceChangePercentage_24h})</View>
                        </View>
                      </div>
                    )
                  }
                </div>
                <div className='right'>
                  <View className='marketRank'>
                    {`No.${coinInfo.marketCapRank}`}
                  </View>
                  <View className='marketItem '>{`流通市值 ${coinInfo.marketCap}`}</View>
                  {/* <View className='marketItem'>{`稀释市值 ${coinInfo.fullyDilutedValuation}`}</View> */}
                </div>
              </View>
              {
                coinInfoLeft.length !== 0 && coinInfoRight.length !== 0 && (
                <View className='headerInfo'>
                  <View className='left'>
                    {
                      coinInfoLeft.slice(0,2).map((leftInfo) => {
                        return (
                          <View className='headerInfoItem'>
                            <View className='name'>{leftInfo.name}</View>
                            <View>{leftInfo.value}</View>
                          </View>
                        )
                      })
                    }
                  </View>
                  {/* <View className='center'></View> */}
                  <View className='right'>
                    {
                      coinInfoRight.slice(0,2).map((leftInfo) => {
                        return (
                          <View className='headerInfoItem'>
                            <View className='name'>{leftInfo.name}</View>
                            <View>{leftInfo.value}</View>
                          </View>
                        )
                      })
                    }
                  </View>
                </View>
                )
              }
              {
                infoShow && coinInfoLeft.length !== 0 && coinInfoRight.length !== 0 && (
                <View className='headerInfo'>
                  <View className='left'>
                    {
                      coinInfoLeft.slice(2).map((leftInfo) => {
                        return (
                          <View className='headerInfoItem'>
                            <View className='name'>{leftInfo.name}</View>
                            <View>{leftInfo.value}</View>
                          </View>
                        )
                      })
                    }
                  </View>
                  {/* <View className='center'></View> */}
                  <View className='right'>
                    {
                      coinInfoRight.slice(2).map((leftInfo) => {
                        return (
                          <View className='headerInfoItem'>
                            <View className='name'>{leftInfo.name}</View>
                            <View>{leftInfo.value}</View>
                          </View>
                        )
                      })
                    }
                  </View>
                </View>
                )
              }
              <View className='coin-info-caret' onClick={changeShow}>
                <IconFont name={`${infoShow? 'caret-up': 'caret-down'}`} size={30} />
              </View>
            </View>
          )
        }
        
      </View>
      
      {/* tab选择 */}
      <TabBar className='tabContainer' activeKey={pageActiveKey} onChange={pageActiveClick}>
        <TabBar.Item key='chart' title='图表' />
        <TabBar.Item key='ai' title='AI' />
        <TabBar.Item key='market' title='市场' />
        {/* <TabBar.Item key='comment' title='评论' /> */}
      </TabBar>


      {/* 折线图区域 */}
      <div className='box'>
        <div className='f2Box'>
          <TabBar className='chartTab' activeKey={activeKey} onChange={activeClick}>
            <TabBar.Item key='hour' title='小时' />
            <TabBar.Item key='day' title='日' />
            <TabBar.Item key='week' title='周' />
            <TabBar.Item key='month' title='月' />
          </TabBar>
          <View className='chartBox'>
            <View className='chart-arrawsalt' onClick={jump2Land}>
              <IconFont name='arrawsalt' size={30} color='#fff' />
            </View>
            <ec-canvas canvas-id="mychart-kline" ec={ec}></ec-canvas>
          </View>
          
        </div>
      </div>
      {/* AI解析 */}
      <View className='ai-box'>
        <MoziCard
          title='AI解析'
          // sumNum={coinMarket.length}
          // type='more'
          // callback={jump2List}
        >
        <Layout isLoading={ai.loading} isError={ai.error}>
          <ScrollView
            className='scroll-markdown'
            scrollY
          >
            {
              // @ts-ignore
              <towxml nodes={ai.data} />
            }
          </ScrollView>
        </Layout>
        </MoziCard>
      </View>
      


      {/* 市场行情 */}
      <View className='marketBox'>
        <Layout isLoading={coinMarket.length === 0}>
          <MoziCard
            title='市场'
            sumNum={coinMarket.length}
            // type='more'
            callback={jump2List}
          >
            <MoziGrid
              length={5}
              colName={['交易所', '最新价', '24H涨幅', '24H成交量', '24小时成交额']}
              gridContent={coinMarket.data}
              // callback={(gridCon) => {jump2Detail(gridCon.key)}}
            >

            </MoziGrid>
          </MoziCard>
        </Layout>
      </View>
      {/* <div className='marketBox'>
        <MoziCard
          title='市场'
          sumNum={4}
          type='more'
          callback={jump2List}
        >
          <MoziGrid
            length={5}
            colName={['交易所', '最新价', '24H涨幅', '24H成交量', '24小时成交额']}
            gridContent={marketData}
            // callback={(gridCon) => {jump2Detail(gridCon.key)}}
          >

          </MoziGrid>
        </MoziCard>
      </div> */}
      {/* 评论 */}
      {coinInfo?.symbol && (
        <View className='footer-list'>
          <View className='footer-item'>
            <AddCollect isOwn={coinInfo.isSelfSelected} symbol={coinInfo.symbol} />
            <View>加自选</View>
          </View>
          {/* <View className='footer-item'> */}
            <Button className='footer-item' openType='share'>
              <IconFont name='share' size={40} />
              <View>分享</View>
            </Button>
          {/* </View> */}
        </View>
      )}
      
      {/* <PageLogin show={popVis} hideCb={() => {setPopVis(false)}} /> */}
    </View>
  )
}




