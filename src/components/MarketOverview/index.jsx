import { View, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useEffect, useState } from 'react';
import { jump2NoTab } from '../../utils/core';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import './index.less';

const CDN_PREFIX = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets';
const UpIcon = `${CDN_PREFIX}/icon/find/up.png`;
const DownIcon = `${CDN_PREFIX}/icon/find/down.png`;

const CoinIcon = `${CDN_PREFIX}/icon/find_slices/find-coin%402x.png`;
const TurnoverIcon = `${CDN_PREFIX}/icon/find_slices/find-vol%402x.png`;
const MarketMonitoringIcon = `${CDN_PREFIX}/icon/find_slices/find-watch%402x.png`;
const CalendarIcon = `${CDN_PREFIX}/icon/find_slices/find-calendar%402x.png`;

const MarketOverview = memo(({ data }) => {
  const [smartValue, setSmartValue] = useState('暂无配置');
  const [smartAction, setSmartAction] = useState('去配置');
  const [smartOnClick, setSmartOnClick] = useState(() => () => jump2NoTab('addwarn', { symbol: 'BTC' }));

  useEffect(() => {
    const init = async () => {
      try {
        const token = Taro.getStorageSync('token');
        if (!token) {
          setSmartValue('暂无配置');
          setSmartAction('去配置');
          setSmartOnClick(() => () => jump2NoTab('addwarn', { symbol: 'BTC' }));
          return;
        }
        const myWarnRes = await request({ url: Interface.MY_WARN });
        const groups = myWarnRes?.data || {};
        // 在所有币种里挑选：激活的告警中“最新配置”的那个币
        let chosenSymbol = null;
        let latestTs = -Infinity;
        Object.keys(groups || {}).forEach((symbol) => {
          const arr = groups[symbol]?.warnContent || [];
          arr.forEach((item, idx) => {
            if (item?.active) {
              const rawTs = item?.updatedAt || item?.updateTime || item?.time || item?.ts || item?.createTime || item?.createdAt;
              const parsedTs = rawTs ? Date.parse(rawTs) : NaN;
              // 若没有时间字段，使用索引作为近似顺序（越往后越新）
              const ts = Number.isFinite(parsedTs) ? parsedTs : idx;
              if (ts > latestTs) {
                latestTs = ts;
                chosenSymbol = symbol;
              }
            }
          });
        });

        const firstSymbol = chosenSymbol || Object.keys(groups)[0];
        if (!firstSymbol) {
          setSmartValue('暂无配置');
          setSmartAction('去配置');
          setSmartOnClick(() => () => jump2NoTab('addwarn', { symbol: 'BTC' }));
          return;
        }
        // 拉取该币的最近涨跌数据
        const priceRes = await request({ url: Interface.COIN_INFO, data: { coin: firstSymbol } });
        const list = Array.isArray(priceRes?.data) ? priceRes.data : (priceRes?.data ? [priceRes.data] : []);
        // 匹配字段兼容: symbol/coin/name，忽略大小写
        const priceItem = list.find((it) => String(it?.symbol || it?.coin || it?.name || '').toUpperCase() === String(firstSymbol).toUpperCase()) || list[0] || {};
        // 兼容可能带%或不带%的字符串
        const normalizePercent = (v) => {
          if (v === undefined || v === null || v === '') return undefined;
          const num = parseFloat(String(v).toString().replace('%',''));
          return Number.isFinite(num) ? num : undefined;
        };
        let percent = normalizePercent(priceItem?.priceChangePercent);
        if (percent === undefined) percent = normalizePercent(priceItem?.priceChangePercentage24h);
        if (percent === undefined) percent = normalizePercent(priceItem?.priceRange);
        if (percent === undefined) percent = normalizePercent(priceItem?.price_24h);
        // 若仍无百分比，尝试用开收盘计算
        if (percent === undefined || percent === null || percent === '') {
          const open = priceItem?.open ?? priceItem?.Open ?? priceItem?.first ?? priceItem?.o;
          const last = priceItem?.last ?? priceItem?.Close ?? priceItem?.close ?? priceItem?.c;
          if (Number.isFinite(open) && Number.isFinite(last) && Number(open) !== 0) {
            percent = ((last - open) / open) * 100;
          } else {
            percent = 0;
          }
        }
        // 兜底：若仍为 0 或 NaN，再调用详情头部接口读取 24H 百分比
        if (!Number.isFinite(percent) || Number(percent) === 0) {
          try {
            const headerRes = await request({ url: Interface.coin_info, data: { symbol: firstSymbol } });
            const p = headerRes?.data?.priceChangePercentage_24h;
            const parsed = normalizePercent(p);
            if (parsed !== undefined) {
              percent = parsed;
            }
          } catch (e) {
            // ignore
          }
        }
        const percentStr = `${Number(percent).toFixed(2)}%`;
        setSmartValue(`${firstSymbol} ${percentStr}`);
        setSmartAction('去配置');
        setSmartOnClick(() => () => jump2NoTab('addwarn', { symbol: firstSymbol }));
      } catch (e) {
        setSmartValue('暂无配置');
        setSmartAction('去配置');
        setSmartOnClick(() => () => jump2NoTab('addwarn', { symbol: 'BTC' }));
      }
    };
    init();
  }, []);
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
      value: smartValue,
      action: smartAction,
      onClick: () => smartOnClick()
    },
    {
      id: 'today',
      icon: CalendarIcon, /* 替换为新的图标 */
      iconColor: 'purple',
      title: '公告日历',
      value: '今日有更新',
      desc: '去订阅', /* 修改描述为去订阅 */
      isActionButton: true, /* 标记为按钮样式 */
      onClick: () => {
        try {
          Taro.switchTab({ url: '/pages/me/index' });
        } catch (e) {}
      }
    }
  ];

  const marketData = data || defaultData;
  // 不再过滤，全部展示
  const visibleMarketData = marketData || [];

  const renderValueWithPercentage = (value, extraClass = '') => {
    const regex = /([+-]?\d+\.?\d*%)/; // 匹配百分比，例如 +3.26%, -1.26%
    const match = value.match(regex);

    if (match) {
      const percentage = match[0];
      const nonPercentage = value.replace(percentage, '');
      const colorClass = 'positive';

      return (
        <>
          <View className='card-value-text'>{nonPercentage}</View>
          <View className={`card-value-percentage ${colorClass}`}>{percentage}</View>
        </>
      );
    } else {
      const isPlaceholder = value === '暂无配置';
      return <View className={`card-value-text ${extraClass} ${isPlaceholder ? 'card-value-placeholder' : ''}`}>{value}</View>;
    }
  };

  const handleCardClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
  };

  const isSingle = visibleMarketData.length === 1;

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
            {visibleMarketData.map((item) => (
              <View 
                key={item.id}
                className={`market-card ${isSingle ? 'single' : ''}`}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onClick();
                    }}
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
