<script setup>
import { ref, reactive } from 'vue'

// 响应式数据
const loading = ref(false)
const showActionSheetFlag = ref(false)
const showModalFlag = ref(false)

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

// 单选框选项
const radioList = ref([
  { name: '买入', value: 'buy' },
  { name: '卖出', value: 'sell' }
])

// 操作面板选项
const actionSheetList = ref([
  { text: '查看详情' },
  { text: '添加自选' },
  { text: '设置提醒' }
])

// 方法
const goBack = () => {
  uni.navigateBack()
}

const showActionSheet = () => {
  showActionSheetFlag.value = true
}

const showModal = () => {
  showModalFlag.value = true
}

const showToast = () => {
  uni.showToast({
    title: '添加成功',
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

const actionSheetClick = (index) => {
  console.log('点击了:', actionSheetList.value[index].text)
}

const modalConfirm = () => {
  console.log('确认操作')
}

const modalCancel = () => {
  console.log('取消操作')
}
</script>

<template>
  <view class="container">
    <!-- 导航栏 -->
    <u-navbar 
      title="uView UI 组件演示" 
      :border-bottom="true"
      left-icon="arrow-left"
      @leftClick="goBack"
    />
    
    <!-- 数据展示区域 -->
    <view class="demo-section">
      <u-card 
        title="市场数据" 
        sub-title="实时更新"
        :show-head="true"
        margin="20upx"
      >
        <view class="market-data">
          <!-- 数字动画 -->
          <view class="data-item">
            <text class="label">BTC价格</text>
            <u-count-to 
              :start-val="0" 
              :end-val="65432.18" 
              :decimals="2"
              :duration="2000"
              separator=","
              suffix=" USD"
              color="#f56c6c"
              bold
            />
          </view>
          
          <view class="data-item">
            <text class="label">24h涨跌</text>
            <u-tag 
              text="+5.68%" 
              bg-color="#e1f3d8" 
              color="#67c23a"
              shape="circle"
              size="mini"
            />
          </view>
        </view>
      </u-card>
    </view>

    <!-- 操作按钮区域 -->
    <view class="demo-section">
      <u-card title="操作演示" margin="20upx">
        <view class="button-demo">
          <!-- 各种按钮 -->
          <u-button 
            type="primary" 
            text="买入" 
            @click="showActionSheet"
            margin="0 10upx 20upx 0"
          />
          <u-button 
            type="error" 
            text="卖出" 
            @click="showModal"
            margin="0 10upx 20upx 0"
          />
          <u-button 
            type="warning" 
            text="添加自选" 
            @click="showToast"
            margin="0 10upx 20upx 0"
          />
          
          <!-- 加载按钮 -->
          <u-button 
            type="success" 
            text="刷新数据" 
            :loading="loading"
            @click="refreshData"
            loading-text="刷新中"
            margin="0 10upx 20upx 0"
          />
        </view>
      </u-card>
    </view>

    <!-- 表格展示 -->
    <view class="demo-section">
      <u-card title="数据表格" margin="20upx">
        <view class="table-demo">
          <u-table>
            <u-tr>
              <u-th text="币种" width="25%"/>
              <u-th text="价格" width="25%"/>
              <u-th text="涨跌" width="25%"/>
              <u-th text="操作" width="25%"/>
            </u-tr>
            <u-tr v-for="(item, index) in tableData" :key="index">
              <u-td :text="item.symbol"/>
              <u-td :text="`$${item.price}`"/>
              <u-td>
                <u-tag 
                  :text="`${item.change > 0 ? '+' : ''}${item.change}%`"
                  :type="item.change > 0 ? 'success' : 'error'"
                  size="mini"
                />
              </u-td>
              <u-td>
                <u-button 
                  text="详情" 
                  type="primary" 
                  size="mini"
                  @click="viewDetail(item)"
                />
              </u-td>
            </u-tr>
          </u-table>
        </view>
      </u-card>
    </view>

    <!-- 统计图表区域 -->
    <view class="demo-section">
      <u-card title="数据统计" margin="20upx">
        <view class="chart-demo">
          <!-- 进度环 -->
          <view class="progress-demo">
            <u-circle-progress 
              :percent="75" 
              active-color="#19be6b"
              inactive-color="#ececec"
            >
              <view class="progress-content">
                <text class="progress-text">75%</text>
                <text class="progress-label">完成度</text>
              </view>
            </u-circle-progress>
          </view>
          
          <!-- 线性进度条 -->
          <view class="linear-progress">
            <view class="progress-item">
              <text class="progress-name">BTC占比</text>
              <u-line-progress 
                :percent="60" 
                active-color="#2979ff"
                height="16"
                :show-percent="true"
              />
            </view>
            <view class="progress-item">
              <text class="progress-name">ETH占比</text>
              <u-line-progress 
                :percent="30" 
                active-color="#ff9800"
                height="16"
                :show-percent="true"
              />
            </view>
            <view class="progress-item">
              <text class="progress-name">其他占比</text>
              <u-line-progress 
                :percent="10" 
                active-color="#4caf50"
                height="16"
                :show-percent="true"
              />
            </view>
          </view>
        </view>
      </u-card>
    </view>

    <!-- 表单输入区域 -->
    <view class="demo-section">
      <u-card title="交易表单" margin="20upx">
        <u-form :model="form" ref="formRef">
          <u-form-item label="交易币种" prop="symbol">
            <u-input 
              v-model="form.symbol" 
              placeholder="请输入币种符号"
              clearable
            />
          </u-form-item>
          
          <u-form-item label="交易数量" prop="amount">
            <u-number-box 
              v-model="form.amount"
              :min="0"
              :max="999999"
              :step="0.01"
              :decimal-length="2"
            />
          </u-form-item>
          
          <u-form-item label="交易类型" prop="type">
            <u-radio-group v-model="form.type">
              <u-radio 
                v-for="(item, index) in radioList" 
                :key="index"
                :label="item.name"
                :name="item.value"
              />
            </u-radio-group>
          </u-form-item>
          
          <u-form-item>
            <u-button 
              type="primary" 
              text="提交交易"
              :custom-style="{ width: '100%' }"
              @click="submitForm"
            />
          </u-form-item>
        </u-form>
      </u-card>
    </view>

    <!-- 弹窗组件 -->
    <u-action-sheet 
      :list="actionSheetList"
      v-model="showActionSheetFlag"
      @click="actionSheetClick"
    />
    
    <u-modal 
      v-model="showModalFlag"
      title="确认操作"
      content="确定要执行此操作吗？"
      @confirm="modalConfirm"
      @cancel="modalCancel"
    />
  </view>
</template>

<style scoped>
.container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.demo-section {
  margin-bottom: 20upx;
}

.market-data {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20upx 0;
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

.button-demo {
  display: flex;
  flex-wrap: wrap;
  padding: 20upx 0;
}

.table-demo {
  padding: 20upx 0;
}

.chart-demo {
  padding: 20upx 0;
}

.progress-demo {
  display: flex;
  justify-content: center;
  margin-bottom: 40upx;
}

.progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-text {
  font-size: 32upx;
  font-weight: bold;
  color: #19be6b;
}

.progress-label {
  font-size: 24upx;
  color: #666;
  margin-top: 8upx;
}

.linear-progress {
  padding: 0 20upx;
}

.progress-item {
  margin-bottom: 30upx;
}

.progress-name {
  font-size: 28upx;
  color: #333;
  margin-bottom: 10upx;
  display: block;
}
</style>
