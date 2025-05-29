import { View, Text, Image, ScrollView, Button, Input, Textarea } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useLoad, useReachBottom, useShareAppMessage } from '@tarojs/taro';
import { SearchInput } from '../../components/SearchInput';
import { Interface } from '../../utils/constants';
import { request } from '../../utils/request';
import { Layout } from '../../components/Layout';
import { GardenLoading } from '../../components/Loading';

import { isEmpty } from 'lodash';
import IconFont from '../../components/iconfont';
import './index.less'

export default function CommunityPage() {
  // 接口定义
  if (!Interface.POSTS_DELETE) {
    Interface.POSTS_DELETE = '/posts/delete';
  }
  if (!Interface.POSTS_UPDATE) {
    Interface.POSTS_UPDATE = '/posts/update';
  }
  if (!Interface.CREATE_TOPIC) {
    Interface.CREATE_TOPIC = '/topic/new';
  }
  const [mainTab, setMainTab] = useState('recommend')
  const [subTab, setSubTab] = useState('all')
  const [showCoinSelector, setShowCoinSelector] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState('')
  const [dynamicCoin, setDynamicCoin] = useState(null) // 存储动态展示的币种
  const [showCreateTopic, setShowCreateTopic] = useState(false)
  const [topicTitle, setTopicTitle] = useState('')
  const [topicDesc, setTopicDesc] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  // const [showActionSheet, setShowActionSheet] = useState(false)
  // const [selectedPost, setSelectedPost] = useState(null)

  // 跳转到话题搜索页
  const goToTopicSearch = () => {
    Taro.navigateTo({
      url: `/pages/topicsearch/index`
    })
  }

  // 搜索币种
  const searchCoin = async (value) => {
    setSearchKeyword(value);
    if (!value) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await request({
        url: Interface.COIN_INFO,
        data: {
          coin: value
        }
      });
      if (!isEmpty(res?.data)) {
        setSearchResults(res.data.map(item => ({
          key: item.symbol,
          url: item.url,
          symbol: item.symbol
        })));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('搜索币种失败:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [posts, setPosts] = useState([])
  const [likedPosts, setLikedPosts] = useState({}) // 存储点赞状态
  const [hotTopics, setHotTopics] = useState([]);
  const [hotTopicsPage, setHotTopicsPage] = useState(1);
  const [hotTopicsLoading, setHotTopicsLoading] = useState(false);
  const [hotTopicsAllLoaded, setHotTopicsAllLoaded] = useState(false);
  // 获取热榜话题
  const fetchHotTopics = async () => {
    if (hotTopicsLoading || hotTopicsAllLoaded) return;
    setHotTopicsLoading(true);
    try {
      const response = await request({
        url: Interface.HOT_TOPICS_API,
        data: {
          page: hotTopicsPage,
          size
        }
      });
      
      if (response?.data) {

        if (response.data.isLogin === false) {
          // TODO
          console.error('获取热榜话题失败:', error);
          Taro.showToast({
            title: '获取数据失败',
            icon: 'error',
            duration: 2000
          });
          return;
        }

        const { data, totalPages, page: currentPage } = response.data;
        setHotTopics(prev => currentPage === 1 ? data : [...prev, ...data]);
        setHotTopicsAllLoaded(currentPage >= totalPages);
        setHotTopicsPage(currentPage + 1);
      }
    } catch (error) {
      console.error('获取热榜话题失败:', error);
      Taro.showToast({
        title: '获取数据失败',
        icon: 'error',
        duration: 2000
      });
    } finally {
      setHotTopicsLoading(false);
    }
  };

  // 获取帖子列表
  const fetchPosts = async () => {
    // if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await request({
        url: Interface.POSTS_API,
        data: {
          page,
          size
        }
      });
      
      if (response?.data?.data) {
        const { data, total, totalPages } = response.data;
        const formattedData = data.map(item => ({
          id: item.id,
          avatar: item.avatar || 'https://placeholder.co/100',
          nickname: item.nickname || '匿名用户',
          tag: item.category || '普通',
          title: item.title,
          content: item.content,
          comments: item.commentCnt || 0,
          likes: item.likeCnt || 0,
          userId: item.userId,
          tags: item.tags || [],
          topics: item.topics || [],
        }));
        
        setPosts(prevPosts => page === 1 ? formattedData : [...prevPosts, ...formattedData]);
        setHasMore(page < totalPages);
      }
    } catch (error) {
      console.error('获取帖子列表失败:', error);
      Taro.showToast({
        title: '获取数据失败',
        icon: 'error',
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  useShareAppMessage((res) => {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // 获取当前分享的评论数据
      const postId = res.target?.dataset?.postId
      const postTitle = res.target?.dataset?.postTitle
      
      if (postId && postTitle) {
        return {
          title: postTitle,
          path: `/pages/commentinfo/index?id=${postId}`,
        }
      }
    }
    // 默认分享整个社区页面
    return {
      title: 'Mozi社区 - 一起来讨论吧',
      path: '/pages/community/index',
    }
  })

  // 初始加载和刷新
  useEffect(() => {
    if (mainTab === 'recommend') {
      fetchPosts();
    } else if (mainTab === 'hot') {
      fetchHotTopics();
    }
  }, [page, mainTab]);

  // 获取当前用户ID
  const getCurrentUserId = () => {
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      if (userInfo && userInfo.userId) {
        setCurrentUserId(userInfo.userId);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }

  // 监听页面显示
  Taro.useDidShow(() => {
    // 获取当前用户ID
    getCurrentUserId();
    const needRefresh = Taro.getStorageSync('needRefreshCommunity');
    if (needRefresh) {
      Taro.showLoading();
      // 重置页码并刷新数据
      setPage(1);
      setHasMore(true);
      if (mainTab === 'recommend') {
        fetchPosts();
      } else if (mainTab === 'hot') {
        fetchHotTopics();
      }
      // 清除刷新标记
      Taro.hideLoading();
      Taro.removeStorageSync('needRefreshCommunity');
    }

    // 检查本地缓存中是否有从详情页传递过来的 symbol
    const symbolFromStorage = Taro.getStorageSync('communityCoinSymbol');
    console.log('symbolFromStorage',symbolFromStorage);
    if (symbolFromStorage) {
      setMainTab('recommend'); // 确保在推荐tab下
      setSubTab('currency');   // 切换到币种subTab
      handleCoinSelect(symbolFromStorage); // 处理币种选择
      Taro.removeStorageSync('communityCoinSymbol'); // 读取后立即清除
    } else {
      // // 保留原有的路由参数检查逻辑作为备用或移除 (根据实际需求决定)
      // const router = Taro.getCurrentInstance().router;
      // if (router && router.params && router.params.symbol) {
      //   const symbolFromParams = router.params.symbol;
      //   setMainTab('recommend'); // 确保在推荐tab下
      //   setSubTab('currency');   // 切换到币种subTab
      //   handleCoinSelect(symbolFromParams); // 处理币种选择
      // }
    }
  });

  // 下拉刷新
  const onPullDownRefresh = async () => {
    try {
      if (mainTab === 'hot') {
        setHotTopicsPage(1);
        setHotTopicsAllLoaded(false);
        await fetchHotTopics();
      } else {
        setPage(1);
        setHasMore(true);
        await fetchPosts();
      }
    } catch (error) {
      console.error('下拉刷新失败:', error);
      Taro.showToast({
        title: '刷新失败',
        icon: 'error',
        duration: 2000
      });
    } finally {
      Taro.stopPullDownRefresh();
    }
  };

  // 上拉加载更多
  const onReachBottom = () => {
    if (loading || hotTopicsLoading) return;
    
    if (mainTab === 'hot') {
      if (!hotTopicsAllLoaded) {
        fetchHotTopics();
      }
    } else {
      if (hasMore) {
        setPage(prev => prev + 1);
      }
    }
  };

  useReachBottom(() => {
    console.log('滑动到底部');
    onReachBottom();
  });

  // 子导航配置
  const subTabs = [
    { key: 'all', title: '全部' },
    { key: 'discovery', title: '发现好币' },
    { key: 'question', title: '不懂就问' },
    { key: 'currency', title: '币种' }
  ]

  // 币种标签配置
  const coinTabs = [
    { key: 'BTC', title: 'BTC' },
    { key: 'ETH', title: 'ETH' },
    { key: 'BNB', title: 'BNB' },
    { key: 'DOGE', title: 'DOGE' },
    { key: 'XRP', title: 'XRP' }
  ]

  // 处理删除帖子
  const handleDeletePost = async (e, postId) => {
    e.stopPropagation(); // 阻止冒泡，避免触发帖子详情跳转
    
    // 显示确认对话框
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条帖子吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const response = await request({
              url: `${Interface.POSTS_DELETE}/${postId}`,
              method: 'get'
            });
            
            if (response?.code === 0) {
              Taro.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              });
              
              // 从列表中移除已删除的帖子
              setPosts(prev => prev.filter(post => post.id !== postId));
            } else {
              Taro.showToast({
                title: '删除失败',
                icon: 'error',
                duration: 2000
              });
            }
          } catch (error) {
            console.error('删除帖子失败:', error);
            Taro.showToast({
              title: '删除失败',
              icon: 'error',
              duration: 2000
            });
          }
        }
      }
    });
  }

  // 处理更新帖子
  const handleUpdatePost = (e, post) => {
    console.log('e',e);
    console.log('post',post);
    e.stopPropagation(); // 阻止冒泡，避免触发帖子详情跳转
    
    // 跳转到发帖页面，并传递帖子信息
    Taro.navigateTo({
      url: `/pages/post/index?id=${post.id}&title=${encodeURIComponent(post.title)}&content=${encodeURIComponent(post.content)}&isUpdate=true`
    });
  }

  // 处理点赞/取消点赞
  const handleLike = async (e, postId) => {
    e.stopPropagation() // 阻止冒泡，避免触发帖子详情跳转
    try {
      const isLiked = likedPosts[postId]
      const response = await request({
        url: isLiked ? `${Interface.POSTS_UNLIKE}/${postId}` : `${Interface.POSTS_LIKE}/${postId}`,
        method: 'get'
      })

      if (response?.code === 0) {
        // 更新点赞状态
        setLikedPosts(prev => ({
          ...prev,
          [postId]: !isLiked
        }))
        
        // 更新点赞数
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: isLiked ? post.likes - 1 : post.likes + 1
            }
          }
          return post
        }))
      }
    } catch (error) {
      console.error('点赞操作失败:', error)
      Taro.showToast({
        title: '操作失败',
        icon: 'error',
        duration: 2000
      })
    }
  }

  const handlePost = () => {
    // 根据当前标签页确定要使用的模板
    let templateType = '';
    
    if (mainTab === 'recommend') {
      if (subTab === 'discovery') {
        templateType = '发现好币';
      } else if (subTab === 'question') {
        templateType = '不懂就问';
      } else {
        templateType = '普通';
      }
    } else {
      // 热榜页面默认使用普通模板
      templateType = '普通';
    }
    
    Taro.navigateTo({
      url: `/pages/post/index?templateType=${encodeURIComponent(templateType)}`
    })
  }

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin)
    setShowCoinSelector(false)
    
    // 检查选中的币种是否在coinTabs中
    const isInCoinTabs = coinTabs.some(tab => tab.key === coin)
    if (!isInCoinTabs) {
      // 如果不在coinTabs中，设置为动态展示的币种
      setDynamicCoin(coin)
    } else {
      // 如果在coinTabs中，清除动态币种
      setDynamicCoin(null)
    }
  }

  const handleMoreCoins = () => {
    setShowCoinSelector(true)
  }

  const handleTopicSquare = () => {
    Taro.navigateTo({
      url: '/pages/topics/square/index'
    })
  }

  // 创建话题
  const handleCreateTopic = async () => {
    console.log('创建话题');
    if (!topicTitle.trim()) {
      Taro.showToast({
        title: '请输入话题名称',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    try {
      const response = await request({
        url: Interface.CREATE_TOPIC,
        method: 'POST',
        data: {
          name: topicTitle.trim(),
          description: topicDesc.trim()
        }
      });
      
      if (response?.code === 0) {
        Taro.showToast({
          title: '创建成功',
          icon: 'success',
          duration: 2000
        });
        
        // 清空输入框
        setTopicTitle('');
        setTopicDesc('');
        
        // 关闭弹窗
        setShowCreateTopic(false);
        
        // 异步刷新话题列表
        setHotTopicsPage(1);
        setHotTopicsAllLoaded(false);
        
        // 异步获取最新话题列表数据
        (async () => {
          try {
            const topicsResponse = await request({
              url: Interface.HOT_TOPICS_API,
              data: {
                page: 1,
                size
              }
            });
            
            if (topicsResponse?.data) {
              const { data, totalPages } = topicsResponse.data;
              setHotTopics(data);
              setHotTopicsAllLoaded(1 >= totalPages);
              setHotTopicsPage(2);
            }
          } catch (error) {
            console.error('异步获取话题列表失败:', error);
          }
        })();
      } else {
        Taro.showToast({
          title: response?.errorMsg || '创建失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('创建话题失败:', error);
      Taro.showToast({
        title: '创建失败',
        icon: 'none',
        duration: 2000
      });
    }
  }

  // 添加跳转到评论详情页的方法
  const navigateToCommentInfo = (commentId) => {
    Taro.navigateTo({
      url: `/pages/commentinfo/index?id=${commentId}`
    })
  }

  // 添加跳转到话题详情页的方法
  const navigateToTopicInfo = (topicId) => {
    Taro.navigateTo({
      url: `/pages/topicinfo/index?id=${topicId}`
    })
  }

  // 处理操作菜单选择
  const handleActionClick = (type) => {
    if (!selectedPost) return;
    
    if (type === 'edit') {
      handleUpdatePost(null, selectedPost);
    } else if (type === 'delete') {
      handleDeletePost(null, selectedPost.id);
    }
    setShowActionSheet(false);
  };

  return (
    <View className="community-container">
      {/* 主导航 */}
      <View className="main-tabs">
        <View className="tabs-left">
          <Text 
            className={`tab-item ${mainTab === 'recommend' ? 'active' : ''}`}
            onClick={() => setMainTab('recommend')}
          >
            推荐
          </Text>
          <Text 
            className={`tab-item ${mainTab === 'hot' ? 'active' : ''}`}
            onClick={() => setMainTab('hot')}
          >
            热榜
          </Text>
        </View>
      </View>

      {/* 子导航 */}
      {mainTab === 'recommend' && (
        <ScrollView className="sub-tabs" scrollX>
          {subTabs.map(item => (
            <Text
              key={item.key}
              className={`sub-tab ${subTab === item.key ? 'active' : ''}`}
              onClick={() => setSubTab(item.key)}
            >
              {item.title}
            </Text>
          ))}
        </ScrollView>
      )}

      {/* 币种子标签 */}
      {mainTab === 'recommend' && subTab === 'currency' && (
        <ScrollView className="coin-tabs" scrollX>
          {coinTabs.map(item => (
            <Text
              key={item.key}
              className={`coin-tab ${selectedCoin === item.key ? 'active' : ''}`}
              onClick={() => handleCoinSelect(item.key)}
            >
              {item.title}
            </Text>
          ))}
          {dynamicCoin && (
            <Text
              className={`coin-tab ${selectedCoin === dynamicCoin ? 'active' : ''}`}
              onClick={() => handleCoinSelect(dynamicCoin)}
            >
              {dynamicCoin}
            </Text>
          )}
          <Text className="coin-tab more" onClick={handleMoreCoins}>更多</Text>
        </ScrollView>
      )}

      {/* 热榜搜索和创建 */}
      {mainTab === 'hot' && (
        <View className="hot-search-bar">
          <View className="search-box"  onClick={goToTopicSearch}>
            {/* <Input
              className="search-input"
              placeholder="搜索话题"
              value={searchKeyword}
              onInput={e => setSearchKeyword(e.detail.value)}
            /> */}
            <View>搜索话题</View>
          </View>
          <Button className="create-topic-btn" onClick={() => setShowCreateTopic(true)}>
            创建话题
          </Button>
        </View>
      )}

      {/* 内容列表 */}
      <View 
        className={`content-list ${mainTab === 'recommend' ? (subTab === 'currency' ? 'with-coin-tabs' : 'with-sub-tabs') : 'topic-sub-tabs'}`}
      >
        {mainTab === 'hot' ? (
          <View className="hot-topics">
            {hotTopics.length > 0 && hotTopics.map((topic, index) => (
              <View key={topic.id} className="hot-topic-item" onClick={() => navigateToTopicInfo(topic.id)}>
                <View className="topic-rank">{index + 1}</View>
                <View className="topic-info">
                  <Text className="topic-title">{topic.name}</Text>
                  <Text className="topic-desc">{topic.description || '暂无描述'}</Text>
                  <View className="topic-stats">
                    <Text className="stat-item">热度 {topic.score || 0}</Text>
                    <Text className="stat-item">{topic.createdAt.replace('T', '    ')}</Text>
                  </View>
                </View>
              </View>
            ))}
            {hotTopicsLoading && (
              <View className="loading-more">
                <GardenLoading />
              </View>
            )}
            {hotTopicsAllLoaded && (
              <View className="list-footer">
                <Text>已经到底了</Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            {posts
              .filter(item => {
                if (subTab === 'all') return true;
                return item.tag === subTabs.find(tab => tab.key === subTab)?.title;
              })
              .map(item => {
                return (
                  <View key={item.id} className="comment-card" onClick={() => navigateToCommentInfo(item.id)}>
                    {/* 用户自己的帖子显示编辑按钮 */}
                    {item.userId === currentUserId && (
                      <View className="edit-actions">
                        <View onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(item);
                          setShowActionSheet(true);
                        }}>
                          <IconFont name='ellipsis' size={50} />
                        </View>
                      </View>
                    )}

                    {/* 底部操作菜单 */}
                    {showActionSheet && (
                      <View className="action-sheet-mask" onClick={(e) => {e.stopPropagation(); setShowActionSheet(false)}}>
                        <View className="action-sheet" onClick={(e) => e.stopPropagation()}>
                          <View className="action-sheet-title">请选择操作</View>
                          <View className="action-sheet-item" onClick={() => handleActionClick('edit')}>
                            <Text>编辑</Text>
                          </View>
                          <View className="action-sheet-item" onClick={() => handleActionClick('delete')}>
                            <Text>删除</Text>
                          </View>
                        </View>
                      </View>
                    )}
                    {/* 用户信息 */}
                    <View className="user-info">
                      <Image src={item.avatar} className="avatar" />
                      <Text className="nickname">{item.nickname}</Text>
                    </View>
  
                    {/* 内容标签 */}
                    <Text className="content-tag">{item.tag}</Text>
  
                    {/* 标题 */}
                    <Text className="title">{item.title}</Text>
  
                    {/* 描述 */}
                    <Text className="description">{item.content}</Text>
                    
                    {/* 币种和话题标签 */}
                    {(item.tags?.length > 0 || item.topics?.length > 0) && (
                      <View className="tags-topics-container">
                        {/* 币种标签 */}
                        {item.tags?.map(tag => (
                          <Text 
                            key={`tag-${tag.id}`} 
                            className="coin-tag"
                            onClick={() => Taro.navigateTo({ url: `/pages/detail/index?symbol=${tag.name}` })}
                          >
                            ${tag.name}$
                          </Text>
                        ))}
                        
                        {/* 话题标签 */}
                        {item.topics?.map(topic => (
                          <Text 
                            key={`topic-${topic.id}`} 
                            className="topic-tag"
                            onClick={() => Taro.navigateTo({ url: `/pages/topicinfo/index?id=${topic.id}` })}
                          >
                            #{topic.name}
                          </Text>
                        ))}
                      </View>
                    )}
                    
                    {/* 操作按钮 */}
                    <View className="action-buttons">
                      <Button 
                        className="action-btn" 
                        openType='share' 
                        data-post-id={item.id} 
                        data-post-title={item.title}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconFont name='share' size={40} />
                        <Text className="icon-share"></Text>
                        分享
                      </Button>
                      <Button className="action-btn">
                        <IconFont name='message' size={30} />
                        <Text className="icon-comment">评论</Text>
                        {item.comments}
                      </Button>
                      <Button 
                        className={`action-btn ${likedPosts[item.id] ? 'liked' : ''}`}
                        onClick={(e) => handleLike(e, item.id)}
                      >
                        <IconFont name='heart-fill' color={likedPosts[item.id]? 'red': ''} size={30} />
                        <Text className="icon-like">喜欢</Text>
                        {item.likes}
                      </Button>
                    </View>
                  </View>
                )
              })}
            {loading && (
              <View className="loading-container">
                <Layout isLoading={true} />
              </View>
            )}
          </View>
        )}
      </View>

      {/* 添加悬浮发帖按钮 */}
      <View className="float-post-btn">
        <Button className="post-btn" onClick={handlePost}>
          <Text className="icon-plus">+</Text>
        </Button>
      </View>

      {/* 币种选择器弹窗 */}
      {showCoinSelector && (
        <View className="coin-selector-fullscreen">
          <View className="selector-header">
            <Text className="header-title">选择币种</Text>
            <Text className="close" onClick={() => setShowCoinSelector(false)}>取消</Text>
          </View>
          <View className="selector-search">
            <View className='selector-search-box'>
              <SearchInput
                value={searchKeyword}
                reloadFun={searchCoin}
              />
            </View>
            {searchLoading ? (
              <View className="loading-text">
                <GardenLoading />
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map(coin => (
                <View
                  key={coin.key}
                  className="coin-item"
                  onClick={() => handleCoinSelect(coin.symbol)}
                >
                  <Image className="coin-icon" src={coin.url} mode="aspectFit" />
                  <Text className="coin-name">{coin.symbol}</Text>
                  {selectedCoin === coin.symbol && (
                    <Text className="selected-icon">✓</Text>
                  )}
                </View>
              ))
            ) : searchKeyword ? (
              <View className="no-result">未找到相关币种</View>
            ) : null
          }
          </View>
        </View>
      )}

      {/* 创建话题弹窗 */}
      {showCreateTopic && (
        <View className="topic-creator-mask" onClick={() => setShowCreateTopic(false)}>
          <View className="topic-creator" onClick={e => e.stopPropagation()}>
            <View className="creator-header">
              <Text>创建话题</Text>
              <Text className="close" onClick={() => setShowCreateTopic(false)}>×</Text>
            </View>
            <View className="creator-content">
              <View className="input-group">
                <Text className="label">话题名称</Text>
                <Input
                  className="title-input"
                  value={topicTitle}
                  onInput={e => setTopicTitle(e.detail.value)}
                  placeholder="请输入话题名称（必填）"
                />
              </View>
              <View className="input-group">
                <Text className="label">话题简介</Text>
                <Textarea
                  className="desc-input"
                  value={topicDesc}
                  onInput={e => e.detail.value.length <= 60 && setTopicDesc(e.detail.value)}
                  placeholder="请输入话题简介（选填，最多60字）"
                  maxlength={60}
                />
                <Text className="word-count">{topicDesc.length}/60</Text>
              </View>
            </View>
            <Button 
              className={`create-btn ${topicTitle ? 'active' : ''}`}
              onClick={handleCreateTopic}
            >
              创建话题
            </Button>
          </View>
        </View>
      )}
    </View>
    
  )
}
