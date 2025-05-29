import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import { useLoad, useReachBottom, useRouter } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.less'

export default function TopicInfo() {
  const router = useRouter();
  const [topicId, setTopicId] = useState(null);
  const [detail, setDetail] = useState({
    id: 1,
    title: '话题标题',
    description: '话题描述内容',
    followers: 2345,
    posts: 167
  })

  const [posts, setPosts] = useState([])
  const [allLoaded, setAllLoaded] = useState(false)

  // 模拟话题数据
  const mockTopics = [
    {
      id: 1,
      title: '币圈新人必看',
      description: '新手入门指南，避坑经验分享',
      followers: 2345,
      posts: 167
    },
    {
      id: 2,
      title: 'DeFi生态探讨',
      description: '深入了解去中心化金融的发展',
      followers: 1890,
      posts: 521
    },
    {
      id: 3,
      title: '技术分析',
      description: 'K线形态、技术指标分析',
      followers: 3400,
      posts: 198
    },
    {
      id: 4,
      title: '链上数据解读',
      description: '区块链数据分析与洞察',
      followers: 1560,
      posts: 230
    },
    {
      id: 5,
      title: '项目评测',
      description: '深度解析区块链项目',
      followers: 2100,
      posts: 89
    }
  ];

  // 模拟帖子数据
  const mockPosts = {
    1: [
      {
        id: 101,
        avatar: 'https://placeholder.co/100',
        nickname: '币圈新手',
        tag: '不懂就问',
        title: '如何安全存储数字货币？',
        content: '刚入币圈，想了解一下大家都是如何安全存储自己的数字资产的，有什么好的冷钱包推荐吗？',
        comments: 24,
        likes: 78
      },
      {
        id: 102,
        avatar: 'https://placeholder.co/100',
        nickname: '区块链教育者',
        tag: '经验分享',
        title: '新手常见的5个错误及如何避免',
        content: '总结了新手入场常犯的几个错误，希望对大家有所帮助：1. 追高杀低 2. 不做研究盲目投资 3. 把所有资金都投入 4. 忽视安全 5. 轻信他人',
        comments: 56,
        likes: 203
      }
    ],
    2: [
      {
        id: 201,
        avatar: 'https://placeholder.co/100',
        nickname: 'DeFi研究员',
        tag: '项目分析',
        title: 'Uniswap V3流动性提供策略分析',
        content: 'Uniswap V3的集中流动性机制为LP提供了更多策略选择，本文将分析几种不同的策略及其收益情况。',
        comments: 35,
        likes: 142
      }
    ],
    3: [
      {
        id: 301,
        avatar: 'https://placeholder.co/100',
        nickname: '技术分析师',
        tag: 'TA教学',
        title: '如何识别和利用三角形整理形态',
        content: '三角形整理是K线图中常见的一种形态，正确识别可以帮助判断突破方向。本文详细介绍三角形整理的特征和交易策略。',
        comments: 28,
        likes: 115
      }
    ],
    4: [
      {
        id: 401,
        avatar: 'https://placeholder.co/100',
        nickname: '链上数据分析师',
        tag: '数据解读',
        title: 'BTC大额转账监控与市场影响分析',
        content: '通过监控链上大额转账，可以提前发现可能的市场波动信号。本文分析了近期几笔大额转账对市场的影响。',
        comments: 42,
        likes: 187
      }
    ],
    5: [
      {
        id: 501,
        avatar: 'https://placeholder.co/100',
        nickname: '项目评测员',
        tag: '深度评测',
        title: '某新项目代码审计与安全分析',
        content: '对最近热门的新项目进行了代码审计和安全分析，发现了几个潜在的安全隐患，建议投资者谨慎参与。',
        comments: 63,
        likes: 241
      }
    ]
  };

  useLoad(() => {
    // 获取路由参数中的话题ID
    const { id } = router.params;
    if (id) {
      setTopicId(Number(id));
      // 根据ID加载对应的话题数据
      loadTopicData(Number(id));
    }
  })

  // 加载话题数据的方法
  const loadTopicData = (id) => {
    // 在实际应用中，这里应该是一个API请求
    // 这里使用模拟数据进行演示
    const topicData = mockTopics.find(item => item.id === id);
    if (topicData) {
      setDetail(topicData);
      // 加载话题相关的帖子
      const topicPosts = mockPosts[id] || [];
      setPosts(topicPosts);
    }
  }

  // 跳转到评论详情页
  const navigateToCommentInfo = (commentId) => {
    Taro.navigateTo({
      url: `/pages/commentinfo/index?id=${commentId}`
    })
  }

  // 跳转到发帖页面并关联当前话题
  const handlePost = () => {
    if (topicId) {
      Taro.navigateTo({
        url: `/pages/post/index?topicId=${topicId}&topicTitle=${encodeURIComponent(detail.title)}`
      })
    }
  }

  useReachBottom(() => {
    // 加载更多帖子
    // 这里可以实现分页加载逻辑
    setAllLoaded(true); // 示例：标记已加载全部
  })

  return (
    <View className="topic-detail">
      {/* 话题头部 */}
      <View className="topic-header">
        <View className="title-section">
          <Text className="title">{detail.title}</Text>
          <View className="follow-btn">关注</View>
        </View>
        
        <View className="description">
          <Text>{detail.description}</Text>
        </View>
        
        <View className="stats">
          <Text className="stat-item">{detail.followers} 关注</Text>
          <Text className="stat-item">{detail.posts} 讨论</Text>
        </View>
      </View>

      {/* 帖子列表 */}
      <View className="post-list">
        <View className="list-header">
          <Text className="total">全部帖子</Text>
        </View>

        {posts.map(item => (
          <View key={item.id} className="post-card" onClick={() => navigateToCommentInfo(item.id)}>
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

            {/* 操作按钮 */}
            <View className="action-buttons">
              <View className="action-btn">
                <Text className="icon-share"></Text>
                分享
              </View>
              <View className="action-btn">
                <Text className="icon-comment"></Text>
                {item.comments}
              </View>
              <View className="action-btn">
                <Text className="icon-like"></Text>
                {item.likes}
              </View>
            </View>
          </View>
        ))}

        {/* 底部提示 */}
        {allLoaded && (
          <View className="list-footer">
            <Text className="footer-text">已加载全部内容</Text>
          </View>
        )}
      </View>

      {/* 添加悬浮发帖按钮 */}
      <View className="float-post-btn">
        <Button className="post-btn" onClick={handlePost}>
          <Text className="icon-plus">+</Text>
        </Button>
      </View>
    </View>
  )
}