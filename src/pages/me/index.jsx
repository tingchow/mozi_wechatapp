import { View, Text, Image, Button, PageContainer, OfficialAccount, ScrollView, Textarea } from '@tarojs/components';
import { List, Popup, Grid } from 'antd-mobile';
import IconFont from '../../components/iconfont';
import Taro from '@tarojs/taro';
import { Login } from '../../components/Login';
import { useState, useEffect, useRef } from 'react';
import { useLoad, useShareTimeline, useDidShow } from '@tarojs/taro';
import { jump2Detail, jump2Market, jump2NoTab } from '../../utils/core';
import { request } from '../../utils/request';
import { EMAIL, COINKEY } from '../../utils/constants';
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

  const footerList = [
  //   {
  //   // 分享mozi view
  //   icon: <IconFont name='heart-fill' color='red' size={50} />,
  //   text: '我的自选',
  //   extra: <IconFont name='right' size={50} />,
  //   callback: () => jump2Market('own')
  // }, 
  {
    // 分享mozi view
    icon: <IconFont name='bodongfenxi' size={50} />,
    text: '分享MoziView',
    extra: <IconFont name='right' size={50} />,
  }, {
    // 评分
    icon: <IconFont name='bodongfenxi' size={50} />,
    text: '给我们评分',
    extra: <IconFont name='right' size={50} />,
    callback: () => {score()}
  },
  // {
  //   // 到社交媒体找我们
  //   icon: <IconFont name='bodongfenxi' size={50} />,
  //   text: '到社交媒体找我们',
  //   extra: <IconFont name='right' size={50} />
  // }, 
  {
    // 关于
    icon: <IconFont name='bodongfenxi' size={50} />,
    text: '关于',
    extra: <IconFont name='right' size={50} />,
    callback: () => {about()}
  }, {
    // 给我们留言
    icon: <IconFont name='bodongfenxi' size={50} />,
    text: '联系我们',
    extra: <IconFont name='right' size={50} />,
    callback: () => {contact()}
  }, {
    // 赞赏
    icon: <IconFont name='bodongfenxi' size={50} />,
    text: '赞赏',
    extra: <IconFont name='right' size={50} />,
    callback: () => {reward()}
  }];

  useLoad(() => {
    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment']
    });

    
  });

  useDidShow(() => {
    // console.log('Page loaded.')
    Taro.getStorage({
      key: 'token',
      complete: (res) => {
        console.log(res);
        if (res.data) {
          console.log('');
          setIsLogin(true);
        } else {
          setIsLogin(false);
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

  useShareTimeline(() => {
    console.log('onShareTimeline')
  })

  const score = () => {
    setPopVis(true);
    setPopType('score');
  };
  const about = () => {
    setPopVis(true);
    setPopType('about');
  };
  const contact = () => {
    setPopVis(true);
    setPopType('contact');
  };
  const attendUs = () => {
    setPopVis(true);
    setPopType('attend');
  };
  const reward = ()=> {
    setPopVis(true);
    setPopType('reward');
  };

  const scoreReport = (score) => {
    setScore(score);
    setScoreDisable(false);
  }

  const getTextValue = (e) => {
    const value = e.detail.value;
    scoreInput.current = value;
  };

  const confirmScore = () => {
    if (isReporting) return;
    isReporting = true;
    Taro.showLoading({
      title: '',
    });
    // todo 上传评分
    setTimeout(() => {
      isReporting = false;
      Taro.hideLoading({
        success: () => {
          Taro.showToast({
            title: '反馈成功',
            icon: 'success',
            duration: 2000
          });
        }
      });
      
    }, 5000);
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
          const openIdCode = res.code;

          const tokenInfo = await request({
            url: 'https://moziinnovations.com/user/login',
            data: {
              phoneCode,
              loginCode: openIdCode,
            },
            method: 'POST'
          });

          console.log('tokenInfo', tokenInfo);
          if (tokenInfo?.data?.token) {
            Taro.setStorageSync('token', tokenInfo?.data?.token);
            console.log('用户信息本地缓存成功');
            setIsLogin(true);

            // todo 请求用户的信息
            // todo 成功后
            // 如果是登录，表示有用户信息，不需要跳转
            // setUserInfo(userInfo);
            // Taro.setStorage('userInfo', userInfo);
            // 如果是注册，表示没有用户信息，跳转到用户信息页
            // jump2NoTab('user');
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


  return (
    <View className='me'>
      <View className='header'>
        {
          isLogin? (
            
            <View className='headerUser'>
              <Image className='headerAvatar' mode='aspectFill' src={userInfo.avatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'} />
              <Text>{userInfo.nickName || '微信用户'}</Text>
            </View>
          ) : (
            <Button className='loginBox' openType='getPhoneNumber' onGetPhoneNumber={phoneLogin}>
              <View className='headerUser'>
                <Image className='headerAvatar' mode='aspectFill' src={userInfo.avatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'} />
                <Text>{userInfo.nickName || '请登录'}</Text>
              </View>
            </Button>
          )
        }
        
        <View className='headerSelect'>
          <View className='headerSelectItem' onClick={() => jump2Market('own')}>
             <IconFont name='heart-fill' color='red' size={60} />
             <View className='headerSelectText'>我的自选</View>
          </View>
          {/* <View className='headerSelectItem'>
             <IconFont name='heart-fill' color='red' size={60} />
             <View className='headerSelectText'>我的报警</View>
          </View> */}
          
          <View className='headerSelectItem' onClick={attendUs}>
            <IconFont name='heart-fill' color='red' size={60} />
            <View className='headerSelectText'>关注公众号</View>
          </View>
        </View>
      </View>
      <View className='footer'>
        <List className='footerList'>
          {footerList.map((item, index) => {
            return (
              <List.Item className={`footerItem ${index === footerList.length - 1? 'last': ''}`}>
                <Button className='footerBtn' openType={index === 0? 'share': ''} onClick={item.callback? item.callback: null}>
                  <View className='icon'>{item.icon}</View>
                  <View className='text'>{item.text}</View>
                  <View className='extra'>{item.extra}</View>
                </Button>
              </List.Item>
            )
          })}
        </List>
        {/* <OfficialAccount></OfficialAccount> */}
      </View>
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
            <View className='aboutItem'>MoZi 是一家专业的加密数据分析智能平台，致力于为全球用户提供精准，实时的加密货币市场数据和分析服务，简化交易，降低交易的门槛，帮助用户在加密货币市场中做出明智的投资决策，降低风险，获得更高的收益。</View>
            <br />
            <View className='aboutItem sec-desc'>作为一家专业的加密数据分析平台，为解决用户去哪里买，买什么，怎么买的痛点，Mozi通过整合多种数据，提供详尽的搜索和丰富的各类排行榜让用户探索，包括但不限于交易所排行榜，热门币种排行榜，价格涨跌幅榜，目前覆盖主流交易所的数据。
为了保证数据的准确性和实时性，MoZi 团队由经验丰富的专业人士组成，涵盖交易、数据开发、数据分析,人工智能，和平台架构，他们的专业知识和技能为平台数据的准确性和可靠性提供了强大支持。
作为初创公司，MoZi 秉持墨子兼爱非攻的理念，致力于在全球传播这一理念。同时也诚邀感兴趣的技术，运营，产品以及投资机构联系我们。</View>
            <View className='aboutItem sec-con'>
              <Text>MoZi使命：</Text>
              让财富触手可及 
            </View>
            <View className='aboutItem'>
              <Text>MoZi愿景：</Text>
              让交易更简单，更智能，更安全</View>
            <View className='aboutItem'>
              <Text>MoZi价值观：</Text>
              兼爱 务实 专注 创新 自由</View>
          </View>
          )
        }
        {
          popType === 'score' && (
          <View className='popContainer'>
            <Text>根据您的使用经历，请问您有多大可能向您的朋友推荐mozi行情助手</Text>
            <View className='score-desc'>
              <Text>极不愿意</Text>
              <Text>非常愿意</Text>
            </View>
            <Grid className='scoreList' columns={10} gap={5}>
              {
                [1,2,3,4,5,6,7,8,9,10].map((item, index) => {
                  return <Grid.Item className={`scoreItem ${item === reportScore? 'scoreActive': ''}`} onClick={() => {scoreReport(item)}}>{item}</Grid.Item>
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
          popType === 'contact' && (
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
                  <Image
                    className='attendPic'
                    mode='aspectFit'
                    lazyLoad={true}
                    showMenuByLongpress={true}
                    // style='width: 300px;height: 100px;background: #fff;'
                    src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/wechat_pay.jpg'
                    // onClick={() => {preViewImage('../../assets/BTC.jpg')}}
                  />
                  {/* <View className='contactEmail'>
                    <Text className='coin-key' maxLines={2}>{COINKEY.BTC}</Text>
                    <View className='contactCopy' onClick={() => {copy(COINKEY.BTC)}}>
                      <IconFont name='file-copy' size={40} />
                    </View>
                  </View> */}
                </View>
                <View className='rewardBox'>
                  <Image
                    className='attendPic'
                    mode='aspectFit'
                    lazyLoad={true}
                    showMenuByLongpress={true}
                    // style='width: 300px;height: 100px;background: #fff;'
                    src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/BTC.jpg'
                    // onClick={() => {preViewImage('../../assets/BTC.jpg')}}
                  />
                  <View className='contactEmail'>
                    <Text className='coin-key' maxLines={2}>{COINKEY.BTC}</Text>
                    <View className='contactCopy' onClick={() => {copy(COINKEY.BTC)}}>
                      <IconFont name='file-copy' size={40} />
                    </View>
                  </View>
                </View>
                <View className='rewardBox'>
                  <Image
                    className='attendPic'
                    mode='aspectFit'
                    lazyLoad={true}
                    showMenuByLongpress={true}
                    // style='width: 300px;height: 100px;background: #fff;'
                    src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/ETH.jpg'
                    // onClick={() => {preViewImage('../../assets/ETH.jpg')}}
                  />
                  <View className='contactEmail'>
                    <View>{COINKEY.ETH}</View>
                    <View className='contactCopy' onClick={() => {copy(COINKEY.ETH)}}>
                      <IconFont name='file-copy' size={40} />
                    </View>
                  </View>
                </View>
                <View className='rewardBox'>
                  <Image
                    className='attendPic'
                    mode='aspectFit'
                    lazyLoad={true}
                    showMenuByLongpress={true}
                    // style='width: 300px;height: 100px;background: #fff;'
                    src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/Tron.jpg'
                    // onClick={() => {preViewImage('../../assets/Tron.jpg')}}
                  />
                  <View className='contactEmail'>
                    <Text>{COINKEY.TRON}</Text>
                    <View className='contactCopy' onClick={() => {copy(COINKEY.TRON)}}>
                      <IconFont name='file-copy' size={40} />
                    </View>
                  </View>
                </View>
              </ScrollView>
          </View>
          )
        }
      </PageContainer>
    </View>
  )
}
