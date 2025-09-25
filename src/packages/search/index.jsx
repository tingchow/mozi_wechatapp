import { View, Text, Input, Button, Image, PageContainer } from '@tarojs/components'
import Taro, { useLoad, getCurrentInstance, useRouter, useShareAppMessage, useDidShow, useDidHide } from '@tarojs/taro';
import { useEffect, useState, useRef } from 'react';
import { request } from '../../utils/request';
import { Interface, LOOPTIME } from '../../utils/constants';
import { Card, List, Grid } from 'antd-mobile';
import IconFont from '../../components/iconfont';
import { Layout } from '../../components/Layout';
import { MoziCard } from '../../components/MoziCard';
import { MoziGrid } from '../../components/MoziGrid';
import { SearchInput } from '../../components/SearchInput';
import { AddCollect } from '../../components/AddCollect';
import { AddMonitor } from '../../components/AddMonitor';
import { jump2Detail, jump2List } from '../../utils/core';
import { GardenLoading } from '../../components/Loading';
import { HighlightArea } from '../../components/HighlightArea';
import { PageLogin } from '../../components/PageLogin';
import isEmpty from 'lodash/isEmpty';
const leftArrowIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/left-arrow.png';
import './index.less';
// let $instance = null;

// 页面配置 - 使用自定义导航栏
definePageConfig({
  navigationStyle: 'custom'
})

export default function Search() {
  const [showType, setShowType] = useState('none');
  const [searchValue, setSearchValue] = useState('');
  const [systemInfo, setSystemInfo] = useState({ statusBarHeight: 44, navigationBarHeight: 88 });

  const [infoData, setInfoData] = useState({
    length: 0,
    data: null,
    loading: true,
    close: false
  });
  
  const [areaData, setAreaData] = useState({
    length: 0,
    data: null,
    loading: true,
    close: false
  });
  const [platformData, setPlatformData] = useState({
    length: 0,
    data: null,
    loading: true,
    close: false
  });
  const [spotData, setSpotData] = useState({
    length: 0,
    data: null,
    loading: true,
    close: false
  });

  const needLoop = useRef(true);

  useDidShow(() => {
    needLoop.current = true;
  });

  useDidHide(() => {
    needLoop.current = false;
  });

  const coinRequest = async (value) => {
    const sectionRes = await request({
      url: Interface.COIN_INFO,
      data: {
        coin: value
      }
    });
    let tempData = null
    // 币种信息
    tempData = sectionRes.data.slice(0, 3).map((item) => {
      return {
        title: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} /><View className='gridName'>{item.symbol}</View></View>,
        last: item.last,
        price24h: (<HighlightArea value={item.price24h} />),
        isOwn: (<AddCollect isOwn={item.favorite} symbol={item.symbol} />),
        monitor: <AddMonitor symbol={item.symbol} />,
        key: item.symbol
      };
    });
    console.log(tempData, tempData);
    setInfoData({
      length: sectionRes.data.length,
      data: [...tempData],
      loading: false,
      close: false
    });

    setTimeout(() => {
      if (needLoop.current) coinRequest(value);
    }, LOOPTIME);
  };

  const reload = async (value) => {
    setSearchValue(value);
    // setShowType('loading');
    setShowType('valid');
    const isCoin = await request({
      url: Interface.IS_COIN,
      data: {
        coin: value
      }
    });
    if (!isCoin?.data?.isCoin) {
      setShowType('invalid');
      return;
    }

    // 正确的币种，继续请求各模块信息
    // const interfaceList = [Interface.COIN_INFO, Interface.COIN_SECTION, Interface.COIN_PLATFORM, Interface.COIN_SPOT];
    coinRequest(value);
    const interfaceList = [Interface.COIN_AREA, Interface.COIN_PLATFORM, Interface.COIN_SPOT];
    
    for (let i = 0; i < interfaceList.length; i++) {
      const sectionRes = await request({
        url: interfaceList[i],
        data: {
          coin: value
        }
      });
      let tempData = null;
      
      if (!isEmpty(sectionRes?.data)) {
        console.log(i, sectionRes);
        // if (interfaceList[i] === Interface.COIN_INFO) {
        //   // 币种信息
        //   tempData = sectionRes.data.slice(0, 3).map((item) => {
        //     return {
        //       title: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} /><View className='gridName'>{item.symbol}</View></View>,
        //       last: item.last,
        //       price24h: (<HighlightArea value={item.price24h} />),
        //       isOwn: (<AddCollect isOwn={item.favorite} symbol={item.symbol} />),
        //       monitor: <AddMonitor symbol={item.symbol} />,
        //       key: item.symbol
        //     };
        //   });
        //   setInfoData({
        //     length: sectionRes.data.length,
        //     data: [...tempData],
        //     loading: false,
        //     close: false
        //   });
        //   // setSectionType({
        //   //   ...sectionType,
        //   //   info: {
        //   //     ...sectionType.info,
        //   //     loading: false
        //   //   }
        //   // });
        // }
        if (interfaceList[i] === Interface.COIN_AREA) {
          // 版块信息
          tempData = sectionRes.data.slice(0, 4);
          setAreaData({
            length: sectionRes.data.length,
            data: [...tempData],
            loading: false,
            close: false
          });
          // setSectionType({
          //   ...sectionType,
          //   area: {
          //     ...sectionType.area,
          //     loading: false
          //   }
          // });
        }
        if (interfaceList[i] === Interface.COIN_PLATFORM) {
          // 可交易平台信息
          tempData = sectionRes.data.slice(0, 3).map((item) => {
            return {
              title: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} /><View className='gridName'>{item.exchanges}</View></View>,
              chain: item.chain,
              withdrawfee: item.withdrawfee,
              withdrawmin: item.withdrawmin,
              // key: item.symbol
            };
          });
          setPlatformData({
            length: sectionRes.data.length,
            data: [...tempData],
            loading: false,
            close: false
          });
          // setSectionType({
          //   ...sectionType,
          //   platform: {
          //     ...sectionType.platform,
          //     loading: false
          //   }
          // });
        }
        if (interfaceList[i] === Interface.COIN_SPOT) {
          // 交易对信息
          const spotArr = [];
          if (!isEmpty(sectionRes.data?.spot)) {
            tempData = sectionRes.data.spot.slice(0, 3).map((item) => {
              return {
                title: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} /><View className='gridName'>{item.symbol}</View></View>,
                symbol: item.exchanges,
                lasts: item.lasts,
                price24h: <HighlightArea value={item.price24h} />,
              };
            });
            spotArr.push(tempData);
          }
          if (!isEmpty(sectionRes.data?.nonSpot)) {
            tempData = sectionRes.data.nonSpot.slice(0, 3).map((item) => {
              return {
                title: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} /><View className='gridName'>{item.symbol}</View></View>,
                symbol: item.exchanges,
                lasts: item.lasts,
                price24h: <HighlightArea value={item.price24h} />,
              };
            });
            spotArr.push(tempData);
          }
          console.log('spotArr', spotArr);
          setSpotData({
            length: sectionRes.data.spot.length > 3 || sectionRes.data.nonSpot.length > 3 ? 'more': false,
            data: spotArr,
            loading: false,
            close: false
          });
        }
      } else {
        if (interfaceList[i] === Interface.COIN_INFO) {
          // 币种信息
          setInfoData({
            close: true
          });
        }
        if (interfaceList[i] === Interface.COIN_AREA) {
          // 版块信息
          setAreaData({
            close: true
          });
        }
        if (interfaceList[i] === Interface.COIN_PLATFORM) {
          // 可交易平台信息
          setPlatformData({
            close: true
          });
        }
        if (interfaceList[i] === Interface.COIN_SPOT) {
          // 交易对信息
          setSpotData({
            close: true
          });
        }
      }
      
    }

    // if (infoData.length === 0 && areaData.length === 0 && platformData.length === 0) {
    //   setShowType('invalid');
    // } else {
    //   setShowType('valid');
    // }
    

  };

  useShareAppMessage(() => {
    return {
      title: '你能用微信盯盘啦！'
    };
  });

  // 获取系统信息
  useEffect(() => {
    Taro.getSystemInfo({
      success: (res) => {
        const menuButtonInfo = Taro.getMenuButtonBoundingClientRect();
        setSystemInfo({
          statusBarHeight: res.statusBarHeight,
          navigationBarHeight: menuButtonInfo.top + menuButtonInfo.height + (menuButtonInfo.top - res.statusBarHeight)
        });
      }
    });
  }, []);

  const spotColNameList = [
    [<Text className='pair-title-strong'>现货交易对</Text>, '交易所', '最新价', '24H变化'],
    [<Text className='pair-title-strong'>衍生品交易对</Text>, '交易所', '最新价', '24H变化'],
  ];

  console.log('spotData', spotData);
  return (
    <View className='indexBox'>
      {/* 自定义导航栏和搜索区域 */}
      <View className='top-area' style={{ paddingTop: `${systemInfo.statusBarHeight}px` }}>
        {/* 自定义导航栏 */}
        <View className='custom-navbar'>
          <View className='navbar-left' onClick={() => Taro.switchTab({ url: '/pages/index/index' })}>
            <Image src={leftArrowIcon} className='navbar-left-icon' />
          </View>
          <View className='navbar-title'>搜索</View>
          <View className='navbar-right'>
            <IconFont name='more' size={28} color='#ffffff' />
          </View>
        </View>
        
        {/* 搜索框区域 */}
        <View className='header'>
          <SearchInput reloadFun={reload} />
        </View>
        
          <View className='coin-header-info'>
          {showType === 'valid' && (
            <View className='coin-header-item' onClick={() => {
              if (infoData.length > 3) {
                jump2List({
                  showHeader: true,
                  rankTitle: searchValue,
                  interFace: Interface.COIN_INFO,
                  requestData: {
                    coin: searchValue
                  },
                  gridTitle: ['名称', '最新价', '24H涨幅', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'last'
                  }, {
                    type: 'HighlightArea',
                    data: 'price24h'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  }, {
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }],
                });
              }
                }}>
                  币种({infoData.length})
                  {infoData.length > 3 && <IconFont name='right' size={24} color='#666666' />}
                </View>
          )}
          </View>
        </View>

      <View className='content-area'>
        {
          showType === 'none' && <View className='no-search-box'>请输入您想搜索的币种</View>
        }
        {
          showType === 'invalid' && <View className='no-search-box'>请输入正确的币种</View>
        }
        {
          showType === 'valid' && (
            <View className='search-box'>
            {/* 币种 */}
            <Layout isLoading={infoData.loading} isClose={infoData.close}>
              <MoziCard
                type={infoData.length > 3? 'more': null}
                // type='more'
                callback={() => {
                  jump2List({
                    showHeader: true,
                    rankTitle: searchValue,
                    interFace: Interface.COIN_INFO,
                    requestData: {
                      coin: searchValue
                    },
                    gridTitle: ['名称', '最新价', '24H涨幅', '加自选', '加监控'],
                    gridCon: [{
                      type: 'Img+Text',
                      data: ['url', 'symbol']
                    }, {
                      type: 'Text',
                      data: 'last'
                    }, {
                      type: 'HighlightArea',
                      data: 'price24h'
                    }, {
                      type: 'AddCollect',
                      data: ['favorite', 'symbol']
                    }, {
                      type: 'AddMonitor',
                      data: 'symbol'
                    },{
                      type: 'key',
                      data: 'symbol'
                    }],
                  });
                }}
              >
                <MoziGrid
                  length={5}
                  colName={['名称', '最新价', '24H涨幅', '加自选', '加监控']}
                  gridContent={infoData.data}
                  gridTitleBgColor="transparent"
                  callback={(gridCon) => {jump2Detail(gridCon.key)}}
                >
                </MoziGrid>
              </MoziCard>
            </Layout>
            {!areaData.close && (
              <View className='header-info'>
                <View className='header-info-item' onClick={() => {
                  if (areaData.length > 4) {
                    jump2List({
                      showHeader: true,
                      rankTitle: searchValue,
                      interFace: Interface.COIN_AREA,
                      requestData: {
                        coin: searchValue
                      },
                      gridTitle: ['币种', '版块', '涨幅'],
                      gridCon: [{
                        type: 'Img+Text',
                        data: ['url', 'coin']
                      }, {
                        type: 'Text',
                        data: 'section'
                      }, {
                        type: 'HighlightArea',
                        data: 'changes'
                      }],
                    });
                  }
                }}>
                  相关版块({areaData.length})
                  {areaData.length > 4 && <IconFont name='right' size={24} color='#666666' />}
                </View>
              </View>
            )}
            <Layout isLoading={areaData.loading} isClose={areaData.close}>
              <MoziCard
                type={areaData.length > 4? 'more': null}
                callback={() => {
                  jump2List({
                    showHeader: true,
                    rankTitle: searchValue,
                    interFace: Interface.COIN_AREA,
                    requestData: {
                      coin: searchValue
                    },
                    gridTitle: ['币种', '版块', '涨幅'],
                    gridCon: [{
                      type: 'Img+Text',
                      data: ['url', 'coin']
                    }, {
                      type: 'Text',
                      data: 'section'
                    }, {
                      type: 'HighlightArea',
                      data: 'changes'
                    }],
                  });
                }}
              >
                <View className='area-flex'>
                {
                  areaData.data && areaData.data.map((item) => {
                    return <HighlightArea title={item.section} value={item.changes} />
                  })
                }
                </View>
              </MoziCard>
            </Layout>
            {!platformData.close && (
              <View className='header-info'>
                <View className='header-info-item' onClick={() => {
                  if (platformData.length > 3) {
                    jump2List({
                      showHeader: true,
                      rankTitle: `可交易${(searchValue || '').toUpperCase()}平台`,
                      fromPlatform: true,
                      searchCoin: searchValue,
                      interFace: Interface.COIN_PLATFORM,
                      requestData: {
                        coin: searchValue
                      },
                      gridTitle: ['交易所', '链', '提取手续费', '最小提币量'],
                      gridCon: [{
                        type: 'Img+Text',
                        data: ['url', 'exchanges']
                      }, {
                        type: 'Text',
                        data: 'chain'
                      }, {
                        type: 'Text',
                        data: 'withdrawfee'
                      }, {
                        type: 'Text',
                        data: 'withdrawmin'
                      }],
                    });
                  }
                }}>
                  可交易{searchValue}平台({platformData.length})
                  {platformData.length > 3 && <IconFont name='right' size={24} color='#666666' />}
                </View>
              </View>
            )}
            <Layout isLoading={platformData.loading} isClose={platformData.close}>
              <MoziCard
                bodyClassName='clickable-card'
                onClick={() => {
                  jump2List({
                    showHeader: true,
                    rankTitle: `可交易${(searchValue || '').toUpperCase()}平台`,
                    fromPlatform: true,
                    searchCoin: searchValue,
                    interFace: Interface.COIN_PLATFORM,
                    requestData: { coin: searchValue },
                    gridTitle: ['交易所', '链', '提取手续费', '最小提币量'],
                    gridCon: [
                      { type: 'Img+Text', data: ['url', 'exchanges'] },
                      { type: 'Text', data: 'chain' },
                      { type: 'Text', data: 'withdrawfee' },
                      { type: 'Text', data: 'withdrawmin' }
                    ]
                  });
                }}
              >
                <MoziGrid
                  length={4}
                  colName={['平台', '所属链', '提取手续费', '最小提币量']}
                  gridContent={platformData.data}
                  gridTitleBgColor="transparent"
                >
                </MoziGrid>
              </MoziCard>
            </Layout>
            {!spotData.close && (
              <View className='header-info'>
                <View className='header-info-item' onClick={() => {
                  jump2List({
                    showHeader: true,
                    rankTitle: `${(searchValue || '').toUpperCase()}交易对`,
                    interFace: Interface.COIN_SPOT,
                    requestData: {
                      coin: searchValue
                    },
                    rankName: '交易对',
                    selectArr: ['现货交易对', '衍生品交易对'],
                    reponseData: ['spot', 'nonSpot'],
                    gridTitle: ['交易对', '交易所', '最新价', '24H变化'],
                    gridCon: [{
                      type: 'Img+Text',
                      data: ['url', 'exchanges']
                    }, {
                      type: 'Text',
                      data: 'symbol'
                    }, {
                      type: 'Text',
                      data: 'lasts'
                    }, {
                      type: 'HighlightArea',
                      data: 'price24h'
                    }, {
                      type: 'img',
                      data: 'url'
                    }],
                  });
                }}>
                  交易对
                  <IconFont name='right' size={24} color='#666666' />
                </View>
              </View>
            )}
            <Layout isLoading={spotData.loading} isClose={spotData.close}>
              <MoziCard
                onClick={() => {
                  jump2List({
                    showHeader: true,
                    rankTitle: `${(searchValue || '').toUpperCase()}交易对`,
                    interFace: Interface.COIN_SPOT,
                    requestData: { coin: searchValue },
                    rankName: '交易对',
                    selectArr: ['现货交易对', '衍生品交易对'],
                    reponseData: ['spot', 'nonSpot'],
                    gridTitle: ['交易对', '交易所', '最新价', '24H变化'],
                    gridCon: [
                      { type: 'Img+Text', data: ['url', 'exchanges'] },
                      { type: 'Text', data: 'symbol' },
                      { type: 'Text', data: 'lasts' },
                      { type: 'HighlightArea', data: 'price24h' },
                      { type: 'img', data: 'url' }
                    ]
                  });
                }}
              >
                {
                  spotData?.data && spotData.data.map((pairItem, pairIndex) => {
                    
                    return (
                      <MoziGrid
                        length={4}
                        colName={spotColNameList[pairIndex]}
                        gridContent={pairItem}
                        gridTitleBgColor="transparent"
                        // callback={(gridCon) => {jump2Detail(gridCon.key)}}
                      ></MoziGrid>
                    )
                  })
                }
              </MoziCard>
            </Layout>
            </View>
          )
        }
      </View>
      {/* <PageLogin show={popVis} hideCb={() => {setPopVis(false)}} /> */}
    </View>
  )
}
