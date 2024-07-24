import { View, Text, Input, Button, Image } from '@tarojs/components'
import { useLoad, getCurrentInstance, useRouter } from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import { Card, List, Grid } from 'antd-mobile';
import IconFont from '../../components/iconfont';
import { Layout } from '../../components/Layout';
import { MoziCard } from '../../components/MoziCard';
import { MoziGrid } from '../../components/MoziGrid';
import { SearchInput } from '../../components/SearchInput';
import { AddCollect } from '../../components/AddCollect'; 
import { jump2Detail, jump2List } from '../../utils/core';
import { GardenLoading } from '../../components/Loading';
import { HighlightArea } from '../../components/HighlightArea';
import { isEmpty } from 'lodash';
import './index.less';
// let $instance = null;

export default function Search() {
  const [showType, setShowType] = useState('none');
  const [searchValue, setSearchValue] = useState('');

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
    const interfaceList = [Interface.COIN_INFO, Interface.COIN_AREA, Interface.COIN_PLATFORM];
    
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
        if (interfaceList[i] === Interface.COIN_INFO) {
          // 币种信息
          tempData = sectionRes.data.slice(0, 3).map((item) => {
            return {
              title: <View className='gridText'><Image className='girdIcon' mode='aspectFit' src={item.url} />{item.symbol}</View>,
              last: item.last,
              price24h: (<HighlightArea value={item.price24h} />),
              isOwn: (<AddCollect isOwn={item.isOwn} symbol={item.symbol} />),
              key: item.symbol
            };
          });
          setInfoData({
            length: sectionRes.data.length,
            data: [...tempData],
            loading: false,
            close: false
          });
          // setSectionType({
          //   ...sectionType,
          //   info: {
          //     ...sectionType.info,
          //     loading: false
          //   }
          // });
        }
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
              title: item.exchanges,
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
          tempData = sectionRes.data.slice(0, 3).map((item) => {
            return {
              title: <View className='gridText'><Image className='girdIcon' mode='aspectFit' src={item.url} />{item.symbol}</View>,
              last: item.last,
              price24h: item.price24h,
              isOwn: (<AddCollect isOwn={item.isOwn} symbol={item.symbol}  />),
              key: item.symbol
            };
          });
          // setSectionData({
          //   ...sectionData,
          //   infoData: tempData
          // });
        }
      } else {
        if (interfaceList[i] === Interface.COIN_INFO) {
          // 币种信息
          setInfoData({
            close: true
          });
          // setSectionType({
          //   ...sectionType,
          //   info: {
          //     ...sectionType.info,
          //     loading: false
          //   }
          // });
        }
        if (interfaceList[i] === Interface.COIN_AREA) {
          // 版块信息
          setAreaData({
            close: true
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
          setPlatformData({
            close: true
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
          // tempData = sectionRes.data.slice(0, 3).map((item) => {
          //   return {
          //     title: <View className='gridText'><Image className='girdIcon' mode='aspectFit' src={item.url} />{item.symbol}</View>,
          //     last: item.last,
          //     price24h: item.price24h,
          //     isOwn: (<AddCollect isOwn={item.isOwn} symbol={item.symbol}  />),
          //     key: item.symbol
          //   };
          // });
          // setSectionData({
          //   ...sectionData,
          //   infoData: tempData
          // });
        }
      }
      
    }

    // if (infoData.length === 0 && areaData.length === 0 && platformData.length === 0) {
    //   setShowType('invalid');
    // } else {
    //   setShowType('valid');
    // }
    

  };

  console.log('areaData', areaData);
  return (
    <View className='indexBox'>
      <View className='header'>
        <SearchInput reloadFun={reload} />
      </View>

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
                title='币种'
                sumNum={infoData.length}
                type={infoData.length > 3? 'more': null}
                // type='more'
                callback={() => {
                  jump2List({
                    interFace: [Interface.COIN_INFO],
                    requestData: {
                      coin: searchValue
                    },
                    gridTitle: ['名称', '最新价', '24H涨幅', '加自选'],
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
                      data: ['isOwn', 'symbol']
                    }, {
                      type: 'key',
                      data: 'symbol'
                    }],
                  });
                }}
              >
                <MoziGrid
                  length={4}
                  colName={['名称', '最新价', '24H涨幅', '加自选']}
                  gridContent={infoData.data}
                  callback={(gridCon) => {jump2Detail(gridCon.key)}}
                >
                </MoziGrid>
              </MoziCard>
            </Layout>
            {/* <Layout> */}
              <Layout isLoading={areaData.loading} isClose={areaData.close}>
                <MoziCard
                  title='相关版块'
                  sumNum={areaData.length}
                  type={areaData.length > 4? 'more': null}
                  callback={() => {
                    jump2List({
                      interFace: [Interface.COIN_AREA],
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
              <Layout isLoading={platformData.loading} isClose={platformData.close}>
                <MoziCard
                  title={`可交易${searchValue}平台`}
                  sumNum={platformData.length}
                  type={platformData.length > 3? 'more': null}
                  callback={() => {
                    jump2List({
                      interFace: [Interface.COIN_PLATFORM],
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
                  }}
                >
                  <MoziGrid
                    length={4}
                    colName={['平台', '所属链', '提取手续费', '最小提币量']}
                    gridContent={platformData.data}
                    callback={(gridCon) => {jump2Detail(gridCon.key)}}
                  >

                  </MoziGrid>
                </MoziCard>
              </Layout>
            {/* </Layout> */}
          </View>
        )
      }
      {/* {
        showType === 'loading' && <View className='no-search-box'><GardenLoading /></View>
      } */}
      {/* 可交易对 */}
      {/* <MoziCard
       title={area.tradingPair.title}
       sumNum={area.tradingPair.sumNum}
       type='more'
       callback={jump2List}
      >
        {
          area.tradingPair.list.map((pairItem) => {
            return (
              <MoziGrid
                length={pairItem.grid.length}
                colName={pairItem.grid}
                gridContent={pairItem.spotTradingPair}
                callback={(gridCon) => {jump2Detail(gridCon.key)}}
              ></MoziGrid>
            )
          })
        }
      </MoziCard> */}
    </View>
  )
}
