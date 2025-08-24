import { View, Text, Image, Input, Textarea, Button, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useLoad, useRouter } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import { Interface } from '../../utils/constants'
import './index.less'

// 确保接口定义存在
if (!Interface.POSTS_UPDATE) {
  Interface.POSTS_UPDATE = '/posts/update';
}

export default function PostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isUpdate, setIsUpdate] = useState(false)
  const [postId, setPostId] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState('普通')
  const [showTemplates, setShowTemplates] = useState(false)
  const [formData, setFormData] = useState({
    coinName: '',
    reason: '',
  })
  const [showVote, setShowVote] = useState(false)
  const [voteTitle, setVoteTitle] = useState('')
  const [voteOptions, setVoteOptions] = useState(['看涨', '看跌'])
  const [hasVote, setHasVote] = useState(false)
  const [voteId, setVoteId] = useState(null) // 添加投票ID状态

  // 在现有的 state 后添加
  const [showCoinSelect, setShowCoinSelect] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCoins, setSelectedCoins] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [coinList, setCoinList] = useState([]) // 存储币种列表
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [showTopicSelect, setShowTopicSelect] = useState(false)
  const [topicSearchKeyword, setTopicSearchKeyword] = useState('')
  const [topics, setTopics] = useState([]) // 确保初始化为空数组
  const [userInfo, setUserInfo] = useState(null)
  const [showCreateTopic, setShowCreateTopic] = useState(false)
  const [topicTitle, setTopicTitle] = useState('')
  const [topicDesc, setTopicDesc] = useState('')
  const [hotTopicsPage, setHotTopicsPage] = useState(1)
  const [hotTopicsAllLoaded, setHotTopicsAllLoaded] = useState(false)
  const [showAskTips, setShowAskTips] = useState(false) // 控制"不懂就问"提示弹窗的显示
  const [showCommunityRules, setShowCommunityRules] = useState(false) // 控制社区公约弹窗的显示

  // 加载热门话题
  const loadHotTopics = async () => {
    if (hotTopicsAllLoaded) return; // 如果已加载全部，则不再请求
    
    try {
      const response = await request({
        url: Interface.HOT_TOPICS_API,
        data: {
          page: hotTopicsPage,
          size: 10
        }
      })
      
      if (response?.data) {
        const { data, totalPages } = response.data;
        if (data && Array.isArray(data)) {
          setTopics(prev => hotTopicsPage === 1 ? data : [...prev, ...data]);
          setHotTopicsAllLoaded(hotTopicsPage >= totalPages);
          setHotTopicsPage(hotTopicsPage + 1);
        } else {
          setTopics([]) // 如果不是数组，设置为空数组
        }
      }
    } catch (error) {
      console.error('加载热门话题失败:', error)
      setTopics([]) // 出错时设置为空数组
    }
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
                size: 10
              }
            });
            
            if (topicsResponse?.data) {
              const { data, totalPages } = topicsResponse.data;
              setTopics(data);
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

  
  
  // 加载币种列表
  const loadCoinList = async () => {
    try {
      const response = await request({
        url: Interface.find_coin,
        data: {
          pageSize: 10,
          pageNo: 1
        }
      })
      console.log('币种列表', response);
      if (response?.data?.list && Array.isArray(response.data?.list)) {
        console.log('币种列表详情', response.data?.list);
        setCoinList(response.data?.list)
        setSearchResults(response.data?.list)
      } else {
        setCoinList([])
        setSearchResults([])
      }
    } catch (error) {
      console.error('加载币种列表失败:', error)
      setCoinList([])
      setSearchResults([])
    }
  }

  // 搜索话题
  const searchTopics = async (keyword) => {
    if (!keyword.trim()) {
      // 如果关键词为空，加载热门话题
      loadHotTopics()
      return
    }
    
    // 显示加载中提示
    Taro.showLoading({
      title: '搜索中...',
      mask: true
    })
    
    try {
      const response = await request({
        url: Interface.TOPIC_SEARCH,
        data: { keyword }
      })
      Taro.hideLoading()
      if (response?.data?.data && Array.isArray(response.data?.data)) { // 确保数据是数组
        setTopics(response?.data?.data)
        if (response?.data?.data.length === 0) {
          Taro.showToast({
            title: '未找到相关话题',
            icon: 'none',
            duration: 2000
          })
        }
      } else {
        setTopics([]) // 如果不是数组，设置为空数组
        Taro.showToast({
          title: '未找到相关话题',
          icon: 'none',
          duration: 2000
        })
      }
    } catch (error) {
      console.error('搜索话题失败:', error)
      setTopics([]) // 出错时设置为空数组
      Taro.showToast({
        title: '搜索话题失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      Taro.hideLoading()
    }
  }

  // 发布按钮loading状态
  const [publishing, setPublishing] = useState(false);

  // 发布或更新内容
  const publishPost = async () => {
    // 检查用户是否登录
    const userInfo = Taro.getStorageSync('userInfo');
    if (!userInfo || !userInfo.userId) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      // 可以在这里添加跳转到登录页的逻辑
      return;
    }

    // 验证'发现好币'模板必须选择至少一个币种
    if (selectedTemplate === '发现好币' && selectedCoins.length === 0) {
      Taro.showToast({
        title: '请选择至少一个币种',
        icon: 'none'
      })
      return
    }

    // 设置发布中状态，禁用按钮
    setPublishing(true);

    try {
      // 处理内容字段，对于"发现好币"模板，使用formData.reason作为content
      console.log('title', title, 'content', content);
      const postData = {
        title,
        content: content,
        category: selectedTemplate,
        topicIds: selectedTopic ? [selectedTopic.id] : [],
        tags: selectedCoins.length > 0 ? selectedCoins.map(coin => {
          // 确保tags数组只包含币种的symbol
          return coin.symbol || (typeof coin === 'string' ? coin : '')
        }).filter(Boolean) : []
      }
      
      // 如果有投票信息，添加到postData中
      if (hasVote) {
          // 否则使用投票信息
        postData.vote = {
          voteTitle: voteTitle,
          options: voteOptions.filter(opt => opt) // 过滤掉空选项
        }
      }
      
      // 如果是更新帖子，添加帖子ID
      if (isUpdate && postId) {
        postData.id = postId
      }

      const response = await request({
        url: isUpdate ? Interface.POSTS_UPDATE : Interface.POST_NEW,
        method: 'POST',
        data: postData
      })

      if (response?.code === 0) {
        // 设置刷新标记
        Taro.setStorageSync('needRefreshCommunity', true)
        Taro.showToast({
          title: isUpdate ? '更新成功' : '发布成功',
          icon: 'success',
          success: () => {
            setTimeout(() => {
              Taro.navigateBack()
            }, 1000)
          }
        })
      } else {
        Taro.showToast({
          title: isUpdate? '更新失败' : '发布失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error(isUpdate ? '更新失败:' : '发布失败:', error)
      Taro.showToast({
        title: isUpdate ? '更新失败' : '发布失败',
        icon: 'none'
      })
    } finally {
      // 无论成功失败，都恢复按钮状态
      setPublishing(false);
    }
  }

  // 检查是否为今日首次进入
  const checkFirstVisitToday = () => {
    try {
      const today = new Date().toDateString()
      const lastVisitDate = Taro.getStorageSync('lastPostPageVisit')
      
      if (lastVisitDate !== today) {
        // 今日首次进入，显示社区公约弹窗
        setShowCommunityRules(true)
        // 记录今日访问
        Taro.setStorageSync('lastPostPageVisit', today)
      }
    } catch (error) {
      console.error('检查首次访问失败:', error)
    }
  }

  // 加载时处理路由参数和初始化数据
  useLoad(() => {
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      setUserInfo(userInfo)
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
    
    // 检查是否为今日首次进入
    checkFirstVisitToday()
    
    // 初始化加载币种和话题列表
    loadHotTopics()
    loadCoinList()
    
    const { topicId, topicTitle, id, title: postTitle, content: postContent, isUpdate: updateFlag, templateType, symbol } = router.params
    
    // 处理话题参数
    if (topicId && topicTitle) {
      setSelectedTopic({
        id: Number(topicId),
        name: decodeURIComponent(topicTitle),
        description: ''
      })
    }
    
    // 处理更新帖子的参数
    if (id && updateFlag === 'true') {
      setIsUpdate(true)
      setPostId(Number(id))
      if (postTitle) setTitle(decodeURIComponent(postTitle))
      if (postContent) setContent(decodeURIComponent(postContent))
    }
    
    // 根据传入的模板类型自动选择模板
    if (templateType) {
      const decodedTemplateType = decodeURIComponent(templateType);
      if (templates.includes(decodedTemplateType)) {
        setSelectedTemplate(decodedTemplateType);
        
        // 如果选择了"不懂就问"模板，显示提示弹窗
        if (decodedTemplateType === '不懂就问') {
          setShowAskTips(true);
        }
      }
    }
    
    // 处理币种参数
    if (symbol) {
      console.log('收到symbol参数:', symbol);
      // 立即设置一个默认值，确保至少有一个选中的币种
      setSelectedCoins([{ symbol: symbol, name: symbol }]);
      
      // 当币种列表加载完成后，尝试找到更完整的币种信息
      const checkCoinList = () => {
        console.log('检查币种列表:', coinList.length);
        if (coinList.length > 0) {
          const foundCoin = coinList.find(coin => coin.symbol === symbol);
          if (foundCoin) {
            console.log('找到匹配的币种:', foundCoin);
            setSelectedCoins([foundCoin]);
          }
        } else {
          // 如果币种列表还没加载完成，等待加载
          console.log('币种列表为空，等待加载');
          setTimeout(checkCoinList, 1000);
        }
      };
      
      // 立即检查一次
      checkCoinList();
      
      // 同时监听币种列表变化
      const coinListObserver = setInterval(() => {
        if (coinList.length > 0) {
          checkCoinList();
          clearInterval(coinListObserver);
        }
      }, 1000);
      
      // 5秒后清除观察器，避免无限循环
      setTimeout(() => clearInterval(coinListObserver), 5000);
    }
  })
  
  // 监听搜索关键词变化，实现输入内容后列表消失，内容全删除后重新显示列表
  useEffect(() => {
    if (searchKeyword.trim() === '') {
      // 如果搜索关键词为空，显示所有币种
      setSearchResults(coinList)
    }
  }, [searchKeyword, coinList])
  
  // 监听话题搜索关键词变化
  useEffect(() => {
    if (topicSearchKeyword.trim() === '') {
      // 如果话题搜索关键词为空，重新加载热门话题
      loadHotTopics()
    }
  }, [topicSearchKeyword])
  
  // 监听币种选择弹出层状态变化
  useEffect(() => {
    if (showCoinSelect && coinList.length > 0) {
      // 当打开币种选择弹出层且有币种列表数据时，显示所有币种
      setSearchResults(coinList)
    }
  }, [showCoinSelect, coinList])
  
  // 监听话题选择弹出层状态变化
  useEffect(() => {
    if (showTopicSelect && topics.length === 0) {
      // 当打开话题选择弹出层且没有话题数据时，加载热门话题
      loadHotTopics()
    }
  }, [showTopicSelect])

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

  // 模板配置
  const templates =   ["普通", "发现好币", "不懂就问"]

  // 选择模板
  const selectTemplate = (template) => {
    setSelectedTemplate(template)
    setShowTemplates(false)
    setShowAskTips(false);
    // 如果选择了"不懂就问"模板，显示提示弹窗
    if (template === '不懂就问') {
      setShowAskTips(true)
    }
  }

  // 添加投票选项
  const addVoteOption = () => {
    setVoteOptions([...voteOptions, ''])
  }

  // 更新投票选项
  const updateVoteOption = (index, value) => {
    const newOptions = [...voteOptions]
    newOptions[index] = value
    setVoteOptions(newOptions)
  }

  // 删除投票选项
  const deleteVoteOption = (index) => {
    console.log('现在长度', voteOptions.length);
    if (voteOptions.length <= 2) return // 保证至少保留两个选项
    const newOptions = voteOptions.filter((_, i) => i !== index)
    setVoteOptions(newOptions)
  }

  // 创建投票
  const createVote = () => {
    if (!voteTitle || voteOptions.some(opt => !opt)) {
      // 可以添加提示
      Taro.showToast({
        title: '请填写完整的投票信息',
        icon: 'none'
      })
      return
    }
    
    // 设置hasVote为true，表示帖子包含投票
    setHasVote(true)
    // 关闭投票弹窗
    setShowVote(false)
    
    Taro.showToast({
      title: '投票已添加',
      icon: 'success'
    })

  }
  
  // 检查币种是否已被选择
  const isCoinSelected = (coin) => {
    return selectedCoins.some(item => 
      (item.symbol && item.symbol === coin.symbol) || 
      (item.name && item.name === coin.name) ||
      item === coin.symbol || item === coin.name
    );
  }

  // 过滤话题列表
  const filteredTopics = Array.isArray(topics) ? topics : []

  // 选择话题
  const selectTopic = (topic) => {
    setSelectedTopic(topic)
    setShowTopicSelect(false)
  }

  // 搜索币种
  const searchCoin = async (keyword) => {
    if (!keyword.trim()) {
      // 如果关键词为空，显示所有币种
      setSearchResults(coinList)
      return
    }
    
    try {
      Taro.showLoading({
        title: '搜索中...',
        mask: true
      })
      
      const response = await request({
        url: Interface.COIN_INFO,
        data: {
          coin: keyword
        }
      });
      console.log('详情', response);
      Taro.hideLoading()
      if (response?.data && response.data.length > 0) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
        Taro.showToast({
          title: '未找到匹配的币种',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('搜索币种失败:', error);
      Taro.showToast({
        title: '搜索币种失败',
        icon: 'none'
      });
    } finally {
      Taro.hideLoading()
    }
  }

  // 选择币种
  const selectCoin = (coin) => {
    // 检查是否已经选择了该币种
    const exists = selectedCoins.some(item => 
      (item.symbol && item.symbol === coin.symbol) || 
      (item.name && item.name === coin.name) ||
      item === coin.symbol || item === coin.name
    );
    
    if (!exists) {
      setSelectedCoins([...selectedCoins, coin]);
    }
    setShowCoinSelect(false);
  }
  
  // 移除已选择的币种
  const removeCoin = (index) => {
    const newCoins = [...selectedCoins];
    newCoins.splice(index, 1);
    setSelectedCoins(newCoins);
  }

  // 处理表单变更
  const handleFormChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  console.log('selectedTemplate', selectedTemplate);

  return (
    <View className='post-container'>
      {/* 顶部用户信息 */}
      <View className='user-info'>
        <Image className='avatar' src={userInfo?.avatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'} />
        <Text className='nickname'>{userInfo?.nickName || ''}</Text>
        <Button 
          className='publish-btn' 
          onClick={publishPost} 
          disabled={publishing}
          loading={publishing}
        >
          {isUpdate ? '更新' : '发布'}
        </Button>
      </View>

      {/* 标题输入区 */}
      <View className='title-section'>
        <Input
          className='title-input'
          value={title}
          onInput={e => e.detail.value.length <= 20 && setTitle(e.detail.value)}
          placeholder={selectedTemplate === '普通' ? '标题（选填）' : selectedTemplate === '发现好币' ? '请输入标题（选填）': '请输入问题'}
          maxLength={20}
        />
        <Text className='word-count'>{title.length}/20</Text>
      </View>

      {/* 内容区域 */}
      <View className='content-section'>
        {(selectedTemplate === '普通' || selectedTemplate === '不懂就问') && (
          <Textarea
            className='content-textarea'
            placeholder={selectedTemplate === '普通' ? '写下你的想法...': '详细描述你的问题...'}
            value={content}
            onInput={e => setContent(e.detail.value)}
            maxlength={300}
          />
        )}

        {selectedTemplate === '发现好币' && (
          <View className='discovery-form'>
            <View className='form-item'>
              <Text className='label'>推荐理由</Text>
              <Textarea
                value={content}
                onInput={e => setContent(e.detail.value)}
                placeholder='请输入推荐理由'
                maxlength={300}
              />
            </View>
            <View className='form-item'>
              <Text className='label'>币种名称</Text>
              <View className='coin-select-btn' onClick={() => setShowCoinSelect(true)}>
                <Text className='placeholder'>{selectedCoins.length > 0 ? `已选择 ${selectedCoins.length} 个币种` : '请选择你的币种'}</Text>
                <Text className='icon-arrow'></Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* 投票内容展示 */}
      {hasVote && (
        <View className='vote-display'>
          <Text className='vote-title'>{voteTitle}</Text>
          <View className='vote-options'>
            {voteOptions.map((option, index) => (
              <Text key={index} className='vote-option'>{option}</Text>
            ))}
          </View>
        </View>
      )}

      {/* 选中的币种和话题展示 */}
      <View className='selected-tags'>
        {selectedCoins.map((coin, index) => (
          <Text 
            key={index} 
            className='coin-tag'
            onClick={() => removeCoin(index)}
          >
            ${coin.name || coin.symbol || coin}$
          </Text>
        ))}
        {selectedTopic && (
          <Text className='topic-tag'>#{selectedTopic.name}</Text>
        )}
      </View>

      {/* 底部工具栏 */}
      <View className={`bottom-toolbar ${keyboardHeight > 0? 'bottom-fixed': ''}`} style={{
        bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : 0,
      }}>
        <Button 
          className='template-btn'
          onClick={() => setShowTemplates(true)}
        >
          <View className='template-box'>
          模板
          </View>
        </Button>
        <Button 
          className='template-btn vote-btn'
          onClick={() => setShowVote(true)}
        >
          <View className='template-box'>
          投票
          </View>
        </Button>
        <Button 
          className='template-btn coin-btn'
          onClick={() => setShowCoinSelect(true)}
        >
          <View className='template-box'>
          币种
          </View>
        </Button>
        <Button 
          className='template-btn topic-btn'
          onClick={() => setShowTopicSelect(true)}
        >
          <View className='template-box'>
          话题
          </View>
        </Button>
      </View>

      {/* 币种选择弹出层 */}
      {showCoinSelect && (
        <View className='coin-popup'>
          <View className='popup-mask' onClick={() => setShowCoinSelect(false)} />
          <View className='popup-content'>
            <View className='coin-header'>
              <View className='search-box'>
                <Text className='icon-search'></Text>
                <Input
                  className='search-input'
                  value={searchKeyword}
                  onInput={e => setSearchKeyword(e.detail.value)}
                  placeholder='搜索币种'
                  confirmType='search'
                  onConfirm={(e) => searchCoin(e.detail.value)}
                />
              </View>
              <Button className='cancel-btn' onClick={() => setShowCoinSelect(false)}>
                取消
              </Button>
            </View>
            {/* 搜索结果展示区域 */}
            <View className='search-results'>
              <Text className='results-title'>币种列表</Text>
              <ScrollView className='results-list' scrollY trapScroll>
                {searchResults.length > 0 ? (
                  searchResults.map((coin, index) => (
                    <View
                      key={index}
                      className='result-item'
                      onClick={() => selectCoin(coin)}
                    >
                      <Image className="coin-icon" src={coin.url} mode="aspectFit" />
                      <Text className='coin-symbol'>{coin.symbol}</Text>
                      {coin.name && <Text className='coin-name'>{coin.name}</Text>}
                    </View>
                  ))
                ) : (
                  <View className='no-results'>
                    <Text>暂无币种数据</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      )}

      {/* 话题选择弹出层 */}
      {showTopicSelect && (
        <View className='topic-popup'>
          <View className='popup-mask' onClick={() => setShowTopicSelect(false)} />
          <View className='popup-content'>
            <View className='topic-header'>
              <View className='search-box'>
                <Text className='icon-search'></Text>
                <Input
                  className='search-input'
                  value={topicSearchKeyword}
                  onInput={e => setTopicSearchKeyword(e.detail.value)}
                  placeholder='搜索话题'
                  confirmType='search'
                  onConfirm={(e) => searchTopics(e.detail.value)}
                />
              </View>
              <Button className="create-topic-btn" onClick={() => setShowCreateTopic(true)}>
                创建话题
              </Button>
              <Button className='cancel-btn' onClick={() => setShowTopicSelect(false)}>
                取消
              </Button>
            </View>
            {/* 话题展示区域 */}
            <View className='search-results'>
              <Text className='results-title'>话题列表</Text>
              <ScrollView className='results-list' scrollY trapScroll>
                {topics.length > 0 ? (
                  topics.map(topic => (
                    <View
                      key={topic.id}
                      className='topic-item'
                      onClick={() => selectTopic(topic)}
                    >
                      <Text className='topic-name'>{topic.name}</Text>
                      {topic.description && <Text className='topic-description'>{topic.description}</Text>}
                    </View>
                  ))
                ) : (
                  <View className='no-results'>
                    <Text>{topicSearchKeyword ? '未找到相关话题' : '加载中...'}</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      )}

      {/* 投票弹出层 */}
      {showVote && (
        <View className='vote-popup'>
          <View className='popup-mask' onClick={() => setShowVote(false)} />
          <View className='popup-content'>
            <View className='popup-header'>
              <Text>创建投票</Text>
              <View className='header-btns'>
                <Button className='create-btn' onClick={createVote}>创建</Button>
                <Button className='close-btn' onClick={() => setShowVote(false)}>取消</Button>
              </View>
            </View>
            <View className='vote-form'>
              <View className='vote-title-input'>
                <Input
                  value={voteTitle}
                  onInput={e => e.detail.value.length <= 20 && setVoteTitle(e.detail.value)}
                  placeholder='请输入投票主题'
                  maxLength={20}
                />
                <Text className='word-count'>{voteTitle.length}/20</Text>
              </View>
              <View className='vote-options-list'>
                {voteOptions.map((option, index) => (
                  <View key={index} className='option-item'>
                    <Input
                      className='option-input'
                      value={option}
                      onInput={e => updateVoteOption(index, e.detail.value)}
                      placeholder={`选项${index + 1}`}
                    />
                    {voteOptions.length > 2 && (
                      <Text 
                        className='delete-btn'
                        onClick={() => deleteVoteOption(index)}
                      >×</Text>
                    )}
                  </View>
                ))}
              </View>
              <Button className='add-option-btn' onClick={addVoteOption}>
                添加选项
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* 模板选择弹出层 */}
      {showTemplates && (
        <View className='template-popup'>
          <View className='popup-mask' onClick={() => setShowTemplates(false)} />
          <View className='popup-content'>
            <View className='popup-header'>
              <Text>选择模板</Text>
              <Text className='close-btn' onClick={() => setShowTemplates(false)}>×</Text>
            </View>
            <View className='template-list'>
                {templates.map((item, index) => (
                  <View
                    key={index}
                    className={`template-item ${selectedTemplate === item ? 'active' : ''}`}
                    onClick={() => selectTemplate(item)}
                  >
                    <Text>{item}</Text>
                    <View className='demo-area'>
                      {/* 这里后续可以放置每个模板的示例内容 */}
                    </View>
                  </View>
                ))}
              </View>
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

      {/* 不懂就问提示弹窗 */}
      {showAskTips && (
        <View className="ask-tips-container">
          <View className="ask-tips-box">
            <View className="ask-tips-header">
              <Text>如何更好地提问?</Text>
              <Text className="close-icon" onClick={() => setShowAskTips(false)}>×</Text>
            </View>
            <View className="ask-tips-content">
              <View className="tip-item">
                <Text className="tip-icon">📝</Text>
                <Text className="tip-text">规范准确：规范使用语句标点清晰表述</Text>
              </View>
              <View className="tip-item">
                <Text className="tip-icon">💡</Text>
                <Text className="tip-text">讨论价值：鼓励专业、实用、脑洞等价值讨论</Text>
              </View>
              <View className="tip-item">
                <Text className="tip-icon">👀</Text>
                <Text className="tip-text">客观真实：理性客观地陈述问题和事实</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 社区公约弹窗 */}
      {showCommunityRules && (
        <View className="community-rules-mask">
          <View className="community-rules-popup">
            <View className="rules-header">
              <Text className="rules-title">社区公约</Text>
            </View>
            <View className="rules-content">
              <Text className="rules-text">
                亲爱的用户，您好：{"\n\n"}
                欢迎来到Mozi社区，我们希望打造一个友善、有趣、有料的Web3社区，让每一个用户都能学习到健康的Web3理念，感受到友善有趣的社区氛围。{"\n\n"}
                所以希望每一个用户都能遵守以下社区公约：{"\n\n"}
                尊重他人，不对他人进行基于外貌、地域、理念等方面的人身攻击、辱骂、恶意刷屏等又不友善行为；{"\n\n"}
                尊重事实，不发表不实言论；{"\n\n"}
                尊重平台，不发表恶意营销相关内容，不恶意灌水。{"\n\n"}
                一个友善温暖的社区，需要大家一起来守护，感谢~
              </Text>
            </View>
            <View className="rules-footer">
              <Button 
                className="confirm-btn" 
                onClick={() => setShowCommunityRules(false)}
              >
                好的，知道了
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}