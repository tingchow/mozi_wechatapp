import { View, Image, ScrollView, Button } from '@tarojs/components'
import Taro, { useLoad, useShareAppMessage } from '@tarojs/taro';
import IconFont from '../../components/iconfont';
import { Grid, TabBar} from 'antd-mobile';
import { useState } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import { MoziCard } from '../../components/MoziCard';
import { MoziGrid } from '../../components/MoziGrid';
import { SearchInput } from '../../components/SearchInput';
import { Layout } from '../../components/Layout';
import { AddCollect } from '../../components/AddCollect';
import { HighlightArea } from '../../components/HighlightArea';
import { MoziTreeMap } from '../../components/MoziChart/TreeMap';
import { PageLogin } from '../../components/PageLogin';
import { Popup } from '../../components/PopLogin'
import { jump2Detail, jump2Market, jump2List, jump2NoTab } from '../../utils/core';
import './index.less';

// 区块内容
const area = {
  derivativeArea: {
    title: '衍生品专区',
    list: [{
      icon: 'jijin',
      text: '多空比',
      // path: '跳转地址',
      callback: () => {jump2NoTab('putcallratio')}
    }, {
      icon: 'jifen',
      text: '持仓量',
      callback: () => {jump2NoTab('positionsize')}
    }, {
      icon: 'bodongfenxi',
      text: '资金费率',
      callback: () => {jump2NoTab('fundingrate')}
    }, {
      icon: 'jiaoyichaxun',
      text: '成交额',
      callback: () => {jump2NoTab('tradevol')}
    }]
  },
};

export default function Index() {

  const [ hot_coin, setHotCoin ] = useState(null);
  const [ hot_industry, setHotIndustry ] = useState(null);
  const [ hot_contract, setHotContract ] = useState(null);
  const [ coinLoading, setCoinLoading ] = useState(true);
  const [ industryLoading, setIndustryLoading ] = useState(true);
  const [ contractLoading, setContractLoading ] = useState(true);
  const [ my_own, setOwn ] = useState(null);
  const [ myOwnLoading, setMyOwnLoading ] = useState(true);
  const [ popVis, setPopVis ] = useState(false);
  const [ rankActiveKey, setRankActive ] = useState('zhangfu');

  // 自选接口、涨幅榜、跌幅榜、振幅榜、成交额榜、新币榜、飙升榜
  const footerIfList = [{
    interface: Interface.find_coin,
    data: {
      pageSize: 10,
      pageNo: 1
    }
  }, {
    interface: Interface.price_change,
    data: {
      dim: 'today'
    }
  }, {
    interface: Interface.PRICE_DOWNCHANGE,
    data: {
      dim: 'today'
    }
  }, {
    interface: Interface.price_wave,
    data: {
      dim: 'today'
    }
  }, {
    interface: Interface.coin_trade,
    data: {
      intervals: 'today'
    }
  }, 
  {
    interface: Interface.NEW_COIN,
    data: {}
  }, 
  {
    interface: Interface.PRICE_UPTRADE,
    data: {
      intervals: '7_day'
    }
  }];

  useLoad(async () => {

    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment']
    });

    // 热门币种
    const coin = await cardRequest(Interface.hot_coin, {
      pageSize: 10
    });
    setHotCoin(coin.data);
    setCoinLoading(false);
    // 热门版块
    const indusry = await cardRequest(Interface.hot_industry, {
      pageSize: 10
    });
    setHotIndustry(indusry.data);
    setIndustryLoading(false);
    // 热门合约
    const contract = await cardRequest(Interface.hot_contract, {
      pageSize: 10
    });
    setHotContract(contract.data);
    setContractLoading(false);
    
    // 自选
    // const self_select = await cardRequest(Interface.find_coin, {
    //   pageSize: 10,
    //   pageNo: 1
    // });
    // const temp_self_select = self_select.data.list.map((item) => {
    //   return {
    //     symbol: <View className='ownTitle'><Image className='ownImg' mode='aspectFit' src={item.url} />{item.symbol}</View>,
    //     currentPrice: item.currentPrice,
    //     priceChangePercentage24h: <HighlightArea value={item.priceChangePercentage24h}></HighlightArea>,
    //     totalVolume: item.totalVolume,
    //     own: <AddCollect symbol={item.symbol} isOwn={false} loginCb={() => {setPopVis(true)}} />,
    //     key: item.symbol
    //   };
    // });
    // setOwn(temp_self_select);
    // setMyOwnLoading(false);


    
   

    const tempFooterList = [];

    for (let i = 0; i < footerIfList.length; i++) {
      const itemListData = await cardRequest(footerIfList[i].interface, footerIfList[i].data);

      let tempData = null;
      if (i === 0) {
        // 自选榜，数据额外处理
        tempData = itemListData.data.list.map((item) => {
          return {
            symbol: <View className='ownTitle'><Image className='ownImg' mode='aspectFit' src={item.url} />{item.symbol}</View>,
            currentPrice: item.currentPrice,
            priceChange24h: <HighlightArea value={item.priceChangePercentage24h}></HighlightArea>,
            own: <AddCollect symbol={item.symbol} isOwn={item.favorite} loginCb={() => {setPopVis(true)}} />,
            key: item.symbol,
          };
        });
      } else {
        tempData = (itemListData.data?.slice(0, 10) || [] ).map((item) => {
          return {
            symbol: <View className='ownTitle'><Image className='ownImg' mode='aspectFit' src={item.url} />{item.symbol}</View>,
            last: item.last || item.volume_24h,
            priceRange: <HighlightArea value={item.priceRange || item.movers || item.price_24h}></HighlightArea>,
            own: <AddCollect symbol={item.symbol} isOwn={item.favorite} loginCb={() => {setPopVis(true)}} />,
            key: item.symbol
          }
        });
      }
      tempFooterList.push(tempData);
      
    }

    setFooterArr(tempFooterList);
    setFooterLoading(false);
  });

  useShareAppMessage(() => {
    return {
      title: '你能用微信盯盘啦！'
    };
  });

  const [footerArr, setFooterArr] = useState([]);
  const [footerLoading, setFooterLoading] = useState(true);

  const go2List = () => {
    const arrIndex = activeArr.indexOf(rankActiveKey);
    const requestdimData = [{
      dim: 'today'
    }, {
      dim: '1_day'
    }, {
      dim: '3_day'
    }, {
      dim: '7_day'
    }, {
      dim: '15_day'
    }, {
      dim: '1_month'
    }];
    const requestintervalData = [{
      intervals: 'today'
    }, {
      intervals: '1_day'
    }, {
      intervals: '3_day'
    }, {
      intervals: '7_day'
    }, {
      intervals: '15_day'
    }, {
      intervals: '1_month'
    }];
    const requestbiaoshengintervalsData = [{
      intervals: '1_day'
    }, {
      intervals: '3_day'
    }, {
      intervals: '7_day'
    }, {
      intervals: '15_day'
    }, {
      intervals: '1_month'
    }];
    const selectArr = ['今日', '1天', '3天', '7天', '15天', '1个月'];
    const selectbiaoshengArr = ['1天', '3天', '7天', '15天', '1个月'];
    // const  = footerArr[activeArr.indexOf(rankActiveKey)];
    jump2List({
      interFace: footerIfList[arrIndex].interface,
      requestData: arrIndex === 0? {
        pageSize: 100,
        pageNo: 1
      }: arrIndex === 4 || arrIndex === 5? requestintervalData : arrIndex === 6? requestbiaoshengintervalsData: requestdimData,
      gridTitle: colNameArr[arrIndex],
      gridCon: [{
        type: 'Img+Text',
        data: ['url', 'symbol']
      }, {
        type: 'Text',
        data: arrIndex === 0? 'currentPrice':  arrIndex === 6? 'movers': arrIndex === 5? 'volume_24h': 'last'
      }, {
        type: 'HighlightArea',
        data: arrIndex === 0? 'priceChangePercentage24h': arrIndex === 6? 'movers': arrIndex === 4 || arrIndex === 5 ? 'price_24h': 'priceRange'
      }, {
        type: 'AddCollect',
        data: ['favorite', 'symbol']
      }, {
        type: 'key',
        data: 'symbol'
      }, {
        type: 'img',
        data: 'url'
      }],
      rankTitle: activeArrValue[arrIndex],
      rankName: 'Top100',
      rankDesc: '实时更新',
      selectArr: arrIndex === 6? selectbiaoshengArr: selectArr
    });
  };
  const cardRequest = async (url, data) => {
    const res = await request({
      url,
      data,
    });
    // setHotIndustry(res.data);
    return res;
  };

  const handlePopupConfirm = () => {console.log(1)}

  const jump2Search = () => {
    jump2NoTab('search')
  };

  const rankActiveClick = (value) => {
    setRankActive(value);
  };

  const activeArr = ['zixuan', 'zhangfu', 'diefu', 'zhenfu', 'chengjiaoe', 'xinbi', 'biaosheng'];
  const activeArrValue = ['自选榜', '涨幅榜', '跌幅榜', '波幅榜', '成交额榜', '新币榜', '飙升榜'];
  const colNameArr = [
    ['币种', '最新价', '24小时幅度', '加自选'],
    ['币种', '最新价', '24小时幅度', '加自选'],
    ['币种', '最新价', '24小时幅度', '加自选'],
    ['币种', '最新价', '24小时幅度', '加自选'],
    ['币种', '最新成交额', '24小时幅度', '加自选'],
    ['币种', '最新价', '24小时幅度', '加自选'],
    ['币种', '最新价', '24小时幅度', '加自选']
  ];
  return (
    <View className='indexBox'>
      {/* 头部-搜索框 */}
      {/* <Button openType='contact'>测试-跟我聊天</Button> */}
      <View className='header' onClick={jump2Search}>
        <View className='searchBox'>
          <View className='searchIcon'>
            <IconFont name='search' size={30} />
          </View>
          <View className='searchInput'>请搜索币种</View>
          <View className='searchCancel'>
            <IconFont name='close-circle-fill' color='#b2b2b2' size={30} />
          </View>
        </View>
      </View>
      {/* 衍生品专区 */}
      <MoziCard
        title={area.derivativeArea.title}
      >
        <Grid columns={4}>
        {
          area.derivativeArea.list.map((item, index) => {
            return (
              <Grid.Item className='derivativeItem' onClick={item.callback}>
                <div className='derivativeIcon'>
                  <IconFont name={item.icon} size={50} />
                </div>
                <span>{item.text}</span>
              </Grid.Item>
            )
          })
        }
        </Grid>
      </MoziCard>

      {/* 投资机会 */}
      <MoziCard
        title='投资机会'
        type='more'
        moreDesc='查看更多'
        callback={() => jump2Market('rank')}
      >
        <ScrollView scrollX scrollWithAnimation style={{whiteSpace: 'nowrap'}}>
          
          <div className='treemapBox' onClick={() => {jump2List({
            interFace: Interface.hot_coin,
            gridTitle: ['币种', '热门指数', '24H价格变化'],
            gridCon: [{
              type: 'Text',
              data: 'coin'
            }, {
              type: 'Text',
              data: 'hot'
            }, {
              type: 'HighlightArea',
              data: 'priceChangePercent'
            }]
          })}}>
            <div className='treemapTitle'>热门币种</div>
            <Layout isLoading={coinLoading}>
              <MoziTreeMap
                list={hot_coin}
                name='coin'
                desc='priceChangePercent'
              />
            </Layout>
          </div>
          <div className='treemapBox' onClick={() => {jump2List({
            interFace: Interface.hot_contract,
            gridTitle: ['合约', '热门指数', '24H价格变化'],
            gridCon: [{
              type: 'Text',
              data: 'coin'
            }, {
              type: 'Text',
              data: 'hot'
            }, {
              type: 'HighlightArea',
              data: 'priceChangePercent'
            }]
          })}}>
            <div className='treemapTitle'>热门合约</div>
            <Layout isLoading={contractLoading}>
              <MoziTreeMap
                list={hot_contract}
                name='coin'
                desc='priceChangePercent'
              />
            </Layout>
          </div>
          <div className='treemapBox last' onClick={() => {jump2List({
            interFace: Interface.hot_industry,
            gridTitle: ['版块', '24H变化'],
            gridCon: [{
              type: 'Text',
              data: 'section'
            }, {
              type: 'HighlightArea',
              data: 'changes'
            }]
          })}}>
            <div className='treemapTitle'>热门版块</div>
            <Layout isLoading={industryLoading}>
              <MoziTreeMap
                // list={mock_hotbankuai.data}
                list={hot_industry}
                name='section'
                desc='changes'
              />
            </Layout>
          </div>
        </ScrollView>
      </MoziCard>

      {/* 自选 */}
      {/* <View className='own-box'> */}
        <MoziCard
          title='实时榜单'
          // type='more'
          // callback={() => jump2Market('market')}
        >
          <Layout isLoading={footerLoading}>
            <TabBar className='tab-box' activeKey={rankActiveKey} onChange={rankActiveClick}>
              <TabBar.Item key='zixuan' title='自选榜' />
              <TabBar.Item key='zhangfu' title='涨幅榜' />
              <TabBar.Item key='diefu' title='跌幅榜' />
              <TabBar.Item key='zhenfu' title='波幅榜' />
              <TabBar.Item key='chengjiaoe' title='成交额榜' />
              <TabBar.Item key='xinbi' title='新币榜' />
              <TabBar.Item key='biaosheng' title='飙升榜' />
            </TabBar>
            {
              footerArr.length > 0 && (
                <View>
                  <MoziGrid
                    length={4}
                    colName={colNameArr[activeArr.indexOf(rankActiveKey)]}
                    gridContent={footerArr[activeArr.indexOf(rankActiveKey)]}
                    callback={(gridCon) => {jump2Detail(gridCon.key)}}
                  />
                  <View className='list-more' onClick={go2List}>查看更多 <IconFont name='right' /></View>
                </View>
              )

              
            }
          </Layout>
        </MoziCard>
      {/* </View> */}
      {/* <MoziCard
        title='可能感兴趣'
        type='more'
        callback={() => jump2Market('market')}
      >
        <Layout isLoading={myOwnLoading}>
          <MoziGrid
            length={5}
            colName={['币种', '最新价', '24小时涨幅', '总交易额', '加自选']}
            gridContent={my_own}
            callback={(gridCon) => {jump2Detail(gridCon.key)}}
          />
        </Layout>
      </MoziCard> */}
      
    </View>
  )
}
