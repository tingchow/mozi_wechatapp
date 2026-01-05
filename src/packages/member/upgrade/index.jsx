import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import { useState } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import './index.less';

export default function MemberUpgrade() {
  const [selectedCat, setSelectedCat] = useState('premium'); // 默认选中橘猫
  const [foodAmount, setFoodAmount] = useState(10); // 默认10份猫粮

  useLoad(() => {
    console.log('喂养猫咪页面加载');
  });

  // 猫咪等级配置
  const cats = [
    {
      id: 'basic',
      name: '小白猫',
      icon: '🐱',
      color: '#8C8C8C',
      level: 'Lv.1',
      tagline: '刚刚加入的小猫咪',
      image: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/cat/white-cat.png',
      foodNeeded: 10,
      vipLevel: 1, // 喂养小白猫也是VIP会员
      features: [
        '专属猫咪头像',
        'VIP会员标识',
        '每日签到奖励',
        '社区发帖权限',
        '去除广告'
      ],
      unlocked: true
    },
    {
      id: 'premium',
      name: '橘猫',
      icon: '🐈',
      color: '#FA8C16',
      level: 'Lv.5',
      tagline: '活泼可爱的橘猫',
      image: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/cat/orange-cat.png',
      recommended: true,
      foodNeeded: 50,
      vipLevel: 2, // 对应高级VIP
      features: [
        '小白猫所有特权',
        '橘猫专属表情包',
        '高级数据看板',
        '优先推送消息',
        '数据导出功能',
        '自定义昵称颜色'
      ],
      unlocked: false
    },
    {
      id: 'supreme',
      name: '布偶猫',
      icon: '😻',
      color: '#722ED1',
      level: 'Lv.10',
      tagline: '高贵优雅的布偶猫',
      image: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/cat/ragdoll-cat.png',
      foodNeeded: 100,
      vipLevel: 3, // 对应至尊VIP
      features: [
        '橘猫所有特权',
        '布偶猫专属动画',
        '专属客服喵',
        '定制化服务',
        '独家投资建议',
        '专属猫咪社群',
        '年度猫咪报告',
        '实物周边礼品'
      ],
      unlocked: false
    }
  ];

  // 猫粮数量选项
  const foodOptions = [
    { amount: 10, bonus: 0 },
    { amount: 50, bonus: 5, discount: '送5份' },
    { amount: 100, bonus: 15, discount: '送15份', recommended: true },
    { amount: 200, bonus: 40, discount: '送40份' }
  ];

  const currentCat = cats.find(c => c.id === selectedCat);
  const currentFood = foodOptions.find(f => f.amount === foodAmount);
  const totalFood = currentFood ? currentFood.amount + currentFood.bonus : foodAmount;

  const handleFeed = () => {
    // 检查是否登录
    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 获取当前选中的猫咪和猫粮信息
    const selectedCatData = cats.find(c => c.id === selectedCat);
    
    Taro.showModal({
      title: '确认喂养',
      content: `确定要用 ${totalFood} 份猫粮喂养${selectedCatData?.name}吗？喂养成功后将升级为${selectedCatData?.name}会员！`,
      success: (res) => {
        if (res.confirm) {
          // 模拟喂养成功
          feedCat(selectedCatData);
        }
      }
    });
  };

  // 喂养猫咪
  const feedCat = (catData) => {
    Taro.showLoading({
      title: '喂养中...',
      mask: true
    });

    // 模拟网络请求延迟
    setTimeout(() => {
      // 直接使用猫咪配置中的VIP等级
      const vipLevel = catData.vipLevel;

      console.log('喂养成功 - catData:', catData);
      console.log('喂养成功 - vipLevel:', vipLevel);
      console.log('喂养成功 - catData.vipLevel:', catData.vipLevel);

      // 保存到本地存储
      Taro.setStorageSync('vipLevel', vipLevel);
      Taro.setStorageSync('vipCat', catData.id);
      
      // 更新用户信息中的VIP等级
      const userInfo = Taro.getStorageSync('userInfo') || {};
      userInfo.vipLevel = vipLevel;
      Taro.setStorageSync('userInfo', userInfo);

      console.log('保存后的 vipLevel:', Taro.getStorageSync('vipLevel'));
      console.log('保存后的 userInfo:', Taro.getStorageSync('userInfo'));

      Taro.hideLoading();
      
      // 显示成功提示
      Taro.showModal({
        title: '喂养成功！🎉',
        content: `恭喜你！${catData.name}已经吃饱啦~\n你已升级为${catData.name}会员（等级${vipLevel}）！\n快去会员中心查看你的新特权吧！`,
        showCancel: false,
        confirmText: '查看特权',
        success: (modalRes) => {
          if (modalRes.confirm) {
            // 返回会员中心
            Taro.navigateBack();
          }
        }
      });
    }, 1500);
  };

  return (
    <View className='upgrade-container cat-theme'>
      <ScrollView scrollY className='upgrade-scroll'>
        {/* 顶部标题区域 */}
        <View className='upgrade-header cat-header'>
          <Text className='header-title'>🐾 喂养猫咪升级 🐾</Text>
          <Text className='header-subtitle'>用爱心猫粮喂养你的猫咪，解锁更多特权喵~</Text>
        </View>

        {/* 猫咪选择 */}
        <View className='plans-section cats-section'>
          {cats.map(cat => (
            <View
              key={cat.id}
              className={`plan-card cat-card ${selectedCat === cat.id ? 'selected' : ''} ${!cat.unlocked ? 'locked' : ''}`}
              onClick={() => setSelectedCat(cat.id)}
            >
              {cat.recommended && (
                <View className='recommend-tag'>
                  <Text className='recommend-text'>⭐ 推荐</Text>
                </View>
              )}
              {!cat.unlocked && (
                <View className='lock-overlay'>
                  <Text className='lock-icon'>🔒</Text>
                </View>
              )}
              <View className='plan-card-header cat-header-card'>
                <Text className='plan-icon cat-icon'>{cat.icon}</Text>
                <View className='plan-title-area'>
                  <View className='cat-name-row'>
                    <Text className='plan-name cat-name'>{cat.name}</Text>
                    <Text className='cat-level'>{cat.level}</Text>
                  </View>
                  <Text className='plan-tagline'>{cat.tagline}</Text>
                </View>
                <View className={`select-indicator ${selectedCat === cat.id ? 'active' : ''}`}>
                  {selectedCat === cat.id && <Text className='check-icon'>✓</Text>}
                </View>
              </View>
              <View className='plan-price-area cat-food-area'>
                <Text className='food-icon'>🐟</Text>
                <Text className='food-amount'>{cat.foodNeeded}</Text>
                <Text className='food-unit'>份猫粮</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 猫粮购买 */}
        <View className='duration-section food-section'>
          <Text className='section-title'>🐟 购买猫粮</Text>
          <View className='duration-options food-options'>
            {foodOptions.map(food => (
              <View
                key={food.amount}
                className={`duration-item food-item ${foodAmount === food.amount ? 'selected' : ''} ${food.recommended ? 'recommended-food' : ''}`}
                onClick={() => setFoodAmount(food.amount)}
              >
                {food.recommended && (
                  <View className='hot-badge'>
                    <Text className='hot-text'>🔥</Text>
                  </View>
                )}
                <Text className='food-icon-large'>🐟</Text>
                <Text className='duration-label food-label'>{food.amount}份</Text>
                {food.discount && (
                  <Text className='duration-discount food-discount'>{food.discount}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 猫咪特权详情 */}
        <View className='features-section cat-features'>
          <Text className='section-title'>😺 {currentCat?.name}的特权</Text>
          <View className='features-list'>
            {currentCat?.features.map((feature, index) => (
              <View key={index} className='feature-row'>
                <View className='feature-icon-wrapper cat-feature-icon'>
                  <Text className='feature-icon'>🐾</Text>
                </View>
                <Text className='feature-text'>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 猫咪成长路径 */}
        <View className='comparison-section growth-section'>
          <Text className='section-title'>🌟 猫咪成长路径</Text>
          <View className='growth-path'>
            <View className='growth-item'>
              <View className='growth-icon'>🐱</View>
              <Text className='growth-name'>小白猫</Text>
              <Text className='growth-level'>Lv.1</Text>
              <Text className='growth-food'>10份猫粮</Text>
            </View>
            <View className='growth-arrow'>→</View>
            <View className='growth-item'>
              <View className='growth-icon'>🐈</View>
              <Text className='growth-name'>橘猫</Text>
              <Text className='growth-level'>Lv.5</Text>
              <Text className='growth-food'>50份猫粮</Text>
            </View>
            <View className='growth-arrow'>→</View>
            <View className='growth-item'>
              <View className='growth-icon'>😻</View>
              <Text className='growth-name'>布偶猫</Text>
              <Text className='growth-level'>Lv.10</Text>
              <Text className='growth-food'>100份猫粮</Text>
            </View>
          </View>
        </View>

        {/* 喂养说明 */}
        <View className='faq-section feeding-tips'>
          <Text className='section-title'>💡 喂养小贴士</Text>
          <View className='faq-list tips-list'>
            <View className='faq-item tip-item'>
              <Text className='tip-icon'>🎯</Text>
              <View className='tip-content'>
                <Text className='faq-question'>如何获得猫粮？</Text>
                <Text className='faq-answer'>可以通过购买、每日签到、完成任务等方式获得猫粮。</Text>
              </View>
            </View>
            <View className='faq-item tip-item'>
              <Text className='tip-icon'>⏰</Text>
              <View className='tip-content'>
                <Text className='faq-question'>猫咪会饿吗？</Text>
                <Text className='faq-answer'>不会哦！猫咪升级后会永久保持该等级，不会降级。</Text>
              </View>
            </View>
            <View className='faq-item tip-item'>
              <Text className='tip-icon'>🎁</Text>
              <View className='tip-content'>
                <Text className='faq-question'>有什么特殊奖励？</Text>
                <Text className='faq-answer'>升级到高级猫咪后，会获得专属表情包、头像框等奖励。</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 底部占位 */}
        <View className='bottom-placeholder' />
      </ScrollView>

      {/* 底部喂养栏 */}
      <View className='purchase-bar feed-bar'>
        <View className='price-info feed-info'>
          <View className='feed-summary'>
            <Text className='food-icon-small'>🐟</Text>
            <Text className='final-price'>×{totalFood}</Text>
          </View>
          <Text className='price-desc'>喂养 {currentCat?.name} · {totalFood}份猫粮</Text>
        </View>
        <View className='purchase-btn feed-btn' onClick={handleFeed}>
          <Text className='purchase-text'>💝 立即喂养</Text>
        </View>
      </View>
    </View>
  );
}
