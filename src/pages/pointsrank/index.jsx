import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad, useShareAppMessage, usePullDownRefresh } from '@tarojs/taro';
import { useState, useCallback } from 'react';
import { TabBar } from 'antd-mobile';
import { Layout } from '../../components/Layout';
import IconFont from '../../components/iconfont';
import './index.less';

// 导入奖杯图标
import goldIcon from '../../assets/icon/gold.png';
import silverIcon from '../../assets/icon/silver.png';
import copperIcon from '../../assets/icon/copper.png';

export default function PointsRank() {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [rankData, setRankData] = useState({});

  // 模拟数据
  const mockData = {
    daily: [
      { id: 1, name: '张三', avatar: 'https://images.unsplash.com/photo-1494790108755-2616c5e91d5f?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 1 },
      { id: 2, name: '张三', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 2 },
      { id: 3, name: '张三', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 3 },
      { id: 4, name: '张三', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 4 },
      { id: 5, name: '张三', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 5 },
      { id: 6, name: '张三', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 6 },
      { id: 7, name: '张三', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 7, special: '查看更多朋友圈' },
      { id: 8, name: '张三', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 8 },
      { id: 25, name: '我', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 25, isMe: true }
    ],
    monthly: [
      // 月榜数据...
    ],
    total: [
      // 总榜数据...
    ]
  };

  useShareAppMessage(() => {
    return {
      title: '积分榜单'
    };
  });

  useLoad(() => {
    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment']
    });
    loadRankData();
  });

  // 下拉刷新
  usePullDownRefresh(() => {
    loadRankData().then(() => {
      Taro.stopPullDownRefresh();
    });
  });

  // 加载排行榜数据
  const loadRankData = useCallback(async () => {
    setLoading(true);
    try {
      // 这里应该调用实际的API
      // const response = await request({ url: Interface.POINTS_RANK, data: { type: activeTab } });
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 设置模拟数据
      setRankData(mockData);
    } catch (error) {
      console.error('加载排行榜数据失败:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    // 切换tab时重新加载数据
    setTimeout(() => loadRankData(), 100);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return goldIcon;
      case 2:
        return silverIcon;
      case 3:
        return copperIcon;
      default:
        return null;
    }
  };

  const currentData = rankData[activeTab] || [];
  const topThree = currentData.filter(item => item.rank <= 3);
  const others = currentData.filter(item => item.rank > 3);

  return (
    <View className='points-rank-container'>
      {/* 头部背景 */}
      <View className='header-bg'>
        <View className='header-content'>
          <View className='title'>积分榜单</View>
          <View className='trophy-icon'>🏆</View>
        </View>
      </View>

      {/* Tab切换 */}
      <View className='tab-container'>
        <TabBar activeKey={activeTab} onChange={handleTabChange}>
          <TabBar.Item key='daily' title='日榜' />
          <TabBar.Item key='monthly' title='月榜' />
          <TabBar.Item key='total' title='总榜' />
        </TabBar>
      </View>

      {/* 内容区域 */}
      <ScrollView scrollY className='content-area'>
        <Layout isLoading={loading}>
          {/* 前三名特殊展示 */}
          <View className='top-three-container'>
          <View className='podium'>
            {/* 第二名 */}
            {topThree[1] && (
              <View className='podium-item second'>
                <View className='rank-badge'>
                  <Image src={getRankIcon(2)} className='rank-icon' mode='aspectFit' />
                </View>
                <Image src={topThree[1].avatar} className='avatar' mode='aspectFit' />
                <View className='name'>{topThree[1].name}</View>
                <View className='points'>
                  <Text className='points-icon'>🪙</Text>
                  {topThree[1].points}
                </View>
              </View>
            )}

            {/* 第一名 */}
            {topThree[0] && (
              <View className='podium-item first'>
                <View className='rank-badge'>
                  <Image src={getRankIcon(1)} className='rank-icon' mode='aspectFit' />
                </View>
                <Image src={topThree[0].avatar} className='avatar' mode='aspectFit' />
                <View className='name'>{topThree[0].name}</View>
                <View className='points'>
                  <Text className='points-icon'>🪙</Text>
                  {topThree[0].points}
                </View>
              </View>
            )}

            {/* 第三名 */}
            {topThree[2] && (
              <View className='podium-item third'>
                <View className='rank-badge'>
                  <Image src={getRankIcon(3)} className='rank-icon' mode='aspectFit' />
                </View>
                <Image src={topThree[2].avatar} className='avatar' mode='aspectFit' />
                <View className='name'>{topThree[2].name}</View>
                <View className='points'>
                  <Text className='points-icon'>🪙</Text>
                  {topThree[2].points}
                </View>
              </View>
            )}
          </View>
        </View>

          {/* 其他排名列表 */}
          <View className='rank-list'>
            {others.map((item) => (
              <View key={item.id} className={`rank-item ${item.isMe ? 'me' : ''}`}>
                <View className='rank-number'>{item.rank}</View>
                <Image src={item.avatar} className='avatar-small' mode='aspectFit' />
                <View className='user-info'>
                  <View className='name'>{item.name}</View>
                  {item.special && (
                    <View className='special-badge'>
                      <View className='special-text'>✅ {item.special}</View>
                    </View>
                  )}
                </View>
                <View className='points-area'>
                  <Text className='points-icon'>🪙</Text>
                  <Text className='points-text'>{item.points}</Text>
                </View>
              </View>
            ))}
          </View>
        </Layout>
      </ScrollView>
    </View>
  )
}
