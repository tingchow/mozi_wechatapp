import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro, { useLoad, useShareAppMessage, usePullDownRefresh } from '@tarojs/taro';
import { useState, useCallback } from 'react';
import { Layout } from '../../../components/Layout';
import { request } from '../../../utils/request';
import { Interface } from '../../../utils/constants';
import './index.less';

export default function PointsRank() {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [rankData, setRankData] = useState({});
  const [currentUserData, setCurrentUserData] = useState({});
  const [userInfo, setUserInfo] = useState({ avatar: null, nickname: null });
  const [inviteCode, setInviteCode] = useState('');

  // 默认头像
  const defaultAvatar = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/avatar.png';

  // 获取排行榜数据（与原项目保持一致）
  const fetchRankData = useCallback(async (type) => {
    try {
      const res = await request({
        url: Interface.TASK_RANKING,
        method: 'GET',
        data: {
          type: type,
          limit: 50
        }
      });
      
      console.log(`🔍 [积分榜单] ${type}榜接口返回:`, res);
      
      if (res?.code === 0 && res?.data) {
        const rankings = res.data.rankings || res.data || [];
        // 映射接口数据到组件格式
        const list = rankings.map((item, index) => ({
          id: item.userId || index + 1,
          name: item.nickName || item.nickname || item.userName || '匿名用户',
          avatar: item.avatar || defaultAvatar,
          points: item.points || item.totalPoints || item.dailyPoints || item.monthlyPoints || 0,
          rank: item.rank || index + 1,
          isMe: item.isCurrentUser || false
        }));
        
        console.log(`✅ [积分榜单] ${type}榜数据加载成功，共${list.length}条`);
        
        // 返回排行榜列表和当前用户数据
        return {
          list,
          currentUserRank: res.data.currentUserRank,
          currentUserPoints: res.data.currentUserPoints
        };
      }
      return { list: [], currentUserRank: null, currentUserPoints: null };
    } catch (error) {
      console.error(`获取${type}排行榜失败:`, error);
      return { list: [], currentUserRank: null, currentUserPoints: null };
    }
  }, []);

  // 加载所有类型的排行榜数据
  const loadRankData = useCallback(async () => {
    setLoading(true);
    try {
      const [dailyData, monthlyData, totalData] = await Promise.all([
        fetchRankData('daily'),
        fetchRankData('monthly'),
        fetchRankData('total')
      ]);
      
      setRankData({
        daily: dailyData.list,
        monthly: monthlyData.list,
        total: totalData.list
      });
      
      // 保存当前用户的排名数据
      setCurrentUserData({
        daily: { rank: dailyData.currentUserRank, points: dailyData.currentUserPoints },
        monthly: { rank: monthlyData.currentUserRank, points: monthlyData.currentUserPoints },
        total: { rank: totalData.currentUserRank, points: totalData.currentUserPoints }
      });
      
      console.log('✅ [积分榜单] 所有榜单数据加载完成');
    } catch (error) {
      console.error('加载排行榜数据失败:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  }, [fetchRankData]);

  // 获取用户信息（包括邀请码、头像、昵称）
  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await request({
        url: Interface.USER_DATA_INFO,
        method: 'GET'
      });
      if (res?.code === 0 && res?.data) {
        if (res.data.inviteCode) {
          setInviteCode(res.data.inviteCode);
        }
        setUserInfo({
          avatar: res.data.avatar || null,
          nickname: res.data.nickName || res.data.nickname || null
        });
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }, []);

  useLoad(() => {
    console.log('🎯 [积分榜单] 页面加载');
    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment']
    });
    loadRankData();
    fetchUserInfo();
  });

  // 下拉刷新
  usePullDownRefresh(() => {
    loadRankData().then(() => {
      Taro.stopPullDownRefresh();
    });
  });

  useShareAppMessage(() => {
    const list = (rankData[activeTab] || []);
    const currentUserInfo = currentUserData[activeTab] || {};
    const myRank = currentUserInfo.rank || list.find(item => item.isMe)?.rank;
    const tabText = activeTab === 'daily' ? '日榜' : activeTab === 'monthly' ? '月榜' : '总榜';
    const nickName = userInfo.nickname || '好友';
    const title = myRank ? `${nickName}邀请你来挑战！我在${tabText}排第${myRank}` : `${nickName}邀请你来挑战${tabText}`;
    
    // 如果有邀请码，添加到分享路径
    const sharePath = inviteCode 
      ? `/packages/points/index?inviteCode=${inviteCode}`
      : `/packages/more/pointsrank/index?tab=${activeTab}`;
    
    console.log('🎁 [积分榜单] 分享配置:', { title, path: sharePath });
    
    return {
      title,
      path: sharePath
    };
  });

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const listData = rankData[activeTab] || [];
  // 前三名用于叠加到背景的三个槽位
  const top1 = listData.find((i) => i.rank === 1);
  const top2 = listData.find((i) => i.rank === 2);
  const top3 = listData.find((i) => i.rank === 3);
  
  // 优先使用 API 返回的 currentUserRank 和 currentUserPoints
  const currentUserInfo = currentUserData[activeTab] || {};
  const myRank = currentUserInfo.rank ? {
    rank: currentUserInfo.rank,
    points: currentUserInfo.points ?? 0,
    name: userInfo.nickname || '我',
    avatar: userInfo.avatar || defaultAvatar
  } : listData.find((i) => i.isMe);
  
  const restList = listData.filter((i) => i.rank > 3);

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
