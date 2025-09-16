import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro, { useLoad, useShareAppMessage, usePullDownRefresh } from '@tarojs/taro';
import { useState, useCallback } from 'react';
import { Layout } from '../../../components/Layout';
import IconFont from '../../../components/iconfont';
import './index.less';

export default function PointsRank() {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [rankData, setRankData] = useState({});

  // 模拟数据生成器（为日/月/总榜生成列表）
  const makeList = (basePoints, customNames = []) => {
    const avatars = [
      'https://images.unsplash.com/photo-1494790108755-2616c5e91d5f?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face'
    ];
    return Array.from({ length: 25 }).map((_, idx) => {
      const rank = idx + 1;
      return {
        id: rank,
        name: rank === 25 ? '牛爷爷' : (customNames[idx] || (idx === 2 ? 'GGBond' : idx === 3 ? '超人强' : '张三')),
        avatar: avatars[idx % avatars.length],
        points: basePoints - (rank - 1) * 10,
        rank,
        isMe: rank === 25
      };
    });
  };

  const mockData = {
    daily: makeList(2000),
    monthly: makeList(5200),
    total: makeList(10000)
  };

  useShareAppMessage(() => {
    const list = (rankData[activeTab] || []);
    const me = list.find(item => item.isMe);
    const tabText = activeTab === 'daily' ? '日榜' : activeTab === 'monthly' ? '月榜' : '总榜';
    const title = me ? `邀请你来挑战！我在${tabText}排第${me.rank}` : `邀请你来挑战${tabText}`;
    return {
      title,
      path: `/packages/more/pointsrank/index?inviteFrom=share&tab=${activeTab}`
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

  // 悬浮按钮采用 openType=share 直接调起微信分享

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
                src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/left-arrow.png'}
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
              <Image className='medal-second' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/silver.png'} mode='widthFix' />
              <Image src={top2.avatar} className='ov-avatar' mode='aspectFill' />
              <View className='ov-name'>{top2.name}</View>
              <View className='ov-points'>
                <Image className='coin-icon' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/score-coin.png'} mode='widthFix' />
                <Text className='ov-points-text'>{top2.points}</Text>
              </View>
            </View>
          )}
          {top1 && (
            <View className='overlay-slot first'>
              <Image className='medal-first' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/gold.png'} mode='widthFix' />
              <Image src={top1.avatar} className='ov-avatar' mode='aspectFill' />
              <View className='ov-name'>{top1.name}</View>
              <View className='ov-points'>
                <Image className='coin-icon' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/score-coin.png'} mode='widthFix' />
                <Text className='ov-points-text'>{top1.points}</Text>
              </View>
            </View>
          )}
          {top3 && (
            <View className='overlay-slot third'>
              <Image className='medal-third' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/copper.png'} mode='widthFix' />
              <Image src={top3.avatar} className='ov-avatar' mode='aspectFill' />
              <View className='ov-name'>{top3.name}</View>
              <View className='ov-points'>
                <Image className='coin-icon' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/score-coin.png'} mode='widthFix' />
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
                  <Image className='coin-icon' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/score-coin.png'} mode='widthFix' />
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
              <Image className='coin-icon' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/score-coin.png'} mode='widthFix' />
              <Text className='points-text'>{myRank.points}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 邀请好友悬浮按钮 */}
      <Button className='invite-float-btn' openType='share'>
        <View className='invite-icon-wrap'>
          <Image className='invite-icon' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/score-invite.png'} mode='widthFix' />
        </View>
        <Text className='invite-text'>邀请朋友来挑战吧</Text>
      </Button>
    </View>
  )
}
