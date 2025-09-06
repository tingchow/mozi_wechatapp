import { View, Text, Image, ScrollView, Button, Input, Textarea } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useLoad, useReachBottom, useShareAppMessage, usePullDownRefresh } from '@tarojs/taro';
import { SearchInput } from '../../components/SearchInput';
import { Interface } from '../../utils/constants';
import { request } from '../../utils/request';
import { Layout } from '../../components/Layout';
import { GardenLoading } from '../../components/Loading';

import { isEmpty } from 'lodash';
import IconFont from '../../components/iconfont';
import './index.less'
import BullBearVote from '../../components/BullBearVote'
import recommendationImg from '../../assets/image/community/community-recommend.png'
import hotListImg from '../../assets/image/community/community-hot-list.png'

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
  const [selectedCoin, setSelectedCoin] = useState('BTC')
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
  const [pullRefresh, setPullRefresh] = useState(false)
  const [voteChoice, setVoteChoice] = useState(null)
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
    // 返回Promise以便在useDidShow中使用then和catch
    return new Promise(async (resolve, reject) => {
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
            reject(new Error('未登录')); // 失败时拒绝Promise
            return;
          }

          const { data, totalPages, page: currentPage } = response.data;
          setHotTopics(prev => currentPage === 1 ? data : [...prev, ...data]);
          setHotTopicsAllLoaded(currentPage >= totalPages);
          setHotTopicsPage(currentPage + 1);
          resolve(); // 成功解析Promise
        }
      } catch (error) {
        console.error('获取热榜话题失败:', error);
        Taro.showToast({
          title: '获取数据失败',
          icon: 'error',
          duration: 2000
        });
        reject(error); // 失败时拒绝Promise
      } finally {
        setHotTopicsLoading(false);
      }
    });
  };

  // 获取帖子列表
  const fetchPosts = async (forceRefresh = false) => {
    // 返回Promise以便在useDidShow中使用then和catch
    return new Promise(async (resolve, reject) => {
      // if (loading || !hasMore) return;
      setLoading(true);
      try {
        // 根据当前subTab确定请求参数
        let requestData = {
          page,
          size
        };
        
        // 根据subTab设置不同的参数并检查缓存
        // 只有在不强制刷新的情况下才使用缓存
        if (!forceRefresh && page === 1) {
          if (subTab === 'all') {
            // 全部标签
            // 检查是否有缓存的帖子列表
            const cachedAllPosts = Taro.getStorageSync('cachedAllPosts');
            if (cachedAllPosts && cachedAllPosts.length > 0) {
              // 如果有缓存且是第一页，直接使用缓存数据
              setPosts(cachedAllPosts);
              setHasMore(true); // 假设还有更多数据
              setLoading(false);
              resolve(); // 成功解析Promise
              return;
            }
          } else if (subTab === 'discovery') {
            // 发现好币标签
            requestData.category = '发现好币';
            
            // 检查是否有缓存的帖子列表
            const cachedCategoryPosts = Taro.getStorageSync('cachedCategoryPosts');
            if (cachedCategoryPosts && cachedCategoryPosts['discovery']) {
              // 如果有缓存且是第一页，直接使用缓存数据
              setPosts(cachedCategoryPosts['discovery']);
              setHasMore(cachedCategoryPosts['discovery'].length > 0 && 
                        (cachedCategoryPosts['discovery'][0]?.hasMore || true));
              setLoading(false);
              resolve(); // 成功解析Promise
              return;
            }
          } else if (subTab === 'question') {
            // 不懂就问标签
            requestData.category = '不懂就问';
            
            // 检查是否有缓存的帖子列表
            const cachedCategoryPosts = Taro.getStorageSync('cachedCategoryPosts');
            if (cachedCategoryPosts && cachedCategoryPosts['question']) {
              // 如果有缓存且是第一页，直接使用缓存数据
              setPosts(cachedCategoryPosts['question']);
              setHasMore(cachedCategoryPosts['question'].length > 0 && 
                        (cachedCategoryPosts['question'][0]?.hasMore || true));
              setLoading(false);
              resolve(); // 成功解析Promise
              return;
            }
          } else if (subTab === 'currency' && selectedCoin) {
            // 币种标签
            requestData.symbol = selectedCoin;
            
            // 检查是否有缓存的帖子列表
            const cachedPosts = Taro.getStorageSync('cachedCoinPosts');
            if (cachedPosts && cachedPosts[selectedCoin]) {
              // 如果有缓存且是第一页，直接使用缓存数据
              setPosts(cachedPosts[selectedCoin]);
              setHasMore(cachedPosts[selectedCoin].length > 0 && 
                        (cachedPosts[selectedCoin][0]?.hasMore || true));
              setLoading(false);
              resolve(); // 成功解析Promise
              return;
            }
          }
        } else {
          // 设置请求参数
          if (subTab === 'discovery') {
            requestData.category = '发现好币';
          } else if (subTab === 'question') {
            requestData.category = '不懂就问';
          } else if (subTab === 'currency' && selectedCoin) {
            requestData.symbol = selectedCoin;
          }
        }
        
        // 如果没有缓存或不是第一页，则请求数据
        const response = await request({
          url: Interface.POSTS_API,
          data: requestData
        });
        
        if (response?.data?.data) {
          const { data, total, totalPages } = response.data;
          const formattedData = data.map(item => ({
            id: item.id,
            avatar: item.avatar || 'https://placeholder.co/100',
            nickname: item.nickName || '匿名用户',
            tag: item.category || '普通',
            title: item.title,
            content: item.content,
            comments: item.commentCnt || 0,
            likes: item.likeCnt || 0,
            userId: item.userId,
            tags: item.tags || [],
            topics: item.topics || [],
            isLikedByCurrentUser: item.isLikedByCurrentUser || false,
            updatedAt: item.updatedAt,
          }));
          
          setPosts(prevPosts => page === 1 ? formattedData : [...prevPosts, ...formattedData]);
          setHasMore(page < totalPages);
          resolve(); // 成功解析Promise
        } else {
          // 如果没有数据，设置空数组
          if (page === 1) {
            setPosts([]);
          }
          setHasMore(false);
          resolve(); // 成功解析Promise，即使没有数据
        }
      } catch (error) {
        console.error('获取帖子列表失败:', error);
        Taro.showToast({
          title: '获取数据失败',
          icon: 'error',
          duration: 2000
        });
        reject(error); // 失败时拒绝Promise
      } finally {
        setLoading(false);
      }
    });
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
    console.log('useEffect触发: mainTab, subTab, selectedCoin变化');
    if (mainTab === 'recommend') {
      // 重置页码，确保切换tab时从第一页开始加载
      setPage(1);
      setLoading(true); // 确保设置loading状态
      fetchPosts();
    } else if (mainTab === 'hot') {
      setHotTopicsLoading(true); // 确保设置loading状态
      fetchHotTopics();
    }
  }, [mainTab, subTab, selectedCoin]);
  
  // 监听页码变化，加载更多数据
  useEffect(() => {
    console.log('useEffect触发: page变化', page);
    // 只有当页码大于1时才加载更多，避免重复加载第一页
    if (page > 1 && mainTab === 'recommend') {
      fetchPosts();
    }
  }, [page]);

  // 页面首次加载时预加载币种帖子列表
  useEffect(() => {
    preloadCoinPosts();
  }, []);

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
    // 设置当前页面导航栏背景色（仅社区页生效）
    try {
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#EEF0F3'
      });
    } catch (e) {}
    // 获取当前用户ID
    getCurrentUserId();
    console.log('进入社区页面');
    
    // 检查是否需要刷新社区页面
    const needRefresh = Taro.getStorageSync('needRefreshCommunity');
    
    if (needRefresh) {
      console.log('检测到需要刷新社区页面', needRefresh ? '发帖后返回' : '登录后返回');
      // 显示加载提示，让用户感知到正在刷新
      Taro.showLoading({
        title: '刷新中...',
        mask: true
      });
      
      // 重置页码并刷新数据
      setPage(1);
      setHasMore(true);
      
      // 根据当前标签页刷新不同的数据
      if (mainTab === 'recommend') {
        console.log('刷新推荐页面数据');
        // 设置loading状态，确保显示加载动画
        setLoading(true);
        // 强制刷新，不使用缓存
        fetchPosts(true)
          .then(() => {
            console.log('刷新帖子列表成功');
            // 数据加载完成后隐藏加载提示
            Taro.hideLoading();
            // 显示刷新成功提示
            Taro.showToast({
              title: '刷新成功',
              icon: 'success',
              duration: 1500
            });
          })
          .catch(err => {
            console.error('刷新帖子列表失败:', err);
            Taro.showToast({
              title: '刷新失败',
              icon: 'error',
              duration: 1500
            });
          })
          .finally(() => {
            // 无论成功失败，都隐藏加载提示并清除刷新标记
            Taro.hideLoading();
            Taro.removeStorageSync('needRefreshCommunity');
          });
      } else if (mainTab === 'hot') {
        console.log('刷新热门话题数据');
        // 设置热门话题loading状态
        setHotTopicsLoading(true);
        fetchHotTopics()
          .then(() => {
            console.log('刷新热门话题成功');
            // 数据加载完成后隐藏加载提示
            Taro.hideLoading();
            // 显示刷新成功提示
            Taro.showToast({
              title: '刷新成功',
              icon: 'success',
              duration: 1500
            });
          })
          .catch(err => {
            console.error('刷新热门话题失败:', err);
            Taro.showToast({
              title: '刷新失败',
              icon: 'error',
              duration: 1500
            });
          })
          .finally(() => {
            // 无论成功失败，都隐藏加载提示并清除刷新标记
            Taro.hideLoading();
            Taro.removeStorageSync('needRefreshCommunity');
          });
      } else {
        // 如果不在上述两种情况中，也要清除刷新标记和隐藏加载提示
        console.log('当前标签页不需要刷新');
        Taro.hideLoading();
        Taro.removeStorageSync('needRefreshCommunity');
      }
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
    console.log('触发下拉刷新');
    setPullRefresh(true);
    try {
      if (mainTab === 'hot') {
        setHotTopicsPage(1);
        setHotTopicsAllLoaded(false);
        await fetchHotTopics();
        // 显示刷新成功提示
        Taro.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1500
        });
      } else {
        setPage(1);
        setHasMore(true);
        // 强制刷新，不使用缓存
        await fetchPosts(true);
        // 显示刷新成功提示
        Taro.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1500
        });
      }
    } catch (error) {
      console.error('下拉刷新失败:', error);
      Taro.showToast({
        title: '刷新失败',
        icon: 'error',
        duration: 2000
      });
    } finally {
      setPullRefresh(false);
      Taro.stopPullDownRefresh();
    }
  };

  usePullDownRefresh(() => {
    onPullDownRefresh();
  });

  // 上拉加载更多
  const onReachBottom = () => {
    console.log('onReachBottom called, loading:', loading, 'hotTopicsLoading:', hotTopicsLoading);
    if (loading || hotTopicsLoading) return;
    
    if (mainTab === 'hot') {
      if (!hotTopicsAllLoaded) {
        console.log('加载热门话题');
        setHotTopicsLoading(true); // 设置加载状态
        fetchHotTopics();
      }
    } else {
      if (hasMore) {
        console.log('加载更多帖子');
        setLoading(true); // 设置加载状态
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
    
    // 显示确认对话框
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条帖子吗？',
      success: async (res) => {
        if (res.confirm) {
          Taro.showLoading({
            mask: true,
          });
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
          Taro.hideLoading();
        }
      }
    });
  }

  // 处理更新帖子
  const handleUpdatePost = (e, post) => {
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
    let urlParams = '';
    
    if (mainTab === 'recommend') {
      if (subTab === 'discovery') {
        templateType = '发现好币';
      } else if (subTab === 'question') {
        templateType = '不懂就问';
      } else if (subTab === 'currency' && selectedCoin) {
        // 币种标签下，携带币种信息
        templateType = '普通';
        urlParams = `&symbol=${selectedCoin}`;
        console.log('携带币种参数:', selectedCoin);
      } else {
        templateType = '普通';
      }
    } else {
      // 热榜页面默认使用普通模板
      templateType = '普通';
    }
    
    const url = `/pages/post/index?templateType=${encodeURIComponent(templateType)}${urlParams}`;
    console.log('跳转URL:', url);
    
    Taro.navigateTo({
      url: url
    })
  }

  // 预加载币种帖子列表和其他标签的帖子列表
  const preloadCoinPosts = async () => {
    // 预加载主标签（全部、发现好币、不懂就问）的帖子列表
    const cachedPosts = {};
    const cachedCategoryPosts = {};
    const cachedAllPosts = [];
    
    try {
      // 首先请求主标签的帖子列表（全部）
      const allPostsResponse = await request({
        url: Interface.POSTS_API,
        data: {
          page: 1,
          size
        }
      });
      
      if (allPostsResponse?.data?.data) {
        const { data, totalPages } = allPostsResponse.data;
        const formattedData = data.map(item => ({
          id: item.id,
          avatar: item.avatar || 'https://placeholder.co/100',
          nickname: item.nickName || '匿名用户',
          tag: item.category || '普通',
          title: item.title,
          content: item.content,
          comments: item.commentCnt || 0,
          likes: item.likeCnt || 0,
          userId: item.userId,
          tags: item.tags || [],
          topics: item.topics || [],
          isLikedByCurrentUser: item.isLikedByCurrentUser || false,
          updatedAt: item.updatedAt,
          hasMore: 1 < totalPages
        }));
        
        // 缓存全部标签的帖子列表
        cachedAllPosts.push(...formattedData);
        
        // 如果当前是全部标签，直接使用缓存的帖子列表
        if (subTab === 'all') {
          setPosts(formattedData);
          setHasMore(1 < totalPages);
          setLoading(false);
        }
      }
      
      // 并行请求发现好币和不懂就问标签的帖子列表
      const categoryRequests = [
        request({
          url: Interface.POSTS_API,
          data: {
            page: 1,
            size,
            category: '发现好币'
          }
        }),
        request({
          url: Interface.POSTS_API,
          data: {
            page: 1,
            size,
            category: '不懂就问'
          }
        })
      ];
      
      // 后置请求币种的帖子列表
      const defaultCoins = coinTabs.map(tab => tab.key);
      const coinRequests = defaultCoins.map(coin => {
        return request({
          url: Interface.POSTS_API,
          data: {
            page: 1,
            size,
            symbol: coin
          }
        });
      });
      
      // 先处理分类响应结果
      const categoryResponses = await Promise.all(categoryRequests);
      const categories = ['discovery', 'question'];
      categoryResponses.forEach((response, index) => {
        if (response?.data?.data) {
          const { data, totalPages } = response.data;
          const formattedData = data.map(item => ({
            id: item.id,
            avatar: item.avatar || 'https://placeholder.co/100',
            nickname: item.nickName || '匿名用户',
            tag: item.category || '普通',
            title: item.title,
            content: item.content,
            comments: item.commentCnt || 0,
            likes: item.likeCnt || 0,
            userId: item.userId,
            tags: item.tags || [],
            topics: item.topics || [],
            isLikedByCurrentUser: item.isLikedByCurrentUser || false,
            updatedAt: item.updatedAt,
            hasMore: 1 < totalPages
          }));
          
          // 缓存每个分类的帖子列表
          cachedCategoryPosts[categories[index]] = formattedData;
          
          // 如果当前是对应的分类标签，直接使用缓存的帖子列表
          if ((subTab === 'discovery' && categories[index] === 'discovery') || 
              (subTab === 'question' && categories[index] === 'question')) {
            setPosts(formattedData);
            setHasMore(1 < totalPages);
            setLoading(false);
          }
        }
      });
      
      // 后置处理币种响应结果
      const coinResponses = await Promise.all(coinRequests);
      coinResponses.forEach((response, index) => {
        if (response?.data?.data) {
          const { data, totalPages } = response.data;
          const formattedData = data.map(item => ({
            id: item.id,
            avatar: item.avatar || 'https://placeholder.co/100',
            nickname: item.nickName || '匿名用户',
            tag: item.category || '普通',
            title: item.title,
            content: item.content,
            comments: item.commentCnt || 0,
            likes: item.likeCnt || 0,
            userId: item.userId,
            tags: item.tags || [],
            topics: item.topics || [],
            isLikedByCurrentUser: item.isLikedByCurrentUser || false,
            updatedAt: item.updatedAt,
            hasMore: 1 < totalPages
          }));
          
          // 缓存每个币种的帖子列表
          cachedPosts[defaultCoins[index]] = formattedData;
          
          // 如果当前是币种标签且是当前选中的币种，直接使用缓存的帖子列表
          if (subTab === 'currency' && selectedCoin === defaultCoins[index]) {
            setPosts(formattedData);
            setHasMore(1 < totalPages);
            setLoading(false);
          }
        }
      });
      
      // 将缓存的帖子列表存储到本地
      Taro.setStorageSync('cachedCoinPosts', cachedPosts);
      Taro.setStorageSync('cachedCategoryPosts', cachedCategoryPosts);
      Taro.setStorageSync('cachedAllPosts', cachedAllPosts);
    } catch (error) {
      console.error('预加载帖子列表失败:', error);
      setLoading(false);
    }
  };

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
    
    // 检查是否有缓存的帖子列表
    const cachedPosts = Taro.getStorageSync('cachedCoinPosts');
    if (cachedPosts && cachedPosts[coin]) {
      // 如果有缓存，直接使用缓存数据
      setPosts(cachedPosts[coin]);
      setLoading(false);
    }
  }

  const handleMoreCoins = () => {
    setShowCoinSelector(true)
  }

  // 处理子标签切换
  const handleSubTabChange = (tab) => {
    // 如果切换到不同的标签，重置页码并设置加载状态
    if (tab !== subTab) {
      setSubTab(tab);
      setPage(1);
      setHasMore(true);
      setLoading(true); // 设置加载状态，避免显示上一个标签的数据
      setPosts([]); // 清空当前帖子列表，避免显示上一个标签的数据
      
      // 检查是否有缓存数据
      if (tab === 'all') {
        const cachedAllPosts = Taro.getStorageSync('cachedAllPosts');
        if (cachedAllPosts && cachedAllPosts.length > 0) {
          // 如果有缓存，直接使用缓存数据
          setPosts(cachedAllPosts);
          setHasMore(true); // 假设还有更多数据
          setLoading(false);
          return;
        }
      } else if (tab === 'discovery') {
        const cachedCategoryPosts = Taro.getStorageSync('cachedCategoryPosts');
        if (cachedCategoryPosts && cachedCategoryPosts['discovery']) {
          // 如果有缓存，直接使用缓存数据
          setPosts(cachedCategoryPosts['discovery']);
          setHasMore(cachedCategoryPosts['discovery'].length > 0 && 
                    (cachedCategoryPosts['discovery'][0]?.hasMore || true));
          setLoading(false);
          return;
        }
      } else if (tab === 'question') {
        const cachedCategoryPosts = Taro.getStorageSync('cachedCategoryPosts');
        if (cachedCategoryPosts && cachedCategoryPosts['question']) {
          // 如果有缓存，直接使用缓存数据
          setPosts(cachedCategoryPosts['question']);
          setHasMore(cachedCategoryPosts['question'].length > 0 && 
                    (cachedCategoryPosts['question'][0]?.hasMore || true));
          setLoading(false);
          return;
        }
      } else if (tab === 'currency' && selectedCoin) {
        const cachedPosts = Taro.getStorageSync('cachedCoinPosts');
        if (cachedPosts && cachedPosts[selectedCoin]) {
          // 如果有缓存，直接使用缓存数据
          setPosts(cachedPosts[selectedCoin]);
          setHasMore(cachedPosts[selectedCoin].length > 0 && 
                    (cachedPosts[selectedCoin][0]?.hasMore || true));
          setLoading(false);
          return;
        }
      }
      
      // 如果没有缓存，则请求数据
      // fetchPosts 会在 useEffect 中被触发，因为 subTab 已经改变
    }
  };

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
  const navigateToTopicInfo = (topicId, name, description = '暂无描述') => {
    if (description == null) description = '暂无描述'
    Taro.navigateTo({
      url: `/pages/topicinfo/index?id=${topicId}&title=${name}&description=${description}`
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
          <View
            className={`tab-card ${mainTab === 'recommend' ? 'active' : ''}`}
            onClick={() => setMainTab('recommend')}
          >
            <Image className="tab-image" src={recommendationImg} mode="aspectFill" />
          </View>
          <View
            className={`tab-card ${mainTab === 'hot' ? 'active' : ''}`}
            onClick={() => setMainTab('hot')}
          >
            <Image className="tab-image" src={hotListImg} mode="aspectFill" />
          </View>
        </View>
      </View>

      {/* 子导航 + 币种行 统一容器 */}
      {mainTab === 'recommend' && (
        <View className="tabs-wrapper">
          <ScrollView className="sub-tabs" scrollX>
            {subTabs.map(item => (
              <Text
                key={item.key}
                className={`sub-tab ${subTab === item.key ? 'active' : ''}`}
                onClick={() => handleSubTabChange(item.key)}
              >
                {item.title}
              </Text>
            ))}
          </ScrollView>
          {subTab === 'currency' && (
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
        </View>
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
              <View key={topic.id} className="hot-topic-item" onClick={() => navigateToTopicInfo(topic.id, topic.name, topic.description)}>
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
            {hotTopicsLoading && !pullRefresh && (
              <View className="loading-more">
                <GardenLoading />
              </View>
            )}
            {hotTopicsAllLoaded && hotTopics.length > 0 && (
              <View className="list-footer">
                <Text>已经到底了</Text>
              </View>
            )}
            {!hotTopicsLoading && hotTopics.length === 0 && (
              <View className="empty-content">
                <Text>暂无更多内容</Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            {subTab === 'currency' && (
              <View className="vote-wrapper">
                <BullBearVote
                  title={`您对今天的${selectedCoin}有何看法?`}
                  participants={5445}
                  selected={voteChoice}
                  onSelect={(type) => setVoteChoice(type)}
                />
              </View>
            )}
            {
              pullRefresh && (
                <View className="loading-more">
                      <GardenLoading />
                    </View>
              )
            }
            {posts.map(item => {
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
                          <View className="action-sheet-item" onClick={(e) => {e.stopPropagation();handleActionClick('edit')}}>
                            <Text>编辑</Text>
                          </View>
                          <View className="action-sheet-item" onClick={(e) => {e.stopPropagation();handleActionClick('delete')}}>
                            <Text>删除</Text>
                          </View>
                          {/* <View className="action-sheet-cancel" onClick={() => setShowActionSheet(false)}>
                            <Text>取消</Text>
                          </View> */}
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
                            onClick={(e) => {
                              e.stopPropagation(); // 阻止冒泡，避免触发帖子详情跳转
                              Taro.navigateTo({ url: `/pages/detail/index?symbol=${tag.name}` });
                            }}
                          >
                            ${tag.name}$
                          </Text>
                        ))}
                        
                        {/* 话题标签 */}
                        {item.topics?.map(topic => (
                          <Text 
                            key={`topic-${topic.id}`} 
                            className="topic-tag"
                            onClick={(e) => {
                              e.stopPropagation(); // 阻止冒泡，避免触发帖子详情跳转
                              Taro.navigateTo({ url: `/pages/topicinfo/index?id=${topic.id}` });
                            }}
                          >
                            #{topic.name}
                          </Text>
                        ))}
                      </View>
                    )}

                    <Text className="time">{(item.updatedAt|| '').replace('T', '    ')}</Text>
                    
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
                        <IconFont name='heart-fill' color={item.isLikedByCurrentUser || likedPosts[item.id]? 'red': ''} size={30} />
                        <Text className="icon-like">喜欢</Text>
                        {item.likes}
                      </Button>
                    </View>
                  </View>
                )
              })}
            {loading && !pullRefresh && (
              <View className="loading-container">
                <GardenLoading />
              </View>
            )}
            {!loading && posts.length === 0 && (
              <View className="empty-content">
                <Text>暂无更多内容</Text>
              </View>
            )}
            {!loading && hasMore && posts.length > 0 && (
              <View className="loading-more">
                <Text>上拉加载更多</Text>
              </View>
            )}
            {!loading && !hasMore && posts.length > 0 && (
              <View className="list-footer">
                <Text>已经到底了</Text>
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
