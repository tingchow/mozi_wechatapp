import { View, ScrollView, Image } from '@tarojs/components';
import { memo } from 'react';
import { jump2NoTab } from '../../utils/core';
import './index.less';

const CDN_PREFIX = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets';
const UpIcon = `${CDN_PREFIX}/icon/find/up.png`;
const DownIcon = `${CDN_PREFIX}/icon/find/down.png`;

const CoinIcon = `${CDN_PREFIX}/icon/find_slices/find-coin%402x.png`;
const TurnoverIcon = `${CDN_PREFIX}/icon/find_slices/find-vol%402x.png`;
const MarketMonitoringIcon = `${CDN_PREFIX}/icon/find_slices/find-watch%402x.png`;
const CalendarIcon = `${CDN_PREFIX}/icon/find_slices/find-calendar%402x.png`;

const MarketOverview = memo(({ data }) => {
  // 默认数据
  const defaultData = [
    {
      id: 'total-market-cap',
      icon: CoinIcon, /* 替换为新的图标 */
      iconColor: 'green',
      title: '加密总市值',
      value: '$213215亿',
      change: '+3.26%',
      changeType: 'positive'
    },
    {
      id: 'volume',
      icon: TurnoverIcon, /* 替换为新的图标 */
      iconColor: 'blue', 
      title: '成交量',
      value: '$412.32亿',
      change: '-1.26%',
      changeType: 'negative'
    },
    {
      id: 'smart-order',
      icon: MarketMonitoringIcon, /* 替换为新的图标 */
      iconColor: 'orange',
      title: '智能盯盘',
      value: 'BTC +3%',
      action: '去配置',
      onClick: () => {
        // 智能订盘点击事件 - 跳转到配置告警页面，默认使用BTC
        jump2NoTab('addwarn', { symbol: 'BTC' });
      }
    },
    {
      id: 'today',
      icon: CalendarIcon, /* 替换为新的图标 */
      iconColor: 'purple',
      title: '公告日日历',
      value: '今日有更新',
      desc: '去订阅', /* 修改描述为去订阅 */
      isActionButton: true, /* 标记为按钮样式 */
      onClick: () => {
        console.log('跳转到订阅页面');
      }
    }
  ];

  const marketData = data || defaultData;

  const renderValueWithPercentage = (value, extraClass = '') => {
    const regex = /([+-]?\d+\.?\d*%)/; // 匹配百分比，例如 +3.26%, -1.26%
    const match = value.match(regex);

    if (match) {
      const percentage = match[0];
      const nonPercentage = value.replace(percentage, '');
      const isPositive = parseFloat(percentage) > 0;
      const colorClass = isPositive ? 'positive' : 'negative';

      return (
        <>
          <View className='card-value-text'>{nonPercentage}</View>
          <View className={`card-value-percentage ${colorClass}`}>{percentage}</View>
        </>
      );
    } else {
      return <View className={`card-value-text ${extraClass}`}>{value}</View>;
    }
  };

  const handleCardClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <View className='market-overview'>
      <ScrollView 
        scrollX 
        scrollWithAnimation 
        className="market-cards-scroll"
        style={{whiteSpace: 'nowrap'}}
      >
        <View className='market-cards-content'>
          <View className='market-cards'>
            {marketData.map((item) => (
              <View 
                key={item.id}
                className='market-card'
                onClick={() => handleCardClick(item)}
              >
                <View className='card-header'>
                  <View className='card-icon'>
                    <View className={`icon-circle ${item.iconColor}`}>
                      <Image src={item.icon} className='icon-image' mode='aspectFit' />
                    </View>
                  </View>
                  <View className='card-title'>{item.title}</View>
                </View>
                
                <View className='card-info'>
                  <View className='card-value'>
                    {renderValueWithPercentage(
                      item.value,
                      (item.id === 'today' && String(item.value).includes('今日有更新')) ? 'today-updated' : ''
                    )}
                  </View>
                </View>
                {item.change && (
                  <View className={`card-change ${item.changeType}`}>
                    {item.changeType === 'positive' && <Image src={UpIcon} className='change-icon' />}
                    {item.changeType === 'negative' && <Image src={DownIcon} className='change-icon' />}
                    {item.change}
                  </View>
                )}
                {item.action && (
                  <View 
                    className='card-action'
                    onClick={item.onClick}
                  >
                    {item.action}
                  </View>
                )}
                {item.desc && (
                  <View 
                    className={`card-desc ${item.isActionButton ? 'card-action-button' : ''}`}
                    onClick={item.onClick}
                  >
                    {item.desc}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

MarketOverview.displayName = 'MarketOverview';

export { MarketOverview };
