import { View, Text, Image, ScrollView } from '@tarojs/components';
import React from 'react';
import './index.less';

/**
 * 新币上线组件
 * @param {boolean} showMore - 是否显示"查看更多"
 * @param {Array} data - 新币上线数据列表
 * @param {boolean} loading - 是否正在加载
 * @param {Function} onMoreClick - 点击"查看更多"的回调
 */
const NewCoinListing = ({ showMore = false, data = [], loading = false, onMoreClick }) => {
  const coinListings = data || [];

  return (
    <View className='new-coin-listing-wrapper'>
      {/* 标题头部（独立盒子，透明背景） */}
      <View className='new-coin-listing-header'>
        <Text className='header-title'>新币上线</Text>
        {showMore && <Text className='view-more' onClick={onMoreClick}>查看更多 {'>'}</Text>}
      </View>
      
      {/* 新币上线内容容器：横向滑动列表，每个盒子占屏幕 2/3 宽 */}
      <View className='new-coin-listing-container'>
        {loading ? (
          <View className='loading-state'>
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : coinListings.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-text'>暂无新币上线</Text>
          </View>
        ) : (
          <ScrollView
            className='new-coin-scroll'
            scrollX
            enableFlex
            showScrollbar={false}
            enhanced
          >
            {coinListings.map((coin, index) => {
              const isLast = index === coinListings.length - 1;
              // 适配多种字段格式
              const exchangeName = coin.exchanges || coin.exchange || coin.name;
              const exchangeIcon = coin.logoUrl || coin.exchangeIcon || coin.icon || 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/biannce.png';
              const listingTime = coin.ctime || coin.listingTime || coin.time;
              // 过滤 title 中末尾的日期部分（如 " - 2025-11-26"）
              const title = coin.title ? coin.title.replace(/\s*-\s*\d{4}-\d{2}-\d{2}$/, '') : '';
              const details = coin.deteil || coin.details || coin.description;
              const link = coin.link;
              
              return (
                <View className={`coin-item ${isLast ? 'last' : ''}`} key={coin.id || index}>
                  <View className='coin-info'>
                    <Image className='exchange-icon' src={exchangeIcon} mode='aspectFit' />
                    <Text className='exchange-name'>{exchangeName}</Text>
                    <Text className='listing-time'>{listingTime}</Text>
                  </View>
                  {title && <View className='coin-title'>{title}</View>}
                  {(details || link) && (
                    <View className='coin-link-container'>
                      <View className='coin-link'>详情:{details || link}</View>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default NewCoinListing;
