import { View, Text, Image, ScrollView, Input, Button, Textarea } from '@tarojs/components'
import Taro, { useLoad, useReachBottom, useRouter, useShareAppMessage } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { request } from '../../utils/request'
import { Interface } from '../../utils/constants'
import IconFont from '../../components/iconfont'
import { GardenLoading } from '../../components/Loading'
const CDN_PREFIX = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets';
const likeActiveIcon = `${CDN_PREFIX}/icon/community/like-active.png`;
const likeNoActiveIcon = `${CDN_PREFIX}/icon/community/like-no-active.png`;
const shareIcon = `${CDN_PREFIX}/icon/community/share.png`;
const editIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/edit.png';
import './index.less'

// 确保接口定义存在
if (!Interface.COMMENTS_DELETE) {
  Interface.COMMENTS_DELETE = '/comments/delete/{id}';
}
if (!Interface.COMMENTS_REPLIES) {
  Interface.COMMENTS_REPLIES = '/comments/replies';
}
if (!Interface.COMMENTS_LIKE) {
  Interface.COMMENTS_LIKE = '/comments/like/{id}';
}
if (!Interface.COMMENTS_UNLIKE) {
  Interface.COMMENTS_UNLIKE = '/comments/unlike/{id}';
}

export default function CommentInfo() {
  const router = useRouter();
  const [commentId, setCommentId] = useState(null);
  const [detail, setDetail] = useState({
    id: null,
    userId: '',
    title: '',
    content: '',
    category: '',
    createdAt: '',
    updatedAt: '',
    topics: [],
    tags: [],
    likeCnt: 0,
    commentCnt: 0,
    avatar: '',
    nickName: '',
    commentIds: [],
    isLikedByCurrentUser: false,
    voteInfo: null,
  })

  const [list, setList] = useState([])
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [loading, setLoading] = useState(true)  // 设置初始值为true，表示首次加载
  const [loadingMore, setLoadingMore] = useState(false)  // 新增状态，专门用于底部加载更多的状态
  const [allLoaded, setAllLoaded] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState(null) // 当前登录用户信息
  const [replyTo, setReplyTo] = useState(null) // 回复目标信息
  const [likedPosts, setLikedPosts] = useState({}) // 存储帖子点赞状态
  const [likedComments, setLikedComments] = useState({}) // 存储评论点赞状态
  const [expandedComments, setExpandedComments] = useState({}) // 存储展开状态的评论ID
  const [showActionSheet, setShowActionSheet] = useState(false) // 控制操作菜单显示
  const [selectedPost, setSelectedPost] = useState(null) // 当前选中的帖子
  const [focused, setFocused] = useState(false)

  useLoad(() => {
    // 设置导航栏背景色
    try {
      Taro.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#EEF0F3'
      });
    } catch (e) {}
    
    // 获取路由参数中的评论ID
    const { id } = router.params;
    if (id) {
      setCommentId(Number(id));
      // 根据ID加载对应的评论数据
      loadCommentData(Number(id));
      // 获取当前用户信息
      getCurrentUser();
      // 初始化点赞状态
      initLikeStatus(Number(id));
    }
  })
  
  // 配置页面分享功能
  useShareAppMessage(() => {
    return {
      title: detail.title || 'Mozi社区 - 评论详情',
      path: `/pages/commentinfo/index?id=${commentId}`,
    }
  })

  // 添加键盘高度变化监听
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    // 监听键盘高度变化
    const keyboardHeightChangeListener = res => {
      console.log('键盘高度变化:', res.height)
      setKeyboardHeight(res.height)
    }
    
    // 添加监听器
    Taro.onKeyboardHeightChange(keyboardHeightChangeListener)
    
    // 组件卸载时移除监听器
    return () => {
      Taro.offKeyboardHeightChange(keyboardHeightChangeListener)
    }
  }, [])
  
  // 处理投票提交
  const handleVoteSubmit = async (optionId) => {
    if (!currentUser) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    try {
      Taro.showLoading({
        title: '提交投票中...'
      });
      
      const response = await request({
        url: Interface.CREATE_VOTE.replace('create', 'submit'),
        method: 'POST',
        data: { optionId }
      });
      
      Taro.hideLoading();
      
      if (response?.code === 0) {
        Taro.showToast({
          title: '投票成功',
          icon: 'success',
          duration: 2000
        });
        
        // 重新加载帖子详情，获取最新的投票结果
        loadCommentData(commentId);
      } else {
        Taro.showToast({
          title: response?.errorMsg || '投票失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('投票失败:', error);
      Taro.hideLoading();
      Taro.showToast({
        title: '投票失败',
        icon: 'none',
        duration: 2000
      });
    }
  };
  
  // 处理帖子点赞/取消点赞
  const handlePostLike = async () => {
    try {
      const isLiked = likedPosts[detail.id];
      const response = await request({
        url: isLiked ? Interface.POSTS_UNLIKE + '/' + detail.id : Interface.POSTS_LIKE + '/' + detail.id,
        method: 'get'
      });

      if (response?.code === 0) {
        // 更新点赞状态
        setLikedPosts(prev => ({
          ...prev,
          [detail.id]: !isLiked
        }));
        
        // 更新点赞数
        setDetail(prev => ({
          ...prev,
          likeCnt: isLiked ? prev.likeCnt - 1 : prev.likeCnt + 1
        }));
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      Taro.showToast({
        title: '操作失败',
        icon: 'error',
        duration: 2000
      });
    }
  }
  
  // 处理评论点赞/取消点赞
  const handleCommentLike = async (commentId) => {
    try {
      const isLiked = likedComments[commentId];
      const response = await request({
        url: isLiked 
          ? Interface.COMMENTS_UNLIKE.replace('{id}', commentId) 
          : Interface.COMMENTS_LIKE.replace('{id}', commentId),
        method: 'get'
      });

      if (response?.code === 0) {
        // 更新点赞状态
        setLikedComments(prev => ({
          ...prev,
          [commentId]: !isLiked
        }));
        
        // 更新评论列表中的点赞数
        setList(prevList => prevList.map(item => {
          if (item.id === commentId) {
            return {
              ...item,
              likeCount: isLiked ? item.likeCount - 1 : item.likeCount + 1
            };
          }
          // 检查回复列表
          if (item.replies && item.replies.length > 0) {
            const updatedReplies = item.replies.map(reply => {
              if (reply.commentId === commentId) {
                return {
                  ...reply,
                  likeCount: isLiked ? reply.likeCount - 1 : reply.likeCount + 1
                };
              }
              return reply;
            });
            return {
              ...item,
              replies: updatedReplies
            };
          }
          return item;
        }));
      }
    } catch (error) {
      console.error('评论点赞操作失败:', error);
      Taro.showToast({
        title: '操作失败',
        icon: 'error',
        duration: 2000
      });
    }
  }
  
  // 获取当前用户信息
  const getCurrentUser = async () => {
    try {
      // 从缓存中获取用户信息
      const userInfo = await Taro.getStorage({ key: 'userInfo' });
      if (userInfo && userInfo.data) {
        setCurrentUser(userInfo.data);
      }
    } catch (error) {
      console.log('获取用户信息失败:', error);
    }
  }
  
  // 初始化点赞状态
  const initLikeStatus = async (postId) => {
    try {
      // 这里可以调用接口获取用户对该帖子和评论的点赞状态
      // 由于没有提供获取点赞状态的接口，这里模拟一个空的初始状态
      setLikedPosts({});
      setLikedComments({});
    } catch (error) {
      console.error('初始化点赞状态失败:', error);
    }
  }

  // 加载帖子详情数据的方法
  const loadCommentData = async (id) => {
    try {
      const response = await request({
        url: Interface.POST_DETAIL_API.replace('{id}', id)
      });
      
      if (response?.data) {
        console.log('获取帖子详情成功:', response.data);
        setDetail(response.data);
      }
    } catch (error) {
      console.error('获取帖子详情失败:', error);
      Taro.showToast({
        title: '获取数据失败',
        icon: 'error',
        duration: 2000
      });
    }
  }

  // 处理操作菜单选择
  const handleActionClick = (type) => {
    if (!selectedPost) return;
    
    if (type === 'edit') {
      handleUpdatePost(null, selectedPost);
    } else if (type === 'delete') {
      // 判断是否为评论（有user属性）或帖子
      if (selectedPost.user) {
        handleDeleteComment(selectedPost.id);
      } else {
        handleDeletePost(null, selectedPost.id);
      }
    }
    setShowActionSheet(false);
  };

  // 处理删除帖子
  const handleDeletePost = async (e, postId) => {
    if (e) e.stopPropagation(); // 阻止冒泡，避免触发帖子详情跳转
    
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
              
              // 删除成功后返回上一页
              Taro.navigateBack();
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
  };

  // 处理更新帖子
  const handleUpdatePost = (e, post) => {
    if (e) e.stopPropagation(); // 阻止冒泡，避免触发帖子详情跳转
    
    // 跳转到发帖页面，并传递帖子信息
    Taro.navigateTo({
      url: `/pages/post/index?id=${post.id}&title=${encodeURIComponent(post.title)}&content=${encodeURIComponent(post.content)}&isUpdate=true`
    });
  }

  // 加载评论列表
  const loadComments = async (isInitialLoad = true) => {
    console.log('allLoaded', allLoaded);
    console.log('isInitialLoad', isInitialLoad);
    if (allLoaded) return;
    
    // 根据是否是初始加载来设置不同的loading状态
    if (isInitialLoad) {
      setLoading(true); // 初始加载时设置全局loading
    } else {
      setLoadingMore(true); // 上拉加载更多时只设置底部loading
    }
    
    try {
      const response = await request({
        url: Interface.COMMENTS_API.replace('{postId}', commentId),
        data: {
          page,
          size
        }
      });
      if (response?.data) {
        const { data, totalPages: total, page: currentPage } = response.data;
        setList(prevList => currentPage === 1 ? data : [...prevList, ...data]);
        setTotalPages(total);
        setPage(currentPage + 1);
        setAllLoaded(currentPage >= total);
      }
    } catch (error) {
      console.error('获取评论列表失败:', error);
      Taro.showToast({
        title: '获取评论失败',
        icon: 'error',
        duration: 2000
      });
    } finally {
      // 根据是否是初始加载来重置不同的loading状态
      if (isInitialLoad) {
        setLoading(false); // 重置全局loading
      } else {
        setLoadingMore(false); // 重置底部loading
      }
    }
  }

  useEffect(() => {
    if (commentId) {
      // 只在commentId变化时加载评论，避免重复请求
      loadComments(true); // 传入true表示这是初始加载
    }
  }, [commentId]);

  useReachBottom(() => {
    if (!allLoaded && !loading) {
      loadComments(false) // 传入false表示这是上拉加载更多，不是初始加载
    }
  })

  console.log('detail:', detail);

  // 删除评论
  const handleDeleteComment = async (commentId) => {
    try {
      Taro.showModal({
        title: '提示',
        content: '确定要删除这条评论吗？',
        success: async (res) => {
          if (res.confirm) {
            // 显示加载提示
            Taro.showLoading({
              title: '删除中...'
            });
            
            const response = await request({
              url: Interface.COMMENTS_DELETE.replace('{id}', commentId)
            });
            
            if (response?.data) {
              Taro.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              });
              
              // 从列表中移除已删除的评论
              setList(prevList => prevList.filter(item => item.id !== commentId));
            }
            
            Taro.hideLoading();
          }
        }
      });
    } catch (error) {
      console.error('删除评论失败:', error);
      Taro.showToast({
        title: '删除失败',
        icon: 'error',
        duration: 2000
      });
      Taro.hideLoading();
    }
  };
  
  // 设置回复对象
  const handleReply = (comment, user) => {
    setReplyTo({
      commentId: comment.id,
      userId: user.userId || user.id, // 兼容可能使用id或userId的情况
      nickname: user.nickname
    });
    // 聚焦到输入框
    Taro.pageScrollTo({
      selector: '.comment-input',
      duration: 300
    });
    setFocused(true)
  };
  
  // 取消回复
  const cancelReply = () => {
    setReplyTo(null);
  };

  const commentBlur = () => {
    setReplyTo(null);
    setFocused(false)
  }
  
  // 提交评论或回复
  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      Taro.showToast({
        title: '请输入评论内容',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    setSubmitting(true);
    // 显示加载提示
    Taro.showLoading({
      title: '提交中...'
    });
    
    try {
      let response;
      
      if (replyTo) {
        // 提交回复
        response = await request({
          url: Interface.COMMENTS_REPLIES,
          method: 'POST',
          data: {
            commentId: replyTo.commentId,
            replyToUserId: replyTo.userId,
            content: commentContent.trim()
          }
        });
      } else {
        // 提交评论
        response = await request({
          url: Interface.COMMENTS_NEW,
          method: 'POST',
          data: {
            postId: commentId,
            content: commentContent.trim()
          }
        });
      }

      if (response?.data) {
        Taro.showToast({
          title: replyTo ? '回复成功' : '评论成功',
          icon: 'success',
          duration: 2000
        });
        // 清空评论内容和回复对象
        setCommentContent('');
        setReplyTo(null);
        // 重置页码为1并重新加载评论列表
        setPage(1);
        setAllLoaded(false);
        // 手动请求第一页数据，不改变loading状态
        request({
          url: Interface.COMMENTS_API.replace('{postId}', commentId),
          data: {
            page: 1,
            size
          }
        }).then(response => {
          if (response?.data) {
            const { data, totalPages: total } = response.data;
            setList(data);
            setTotalPages(total);
            setPage(2); // 设置为第2页，因为第1页已加载
            setAllLoaded(1 >= total);
          }
        }).catch(error => {
          console.error('刷新评论列表失败:', error);
        });
      }
    } catch (error) {
      console.error(replyTo ? '回复失败:' : '提交评论失败:', error);
      Taro.showToast({
        title: replyTo ? '回复失败' : '评论失败',
        icon: 'error',
        duration: 2000
      });
    } finally {
      setSubmitting(false);
      // 隐藏加载提示
      Taro.hideLoading();
    }
  };

  return (
    <View className="comment-detail">
      {/* 底部操作菜单 */}
      {showActionSheet && (
        <View className="action-sheet-mask" onClick={(e) => {e.stopPropagation(); setShowActionSheet(false)}}>
          <View className="action-sheet" onClick={(e) => e.stopPropagation()}>
            <View className="action-sheet-title">请选择操作</View>
            {/* 只有主帖子（没有user属性）才显示编辑选项 */}
            {!selectedPost?.user && (
              <View className="action-sheet-item" onClick={() => handleActionClick('edit')}>
                <Text>编辑</Text>
              </View>
            )}
            <View className="action-sheet-item" onClick={() => handleActionClick('delete')}>
              <Text>删除</Text>
            </View>
          </View>
        </View>
      )}
      
      {loading ? (
        <View className="loading-container">
          <GardenLoading />
        </View>
      ) : (
        <>
          {/* 一级评论 */}
          <View className="first-comment">
            <View className="header">
          <Image className="avatar" src={detail.avatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'} />
          <Text className="nickname">{detail.nickName || '匿名用户'}</Text>
          <Text className="category">{detail.category || '普通'}</Text>
          {/* 用户自己的帖子显示编辑按钮 */}
          {currentUser && currentUser.userId === detail.userId && (
            <View className="edit-actions">
              <View onClick={(e) => {
                e.stopPropagation();
                setSelectedPost(detail);
                setShowActionSheet(true);
              }}>
                <IconFont name='ellipsis' size={50} />
              </View>
            </View>
          )}
        </View>
        <View className="post-info">
          

          <Text className="title">{detail.title}</Text>
          <Text className="content">{detail.content}</Text>
          
          {/* 投票区域 */}
          {detail.voteInfo && detail.voteInfo?.options && (
            <View className="vote-container">
              <Text className="vote-title">{detail.voteInfo.voteTitle}</Text>
              <View className="vote-options">
                {detail.voteInfo?.options.length > 0 && detail.voteInfo?.options.map(option => (
                  <View 
                    key={option.id} 
                    className="vote-option"
                    onClick={() => handleVoteSubmit(option.id)}
                  >
                    <Text className="option-text">{option.optionText}</Text>
                    <View className="vote-progress">
                      <View 
                        className="progress-bar" 
                        style={{ width: `${option.percentage}%` }}
                      />
                    </View>
                    <Text className="vote-count">{option.voteCount} 票 ({option.percentage}%)</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* 币种和话题标签 */}
          {(detail.tags?.length > 0 || detail.topics?.length > 0) && (
            <View className="tags-topics-container">
              {/* 币种标签 */}
              {detail.tags?.map(tag => (
                <Text 
                  key={`tag-${tag.id}`} 
                  className="coin-tag"
                  onClick={() => Taro.navigateTo({ url: `/pages/detail/index?symbol=${tag.name}` })}
                >
                  @{tag.name}
                </Text>
              ))}
              
              {/* 话题标签 */}
              {detail.topics?.map(topic => (
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
          <View className="post-stats">
            <Text className="time">{(detail.createdAt|| '').replace('T', '    ')}</Text>
            <View className="action-group">
              <View className="like-btn" onClick={handlePostLike}>
                <Image 
                  className="like-icon" 
                  src={detail.isLikedByCurrentUser || likedPosts[detail.id] ? likeActiveIcon : likeNoActiveIcon} 
                  mode="widthFix" 
                />
                <Text className={`likes ${likedPosts[detail.id] ? 'liked' : ''}`}>{detail.likeCnt || 0}</Text>
              </View>
              <Button className="share-btn" openType="share" data-post-id={detail.id} data-post-title={detail.title}>
                <Image className="share-icon" src={shareIcon} mode="widthFix" />
                <Text className="share-text">分享</Text>
              </Button>
            </View>
          </View>
        </View>
        
        {/* todo */}
        <View className="footer">
          <Text className="address">{detail.address}</Text>
          <Text className="time">{detail.time}</Text>
        </View>
          </View>

          {/* 评论列表 */}
          <View className="comment-list">
            <View className="list-header">
              <Text className="total">全部评论</Text>
              <Text className="count">共{list.length}条回复</Text>
            </View>

            <View className="comments-container">
              {list.map(item => (
                <View key={item.id} className="second-comment">
                  <View className="comment-header">
                    <Image className="avatar" src={item.user.avatar} />
                    <Text className="nickname">{item.user.nickname}</Text>
                    <View className="header-right">
                      <View className="like-btn" onClick={(e) => {
                        e.stopPropagation();
                        handleCommentLike(item.id);
                      }}>
                        <Image 
                          className="comment-like-icon" 
                          src={likedComments[item.id] ? likeActiveIcon : likeNoActiveIcon} 
                          mode="widthFix" 
                        />
                        <Text className={`like-count ${likedComments[item.id] ? 'liked' : ''}`}>{item.likeCount || 0}</Text>
                      </View>
                      {currentUser && currentUser.userId === item.user.id && (
                        <View className="comment-handle" onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(item);
                          setShowActionSheet(true);
                        }}>
                          <IconFont name='ellipsis' size={40} />
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View className="comment-content" onClick={() => handleReply(item, item.user)}>
                    <Text className="text">{item.content}</Text>
                    <View className="meta">
                      <Text className="time">{item.createdAt.replace('T', '   ')}</Text>
                    </View>
                  </View>

                  {/* 回复列表 */}
                  {item.replies.length > 0 && item.replies?.slice(0, expandedComments[item.id] ? undefined : 3).map(reply => (
                    <View key={reply.commentId} className="third-comment">
                      <View className="comment-header">
                        <Image className="avatar" src={reply.user.avatar} />
                        <Text className="nickname">{reply.user.nickname}</Text>
                        {/* {currentUser && currentUser.userId === reply.user.id && (
                          <Text className="delete-btn" onClick={() => handleDeleteComment(reply.commentId)}>删除</Text>
                        )} */}
                      </View>
                      
                      <View className="comment-content">
                        <View onClick={() => handleReply(item, reply.user)}>
                          {reply.replyToUser && (
                            <View className="reply-hint">
                              <Text style={{ color: '#000000' }}>回复</Text>
                              <Text style={{ color: '#888888' }}>@{reply.replyToUser.nickname}：</Text>
                              <Text className="text">{reply.content}</Text>
                            </View>
                          )}
                          
                        </View>
                        {/* <View className="meta">
                          <Text className="time">{reply?.createdAt}</Text>
                          <View className="like-btn" onClick={(e) => {
                            e.stopPropagation();
                            handleCommentLike(reply.commentId);
                          }}>
                            <IconFont name='heart-fill' color={likedComments[reply.commentId] ? 'red' : ''} size={24} />
                            <Text className={`like-count ${likedComments[reply.commentId] ? 'liked' : ''}`}>{reply.likeCount || 0}</Text>
                          </View>
                        </View> */}
                      </View>
                    </View>
                  ))}
                  {item.replies && item.replies.length > 3 && !expandedComments[item.id] && (
                    <View className="view-more" onClick={() => setExpandedComments(prev => ({ ...prev, [item.id]: true }))}>
                      查看更多回复 ({item.replies.length - 3})
                    </View>
                  )}
                  {item.replies && item.replies.length > 3 && expandedComments[item.id] && (
                    <View className="view-more" onClick={() => setExpandedComments(prev => ({ ...prev, [item.id]: false }))}>
                      收起回复
                    </View>
                  )}
                </View>
              ))}

              {/* 加载更多状态 */}
              {loadingMore && (
                <View className="loading-more">
                  <GardenLoading />
                </View>
              )}
            </View>
          </View>
        </>
      )}

      {/* 评论输入框 */}
      <View className="comment-input-container" style={{
        bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : 0,
      }}>
        {/* {replyTo && (
          <View className="reply-info">
            <Text className="reply-text">回复 @{replyTo.nickname}</Text>
            <Text className="cancel-reply" onClick={cancelReply}>取消</Text>
          </View>
        )} */}
        <Textarea
          className="comment-input"
          value={commentContent}
          onInput={e => {setCommentContent(e.detail.value); setFocused(true)}}
          placeholder={replyTo ? `回复 @${replyTo.nickname}...` : "  写下你的评论..."}
          maxlength={200}
          focus={focused}
          adjustPosition={false}
          onBlur={commentBlur}
          autoHeight
          showConfirmBar={false}
        />
        <Button
          className="submit-btn"
          onClick={handleSubmitComment}
          disabled={submitting || !commentContent.trim()}
        >
          {submitting ? '提交中' : '发送'}
        </Button>
      </View>

      {/* 底部提示 */}
      {allLoaded && (
        <View className="list-footer">
          <Text className="footer-text">评论已到底部</Text>
        </View>
      )}
    </View>
  )
}