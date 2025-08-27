<script setup>
import { ref, reactive } from 'vue'

// 响应式数据
const loading = ref(false)
const showModal = ref(false)

// 表格数据
const tableData = ref([
  { symbol: 'BTC', price: '65432.18', change: 5.68 },
  { symbol: 'ETH', price: '3234.56', change: -2.34 },
  { symbol: 'BNB', price: '432.18', change: 3.45 },
  { symbol: 'ADA', price: '1.23', change: -1.23 }
])

// 表单数据
const form = reactive({
  symbol: '',
  amount: 1,
  type: 'buy'
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const showToast = () => {
  uni.showToast({
    title: '操作成功',
    icon: 'success'
  })
}

const refreshData = async () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    loading.value = false
    uni.showToast({
      title: '刷新完成',
      icon: 'success'
    })
  }, 2000)
}

const viewDetail = (item) => {
  uni.showToast({
    title: `查看${item.symbol}详情`,
    icon: 'none'
  })
}

const submitForm = () => {
  console.log('提交表单:', form)
  uni.showToast({
    title: '提交成功',
    icon: 'success'
  })
}

const toggleModal = () => {
  showModal.value = !showModal.value
}

const onRadioChange = (e) => {
  form.type = e.detail.value
}
</script>

<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">←</text>
      </view>
      <view class="nav-title">简化版组件演示</view>
      <view class="nav-right"></view>
    </view>
    
    <!-- 数据展示区域 -->
    <view class="demo-section">
      <view class="card">
        <view class="card-header">
          <text class="card-title">市场数据</text>
          <text class="card-subtitle">实时更新</text>
        </view>
        <view class="market-data">
          <view class="data-item">
            <text class="label">BTC价格</text>
            <text class="value price">$65,432.18</text>
          </view>
          <view class="data-item">
            <text class="label">24h涨跌</text>
            <text class="value change-up">+5.68%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮区域 -->
    <view class="demo-section">
      <view class="card">
        <view class="card-header">
          <text class="card-title">操作演示</text>
        </view>
        <view class="button-demo">
          <button class="btn btn-primary" @click="showToast">买入</button>
          <button class="btn btn-danger" @click="toggleModal">卖出</button>
          <button class="btn btn-warning" @click="showToast">添加自选</button>
          <button class="btn btn-success" :class="{ loading: loading }" @click="refreshData">
            {{ loading ? '刷新中...' : '刷新数据' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 数据表格 -->
    <view class="demo-section">
      <view class="card">
        <view class="card-header">
          <text class="card-title">数据表格</text>
        </view>
        <view class="table-container">
          <view class="table">
            <view class="table-header">
              <view class="table-cell">币种</view>
              <view class="table-cell">价格</view>
              <view class="table-cell">涨跌</view>
              <view class="table-cell">操作</view>
            </view>
            <view class="table-row" v-for="(item, index) in tableData" :key="index">
              <view class="table-cell">{{ item.symbol }}</view>
              <view class="table-cell">${{ item.price }}</view>
              <view class="table-cell">
                <text :class="['change', item.change > 0 ? 'change-up' : 'change-down']">
                  {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
                </text>
              </view>
              <view class="table-cell">
                <button class="btn-mini btn-primary" @click="viewDetail(item)">详情</button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 表单区域 -->
    <view class="demo-section">
      <view class="card">
        <view class="card-header">
          <text class="card-title">交易表单</text>
        </view>
        <view class="form">
          <view class="form-item">
            <text class="form-label">交易币种</text>
            <input 
              v-model="form.symbol" 
              class="form-input" 
              placeholder="请输入币种符号"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">交易数量</text>
            <input 
              v-model="form.amount"
              class="form-input"
              type="number"
              placeholder="请输入数量"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">交易类型</text>
            <radio-group @change="onRadioChange" class="radio-group">
              <label class="radio-item">
                <radio value="buy" :checked="form.type === 'buy'" />
                <text>买入</text>
              </label>
              <label class="radio-item">
                <radio value="sell" :checked="form.type === 'sell'" />
                <text>卖出</text>
              </label>
            </radio-group>
          </view>
          
          <view class="form-item">
            <button class="btn btn-primary btn-block" @click="submitForm">
              提交交易
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 模态框 -->
    <view v-if="showModal" class="modal-overlay" @click="toggleModal">
      <view class="modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">确认操作</text>
        </view>
        <view class="modal-body">
          <text>确定要执行此操作吗？</text>
        </view>
        <view class="modal-footer">
          <button class="btn btn-secondary" @click="toggleModal">取消</button>
          <button class="btn btn-primary" @click="toggleModal">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 导航栏 */
.navbar {
  display: flex;
  align-items: center;
  height: 88upx;
  background: #fff;
  border-bottom: 1upx solid #eee;
  padding: 0 20upx;
}

.nav-left, .nav-right {
  width: 100upx;
}

.nav-icon {
  font-size: 36upx;
  color: #007aff;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32upx;
  font-weight: bold;
  color: #333;
}

/* 卡片 */
.demo-section {
  margin-bottom: 20upx;
}

.card {
  background: #fff;
  margin: 20upx;
  border-radius: 16upx;
  box-shadow: 0 4upx 12upx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 30upx;
  border-bottom: 1upx solid #f0f0f0;
}

.card-title {
  font-size: 32upx;
  font-weight: bold;
  color: #333;
  display: block;
}

.card-subtitle {
  font-size: 24upx;
  color: #666;
  margin-top: 8upx;
  display: block;
}

/* 市场数据 */
.market-data {
  display: flex;
  justify-content: space-around;
  padding: 30upx;
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 24upx;
  color: #666;
  margin-bottom: 10upx;
}

.value {
  font-size: 28upx;
  font-weight: bold;
}

.price {
  color: #f56c6c;
}

.change-up {
  color: #67c23a;
}

.change-down {
  color: #f56c6c;
}

/* 按钮 */
.button-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 20upx;
  padding: 30upx;
}

.btn {
  flex: 1;
  min-width: 160upx;
  height: 70upx;
  border-radius: 12upx;
  border: none;
  font-size: 28upx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-danger {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.btn-warning {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #333;
}

.btn-success {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
}

.btn-secondary {
  background: #6c757d;
}

.btn.loading {
  opacity: 0.7;
}

.btn-block {
  width: 100%;
}

.btn-mini {
  padding: 8upx 16upx;
  font-size: 24upx;
  height: auto;
  min-width: auto;
}

/* 表格 */
.table-container {
  padding: 30upx;
}

.table {
  border: 1upx solid #eee;
  border-radius: 12upx;
  overflow: hidden;
}

.table-header {
  display: flex;
  background: #f8f9fa;
  font-weight: bold;
}

.table-row {
  display: flex;
  border-top: 1upx solid #eee;
}

.table-cell {
  flex: 1;
  padding: 20upx;
  text-align: center;
  font-size: 26upx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 表单 */
.form {
  padding: 30upx;
}

.form-item {
  margin-bottom: 30upx;
}

.form-label {
  display: block;
  font-size: 28upx;
  color: #333;
  margin-bottom: 12upx;
}

.form-input {
  width: 100%;
  height: 80upx;
  border: 1upx solid #ddd;
  border-radius: 12upx;
  padding: 0 20upx;
  font-size: 28upx;
  box-sizing: border-box;
}

.radio-group {
  display: flex;
  gap: 40upx;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 10upx;
  font-size: 28upx;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 16upx;
  width: 600upx;
  max-width: 90%;
}

.modal-header {
  padding: 30upx;
  border-bottom: 1upx solid #eee;
}

.modal-title {
  font-size: 32upx;
  font-weight: bold;
  color: #333;
}

.modal-body {
  padding: 30upx;
  font-size: 28upx;
  color: #666;
}

.modal-footer {
  padding: 30upx;
  display: flex;
  gap: 20upx;
  justify-content: flex-end;
}
</style>
