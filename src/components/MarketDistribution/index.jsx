import { View, Text } from '@tarojs/components';
import { useState, useEffect } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import './index.less';

export function MarketDistribution({ title = '涨跌分布', showUpdateTime = true }) {
  // 直接使用useState管理恐慌贪婪指数
  const [fearGreedIndex, setFearGreedIndex] = useState(76);
  
  // 简单的点击处理函数
  const handleFearGreedClick = () => {
    setFearGreedIndex(100);
  };

  const [distributionData, setDistributionData] = useState({
    updateTime: '12.12 09:58 更新',
    chartData: [
      { range: '>10%', value: 106, type: 'up' },
      { range: '10-7', value: 106, type: 'up' },
      { range: '7-5', value: 76, type: 'up' },
      { range: '5-3', value: 76, type: 'up' },
      { range: '3-0', value: 3022, type: 'up' },
      { range: '0', value: 106, type: 'neutral' },
      { range: '0-3', value: 266, type: 'down' },
      { range: '3-5', value: 106, type: 'down' },
      { range: '5-7', value: 76, type: 'down' },
      { range: '7-10', value: 24, type: 'down' },
      { range: '>10%', value: 50, type: 'down' }
    ],
    statistics: {
      up: 1213,
      neutral: 106,
      down: 1213
    },
    btcMarketShare: {
      percentage: '54.30%',
      change: '+1.2%'
    }
  });

  const [loading, setLoading] = useState(false);

  // 获取最大值用于计算柱状图高度
  const maxValue = Math.max(...distributionData.chartData.map(item => item.value));

  // 获取颜色
  const getBarColor = (type) => {
    switch (type) {
      case 'up': return '#02c076';
      case 'down': return '#ff3333';
      case 'neutral': return '#999';
      default: return '#999';
    }
  };

  // 计算柱状图高度
  const getBarHeight = (value) => {
    return Math.max((value / maxValue) * 100, 5); // 最小高度5%
  };

  // 获取恐慌贪婪指数的颜色
  const getFearGreedColor = (index) => {
    if (index >= 75) return '#ff3333'; // 贪婪 - 红色
    if (index >= 50) return '#ffa500'; // 中性 - 橙色
    return '#02c076'; // 恐慌 - 绿色
  };

  // 获取恐慌贪婪指数的描述
  const getFearGreedText = (index) => {
    if (index >= 75) return '贪婪';
    if (index >= 50) return '中性';
    return '恐慌';
  };

  useEffect(() => {
    // 这里可以添加API请求逻辑
    // fetchMarketDistribution();
  }, []);

  const fetchMarketDistribution = async () => {
    try {
      setLoading(true);
      // const response = await request({
      //   url: Interface.MARKET_DISTRIBUTION
      // });
      // setDistributionData(response.data);
    } catch (error) {
      console.error('获取涨跌分布数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='market-distribution-wrapper'>
      {/* 标题区域 - 独立出来 */}
      <View className='distribution-header'>
        <View className='distribution-title'>{title}</View>
        {showUpdateTime && (
          <View className='distribution-update-time'>{distributionData.updateTime}</View>
        )}
      </View>

      {/* 内容区域 */}
      <View className='market-distribution-container'>
        <View className='market-distribution'>
        {/* 柱状图区域 */}
        <View className='chart-container'>
          <View className='chart-bars'>
            {distributionData.chartData.map((item, index) => (
              <View key={index} className='bar-item'>
                <View className='bar-value'>{item.value}</View>
                <View 
                  className='bar'
                  style={{
                    height: `${getBarHeight(item.value)}px`,
                    backgroundColor: getBarColor(item.type)
                  }}
                />
                <View className='bar-label'>{item.range}</View>
              </View>
            ))}
          </View>
        </View>

        {/* 统计信息 */}
        <View className='statistics-row'>
          <View className='stat-item up'>
            <View className='stat-icon'>▲</View>
            <View className='stat-text'>上涨 {distributionData.statistics.up}</View>
          </View>
          <View className='stat-item neutral'>
            <View className='stat-text'>平 {distributionData.statistics.neutral}</View>
          </View>
          <View className='stat-item down'>
            <View className='stat-icon'>▼</View>
            <View className='stat-text'>下跌 {distributionData.statistics.down}</View>
          </View>
        </View>
        </View>
      </View>
      {/* 底部指标 */}
      <View className='indicators-row'>
          {/* 恐慌贪婪指数 */}
          <View className='indicator-item'>
            <View className='indicator-header'>
              <Text className='indicator-title'>恐慌贪婪指数</Text>
              <View className='info-icon'>ⓘ</View>
            </View>
            <View className='fear-greed-container'>
              <View className='fear-greed-chart'>
                <View 
                  className='fear-greed-semicircle'
                  onClick={handleFearGreedClick}
                >
                  <View className='fear-greed-inner'>
                    <View className='fear-greed-value'>{fearGreedIndex}</View>
                    <View className='fear-greed-text'>{getFearGreedText(fearGreedIndex)}</View>
                  </View>
                  <View 
                    className='fear-greed-ball'
                    style={{
                      transform: `translateX(-50%) rotate(${-90 + (fearGreedIndex / 100) * 180}deg)`
                    }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* BTC市场占有率 */}
          <View className='indicator-item'>
            <View className='indicator-header'>
              <Text className='indicator-title'>BTC市场占有率</Text>
              <View className='info-icon'>ⓘ</View>
            </View>
            <View className='btc-market-share'>
              <View className='btc-percentage'>{distributionData.btcMarketShare.percentage}</View>
              <View className='btc-change up'>
                <View className='change-icon'>▲</View>
                <View className='change-text'>{distributionData.btcMarketShare.change}</View>
              </View>
            </View>
          </View>
        </View>
    </View>
  );
}
