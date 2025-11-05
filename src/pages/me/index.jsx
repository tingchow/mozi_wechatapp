import { View, Text, Image, Button, PageContainer, OfficialAccount, ScrollView, Textarea } from '@tarojs/components';
import { List, Popup, Grid } from 'antd-mobile';
import IconFont from '../../components/iconfont';
import CalendarCard from '../../components/CalendarCard';
import Taro from '@tarojs/taro';
import { useState, useEffect, useRef } from 'react';
import { useLoad, useShareTimeline, useDidShow } from '@tarojs/taro';
import { jump2Detail, jump2Market, jump2NoTab } from '../../utils/core';
import { request } from '../../utils/request';
import { EMAIL, COINKEY, Interface } from '../../utils/constants';
// 默认头像使用 CDN 链接，避免打包并加速加载
const DEFAULT_AVATAR = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/avatar.png';
const EDIT_ICON = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/edit.png';
import NewCoinListing from '../../components/NewCoinListing'; // 导入新币上线组件
import { DonateModal } from '../../components/DonateModal';
// import '../../assets/wechat_account.jpg'
// import '../../assets/BTC.jpg'
// import '../../assets/ETH.jpg'
// import '../../assets/Tron.jpg'
import './index.less';

let isReporting = false;

export default function Index() {

  const [ userInfo, setUserInfo ] = useState({});
  const [popVis, setPopVis] = useState(false);
  const [popType, setPopType] = useState('');
  const [reportScore, setScore] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [scoreDisable, setScoreDisable] = useState(true);
  const scoreInput = useRef('');
  const [unreadCount, setUnreadCount] = useState(0); // 未读通知数量
  const pollingTimer = useRef(null); // 轮询定时器
  const [showSecondaryActions, setShowSecondaryActions] = useState(true); // 控制第二排功能按钮的显示/隐藏
  const [showPointsSection, setShowPointsSection] = useState(true); // 控制我的积分板块的显示/隐藏
  const [showNewCoinListing, setShowNewCoinListing] = useState(true); // 控制新币上线组件的显示/隐藏
  const [showCalendarSection, setShowCalendarSection] = useState(true); // 控制日历组件的显示/隐藏
  // 与行情页一致：当“公告日历”隐藏时，退出登录应固定到底部。
  // 这里通过布尔值来控制日历显示，若为 false，我们在布局末尾插入一个占位 flex 项将按钮推到底部。
  const [showThemeOption, setShowThemeOption] = useState(true); // 控制皮肤中心选项的显示/隐藏
  const [showSocialOption, setShowSocialOption] = useState(true); // 控制社交媒体选项的显示/隐藏
  const [showContactPop, setShowContactPop] = useState(false); // 控制“联系我们”弹层显示/隐藏（默认隐藏）

  const footerList = [
  {
    key: 'theme',
    icon: <Image src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/skin%402x.png'} style={{width: '44px', height: '44px'}} mode="aspectFit" />,
    text: '皮肤中心',
    extra: <IconFont name='right' size={32} color='#ccc' />,
    callback: () => {comingSoon()}
  }, {
    key: 'contact',
    icon: <Image src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/me-contact%402x.png'} style={{width: '44px', height: '44px'}} mode="aspectFit" />,
    text: '联系我们',
    extra: <IconFont name='right' size={32} color='#ccc' />,
    callback: () => {comingSoon()}
  }, {
    key: 'social',
    icon: <Image src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/social%402x.png'} style={{width: '44px', height: '44px'}} mode="aspectFit" />,
    text: '到社交媒体找我们',
    extra: <IconFont name='right' size={32} color='#ccc' />,
    callback: () => {comingSoon()}
  }, {
    key: 'about',
    icon: <Image src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/about%402x.png'} style={{width: '44px', height: '44px'}} mode="aspectFit" />,
    text: '关于',
    extra: <IconFont name='right' size={32} color='#ccc' />,
    callback: () => {about()}
  }, {
    key: 'donate',
    icon: <Image src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/donate%402x.png'} style={{width: '44px', height: '44px'}} mode="aspectFit" />,
    text: '捐赠',
    extra: <IconFont name='right' size={32} color='#ccc' />,
    callback: () => {reward()}
  }];

  useLoad(() => {
    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment']
    });

    
  });

  // 获取未读通知数量
  const getUnreadCount = async () => {
    try {
      const token = Taro.getStorageSync('token');
      if (!token) return;
      
      const res = await request({
        url: Interface.GET_UNREAD_COUNT
      });
      
      if (res?.data?.unreadCount !== undefined) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error('获取未读数量失败:', error);
    }
  };

  // 开始轮询未读通知数量
  const startPolling = () => {
    // 清除之前的定时器
    if (pollingTimer.current) {
      clearInterval(pollingTimer.current);
    }
    
    // 立即获取一次
    getUnreadCount();
    
    // 每1分钟轮询一次
    pollingTimer.current = setInterval(() => {
      getUnreadCount();
    }, 60000);
  };

  // 停止轮询
  const stopPolling = () => {
    if (pollingTimer.current) {
      clearInterval(pollingTimer.current);
      pollingTimer.current = null;
    }
  };

  useDidShow(() => {
    // console.log('Page loaded.')
    Taro.getStorage({
      key: 'token',
      complete: (res) => {
        console.log(res);
        if (res.data) {
          console.log('');
          setIsLogin(true);
          // 登录后开始轮询未读通知
          startPolling();
        } else {
          setIsLogin(false);
          stopPolling();
        }
      },
      // fail: () => {}
    })
    
    Taro.getStorage({
      key: 'userInfo',
      success: function (res) {
        console.log('res',res);
        if (res.data) {
          setUserInfo({
            avatar: res.data.avatar,
            nickName: res.data.nickName
          });
        }
      }
    })
    

    
  })
  
  // 页面卸载时清除定时器
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [])

  useShareTimeline(() => {
    console.log('onShareTimeline')
  })

  const score = () => {
    setPopVis(true);
    setPopType('score');
  };
  const comingSoon = () => {
    setPopVis(true);
    setPopType('coming');
  };
  const about = () => {
    setPopVis(true);
    setPopType('about');
  };
  const contact = () => {
    if (showContactPop) {
      setPopVis(true);
      setPopType('contact');
    }
  };
  const attendUs = () => {
    setPopVis(true);
    setPopType('attend');
  };
  const [donateVisible, setDonateVisible] = useState(false);
  const reward = ()=> {
    // 旧弹窗禁用，改用新 DonateModal
    setDonateVisible(true);
  };

  // 日历组件事件处理
  const handleDateChange = (date) => {
    console.log('选中日期:', date);
    // 这里可以添加日期选择后的逻辑
  };

  const handleToggleChange = (checked) => {
    console.log('交易所公告开关状态:', checked);
    // 这里可以添加开关切换后的逻辑，比如保存用户偏好设置
  };

  const scoreReport = (score) => {
    setScore(score);
    setScoreDisable(false);
  }

  const getTextValue = (e) => {
    const value = e.detail.value;
    scoreInput.current = value;
  };

  const confirmScore = async () => {
    if (isReporting) return;
    isReporting = true;
    Taro.showLoading({
      title: '',
      mask:true
    });
    // todo 上传评分
    const commentRes = await request({
      url: Interface.MOZI_COMMENT,
      method: 'POST',
      data: {
        score: reportScore,
        content: scoreInput.current
      }
    });

    if (commentRes?.data?.isSuccess) {
      Taro.hideLoading({
        success: () => {
          Taro.showToast({
            title: '反馈成功',
            icon: 'success',
            duration: 2000
          });
        }
      });
    } else {
      Taro.hideLoading({
        success: () => {
          Taro.showToast({
            title: '反馈失败',
            icon: 'error',
            duration: 2000
          });
        }
      });
    }
    isReporting = false;
    setPopVis(false);
  };

  const copy = (value) => {
    Taro.setClipboardData({
      data: value,
      success: (res) => {
        Taro.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000
        });
      }
    })
  };

  const jump2User = () => {
    jump2NoTab('user', {
      avatar: userInfo.avatar || '',
      nickName: userInfo.nickName || ''
    });
  };

  const phoneLogin = (e) => {
    const phoneCode = e.detail.code || '';
    Taro.login({
      complete: async (res) => {
        if (res.code) {
          Taro.showLoading({mask:true});
          const openIdCode = res.code;
          console.log('openIdCode', openIdCode);
          const tokenInfo = await request({
            url: Interface.MOZI_LOGIN,
            data: {
              chanel:1, 
              type:'login',
              phoneCode,
              loginCode: openIdCode,
            },
            method: 'POST'
          });

          console.log('tokenInfo', tokenInfo);
          Taro.hideLoading();
          if (tokenInfo?.data?.token) {
            Taro.setStorageSync('token', tokenInfo?.data?.token);
            console.log('用户信息本地缓存成功');
            setIsLogin(true);

            // 先保存用户信息
            console.log('userId', tokenInfo?.data?.userId);
            const userInfo = tokenInfo?.data?.userInfo;
            const userId = tokenInfo?.data?.userId;
            
            Taro.setStorageSync('needRefreshCommunity', true);
            if (!userInfo?.avatar || !userInfo?.nickName ) {
              jump2User();
            } else {
              Taro.setStorageSync('userInfo', {
                avatar: userInfo?.avatar,
                nickName: userInfo?.nickName,
                userId: userId
              });
              setUserInfo({
                avatar: userInfo?.avatar,
                nickName: userInfo?.nickName
              });
            }

            // 检查是否是该用户的首次登录（按用户ID绑定）
            const hasLoggedInBeforeKey = `hasLoggedInBefore_${userId}`;
            const hasLoggedInBefore = Taro.getStorageSync(hasLoggedInBeforeKey);
            if (!hasLoggedInBefore) {
              // 该用户首次登录，设置标记
              Taro.setStorageSync(hasLoggedInBeforeKey, true);
              Taro.setStorageSync('isFirstLogin', true);
              console.log(`✨ 检测到用户[${userId}]首次登录！`);
            } else {
              console.log(`📝 用户[${userId}]之前已登录过`);
            }

            
          } else {
            console.log('数据失败');
            Taro.showToast({
              title: '登录失败',
              icon: 'error',
              duration: 2000
            });
          }
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  };

  const matchOpenType = (key) => {
    if (key) {
      if (key  === 'score') {
        if (!isLogin) {
          return 'getPhoneNumber';
        }
      }
      return key
    } else {
      return '';
    }
  };

  const logout = () => {
    if (!isLogin) {
      Taro.showToast({
        title: '您已退出登录',
        icon: 'error',
      })
      return;
    }
    Taro.removeStorageSync('token');
    Taro.removeStorageSync('userInfo');
    setIsLogin(false);
    setUserInfo({})
    Taro.setStorageSync('needRefreshCommunity', true);
    Taro.showToast({
      title: '退出成功',
      icon: 'success',
    })
  };


  return (
    <View className='me'>
      <View className='header'>
        {
          isLogin? (
            
            <View className='headerUser' onClick={() => jump2User()}>
              <Image className='headerAvatar' mode='aspectFill' src={userInfo.avatar || DEFAULT_AVATAR} />
              <Text>{userInfo.nickName || '微信用户'}</Text>
              {
                isLogin && <Image className='editIcon' src={EDIT_ICON} /> // 移除 size 属性
              }
            </View>
          ) : (
            <Button className='loginBox' openType='getPhoneNumber' onGetPhoneNumber={phoneLogin}>
              <View className='headerUser'>
                <Image className='headerAvatar' mode='aspectFill' src={userInfo.avatar || DEFAULT_AVATAR} />
                <Text>{userInfo.nickName || '请登录'}</Text>
              </View>
            </Button>
          )
        }
        
        {/* 功能按钮区域 */}
        <View className='actionButtons'>
          <View className='actionButton' onClick={() => jump2Market('own')}>
            <View className='actionIcon'>
              <Image className='actionIconImg' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/optional%402x.png'} />
            </View>
            <Text className='actionText'>我的自选</Text>
          </View>
          <View className='actionButton' onClick={() => jump2NoTab('mywarn')}>
            <View className='actionIcon'>
              <Image className='actionIconImg' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/me-alert%402x.png'} />
            </View>
            <Text className='actionText'>我的报警</Text> 
          </View>
          <View className='actionButton' onClick={attendUs}>
            <View className='actionIcon'>
              <Image className='actionIconImg' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/official-accounts%402x.png'} />
            </View>
            <Text className='actionText'>关注公众号</Text>
          </View>
        </View>
      </View>

      {/* 第二排功能按钮 */}
      {showSecondaryActions && (
        <View className='secondaryActions'>
          <View className='actionRow'>
            <View className='actionButton' onClick={() => jump2NoTab('mycomments')}>
              <View className='actionIcon secondary'>
                <Image className='actionIconImg secondary' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/comment%402x.png'} />
              </View>
              <Text className='actionText secondary'>我的评论</Text>
            </View>
            <View className='actionButton' onClick={() => {
              jump2NoTab('mynotices');
              // 进入通知页面后，清空角标
              setUnreadCount(0);
            }}>
              <View className='actionIcon secondary'>
                <Image className='actionIconImg secondary' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/mail%402x.png'} />
                {unreadCount > 0 && <View className='badge'>{unreadCount > 99 ? '99+' : unreadCount}</View>}
              </View>
              <Text className='actionText secondary'>消息通知</Text>
            </View>
            <View className='actionButton' onClick={() => jump2NoTab('mylikes')}>
              <View className='actionIcon secondary'>
                <Image className='actionIconImg secondary' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/like%402x.png'} />
              </View>
              <Text className='actionText secondary'>我的点赞</Text>
            </View>
          </View>
        </View>
      )}

      {/* 左右分布的功能按钮 */}
      <View className='horizontalButtons'>
        {
          !isLogin ? (
                          <Button className='horizontalBtn left' openType='getPhoneNumber' onGetPhoneNumber={phoneLogin}>
                <View className='btnIcon'>
                  <Image className='btnIconImg' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/feedback%402x.png'} />
                </View>
              <View className='btnBottom'>
                <View className='btnContent'>
                  <Text className='btnText'>产品功能反馈</Text>
                  <Text className='btnSubtext'>留言你想要的功能</Text>
                </View>
                <View className='btnArrow'>
                  <IconFont name='right' size={28} color='#ccc' />
                </View>
              </View>
            </Button>
          ) : (
            <View className='horizontalBtn left' onClick={score}>
              <View className='btnIcon'>
                <Image className='btnIconImg' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/feedback%402x.png'} />
              </View>
              <View className='btnBottom'>
                <View className='btnContent'>
                  <Text className='btnText'>产品功能反馈</Text>
                  <Text className='btnSubtext'>留言你想要的功能</Text>
                </View>
                <View className='btnArrow'>
                  <IconFont name='right' size={28} color='#ccc' />
                </View>
              </View>
            </View>
          )
        }
        <Button className='horizontalBtn right' openType='share'>
          <View className='btnIcon'>
            <Image className='btnIconImg' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/me_slices/me-share%402x.png'} />
          </View>
          <View className='btnBottom'>
            <View className='btnContent'>
              <Text className='btnText'>推荐朋友</Text>
              <Text className='btnSubtext'>分享你的喜爱</Text>
            </View>
            <View className='btnArrow'>
              <IconFont name='right' size={28} color='#ccc' />
            </View>
          </View>
        </Button>
      </View>

      {/* 我的积分 */}
      {showPointsSection && (
        <View className='pointsSection'>
          <View className='pointsInfo' onClick={() => Taro.navigateTo({ url: '/packages/points/index' })}>
            <Text className='pointsTitle'>我的积分</Text>
            <View className='pointsValueRow'>
              <Text className='pointsValue'>2000</Text>
              <Text className='pointsDaily'>昨日积分：+100</Text>
            </View>
            <Text className='pointsRank'>
                         当前排名：总榜第 <Text style={{color: '#000', fontWeight: 'bold'}}>23</Text> 名
            </Text>
          </View>
          <View className='pointsAction' onClick={() => Taro.navigateTo({ url: '/packages/more/pointsrank/index' })}>
            <Text className='pointsButton'>积分榜单</Text>
            <IconFont name='right' size={24} color='#fff'/>
          </View>
          <Image className='pointsCoin' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/image/integral-coin.png'} />
        </View>
      )}

      {/* 日历组件（上） */}
      {showCalendarSection && (
        <View className='calendarSection'>
          <CalendarCard
            onDateChange={handleDateChange}
            onToggleChange={handleToggleChange}
            defaultToggle={true}
          />
        </View>
      )}

      {/* 新币上线组件（下） */}
      {showNewCoinListing && (
        <NewCoinListing />
      )}

      {/* 当日历隐藏时，插入一个弹性占位将退出登录推到底部 */}
      {!showCalendarSection && <View className='flex-spacer' />}

      <View className='footer'>
        <List className='footerList'>
          {footerList.map((item, index) => {
            const openType = matchOpenType(item.key);
            // 根据key判断是否隐藏
            if (item.key === 'theme' && !showThemeOption) return null;
            if (item.key === 'social' && !showSocialOption) return null;

            return (
              <List.Item key={index} className={`footerItem ${index === footerList.length - 1? 'last': ''}`}>
                {
                  openType === 'getPhoneNumber'? 
                  <Button className='footerBtn' openType={openType} onGetPhoneNumber={phoneLogin}>
                    <View className='icon'>{item.icon}</View>
                    <View className='text'>{item.text}</View>
                    <View className='extra'>{item.extra}</View>
                  </Button>:
                  <Button className='footerBtn' openType={openType} onClick={item.callback? item.callback: null}>
                  <View className='icon'>{item.icon}</View>
                  <View className='text'>{item.text}</View>
                  <View className='extra'>{item.extra}</View>
                </Button>
                }
              </List.Item>
            )
          })}
        </List>
        {/* <OfficialAccount></OfficialAccount> */}
      </View>
      
      {isLogin && (
        <Button className='logoutBtn' onClick={logout}>退出登录</Button>
      )}
      <PageContainer
        show={popVis}
        // onMaskClick={() => {
        //   setPopVisible(false)
        // }}
        onAfterLeave={() => {
          setPopVis(false)
        }}
        // bodyStyle={{ height: '40vh' }}
        closeOnSlideDown={true}
        round={true}
        forceRender={true}
        position='bottom'
      >
        {
          popType === 'about' && (
          <View className='popContainer'>
            <View className='aboutItem'>Mozi 是一家专业的加密数据分析智能平台，致力于为全球用户提供精准，实时的加密货币市场数据和分析服务，简化交易，降低交易的门槛，帮助用户在加密货币市场中做出明智的投资决策，降低风险，获得更高的收益。</View>
            <br />
            <View className='aboutItem sec-desc'>作为一家专业的加密数据分析平台，为解决用户去哪里买，买什么，怎么买的痛点，Mozi通过整合多种数据，提供详尽的搜索和丰富的各类排行榜让用户探索，包括但不限于交易所排行榜，热门币种排行榜，价格涨跌幅榜，目前覆盖主流交易所的数据。
为了保证数据的准确性和实时性，Mozi 团队由经验丰富的专业人士组成，涵盖交易、数据开发、数据分析,人工智能，和平台架构，他们的专业知识和技能为平台数据的准确性和可靠性提供了强大支持。
作为初创公司，Mozi 秉持墨子兼爱非攻的理念，致力于在全球传播这一理念。同时也诚邀感兴趣的技术，运营，产品以及投资机构联系我们。</View>
            <View className='aboutItem sec-con'>
              <Text>Mozi使命：</Text>
              让财富触手可及 
            </View>
            <View className='aboutItem'>
              <Text>Mozi愿景：</Text>
              让交易更简单，更智能，更安全</View>
            <View className='aboutItem'>
              <Text>Mozi价值观：</Text>
              兼爱 务实 专注 创新 自由</View>
          </View>
          )
        }
        {
          popType === 'coming' && (
          <View className='popContainer'>
            <Text style={{ textAlign: 'center' }}>敬请期待</Text>
          </View>
          )
        }
        {
          popType === 'score' && (
          <View className='popContainer'>
            <Text>根据您的使用经历，请问您有多大可能向您的朋友推荐Mozi行情助手</Text>
            <View className='score-desc'>
              <Text>极不愿意</Text>
              <Text>非常愿意</Text>
            </View>
            <Grid className='scoreList' columns={10} gap={5}>
              {
                [1,2,3,4,5,6,7,8,9,10].map((item, index) => {
                  return <Grid.Item key={index} className={`scoreItem ${item === reportScore? 'scoreActive': ''}`} onClick={() => {scoreReport(item)}}>{item}</Grid.Item>
                })
              }
            </Grid>
            <View className='score-con'>
              <View>
                <Text>更多反馈</Text>
                <Text className='score-con-desc'>（选填）</Text>
              </View>
              <Textarea className='score-text' placeholder='感谢反馈，期待您更多的建议' maxlength={200} onInput={getTextValue} />
            </View>
            <Button className={`score-btn ${scoreDisable? 'score-btn-disable': ''}`} onClick={confirmScore} disabled={scoreDisable}>提交</Button>
          </View>
          )
        }
        {
          popType === 'contact' && showContactPop && (
          <View className='popContainer contactContainer'>
            <Text className='contactTitle'>欢迎联系我们</Text>
            <View className='contactEmail'>
              <Text>{EMAIL}</Text>
              <View className='contactCopy' onClick={() => {copy(EMAIL)}}>
                <IconFont name='file-copy' size={40} />
              </View>
            </View>
          </View>
          )
        }
        {
          popType === 'attend' && (
          <View className='popContainer'>
            <Text className='contactTitle'>欢迎关注我们的公众号</Text>
            <Image
              className='attendPic'
              mode='aspectFit'
              lazyLoad={true}
              showMenuByLongpress={true}
              // style='width: 300px;height: 100px;background: #fff;'
              src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/wechat_account.jpg'
            />
          </View>
          )
        }
        {/* 旧版捐赠弹窗已停用，保留注释以便回滚参考
        {
          popType === 'reward' && (
            <View className='scrollContainer'>
              <Text className='contactTitle'>如果觉着好用，欢迎打赏支持</Text>
              <ScrollView
                scrollX
                enablePassive={true}
                scrollWithAnimation
                style={{whiteSpace: 'nowrap'}}
              >
                <View className='rewardBox'>
                  <Image className='attendPic' mode='aspectFit' lazyLoad showMenuByLongpress src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/wechat_pay.jpg' />
                </View>
                <View className='rewardBox'>
                  <Image className='attendPic' mode='aspectFit' lazyLoad showMenuByLongpress src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/BTC-simple.jpg' />
                  <View className='contactEmail'>
                    <Text className='coin-key' maxLines={2}>{COINKEY.BTC}</Text>
                  </View>
                </View>
                <View className='rewardBox'>
                  <Image className='attendPic' mode='aspectFit' lazyLoad showMenuByLongpress src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/ETH-simple.jpg' />
                  <View className='contactEmail'>
                    <View>{COINKEY.ETH}</View>
                  </View>
                </View>
                <View className='rewardBox'>
                  <Image className='attendPic' mode='aspectFit' lazyLoad showMenuByLongpress src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/Tron-simple.jpg' />
                  <View className='contactEmail'>
                    <Text>{COINKEY.TRON}</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          )
        }
        */}
      </PageContainer>

      {/* 新捐赠弹窗 */}
      <DonateModal
        visible={donateVisible}
        onClose={() => setDonateVisible(false)}
        image={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/wechat_pay.jpg'}
        text={'如果觉得好用，欢迎打赏支持'}
      />
    </View>
  )
}
