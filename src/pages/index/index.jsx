import { View, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro';
import IconFont from '../../components/iconfont';
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
      path: '跳转地址'
    }, {
      icon: 'bodongfenxi',
      text: '资金费率',
      path: '跳转地址'
    }, {
      icon: 'jiaoyichaxun',
      text: '成交额',
      path: '跳转地址'
    }]
  },
};

export default function Putcallratio() {

  const [ hot_coin, setHotCoin ] = useState(null);
  const [ hot_industry, setHotIndustry ] = useState(null);
  const [ hot_contract, setHotContract ] = useState(null);
  const [ coinLoading, setCoinLoading ] = useState(true);
  const [ industryLoading, setIndustryLoading ] = useState(true);
  const [ contractLoading, setContractLoading ] = useState(true);
  const [ my_own, setOwn ] = useState(null);
  const [ myOwnLoading, setMyOwnLoading ] = useState(true);

  useLoad(async () => {
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
    const self_select = await cardRequest(Interface.find_coin, {
      pageSize: 10,
      pageNo: 1
    });
    const temp_self_select = self_select.data.list.map((item) => {
      return {
        symbol: <View className='ownTitle'><Image className='ownImg' mode='aspectFit' src={item.url} />{item.symbol}</View>,
        currentPrice: item.currentPrice,
        priceChangePercentage24h: <HighlightArea value={item.priceChangePercentage24h}></HighlightArea>,
        totalVolume: item.totalVolume,
        own: <AddCollect symbol={item.symbol} isOwn={false} />,
        key: item.symbol
      };
    });
    setOwn(temp_self_select);
    setMyOwnLoading(false);
  });

  const cardRequest = async (url, data) => {
    const res = await request({
      url,
      data,
    });
    // setHotIndustry(res.data);
    return res;
  };

  const jump2Search = () => {
    jump2NoTab('search')
  };

  return (
    <View className='indexBox'>
      {/* 头部-搜索框 */}
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
      {/* <MoziCard
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
      </MoziCard> */}

      {/* 投资机会 */}
      <MoziCard
        title='投资机会'
        type='more'
        moreDesc='查看更多'
        callback={() => jump2Market('rank')}
      >
        <ScrollView scrollX scrollWithAnimation style={{whiteSpace: 'nowrap'}}>
          
          <div className='treemapBox' onClick={() => {jump2List({
            interFace: [Interface.hot_coin],
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
            interFace: [Interface.hot_contract],
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
            interFace: [Interface.hot_industry],
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
      <MoziCard
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
      </MoziCard>
    </View>
  )
}
