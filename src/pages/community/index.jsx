import { View, Text, Image, ScrollView, Button, Input, Textarea } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import Taro, { useLoad, useReachBottom, useShareAppMessage, usePullDownRefresh } from '@tarojs/taro';
import { SearchInput } from '../../components/SearchInput';
import { Interface } from '../../utils/constants';
import { request } from '../../utils/request';
import { Layout } from '../../components/Layout';
import { GardenLoading } from '../../components/Loading';

import isEmpty from 'lodash/isEmpty';
import IconFont from '../../components/iconfont';
const CDN_PREFIX = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets';
const shareIcon = `${CDN_PREFIX}/icon/community/share.png`;
const likeActiveIcon = `${CDN_PREFIX}/icon/community/like-active.png`;
const commentIcon = `${CDN_PREFIX}/icon/community/comment.png`;
const likeNoActiveIcon = `${CDN_PREFIX}/icon/community/like-no-active.png`;
const messagesCommentIcon = `${CDN_PREFIX}/icon/community/messages-comment.png`;
const messagesLikeActiveIcon = `${CDN_PREFIX}/icon/community/messages-like-active.png`;
const messagesLikeNoActivedIcon = `${CDN_PREFIX}/icon/community/messages-like-no-actived.png`;
const messagesShareIcon = `${CDN_PREFIX}/icon/community/messages-share.png`;
const reasonIcon = `${CDN_PREFIX}/icon/community/reason.png`;
const plateIcon = `${CDN_PREFIX}/icon/community/plate.png`;
const integralIcon = `${CDN_PREFIX}/icon/community/integral.png`;
import './index.less'
import BullBearVote from '../../components/BullBearVote'
import QuestionButtons from '../../components/QuestionButtons'
// 三个图片Tab的CDN路径
const recommendActiveImg = `${CDN_PREFIX}/image/community/recomand_active@2x.png`;
const recommendInactiveImg = `${CDN_PREFIX}/image/community/recomand_no_active@2x.png`;
const newsActiveImg = `${CDN_PREFIX}/image/community/news_active@2x.png`;
const newsInactiveImg = `${CDN_PREFIX}/image/community/news_no_active@2x.png`;
const hotActiveImg = `${CDN_PREFIX}/image/community/hot_range_active@2x.png`;
const hotInactiveImg = `${CDN_PREFIX}/image/community/hot_range_no_active@2x.png`;
const findBestCoinIcon = `${CDN_PREFIX}/icon/community/find-best-coin.png`;
const nov1Icon = `${CDN_PREFIX}/icon/community/Nov1.png`;
const nov2Icon = `${CDN_PREFIX}/icon/community/Nov2.png`;
const nov3Icon = `${CDN_PREFIX}/icon/community/Nov3.png`;
const hotIcon = `${CDN_PREFIX}/icon/community/hot.png`;

// 时间格式化函数
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000; // years
  if (interval > 1) {
    return Math.floor(interval) + " 年前";
  }
  interval = seconds / 2592000; // months
  if (interval > 1) {
    return Math.floor(interval) + " 月前";
  }
  interval = seconds / 86400; // days
  if (interval > 1) {
    return Math.floor(interval) + " 天前";
  }
  interval = seconds / 3600; // hours
  if (interval > 1) {
    return Math.floor(interval) + " 小时前";
  }
  interval = seconds / 60; // minutes
  if (interval > 1) {
    return Math.floor(interval) + " 分钟前";
  }
  return Math.floor(seconds) + " 秒前";
};

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
  const [coinVoteData, setCoinVoteData] = useState({ upCount: 0, downCount: 0, participants: 0, userVote: null }) // 币种投票数据
  const [showQuestionButtons, setShowQuestionButtons] = useState(false) // 新增状态来控制按钮的显示/隐藏
  const [showBullBearVote, setShowBullBearVote] = useState(true) // 默认显示看涨看跌投票组件（币种子标签下）
  // const [showActionSheet, setShowActionSheet] = useState(false)
  // const [selectedPost, setSelectedPost] = useState(null)

  // 请求标识ref，用于防止竞态条件（与原项目对齐）
  const fetchPostsRequestIdRef = useRef(0);
  const fetchHotTopicsRequestIdRef = useRef(0);

  // 预加载后的 Tab 图片路径（默认使用 CDN，预加载成功后替换成本地/缓存路径）
  const [tabImageSrc, setTabImageSrc] = useState({
    recommendActive: recommendActiveImg,
    recommendInactive: recommendInactiveImg,
    newsActive: newsActiveImg,
    newsInactive: newsInactiveImg,
    hotActive: hotActiveImg,
    hotInactive: hotInactiveImg
  })

  // 跳转到话题搜索页
  const goToTopicSearch = () => {
    Taro.navigateTo({
      url: `/packages/community/topicsearch/index`
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
  const fetchHotTopics = async (reset = false) => {
    // 返回Promise以便在useDidShow中使用then和catch
    return new Promise(async (resolve, reject) => {
      if (hotTopicsLoading && !reset) return;
      
      // 生成新的请求ID（与原项目对齐）
      const requestId = ++fetchHotTopicsRequestIdRef.current;
      
      setHotTopicsLoading(true);
      
      const currentPage = reset ? 1 : hotTopicsPage;
      
      try {
        const response = await request({
          url: Interface.HOT_TOPICS_API,
          data: {
            page: currentPage,
            size
          }
        });
        
        // 检查是否是最新的请求，如果不是则忽略结果（与原项目对齐）
        if (requestId !== fetchHotTopicsRequestIdRef.current) {
          console.log('忽略过期的热榜请求');
          return;
        }
        
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

          const { data, totalPages } = response.data;
          if (reset || currentPage === 1) {
            setHotTopics(data);
          } else {
            setHotTopics(prev => [...prev, ...data]);
          }
          setHotTopicsAllLoaded(currentPage >= totalPages);
          setHotTopicsPage(currentPage + 1);
          
          // 接口成功返回后才关闭loading
          setHotTopicsLoading(false);
          resolve(); // 成功解析Promise
        }
      } catch (error) {
        // 检查是否是最新的请求
        if (requestId !== fetchHotTopicsRequestIdRef.current) {
          return;
        }
        
        console.error('获取热榜话题失败:', error);
        Taro.showToast({
          title: '获取数据失败',
          icon: 'error',
          duration: 2000
        });
        
        // 只有在接口报错时才关闭loading
        setHotTopicsLoading(false);
        reject(error); // 失败时拒绝Promise
      }
    });
  };

  // 获取帖子列表
  const fetchPosts = async (forceRefresh = false) => {
    // 返回Promise以便在useDidShow中使用then和catch
    return new Promise(async (resolve, reject) => {
      // 如果正在加载且不是强制刷新，则不重复加载
      if (loading && !forceRefresh) {
        console.log('🔍 [DEBUG] 正在加载中，跳过本次请求');
        resolve(); // 重要：需要 resolve Promise
        return;
      }
      
      // 生成新的请求ID，用于识别最新请求（与原项目对齐）
      const requestId = ++fetchPostsRequestIdRef.current;
      
      setLoading(true);
      
      try {
        // 根据当前subTab确定请求参数
        // 如果是强制刷新，使用第1页，否则使用当前页码
        const currentPage = forceRefresh ? 1 : page;
        let requestData = {
          page: currentPage,
          size
        };
        
        // 根据subTab设置不同的参数并检查缓存
        // 只有在不强制刷新的情况下才使用缓存
        if (!forceRefresh && currentPage === 1) {
          if (subTab === 'all') {
            // 全部标签
            requestData.userType = 'real'; // 精选推荐：真实用户
            
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
            requestData.userType = 'real'; // 精选推荐：真实用户
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
            requestData.userType = 'real'; // 精选推荐：真实用户
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
          // 根据mainTab设置userType参数（与原项目对齐）
          if (mainTab === 'recommend') {
            // 根据subTab设置不同的参数
            if (subTab === 'discovery') {
              requestData.userType = 'real'; // 精选推荐：真实用户
              requestData.category = '发现好币';
            } else if (subTab === 'question') {
              requestData.userType = 'real'; // 精选推荐：真实用户
              requestData.category = '不懂就问';
            } else if (subTab === 'currency' && selectedCoin) {
              // 币种标签：不设置 userType，只设置 symbol
              requestData.symbol = selectedCoin;
            } else {
              // 'all' 标签
              requestData.userType = 'real'; // 精选推荐：真实用户
            }
          } else if (mainTab === 'news') {
            requestData.userType = 'virtual'; // 快讯：虚拟用户
          }
        }
        
        // 如果没有缓存或不是第一页，则请求数据
        const response = await request({
          url: Interface.POSTS_API,
          data: requestData
        });
        
        // 检查是否是最新的请求，如果不是则忽略结果（防止竞态条件，与原项目对齐）
        if (requestId !== fetchPostsRequestIdRef.current) {
          console.log('忽略过期的帖子请求，requestId:', requestId, '当前最新:', fetchPostsRequestIdRef.current);
          return;
        }
        
        if (response?.data?.data) {
          const { data, total, totalPages } = response.data;
          const formattedData = data.map(item => ({
            id: item.id,
            avatar: item.avatar || 'https://placeholder.co/100',
            nickname: item.nickName || '匿名用户',
            tag: item.category || '普通',
            category: item.category, // 保留原始category字段
            title: item.title,
            content: item.content,
            comments: item.commentCnt || 0,
            likes: item.likeCnt || 0,
            userId: item.userId,
            tags: item.tags || [],
            topics: item.topics || [],
            isLikedByCurrentUser: item.isLikedByCurrentUser || false,
            updatedAt: item.updatedAt,
            createdAt: item.createdAt,
            userType: item.userType, // 添加 userType 字段
            images: item.images || [],
            sector: item.sector // 所属板块字段
          }));
          
          // 前端兜底过滤：根据标签过滤不同的 userType（与原项目对齐）
          // 精选推荐：显示非 'virtual' 的帖子（包括 'real'、'jinancn' 等真实用户）
          // 快讯：只显示 userType === 'virtual' 的帖子
          // 币种标签：不进行 userType 过滤
          const filteredData = formattedData.filter(item => {
            // 币种标签不过滤 userType
            if (mainTab === 'recommend' && subTab === 'currency') {
              return true;
            }
            if (mainTab === 'recommend') {
              return item.userType !== 'virtual';
            } else if (mainTab === 'news') {
              return item.userType === 'virtual';
            }
            return true; // 其他情况显示所有
          });
          
          // 按 createdAt 倒序排序，最新的在前面
          const sortedData = filteredData.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          });
          
          if (currentPage === 1) {
            setPosts(sortedData);
          } else {
            // 追加数据时，使用Set去重，避免重复显示
            setPosts(prevPosts => {
              const existingIds = new Set(prevPosts.map(p => p.id));
              const newPosts = sortedData.filter(p => !existingIds.has(p.id));
              return [...prevPosts, ...newPosts];
            });
          }
          
          // 更新 hasMore 状态：
          // 1. 如果当前页小于总页数，说明还有更多数据
          // 2. 如果返回的数据为空，说明没有更多数据了
          // 3. 如果返回的数据少于请求的size，说明这是最后一页
          const hasMoreData = currentPage < totalPages && data.length > 0 && data.length >= size;
          setHasMore(hasMoreData);
          
          // 接口成功返回后才关闭loading
          setLoading(false);
          resolve(); // 成功解析Promise
        } else {
          // 如果没有数据，设置空数组
          if (currentPage === 1) {
            setPosts([]);
          }
          setHasMore(false);
          
          // 接口成功返回后才关闭loading
          setLoading(false);
          resolve(); // 成功解析Promise，即使没有数据
        }
      } catch (error) {
        // 检查是否是最新的请求
        if (requestId !== fetchPostsRequestIdRef.current) {
          console.log('忽略过期请求的错误');
          return;
        }
        
        console.error('获取帖子列表失败:', error);
        Taro.showToast({
          title: '获取数据失败',
          icon: 'error',
          duration: 2000
        });
        
        // 只有在接口报错时才关闭loading
        setLoading(false);
        reject(error); // 失败时拒绝Promise
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
          path: `/packages/community/commentinfo/index?id=${postId}`,
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
    if (mainTab === 'recommend' || mainTab === 'news') {
      // 重置页码和帖子列表，确保切换tab时从第一页开始加载
      setPage(1);
      setPosts([]); // 清空帖子列表
      setHasMore(true);
      setLoading(true); // 确保设置loading状态
      
      // 使用 setTimeout 确保状态更新后再调用接口
      setTimeout(() => {
        fetchPosts(true); // 传入 true 表示强制刷新
      }, 0);
      
      // 如果是币种tab，获取投票数据
      if (subTab === 'currency' && selectedCoin) {
        fetchCoinVoteData(selectedCoin);
      }
    } else if (mainTab === 'hot') {
      setHotTopics([]);
      setHotTopicsPage(1);
      setHotTopicsAllLoaded(false);
      setHotTopicsLoading(true); // 确保设置loading状态
      
      setTimeout(() => {
        fetchHotTopics(true); // 传入 true 表示重置
      }, 0);
    }
  }, [mainTab, subTab, selectedCoin]);
  
  // 监听页码变化，加载更多数据
  useEffect(() => {
    console.log('useEffect触发: page变化', page);
    // 只有当页码大于1时才加载更多，避免重复加载第一页
    if (page > 1 && (mainTab === 'recommend' || mainTab === 'news')) {
      fetchPosts();
    }
  }, [page]);

  // 页面首次加载时预加载币种帖子列表
  useEffect(() => {
    preloadCoinPosts();
  }, []);

  // 页面首次加载时预缓存主 Tab 图片，避免首次点击时闪白
  useEffect(() => {
    preloadTabImages();
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
    // 读取首页设置的预设主tab
    try {
      const preset = Taro.getStorageSync('communityMainTabPreset');
      if (preset === 'hot' || preset === 'recommend') {
        setMainTab(preset);
        Taro.removeStorageSync('communityMainTabPreset');
      }
    } catch (e) {}
    // 获取当前用户ID
    getCurrentUserId();
    console.log('进入社区页面');
    
    // 检查是否需要刷新社区页面
    const needRefresh = Taro.getStorageSync('needRefreshCommunity');
    
    if (needRefresh) {
      console.log('检测到需要刷新社区页面', needRefresh ? '发帖后返回' : '登录后返回');
      
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
            // 清除刷新标记
            Taro.removeStorageSync('needRefreshCommunity');
          });
      } else if (mainTab === 'hot') {
        console.log('刷新热门话题数据');
        // 设置热门话题loading状态
        setHotTopicsLoading(true);
        fetchHotTopics()
          .then(() => {
            console.log('刷新热门话题成功');
          })
          .catch(err => {
            console.error('刷新热门话题失败:', err);
            Taro.showToast({
              title: '刷新失败',
              icon: 'error',
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
            // 清除刷新标记
            Taro.removeStorageSync('needRefreshCommunity');
          });
      } else {
        // 如果不在上述两种情况中，也要清除刷新标记
        console.log('当前标签页不需要刷新');
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
    console.log('🔍 [DEBUG] onReachBottom called');
    console.log('🔍 [DEBUG] mainTab:', mainTab);
    console.log('🔍 [DEBUG] loading:', loading);
    console.log('🔍 [DEBUG] hasMore:', hasMore);
    console.log('🔍 [DEBUG] page:', page);
    console.log('🔍 [DEBUG] hotTopicsLoading:', hotTopicsLoading);
    
    if (loading || hotTopicsLoading) {
      console.log('🔍 [DEBUG] 正在加载中，跳过');
      return;
    }
    
    if (mainTab === 'hot') {
      if (!hotTopicsAllLoaded) {
        console.log('🔍 [DEBUG] 加载热门话题');
        setHotTopicsLoading(true);
        fetchHotTopics();
      }
    } else if (mainTab === 'recommend' || mainTab === 'news') {
      if (hasMore) {
        console.log('🔍 [DEBUG] 加载更多帖子，当前page:', page);
        // 不要在这里设置 setLoading(true)，fetchPosts 内部会设置
        setPage(prev => {
          console.log('🔍 [DEBUG] 设置page从', prev, '到', prev + 1);
          return prev + 1;
        });
      } else {
        console.log('🔍 [DEBUG] 没有更多数据了');
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
    { key: 'currency', title: '币种' },
    { key: 'question', title: '不懂就问' },
    { key: 'discovery', title: '发现好币' }
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
      url: `/packages/community/post/index?id=${post.id}&title=${encodeURIComponent(post.title)}&content=${encodeURIComponent(post.content)}&isUpdate=true`
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
        setLikedPosts(prev => {
          const newLikedPosts = { ...prev };
          newLikedPosts[postId] = !isLiked;
          return newLikedPosts;
        })
        
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
        
        // 点赞成功后，自动调用每日点赞任务完成接口（与原项目对齐）
        if (!isLiked) {
          const { reportDailyLike } = require('../../utils/taskHelper')
          reportDailyLike()
        }
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
    
    const url = `/packages/community/post/index?templateType=${encodeURIComponent(templateType)}${urlParams}`;
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
          size,
          userType: 'real' // 精选推荐：真实用户
        }
      });
      
      if (allPostsResponse?.data?.data) {
        const { data, totalPages } = allPostsResponse.data;
        const formattedData = data.map(item => ({
          id: item.id,
          avatar: item.avatar || 'https://placeholder.co/100',
          nickname: item.nickName || '匿名用户',
          tag: item.category || '普通',
          category: item.category,
          title: item.title,
          content: item.content,
          comments: item.commentCnt || 0,
          likes: item.likeCnt || 0,
          userId: item.userId,
          tags: item.tags || [],
          topics: item.topics || [],
          isLikedByCurrentUser: item.isLikedByCurrentUser || false,
          updatedAt: item.updatedAt,
          createdAt: item.createdAt,
          userType: item.userType,
          images: item.images || [],
          sector: item.sector,
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
            userType: 'real', // 精选推荐：真实用户
            category: '发现好币'
          }
        }),
        request({
          url: Interface.POSTS_API,
          data: {
            page: 1,
            size,
            userType: 'real', // 精选推荐：真实用户
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
            category: item.category,
            title: item.title,
            content: item.content,
            comments: item.commentCnt || 0,
            likes: item.likeCnt || 0,
            userId: item.userId,
            tags: item.tags || [],
            topics: item.topics || [],
            isLikedByCurrentUser: item.isLikedByCurrentUser || false,
            updatedAt: item.updatedAt,
            createdAt: item.createdAt,
            userType: item.userType,
            images: item.images || [],
            sector: item.sector,
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
            category: item.category,
            title: item.title,
            content: item.content,
            comments: item.commentCnt || 0,
            likes: item.likeCnt || 0,
            userId: item.userId,
            tags: item.tags || [],
            topics: item.topics || [],
            isLikedByCurrentUser: item.isLikedByCurrentUser || false,
            updatedAt: item.updatedAt,
            createdAt: item.createdAt,
            userType: item.userType,
            images: item.images || [],
            sector: item.sector,
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

  // 预加载图片得到可用路径（微信小程序用 downloadFile，H5 直接预热缓存）
  const preloadImage = async (url) => {
    try {
      const env = Taro.getEnv();
      if (env === Taro.ENV_TYPE.WEAPP) {
        const res = await Taro.downloadFile({ url });
        if (res && res.statusCode === 200 && res.tempFilePath) {
          return res.tempFilePath;
        }
        return url;
      }
      // H5 端：通过构建 Image 对象预热浏览器缓存
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      });
      return url;
    } catch (e) {
      return url;
    }
  }

  // 并行预加载主 Tab 使用到的六张图片
  const preloadTabImages = async () => {
    try {
      const [recoActive, recoInactive, newsActive, newsInactive, hotActive, hotInactive] = await Promise.all([
        preloadImage(recommendActiveImg),
        preloadImage(recommendInactiveImg),
        preloadImage(newsActiveImg),
        preloadImage(newsInactiveImg),
        preloadImage(hotActiveImg),
        preloadImage(hotInactiveImg)
      ]);
      setTabImageSrc({
        recommendActive: recoActive,
        recommendInactive: recoInactive,
        newsActive,
        newsInactive,
        hotActive,
        hotInactive
      });
    } catch (e) {
      // 忽略预加载失败，保持使用 CDN
    }
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
    
    // 投票数据会在 useEffect 中自动获取，这里不需要重复调用
    
    // 检查是否有缓存的帖子列表
    const cachedPosts = Taro.getStorageSync('cachedCoinPosts');
    if (cachedPosts && cachedPosts[coin]) {
      // 如果有缓存，直接使用缓存数据
      setPosts(cachedPosts[coin]);
      setLoading(false);
    }
  }

  // 获取币种投票数据
  const fetchCoinVoteData = async (coin) => {
    try {
      const response = await request({
        url: Interface.GET_COIN_VOTE,
        data: {
          coinType: coin
        }
      })
      
      console.log('查询投票数量:', response)
      
      if (response?.code === 0 && response?.data) {
        const { upCount = 0, downCount = 0, userChoice = null } = response.data
        const participants = upCount + downCount
        // userChoice 可能是 'up' 或 'down'，需要转换为 'bull' 或 'bear'
        const userVote = userChoice === 'up' ? 'bull' : userChoice === 'down' ? 'bear' : null
        setCoinVoteData({ upCount, downCount, participants, userVote })
        setVoteChoice(userVote)
      } else {
        // 如果没有数据，使用默认值
        setCoinVoteData({ upCount: 0, downCount: 0, participants: 0, userVote: null })
        setVoteChoice(null)
      }
    } catch (error) {
      console.error('获取投票数据失败:', error)
      // 出错时使用默认值
      setCoinVoteData({ upCount: 0, downCount: 0, participants: 0, userVote: null })
      setVoteChoice(null)
    }
  }

  // 提交币种投票
  const handleCoinVote = async (type) => {
    // 检查用户是否登录
    const token = Taro.getStorageSync('token')
    if (!token) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 如果用户已经投过票，不允许重复投票
    if (coinVoteData.userVote) {
      Taro.showToast({
        title: '您已经投过票了',
        icon: 'none',
        duration: 2000
      })
      return
    }

    try {
      // 将 'bull' 转换为 'up'，'bear' 转换为 'down'
      const voteType = type === 'bull' ? 'up' : 'down'
      
      const response = await request({
        url: Interface.SUBMIT_COIN_VOTE,
        method: 'POST',
        data: {
          coinType: selectedCoin,
          type: voteType
        }
      })

      console.log('投票提交返回:', response)

      if (response?.code === 0) {
        Taro.showToast({
          title: '投票成功',
          icon: 'success',
          duration: 1500
        })
        
        // 更新投票数据
        setVoteChoice(type)
        // 重新获取最新投票数据
        fetchCoinVoteData(selectedCoin)
      } else {
        Taro.showToast({
          title: response?.errorMsg || response?.message || '投票失败',
          icon: 'none',
          duration: 2000
        })
      }
    } catch (error) {
      console.error('投票失败:', error)
      Taro.showToast({
        title: '投票失败',
        icon: 'none',
        duration: 2000
      })
    }
  }

  const handleMoreCoins = () => {
    setShowCoinSelector(true)
  }

  // 处理热门话题加载更多
  const handleLoadMore = () => {
    if (mainTab === 'hot' && !hotTopicsLoading && !hotTopicsAllLoaded) {
      fetchHotTopics();
    }
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
      url: `/packages/community/commentinfo/index?id=${commentId}`
    })
  }

  // 添加跳转到话题详情页的方法
  const navigateToTopicInfo = (topicId, name, description = '暂无描述') => {
    if (description == null) description = '暂无描述'
    Taro.navigateTo({
      url: `/packages/community/topicinfo/index?id=${topicId}&title=${name}&description=${description}`
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
    <View className={`community-container ${mainTab === 'hot' ? 'hot-mode' : ''}`}>
      {/* 主导航 - 三个图片Tab */}
      <View className="main-tabs">
        <View className="tabs-left">
          <View
            className={`tab-card ${mainTab === 'recommend' ? 'active' : ''}`}
            onClick={() => setMainTab('recommend')}
          >
            <Image className="tab-image" src={mainTab === 'recommend' ? tabImageSrc.recommendActive : tabImageSrc.recommendInactive} mode="aspectFill" />
          </View>
          <View
            className={`tab-card ${mainTab === 'news' ? 'active' : ''}`}
            onClick={() => setMainTab('news')}
          >
            <Image className="tab-image" src={mainTab === 'news' ? tabImageSrc.newsActive : tabImageSrc.newsInactive} mode="aspectFill" />
          </View>
          <View
            className={`tab-card ${mainTab === 'hot' ? 'active' : ''}`}
            onClick={() => setMainTab('hot')}
          >
            <Image className="tab-image" src={mainTab === 'hot' ? tabImageSrc.hotActive : tabImageSrc.hotInactive} mode="aspectFill" />
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

      {/* 快讯子导航 */}
      {mainTab === 'news' && (
        <View className="tabs-wrapper news-tabs-wrapper">
          <View className="sub-tabs">
            <Text className="sub-tab active">全部</Text>
          </View>
        </View>
      )}

      {/* 内容列表 */}
      <View 
        className={`content-list ${mainTab === 'recommend' ? (subTab === 'currency' ? 'with-coin-tabs' : 'with-sub-tabs') : (mainTab === 'news' ? 'with-sub-tabs' : 'topic-sub-tabs')}`}
        catchtouchmove={mainTab === 'hot' ? 'true' : ''}
      >
        {mainTab === 'hot' ? (
          <ScrollView 
            className="hot-topics"
            scrollY
            enableBackToTop
            onScrollToLower={handleLoadMore}
          >
            {hotTopics.length > 0 && hotTopics.map((topic, index) => (
              <View key={topic.id} className="hot-topic-item" onClick={() => navigateToTopicInfo(topic.id, topic.name, topic.description)}>
                <View className={`topic-rank ${index < 3 ? 'medal-rank' : ''}`}>
                  {index === 0 ? (
                    <Image className="rank-medal" src={nov1Icon} mode='aspectFit' />
                  ) : index === 1 ? (
                    <Image className="rank-medal" src={nov2Icon} mode='aspectFit' />
                  ) : index === 2 ? (
                    <Image className="rank-medal" src={nov3Icon} mode='aspectFit' />
                  ) : (
                    index + 1
                  )}
                </View>
                <View className="topic-info">
                  <Text className="topic-title">{topic.name}</Text>
                  <Text className="topic-desc">{topic.description || '暂无描述'}</Text>
                </View>
                <View className="topic-right-info">
                  <View className="heat-text">
                    <Image className="heat-icon" src={hotIcon} mode='aspectFit' />
                    <Text className="heat-value">{topic.score || 0}</Text>
                  </View>
                  <Text className="time-text">{topic.createdAt.replace('T', '    ')}</Text>
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
          </ScrollView>
        ) : (
          <View>
            {subTab === 'question' && showQuestionButtons && (
              <QuestionButtons 
                onAskQuestion={handlePost}
                onAnswerQuestion={handlePost}
              />
            )}
            {subTab === 'currency' && showBullBearVote && (
              <View className="vote-wrapper">
                <BullBearVote
                  title={`您对今天的${selectedCoin}有何看法?`}
                  upCount={coinVoteData.upCount}
                  downCount={coinVoteData.downCount}
                  participants={coinVoteData.participants}
                  selected={voteChoice}
                  onSelect={handleCoinVote}
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
            <View className={mainTab === 'recommend' && subTab === 'discovery' ? 'discovery-grid' : ''}>
              {/* 快讯tab只显示userType为virtual的帖子（前端二次过滤） */}
              {mainTab === 'news' && posts.filter(post => post.userType === 'virtual').length === 0 && !loading && (
                <View className="empty-state">
                  <Text className="empty-text">暂无帖子</Text>
                </View>
              )}
              {(mainTab === 'news' ? posts.filter(post => post.userType === 'virtual') : posts).map(item => {
                  // 根据当前标签页决定使用哪种卡片样式（只在推荐tab下的发现好币子标签生效）
                  const isDiscoveryCard = mainTab === 'recommend' && subTab === 'discovery';
                  
                  return (
                    <View key={item.id} className={`comment-card ${isDiscoveryCard ? 'discovery-only' : ''}`} onClick={() => navigateToCommentInfo(item.id)}>
                    {/* 发现好币背景图片（只在发现好币tab显示） */}
                    {isDiscoveryCard && (
                      <Image src={findBestCoinIcon} className="find-best-coin-bg" />
                    )}
                    
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
                        </View>
                      </View>
                    )}

                    {isDiscoveryCard ? (
                      /* 发现好币专用卡片样式 */
                      <>
                        {/* 用户信息 - 顶部 */}
                        <View className="discovery-user-info">
                          <Image src={item.avatar} className="discovery-avatar" />
                          <View className="discovery-user-content">
                            <Text className="discovery-nickname">{item.nickname}</Text>
                            <Text className="discovery-time">{formatTimeAgo(item.updatedAt)}</Text>
                          </View>
                        </View>

                        {/* 币种信息区域 */}
                        <View className="coin-info-section">
                          <View className="coin-info-row">
                            <Image className="coin-info-icon-img" src={integralIcon} mode="widthFix" />
                            <Text className="coin-info-label">币种名称：</Text>
                            <Text className="coin-info-value">
                              {item.tags && item.tags.length > 0 ? item.tags[0].name : 'Bitcoin'}
                            </Text>
                          </View>
                          
                          <View className="coin-info-row">
                            <Image className="coin-info-icon-img" src={plateIcon} mode="widthFix" />
                            <Text className="coin-info-label">所属板块：</Text>
                            <Text className="coin-info-value">
                              {item.sector || 'DeFi'}
                            </Text>
                          </View>
                          
                          <View className="coin-info-row">
                            <Image className="coin-info-icon-img" src={reasonIcon} mode="widthFix" />
                            <Text className="coin-info-label">推荐理由：</Text>
                            <Text className="coin-info-value">
                              {item.content || '大饼即将上涨，请注意'}
                            </Text>
                          </View>
                        </View>

                        {/* 操作按钮 - 发现好币样式 */}
                        <View className="discovery-action-buttons">
                          <Button 
                            className={`discovery-action-btn like-btn ${likedPosts[item.id] ? 'liked' : ''}`}
                            onClick={(e) => handleLike(e, item.id)}
                          >
                            <Image 
                              className="discovery-action-icon" 
                              src={likedPosts[item.id] ? messagesLikeActiveIcon : messagesLikeNoActivedIcon} 
                              mode="widthFix" 
                            />
                            <Text className="action-count">{item.likes || 284}</Text>
                          </Button>
                          
                          <Button 
                            className="discovery-action-btn share-btn"
                            openType='share' 
                            data-post-id={item.id} 
                            data-post-title={item.title}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Image 
                              className="discovery-action-icon" 
                              src={messagesShareIcon} 
                              mode="widthFix" 
                            />
                          </Button>
                          
                          <Button className="discovery-action-btn comment-btn">
                            <Image 
                              className="discovery-action-icon" 
                              src={messagesCommentIcon} 
                              mode="widthFix" 
                            />
                            <Text className="action-count">{item.comments || 2}</Text>
                          </Button>
                        </View>
                      </>
                    ) : (
                      /* 原有的普通卡片样式 */
                      <>
                        {/* 用户信息 */}
                        <View className="user-info">
                          <Image src={item.avatar} className="avatar" />
                          <View className="user-content-wrapper">
                            <View className="user-nickname-tag-wrapper">
                              <Text className="nickname">{item.nickname}</Text>
                              {/* 内容标签 */}
                              <Text className="content-tag">{item.tag}</Text>
                            </View>
                            {/* 时间信息盒子 */}
                            <View className="time-info">
                              <Text className="time">{formatTimeAgo(item.updatedAt)}</Text>
                            </View>
                          </View>
                        </View>

                        {/* 标题 */}
                        <Text className="title">{item.title}</Text>

                        {/* 描述 */}
                        <Text className="description">{item.content}</Text>
                        
                        {/* 币种和话题标签 */}
                        {(item.tags?.length > 0 || item.topics?.length > 0) && (
                          <View className="tags-topics-container tag-gap-fix">
                            {/* 币种标签 */}
                            {item.tags?.map(tag => (
                              <Text 
                                key={`tag-${tag.id}`} 
                                className="coin-tag"
                                onClick={(e) => {
                                  e.stopPropagation(); // 阻止冒泡，避免触发帖子详情跳转
                                  Taro.navigateTo({ url: `/packages/detail/index?symbol=${tag.name}` });
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
                                  Taro.navigateTo({ url: `/packages/community/topicinfo/index?id=${topic.id}` });
                                }}
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
                            <Image className="post-icon-img" src={shareIcon} mode="widthFix" />
                            <Text className="icon-share"></Text>
                          </Button>
                          <Button className="action-btn">
                            <Image className="post-icon-img" src={commentIcon} mode="widthFix" />
                            {item.comments}
                          </Button>
                          <Button 
                            className={`action-btn ${likedPosts[item.id] ? 'liked' : ''}`}
                            onClick={(e) => handleLike(e, item.id)}
                          >
                            <Image className="post-icon-img" src={likedPosts[item.id] ? likeActiveIcon : likeNoActiveIcon} mode="widthFix" />
                            {item.likes}
                          </Button>
                        </View>
                      </>
                    )}
                  </View>
                )
              })}
            </View>
            {loading && !pullRefresh && (
              <View className="loading-container">
                <GardenLoading />
              </View>
            )}
            {!loading && posts.length === 0 && mainTab !== 'news' && (
              <View className="empty-content">
                <Text>暂无更多内容</Text>
              </View>
            )}
            {!loading && hasMore && posts.length > 0 && !(mainTab === 'news' && posts.filter(post => post.userType === 'virtual').length === 0) && (
              <View className="loading-more">
                <Text>上拉加载更多</Text>
              </View>
            )}
            {!loading && !hasMore && posts.length > 0 && !(mainTab === 'news' && posts.filter(post => post.userType === 'virtual').length === 0) && (
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
          <Image className="post-icon-img" src={`${CDN_PREFIX}/image/community/publish.png`} mode="widthFix" />
        </Button>
      </View>

      {/* 币种选择器弹窗 */}
      {showCoinSelector && (
        <View className="coin-selector-fullscreen">
          <View className="selector-header">
            <Text className="header-title">搜索币种</Text>
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
                  {/* {selectedCoin === coin.symbol && (
                    // <Text className="selected-icon">✓</Text>
                  )} */}
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
