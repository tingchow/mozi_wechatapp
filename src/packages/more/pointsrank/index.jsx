import { View, Text, Image, ScrollView, Button, PageContainer } from '@tarojs/components'
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
  const [popVisible, setPopVisible] = useState(false);
  const [popType, setPopType] = useState('');

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
          // 直接使用接口 rankings 的顺序，rank 用序号兜底
          rank: index + 1,
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

  // 手机号登录（与积分中心保持一致）
  const phoneLogin = (e) => {
    const phoneCode = e.detail.code || ''
    Taro.login({
      complete: async (res) => {
        if (res.code) {
          Taro.showLoading({ mask: true })
          const openIdCode = res.code
          console.log('openIdCode', openIdCode)
          
          // 获取待处理的邀请码
          const pendingInviteCode = Taro.getStorageSync('pendingInviteCode')
          
          const loginData = {
            chanel: 1,
            type: 'login',
            phoneCode,
            loginCode: openIdCode,
            channel:'miniapp'
          }
          
          // 如果有邀请码，添加到登录参数中
          if (pendingInviteCode) {
            loginData.invitedCode = pendingInviteCode
            console.log('🎫 [积分榜单-登录] 携带邀请码:', pendingInviteCode)
          }
          
          const tokenInfo = await request({
            url: Interface.MOZI_LOGIN,
            data: loginData,
            method: 'POST',
          })
          
          console.log('tokenInfo', tokenInfo)
          Taro.hideLoading()
          
          if (tokenInfo?.data?.token) {
            Taro.setStorageSync('token', tokenInfo?.data?.token)
            console.log('用户信息本地缓存成功')
            
            const userInfo = tokenInfo?.data?.userInfo
            const userId = tokenInfo?.data?.userId
            
            if (userId) {
              Taro.setStorageSync('userId', userId)
            }
            
            if (userInfo?.avatar && userInfo?.nickName) {
              Taro.setStorageSync('userInfo', {
                avatar: userInfo?.avatar,
                nickName: userInfo?.nickName,
                userId: userId
              })
            }
            
            // 关闭登录弹窗
            setPopVisible(false)
            
            // 获取并保存用户详细数据（包括邀请码）
            const { fetchAndSaveUserData } = require('../../../utils/userHelper')
            await fetchAndSaveUserData()
            
            // 检查是否有待处理的邀请码
            const pendingInviteCode = Taro.getStorageSync('pendingInviteCode')
            if (pendingInviteCode) {
              console.log('🔗 [积分榜单-登录成功] 检测到待处理的邀请码:', pendingInviteCode)
              // 绑定邀请码
              bindInviteCode(pendingInviteCode)
            }
            
            // 登录成功后，自动调用每日登录任务完成接口
            const { reportDailyLogin } = require('../../../utils/taskHelper')
            reportDailyLogin()
            
            Taro.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            })
            
            // 刷新排行榜数据和用户信息
            loadRankData()
            fetchUserInfo()
          } else {
            console.log('登录失败')
            Taro.showToast({
              title: '登录失败',
              icon: 'error',
              duration: 2000
            })
          }
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  }

  // 绑定邀请码（与积分中心保持一致）
  const bindInviteCode = async (inviteCode) => {
    try {
      console.log('🔗 [积分榜单-邀请码] 开始绑定邀请关系:', inviteCode)
      
      // TODO: 调用后端接口绑定邀请关系
      // const res = await request({
      //   url: Interface.BIND_INVITE_CODE,
      //   method: 'POST',
      //   data: { inviteCode }
      // })
      
      // if (res?.code === 0) {
      //   console.log('✅ [积分榜单-邀请码] 邀请关系绑定成功')
      //   Taro.removeStorageSync('pendingInviteCode')
      //   Taro.showToast({
      //     title: '邀请绑定成功，已获得积分',
      //     icon: 'success'
      //   })
      // }
      
      // 暂时只清除待处理的邀请码
      Taro.removeStorageSync('pendingInviteCode')
      console.log('✅ [积分榜单-邀请码] 邀请码已保存，等待后端接口对接')
      
      Taro.showToast({
        title: '邀请绑定成功',
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error('❌ [积分榜单-邀请码] 绑定邀请关系失败:', error)
    }
  }

  useLoad(() => {
    console.log('🎯 [积分榜单] 页面加载');
    
    // 检查是否携带邀请码（与积分中心保持一致）
    try {
      const instance = Taro.getCurrentInstance()
      const router = instance.router
      let inviteCodeParam = router?.params?.inviteCode
      
      // 如果从 router.params 获取不到，尝试从 URL 解析
      if (!inviteCodeParam) {
        const url = router?.path || ''
        const match = url.match(/inviteCode=([^&]+)/)
        if (match) {
          inviteCodeParam = match[1]
        }
      }
      
      console.log('🔍 [积分榜单-邀请码] 完整路由信息:', router)
      console.log('🔍 [积分榜单-邀请码] 页面参数:', router?.params)
      console.log('🔍 [积分榜单-邀请码] 邀请码:', inviteCodeParam)
      
      if (inviteCodeParam) {
        console.log('✅ [积分榜单-邀请码] 检测到邀请码:', inviteCodeParam)
        
        // 保存邀请码到本地存储
        Taro.setStorageSync('pendingInviteCode', inviteCodeParam)
        
        // 检查用户是否已登录
        const token = Taro.getStorageSync('token')
        
        if (!token) {
          console.log('⚠️ [积分榜单-邀请码] 用户未登录，弹出登录弹窗')
          
          // 延迟一下，等待页面渲染完成
          setTimeout(() => {
            // 直接显示登录弹窗
            setPopType('login')
            setPopVisible(true)
          }, 500)
        } else {
          console.log('✅ [积分榜单-邀请码] 用户已登录，可以绑定邀请关系')
          // TODO: 调用后端接口绑定邀请关系
          // 这里可以复用积分中心的 bindInviteCode 逻辑
        }
      }
    } catch (error) {
      console.error('❌ [积分榜单-邀请码] 检查邀请码失败:', error)
    }
    
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
    
    // 获取用户昵称（与积分中心保持一致）
    const storedUserInfo = Taro.getStorageSync('userInfo') || {}
    const nickName = storedUserInfo.nickName || userInfo.nickname || '好友'
    
    // 从多个来源获取邀请码（与积分中心保持一致）
    const userData = Taro.getStorageSync('userData') || {}
    let finalInviteCode = userData.inviteCode || userData.invitationCode
    
    // 如果 userData 中没有，尝试从 pointsData 获取
    if (!finalInviteCode) {
      const savedPointsData = Taro.getStorageSync('pointsData') || {}
      finalInviteCode = savedPointsData.inviteCode || inviteCode
    }
    
    console.log('🔍 [积分榜单-分享回调] userData:', userData)
    console.log('🔍 [积分榜单-分享回调] userData中的邀请码:', userData.inviteCode || userData.invitationCode)
    console.log('🔍 [积分榜单-分享回调] state中的邀请码:', inviteCode)
    console.log('🔍 [积分榜单-分享回调] 最终使用的邀请码:', finalInviteCode)
    
    // 生成分享标题
    const title = myRank 
      ? `${nickName}邀请你来挑战！我在${tabText}排第${myRank}` 
      : `${nickName}邀请你来挑战${tabText}`;
    
    // 分享路径：分享积分榜单页面，同时携带邀请码和当前榜单类型
    const shareConfig = {
      title,
      path: finalInviteCode 
        ? `/packages/more/pointsrank/index?tab=${activeTab}&inviteCode=${finalInviteCode}`
        : `/packages/more/pointsrank/index?tab=${activeTab}`,
    }
    
    console.log('========================================')
    console.log('🎁 [积分榜单-分享] 分享给好友')
    console.log('📝 标题:', shareConfig.title)
    console.log('🔗 路径:', shareConfig.path)
    console.log('👤 分享人:', nickName)
    console.log('🎫 邀请码:', finalInviteCode)
    console.log('📊 当前榜单:', tabText)
    console.log('🏆 我的排名:', myRank || '未上榜')
    console.log('⚠️  注意：开发版不显示自定义标题，正式版才会显示')
    console.log('========================================')
    
    return shareConfig
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

      {/* 登录弹窗 */}
      <PageContainer
        show={popVisible}
        onAfterLeave={() => setPopVisible(false)}
        closeOnSlideDown
        round
        forceRender
        position='bottom'
      >
        {popType === 'login' && (
          <View className='loginPopContainer'>
            <Text className='loginTitle'>邀请登录</Text>
            <Text className='loginDesc'>您收到了好友的邀请，请先登录以完成邀请绑定并获得积分奖励</Text>
            <Button 
              className='loginButton' 
              openType='getPhoneNumber' 
              onGetPhoneNumber={phoneLogin}
            >
              <Text className='loginButtonText'>微信手机号登录</Text>
            </Button>
          </View>
        )}
      </PageContainer>
    </View>
  )
}
