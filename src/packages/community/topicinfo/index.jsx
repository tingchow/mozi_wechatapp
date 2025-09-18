import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import { useLoad, useReachBottom, useRouter } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.less'
import { request } from '../../../utils/request'
import { Interface } from '../../../utils/constants'
import { GardenLoading } from '../../../components/Loading'
import IconFont from '../../../components/iconfont'
const shareIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/share.png'
const commentIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/messages-comment.png'
const likeIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/like-no-active.png'
const likeActiveIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/like-active.png'

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
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [hasMore, setHasMore] = useState(true)
  const [likedPosts, setLikedPosts] = useState({}) // 存储点赞状态
  const [currentUserId, setCurrentUserId] = useState('')
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)

  useLoad(() => {
    // 获取路由参数中的话题ID和其他信息
    const { id, title, description, followers, posts: postCount } = router.params;
    if (id) {
      setTopicId(Number(id));
      // 设置话题详情
      setDetail({
        id: Number(id),
        title: title || '话题标题',
        description: description || '暂无描述',
        followers: Number(followers) || 0,
        posts: Number(postCount) || 0
      });
      // 加载帖子列表
      fetchTopicPosts(Number(id), 1);
      // 获取当前用户ID
      getCurrentUserId();
    }
  })

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

  // 获取话题相关帖子
  const fetchTopicPosts = async (id, pageNum) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await request({
        url: `${Interface.TOPIC_POSTS}/${id}`,
        data: {
          page: pageNum,
          size: size
        }
      });
      
      if (response?.data) {
        const { data, total, totalPages, page: currentPage } = response.data;
        
        // 格式化帖子数据
        const formattedPosts = data.map(item => ({
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
        }));
        
        // 更新帖子列表
        setPosts(prev => pageNum === 1 ? formattedPosts : [...prev, ...formattedPosts]);
        setHasMore(currentPage < totalPages);
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('获取话题帖子失败:', error);
      Taro.showToast({
        title: '获取帖子失败',
        icon: 'error',
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

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

  // 处理删除帖子
  const handleDeletePost = async (postId) => {
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
  const handleUpdatePost = (post) => {
    // 跳转到发帖页面，并传递帖子信息
    Taro.navigateTo({
      url: `/pages/post/index?id=${post.id}&title=${encodeURIComponent(post.title)}&content=${encodeURIComponent(post.content)}&isUpdate=true`
    });
  }

  // 处理操作菜单选择
  const handleActionClick = (type) => {
    if (!selectedPost) return;
    
    if (type === 'edit') {
      handleUpdatePost(selectedPost);
    } else if (type === 'delete') {
      handleDeletePost(selectedPost.id);
    }
    setShowActionSheet(false);
  };

  // 下拉刷新
  Taro.usePullDownRefresh(async () => {
    try {
      setPage(1);
      setHasMore(true);
      await fetchTopicPosts(topicId, 1);
    } catch (error) {
      console.error('下拉刷新失败:', error);
    } finally {
      Taro.stopPullDownRefresh();
    }
  });

  // 上拉加载更多
  useReachBottom(() => {
    if (hasMore && !loading && topicId) {
      fetchTopicPosts(topicId, page);
    }
  })

  return (
    <View className="topic-detail">
      {/* 话题头部 */}
      <View className="topic-header">
        <View className="title-section">
          <Text className="title">{detail.title}</Text>
        </View>
        
        <View className="description">
          <Text>{detail.description}</Text>
        </View>
        
      </View>

      {/* 帖子列表（仅当有数据时显示“全部帖子”盒子） */}
      {posts.length > 0 ? (
        <View className="post-list">
          <View className="list-header">
            <Text className="total">全部帖子</Text>
          </View>

          {posts.map(item => (
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
                {item.tags?.map(tag => (
                  <Text 
                    key={`tag-${tag.id}`} 
                    className="coin-tag"
                    onClick={(e) => {
                      e.stopPropagation();
                      Taro.navigateTo({
                        url: `/packages/detail/index?symbol=${tag.name}`
                      });
                    }}
                  >
                    ${tag.name}$
                  </Text>
                ))}
                {item.topics?.map(topic => (
                  <Text 
                    key={`topic-${topic.id}`} 
                    className="topic-tag"
                    onClick={(e) => {
                      e.stopPropagation();
                      Taro.navigateTo({
                        url: `/pages/topicinfo/index?id=${topic.id}`
                      });
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
                <Image className='action-icon' src={shareIcon} mode='aspectFit' />
                分享
              </Button>
              <Button className="action-btn">
                <Image className='action-icon' src={commentIcon} mode='aspectFit' />
                {item.comments}
              </Button>
              <Button 
                className={`action-btn ${likedPosts[item.id] ? 'liked' : ''}`}
                onClick={(e) => handleLike(e, item.id)}
              >
                <Image className='action-icon' src={likedPosts[item.id] ? likeActiveIcon : likeIcon} mode='aspectFit' />
                {item.likes}
              </Button>
            </View>
            </View>
          ))}

          {/* 底部提示（列表内，仅用于已有数据的继续加载） */}
          {loading && (
            <View className="loading-more">
              <GardenLoading />
            </View>
          )}
          
          {!loading && !hasMore && posts.length > 0 && (
            <View className="list-footer">
              <Text className="footer-text">已加载全部内容</Text>
            </View>
          )}
        </View>
      ) : (
        // 无数据时，显示全局loading或空状态（水平居中）
        <View>
          {loading ? (
            <View className="empty-loading">
              <GardenLoading />
            </View>
          ) : (
            <View className="empty-footer">
              <Text className="footer-text">暂无帖子</Text>
            </View>
          )}
        </View>
      )}

      {/* 添加悬浮发帖按钮 */}
      <View className="float-post-btn">
        <Button className="post-btn" onClick={handlePost}>
          <Text className="icon-plus">+</Text>
        </Button>
      </View>
    </View>
  )
}