import { View, Text, Image, ScrollView } from '@tarojs/components';
import React from 'react';
import './index.less';

const NewCoinListing = ({ showMore = false }) => {
  // 模拟新币上线数据
  const coinListings = [
    {
      id: 1,
      exchange: 'Binance',
      exchangeIcon: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/biannce.png',
      listingTime: '2025-05-07 10:00:10',
      details: 'Ravala (AVA)将上线 Bitget 创新区及WEB3区!',
      link: 'https://www.bitget.com/zh-CN/support/articles/1256060381977'
    },
    {
      id: 2,
      exchange: 'OKX',
      exchangeIcon: 'https://static.okx.com/cdn/assets/imgs/MjAyMTA0/6DF10C3FF1B4BCB6_2.png',
      listingTime: '2025-05-08 14:30:00',
      details: 'LayerZero (ZRO) 将上线 OKX 现货交易!',
      link: 'https://www.okx.com/support/hc/zh-cn/articles/18649384847757'
    },
    {
      id: 3,
      exchange: 'Bybit',
      exchangeIcon: 'https://static.bybit.com/web/v2/dist/assets/images/favicon.ico',
      listingTime: '2025-05-09 16:00:00',
      details: 'Polygon (POL) 将上线 Bybit 现货交易区!',
      link: 'https://announcements.bybit.com/article/pol-listing'
    }
  ];

  return (
    <View className='new-coin-listing-wrapper'>
      {/* 标题头部（独立盒子，透明背景） */}
      <View className='new-coin-listing-header'>
        <Text className='header-title'>新币上线</Text>
        {showMore && <Text className='view-more'>查看更多 {'>'}</Text>}
      </View>
      
      {/* 新币上线内容容器：横向滑动列表，每个盒子占屏幕 2/3 宽 */}
      <View className='new-coin-listing-container'>
        <ScrollView
          className='new-coin-scroll'
          scrollX
          enableFlex
          showScrollbar={false}
          enhanced
          // style={{ height: '1px' }}
        >
          {coinListings.map((coin, index) => {
            const isLast = index === coinListings.length - 1;
            return (
            <View className={`coin-item ${isLast ? 'last' : ''}`} key={coin.id}>
              <View className='coin-info'>
                <Image className='exchange-icon' src={coin.exchangeIcon} />
                <Text className='exchange-name'>{coin.exchange}</Text>
                <Text className='listing-time'>{coin.listingTime}</Text>
              </View>
              <Text className='coin-details'>{coin.details}</Text>
              <View className='coin-link-container'>
                <Text className='coin-link'>详情:{coin.link}</Text>
              </View>
            </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default NewCoinListing;
