import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad, useShareAppMessage, usePullDownRefresh } from '@tarojs/taro';
import { useState, useCallback } from 'react';
import { Layout } from '../../components/Layout';
import IconFont from '../../components/iconfont';
import './index.less';

export default function PointsRank() {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [rankData, setRankData] = useState({});

  // 模拟数据
  const mockData = {
    daily: [
      { id: 1, name: '张三', avatar: 'https://images.unsplash.com/photo-1494790108755-2616c5e91d5f?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 1 },
      { id: 2, name: '张三', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 2 },
      { id: 3, name: 'GGBond', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 3 },
      { id: 4, name: '超人强', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 4 },
      { id: 5, name: '张三', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 5 },
      { id: 6, name: '张三', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 6 },
      { id: 7, name: '张三', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 7, special: '查看更多朋友圈' },
      { id: 8, name: '张三', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 8 },
      { id: 25, name: '牛爷爷', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face', points: 2000, rank: 25, isMe: true }
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

  const listData = rankData[activeTab] || [];
  // 前三名用于叠加到背景的三个槽位
  const top1 = (rankData[activeTab] || []).find((i) => i.rank === 1);
  const top2 = (rankData[activeTab] || []).find((i) => i.rank === 2);
  const top3 = (rankData[activeTab] || []).find((i) => i.rank === 3);
  const myRank = (rankData[activeTab] || []).find((i) => i.isMe);
  const restList = (rankData[activeTab] || []).filter((i) => i.rank > 3);

  return (
    <View className='points-rank-container'>
      {/* 头部背景 */}
      <View className='header-bg'>
        <View className='header-content'>
          <View className='top-row'>
            <View className='back-arrow' onClick={() => Taro.navigateBack()}>
              <Image 
                className='back-arrow-icon'
                src={require('@/assets/icon/left-arrow.png')}
              />
            </View>
            <View className='mini-title'>积分榜单</View>
          </View>
          <View className='main-title'>积分榜单</View>
          <View className='mini-tabs'>
            <View
              className={`mini-tab ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => handleTabChange('daily')}
            >
              日榜
            </View>
            <View
              className={`mini-tab ${activeTab === 'monthly' ? 'active' : ''}`}
              onClick={() => handleTabChange('monthly')}
            >
              月榜
            </View>
            <View
              className={`mini-tab ${activeTab === 'total' ? 'active' : ''}`}
              onClick={() => handleTabChange('total')}
            >
              总榜
            </View>
          </View>
        </View>
      </View>

      {/* 仅过渡背景 + Top3 叠加信息 */}
      <View className='transition-top3'>
        <View className='transition-bg' />
        <View className='top3-overlay'>
          {top2 && (
            <View className='overlay-slot second'>
              <Image src={top2.avatar} className='ov-avatar' mode='aspectFill' />
              <View className='ov-name'>{top2.name}</View>
              <View className='ov-points'>
                <Image className='coin-icon' src={require('@/assets/icon/score-coin.png')} mode='widthFix' />
                <Text className='ov-points-text'>{top2.points}</Text>
              </View>
            </View>
          )}
          {top1 && (
            <View className='overlay-slot first'>
              <Image src={top1.avatar} className='ov-avatar' mode='aspectFill' />
              <View className='ov-name'>{top1.name}</View>
              <View className='ov-points'>
                <Image className='coin-icon' src={require('@/assets/icon/score-coin.png')} mode='widthFix' />
                <Text className='ov-points-text'>{top1.points}</Text>
              </View>
            </View>
          )}
          {top3 && (
            <View className='overlay-slot third'>
              <Image src={top3.avatar} className='ov-avatar' mode='aspectFill' />
              <View className='ov-name'>{top3.name}</View>
              <View className='ov-points'>
                <Image className='coin-icon' src={require('@/assets/icon/score-coin.png')} mode='widthFix' />
                <Text className='ov-points-text'>{top3.points}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 内容区域 */}
      <ScrollView scrollY className='content-area'>
        <Layout isLoading={loading}>
          {/* 排名列表 */}
          <View className='rank-list'>
            {restList.map((item) => (
              <View key={item.id} className={`rank-item`}>
                <View className='rank-number'>{item.rank}</View>
                <Image src={item.avatar} className='avatar-small' mode='aspectFit' />
                <View className='user-info'>
                  <View className='name'>{item.name}</View>
                </View>
                <View className='points-area'>
                  <Image className='coin-icon' src={require('@/assets/icon/score-coin.png')} mode='widthFix' />
                  <Text className='points-text'>{item.points}</Text>
                </View>
              </View>
            ))}
          </View>
        </Layout>
      </ScrollView>

      {/* 我的排名悬浮卡片 */}
      {myRank && (
        <View className='my-rank-overlay'>
          <View className='rank-item me'>
            <View className='rank-number'>{myRank.rank}</View>
            <Image src={myRank.avatar} className='avatar-small' mode='aspectFit' />
            <View className='user-info'>
              <View className='name'>{myRank.name}</View>
            </View>
            <View className='points-area'>
              <Image className='coin-icon' src={require('@/assets/icon/score-coin.png')} mode='widthFix' />
              <Text className='points-text'>{myRank.points}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
