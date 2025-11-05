import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import InfoPopup from '../InfoPopup';
const CDN_PREFIX = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets';
const warnIcon = `${CDN_PREFIX}/icon/warn.png`;
import './index.less';

export function MarketDistribution({ title = '涨跌分布', showUpdateTime = true }) {
  // 恐慌贪婪指数
  const [fearGreedIndex, setFearGreedIndex] = useState(0);
  const [fearGreedCategory, setFearGreedCategory] = useState('加载中...');
  
  // 弹窗状态
  const [fearGreedPopupVisible, setFearGreedPopupVisible] = useState(false);
  const [btcPopupVisible, setBtcPopupVisible] = useState(false);
  
  // 点击信息图标显示说明
  const handleFearGreedInfoClick = () => {
    setFearGreedPopupVisible(true);
  };

  // 点击BTC市场占有率信息图标
  const handleBTCInfoClick = () => {
    setBtcPopupVisible(true);
  };

  const [distributionData, setDistributionData] = useState({
    updateTime: '加载中...',
    chartData: [
      { range: '>10%', value: 0, type: 'up' },
      { range: '10-7', value: 0, type: 'up' },
      { range: '7-5', value: 0, type: 'up' },
      { range: '5-3', value: 0, type: 'up' },
      { range: '3-0', value: 0, type: 'up' },
      { range: '0', value: 0, type: 'neutral' },
      { range: '0-3', value: 0, type: 'down' },
      { range: '3-5', value: 0, type: 'down' },
      { range: '5-7', value: 0, type: 'down' },
      { range: '7-10', value: 0, type: 'down' },
      { range: '>10%', value: 0, type: 'down' }
    ],
    statistics: {
      up: 0,
      neutral: 0,
      down: 0
    },
    btcMarketShare: {
      percentage: '0%',
      change: '0%'
    }
  });

  const [loading, setLoading] = useState(true);

  // 获取最大值用于计算柱状图高度
  const maxValue = Math.max(...distributionData.chartData.map(item => item.value));

  // 获取颜色
  const getBarColor = (type) => {
    switch (type) {
      case 'up': return '#11B787';
      case 'down': return '#FA5F5F';
      case 'neutral': return '#999';
      default: return '#999';
    }
  };

  // 计算柱状图高度
  const getBarHeight = (value) => {
    const maxHeight = 150; // 与CSS中的max-height保持一致
    return Math.min(Math.max((value / maxValue) * 100, 5), maxHeight); // 最小高度5%，最大高度150px
  };

  // 获取恐慌贪婪指数的颜色
  const getFearGreedColor = (index) => {
    if (index >= 75) return '#FA5F5F'; // 贪婪 - 红色
    if (index >= 50) return '#ffa500'; // 中性 - 橙色
    return '#11B787'; // 恐慌 - 绿色
  };

  // 根据 index 值精确匹配小球位置（每个数字单独调整）
  // 注意：H5使用px，小程序使用rpx，需要乘以2
  // H5容器: 120px × 60px，小程序容器: 240rpx × 120rpx
  const getBallPosition = (indexValue) => {
    const value = Math.round(indexValue);
    
    // 每个数字单独匹配（0-100），H5的px值 × 2 = 小程序的rpx值
    switch (value) {
      case 0: return { top: -6, left: 91 };     // H5: -8, 49
      case 1: return { top: -6, left: 91 };
      case 2: return { top: -6, left: 91 };     // H5: -9, 49
      case 3: return { top: -6, left: 91 };
      case 4: return { top: -6, left: 91 };
      case 5: return { top: -6, left: 91 };
      case 6: return { top: -6, left: 91 };
      case 7: return { top: -6, left: 91 };
      case 8: return { top: -6, left: 91 };
      case 9: return { top: -6, left: 91 };
      case 10: return { top: -6, left: 91 };   // H5: -9, 50
      case 11: return { top: -6, left: 91 };
      case 12: return { top: -6, left: 89 };
      case 13: return { top: -6, left: 89 };
      case 14: return { top: -6, left: 89 };
      case 15: return { top: -6, left: 89 };
      case 16: return { top: -6, left: 89 };   // H5: -9, 51
      case 17: return { top: -6, left: 89 };
      case 18: return { top: -6, left: 89 };
      case 19: return { top: -6, left: 89 };
      case 20: return { top: -6, left: 89 };
      case 21: return { top: -6, left: 89 };
      case 22: return { top: -6, left: 89 };
      case 23: return { top: -6, left: 89 };
      case 24: return { top: -6, left: 89 };   // H5: -9, 52
      case 25: return { top: -6, left: 89 };
      case 26: return { top: -6, left: 89 };
      case 27: return { top: -6, left: 89 };
      case 28: return { top: -6, left: 89 };
      case 29: return { top: -6, left: 89 };
      case 30: return { top: -6, left: 89 };   // H5: -9, 53
      case 31: return { top: -6, left: 89 };
      case 32: return { top: -6, left: 89 };   // H5: -9, 54
      case 33: return { top: -6, left: 89 };
      case 34: return { top: -6, left: 89 };
      case 35: return { top: -6, left: 89 };
      case 36: return { top: -6, left: 89 };
      case 37: return { top: -6, left: 89 };   // H5: -8, 54
      case 38: return { top: -6, left: 91 };
      case 39: return { top: -6, left: 91 };   // H5: -8, 55
      case 40: return { top: -6, left: 91 };
      case 41: return { top: -6, left: 91 };
      case 42: return { top: -6, left: 91 };   // H5: -7, 55
      case 43: return { top: -6, left: 91 };
      case 44: return { top: -6, left: 91 };
      case 45: return { top: -6, left: 91 };
      case 46: return { top: -6, left: 91 };   // H5: -7, 56
      case 47: return { top: -6, left: 91 };
      case 48: return { top: -6, left: 98 };   // H5: -7, 58
      case 49: return { top: -8, left: 100 };   // H5: -7, 60
      case 50: return { top: -10, left: 124 };   // H5: -7, 68
      case 51: return { top: -10, left: 124 };
      case 52: return { top: -10, left: 124 };
      case 53: return { top: -9, left: 124 };   // H5: -6, 68
      case 54: return { top: -9, left: 124 };   // H5: -6, 69
      case 55: return { top: -8, left: 124 };   // H5: -5, 69
      case 56: return { top: -7, left: 124 };    // H5: -4, 70
      case 57: return { top: -4, left: 124 };
      case 58: return { top: -4, left: 124 };    // H5: -3, 71
      case 59: return { top: -4, left: 124};    // H5: -2, 71
      case 60: return { top: -3, left: 124 };    // H5: -1, 72
      case 61: return { top: -2, left: 124 };
      case 62: return { top: -2, left: 124 };     // H5: 0, 73
      case 63: return { top: -0, left: 124 };     // H5: 1, 73
      case 64: return { top: -0, left: 124 };     // H5: 2, 74
      case 65: return { top: 2, left: 124 };
      case 66: return { top: 2, left: 124 };     // H5: 3, 75
      case 67: return { top: 4, left: 124 };     // H5: 4, 75
      case 68: return { top: 4, left: 124 };    // H5: 6, 76
      case 69: return { top: 6, left: 124 };    // H5: 7, 76
      case 70: return { top: 16, left: 140 };    // H5: 8, 77
      case 71: return { top: 16, left: 141 };    // H5: 9, 77
      case 72: return { top: 20, left: 141 };    // H5: 10, 77
      case 73: return { top: 20, left: 141 };    // H5: 12, 78
      case 74: return { top: 22, left: 141 };    // H5: 15, 79
      case 75: return { top: 24, left: 141 };    // H5: 16, 79
      case 76: return { top: 28, left: 141 };    // H5: 18, 80
      case 77: return { top: 30, left: 141 };    // H5: 19, 79
      case 78: return { top: 32, left: 141 };    // H5: 20, 79
      case 79: return { top: 34, left: 141 };    // H5: 21, 78
      case 80: return { top: 38, left: 141 };    // H5: 22, 78
      case 81: return { top: 40, left: 141 };    // H5: 23, 78
      case 82: return { top: 40, left: 138 };    // H5: 24, 78
      case 83: return { top: 40, left: 136 };    // H5: 25, 76
      case 84: return { top: 40, left: 136 };    // H5: 24, 78
      case 85: return { top: 40, left: 132 };    // H5: 25, 76
      case 86: return { top: 40, left: 132 };    // H5: 24, 78
      case 87: return { top: 40, left: 130 };    // H5: 25, 76
      case 88: return { top: 40, left: 128 };    // H5: 24, 78
      case 89: return { top: 40, left: 126 };    // H5: 25, 76
      case 90: return { top: 40, left: 126 };    // H5: 24, 78
      case 91: return { top: 40, left: 124 };    // H5: 25, 76
      case 92: return { top: 40, left: 122 };    // H5: 24, 78
      case 93: return { top: 40, left: 120 };    // H5: 25, 76
      case 94: return { top: 42, left: 118 };    // H5: 28, 68
      case 95: return { top: 42, left: 118 };    // H5: 28, 67
      case 96: return { top: 42, left: 116 };    // H5: 28, 66
      case 97: return { top: 42, left: 116 };    // H5: 28, 65
      case 98: return { top: 46, left: 116 };    // H5: 28, 64
      case 99: return { top: 48, left: 114 };
      case 100: return { top: 64, left: 114 };   // H5: 33, 63
      
      default:
        return { top: 0, left: 100 };
    }
  };

  // 初始化数据加载和定时刷新
  useEffect(() => {
    fetchMarketDistribution();
    fetchFearGreedIndex();
    fetchAggregationDetail();
    
    // 设置定时刷新（每30秒）
    const interval = setInterval(() => {
      fetchMarketDistribution();
      fetchFearGreedIndex();
      fetchAggregationDetail();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // 获取涨跌分布数据
  const fetchMarketDistribution = async () => {
    try {
      setLoading(true);
      const response = await request({
        url: Interface.MARKET_DISTRIBUTION
      });
      
      if (response?.data) {
        const apiData = response.data;
        
        // 数据映射：将API返回的数据映射到组件需要的格式
        // API区间：0-3%, 3-5%, 5-10%, 10-20%, 20%+
        // 组件区间：0-3%, 3-5%, 5-7%, 7-10%, 10%+
        const gt5To7Up = Math.round(apiData.gt5To10Up * 0.4) || 0;  // 5-7% 约占 5-10% 的 40%
        const gt7To10Up = apiData.gt5To10Up - gt5To7Up || 0;        // 7-10%
        const gt10PlusUp = (apiData.gt10To20Up || 0) + (apiData.gt20Up || 0); // 10%以上
        
        const gt5To7Down = Math.round(apiData.gt5To10Down * 0.4) || 0;
        const gt7To10Down = apiData.gt5To10Down - gt5To7Down || 0;
        const gt10PlusDown = (apiData.gt10To20Down || 0) + (apiData.gt20Down || 0);
        
        // 计算统计数据
        const totalUp = (apiData.gt0To3Up || 0) + (apiData.gt3To5Up || 0) + (apiData.gt5To10Up || 0) + (apiData.gt10To20Up || 0) + (apiData.gt20Up || 0);
        const totalDown = (apiData.gt0To3Down || 0) + (apiData.gt3To5Down || 0) + (apiData.gt5To10Down || 0) + (apiData.gt10To20Down || 0) + (apiData.gt20Down || 0);
        const totalNeutral = apiData.gt0 || 0;
        
        // 获取当前时间
        const now = new Date();
        const updateTime = `${now.getMonth() + 1}.${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 更新`;
        
        setDistributionData(prev => ({
          updateTime,
          chartData: [
            { range: '>10%', value: gt10PlusUp, type: 'up' },
            { range: '10-7', value: gt7To10Up, type: 'up' },
            { range: '7-5', value: gt5To7Up, type: 'up' },
            { range: '5-3', value: apiData.gt3To5Up || 0, type: 'up' },
            { range: '3-0', value: apiData.gt0To3Up || 0, type: 'up' },
            { range: '0', value: totalNeutral, type: 'neutral' },
            { range: '0-3', value: apiData.gt0To3Down || 0, type: 'down' },
            { range: '3-5', value: apiData.gt3To5Down || 0, type: 'down' },
            { range: '5-7', value: gt5To7Down, type: 'down' },
            { range: '7-10', value: gt7To10Down, type: 'down' },
            { range: '>10%', value: gt10PlusDown, type: 'down' }
          ],
          statistics: {
            up: totalUp,
            neutral: totalNeutral,
            down: totalDown
          },
          btcMarketShare: prev.btcMarketShare // 保持原有的BTC市场占有率数据
        }));
      }
    } catch (error) {
      console.error('获取涨跌分布数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取恐慌贪婪指数
  const fetchFearGreedIndex = async () => {
    try {
      const response = await request({
        url: Interface.FEAR_GREED_INDEX
      });
      
      if (response?.data) {
        // 使用 value 字段
        const index = response.data.value || 0;
        // 确保指数在 0-100 之间
        const validIndex = Math.min(Math.max(Number(index) || 0, 0), 100);
        setFearGreedIndex(validIndex);
        
        // 使用 API 返回的 category 字段
        if (response.data.category) {
          setFearGreedCategory(response.data.category);
        }
      }
    } catch (error) {
      console.error('获取恐慌贪婪指数失败:', error);
    }
  };

  // 获取市场聚合数据（BTC市场占有率、市值、成交量等）
  const fetchAggregationDetail = async () => {
    try {
      const response = await request({
        url: Interface.AGGREGATION_DETAIL
      });
      
      if (response?.data) {
        const { btcDominanceFmt, btcDominanceChangeFmt } = response.data;
        
        // 只有当数据有效时才更新（避免设置为 '0%'）
        if (btcDominanceFmt) {
          setDistributionData(prev => ({
            ...prev,
            btcMarketShare: {
              percentage: btcDominanceFmt,
              change: btcDominanceChangeFmt || prev.btcMarketShare.change
            }
          }));
          console.log('✅ 更新BTC市场占有率:', btcDominanceFmt, '变化:', btcDominanceChangeFmt);
        } else {
          console.log('⚠️ BTC市场占有率数据为空，保持旧值:', response.data);
        }
      }
    } catch (error) {
      console.error('❌ 获取市场聚合数据失败:', error);
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
              <Image 
                className='info-icon' 
                src={warnIcon} 
                onTap={handleFearGreedInfoClick}
                mode='aspectFit'
              />
            </View>
            <View className='fear-greed-container'>
              <View className='fear-greed-chart'>
                <View className='fear-greed-semicircle'>
                  <View className='fear-greed-inner'>
                    <View className='fear-greed-value'>{fearGreedIndex}</View>
                    <View className='fear-greed-text'>{fearGreedCategory}</View>
                  </View>
                  <View 
                    className='fear-greed-ball'
                    style={{
                      top: `${getBallPosition(fearGreedIndex).top}rpx`,
                      left: `${getBallPosition(fearGreedIndex).left}rpx`,
                      transform: `rotate(${-90 + (fearGreedIndex / 145) * 180}deg)`
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
              <Image 
                className='info-icon' 
                src={warnIcon}
                onTap={handleBTCInfoClick}
                mode='aspectFit'
              />
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

        {/* 恐慌贪婪指数弹窗 */}
        <InfoPopup
          visible={fearGreedPopupVisible}
          title="恐慌贪婪指数"
          items={[
            { 
              label: '数值越低（接近0）：', 
              text: '投资者越恐惧，市场可能被低估；' 
            },
            { 
              label: '数值越高（接近100）：', 
              text: '投资者越贪婪，市场可能过热。' 
            }
          ]}
          onClose={() => setFearGreedPopupVisible(false)}
        />

        {/* BTC市场占有率弹窗 */}
        <InfoPopup
          visible={btcPopupVisible}
          title="BTC市场占有率"
          items={[
            { 
              label: '占比上升：', 
              text: '说明资金更集中在比特币，市场趋于保守；' 
            },
            { 
              label: '占比下降：', 
              text: '说明资金流向山寨币，市场更活跃。' 
            }
          ]}
          onClose={() => setBtcPopupVisible(false)}
        />
    </View>
  );
}
