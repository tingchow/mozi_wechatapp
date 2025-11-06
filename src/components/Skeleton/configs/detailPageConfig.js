/**
 * 币种详情页骨架屏配置
 */
export const detailPageSkeletonConfig = {
  type: 'column',
  style: { width: '100%', backgroundColor: '#fff' },
  children: [
    // 头部信息区域
    {
      type: 'container',
      style: { 
        padding: '32rpx',
        backgroundColor: '#fff'
      },
      children: [
        // 币种基本信息行
        {
          type: 'row',
          style: { 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32rpx'
          },
          children: [
            // 左侧：图标+名称+价格+涨跌幅
            {
              type: 'column',
              style: { flex: 1, gap: '16rpx' },
              children: [
                // 图标+名称
                {
                  type: 'row',
                  gap: '16rpx',
                  style: { alignItems: 'center' },
                  children: [
                    { type: 'circle', size: '80rpx' },
                    { type: 'element', width: '160rpx', height: '48rpx' }
                  ]
                },
                // 价格
                { type: 'element', width: '300rpx', height: '80rpx', style: { marginTop: '8rpx' } },
                // 涨跌幅
                {
                  type: 'row',
                  gap: '16rpx',
                  style: { alignItems: 'center', marginTop: '8rpx' },
                  children: [
                    { type: 'circle', size: '48rpx' },
                    { type: 'element', width: '240rpx', height: '36rpx' }
                  ]
                }
              ]
            },
            // 右侧：市值排名+市值
            {
              type: 'column',
              style: { alignItems: 'flex-end', gap: '16rpx', marginTop: '96rpx' },
              children: [
                { type: 'element', width: '160rpx', height: '48rpx' },
                { type: 'element', width: '240rpx', height: '36rpx' }
              ]
            }
          ]
        },
        // 详细信息网格
        {
          type: 'grid',
          columns: 'repeat(2, 1fr)',
          gap: '24rpx',
          style: { marginTop: '32rpx' },
          children: [
            // 左侧列
            {
              type: 'column',
              gap: '24rpx',
              children: [
                {
                  type: 'row',
                  style: { justifyContent: 'space-between' },
                  children: [
                    { type: 'element', width: '160rpx', height: '32rpx' },
                    { type: 'element', width: '160rpx', height: '32rpx' }
                  ]
                },
                {
                  type: 'row',
                  style: { justifyContent: 'space-between' },
                  children: [
                    { type: 'element', width: '160rpx', height: '32rpx' },
                    { type: 'element', width: '160rpx', height: '32rpx' }
                  ]
                }
              ]
            },
            // 右侧列
            {
              type: 'column',
              gap: '24rpx',
              children: [
                {
                  type: 'row',
                  style: { justifyContent: 'space-between' },
                  children: [
                    { type: 'element', width: '160rpx', height: '32rpx' },
                    { type: 'element', width: '160rpx', height: '32rpx' }
                  ]
                },
                {
                  type: 'row',
                  style: { justifyContent: 'space-between' },
                  children: [
                    { type: 'element', width: '160rpx', height: '32rpx' },
                    { type: 'element', width: '160rpx', height: '32rpx' }
                  ]
                }
              ]
            }
          ]
        },
        // 展开/收起按钮
        {
          type: 'row',
          style: { 
            justifyContent: 'center',
            marginTop: '24rpx'
          },
          children: [
            { type: 'element', width: '40rpx', height: '40rpx', borderRadius: '20rpx' }
          ]
        }
      ]
    },
    
    // Tab 选择区域
    {
      type: 'row',
      style: { 
        padding: '24rpx 32rpx',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        justifyContent: 'space-around'
      },
      children: [
        { type: 'element', width: '80rpx', height: '40rpx' },
        { type: 'element', width: '80rpx', height: '40rpx' },
        { type: 'element', width: '120rpx', height: '40rpx' }
      ]
    },
    
    // 图表区域（包含整个图表和控制按钮）
    {
      type: 'container',
      style: { 
        padding: '32rpx',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0'
      },
      children: [
        // 图表类型切换按钮
        {
          type: 'row',
          gap: '16rpx',
          style: { marginBottom: '24rpx' },
          children: [
            { type: 'element', width: '60rpx', height: '60rpx', borderRadius: '8rpx' },
            { type: 'element', width: '60rpx', height: '60rpx', borderRadius: '8rpx' }
          ]
        },
        // 周期选择
        {
          type: 'row',
          gap: '24rpx',
          style: { marginBottom: '24rpx' },
          children: [
            { type: 'element', width: '80rpx', height: '48rpx' },
            { type: 'element', width: '80rpx', height: '48rpx' },
            { type: 'element', width: '80rpx', height: '48rpx' },
            { type: 'element', width: '80rpx', height: '48rpx' }
          ]
        },
        // 图表
        { type: 'element', width: '100%', height: '600rpx', borderRadius: '16rpx' }
      ]
    },
    
    // 市场数据区域
    {
      type: 'container',
      style: { 
        padding: '32rpx',
        backgroundColor: '#fff',
        marginTop: '16rpx'
      },
      children: [
        // 标题
        {
          type: 'row',
          style: { 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24rpx'
          },
          children: [
            { type: 'element', width: '100rpx', height: '40rpx' },
            { type: 'element', width: '80rpx', height: '32rpx' }
          ]
        },
        
        // 表头
        {
          type: 'row',
          style: { 
            padding: '24rpx 0',
            borderBottom: '1px solid #f0f0f0',
            justifyContent: 'space-between'
          },
          children: [
            { type: 'element', width: '120rpx', height: '32rpx' },
            { type: 'element', width: '100rpx', height: '32rpx' },
            { type: 'element', width: '100rpx', height: '32rpx' },
            { type: 'element', width: '100rpx', height: '32rpx' }
          ]
        },
        
        // 数据行1
        {
          type: 'row',
          style: { 
            padding: '24rpx 0',
            borderBottom: '1px solid #f0f0f0',
            justifyContent: 'space-between',
            alignItems: 'center'
          },
          children: [
            {
              type: 'row',
              gap: '16rpx',
              style: { alignItems: 'center' },
              children: [
                { type: 'circle', size: '48rpx' },
                { type: 'element', width: '100rpx', height: '32rpx' }
              ]
            },
            { type: 'element', width: '100rpx', height: '32rpx' },
            { type: 'element', width: '100rpx', height: '32rpx' },
            { type: 'element', width: '100rpx', height: '32rpx' }
          ]
        },
        
        // 数据行2
        {
          type: 'row',
          style: { 
            padding: '24rpx 0',
            borderBottom: '1px solid #f0f0f0',
            justifyContent: 'space-between',
            alignItems: 'center'
          },
          children: [
            {
              type: 'row',
              gap: '16rpx',
              style: { alignItems: 'center' },
              children: [
                { type: 'circle', size: '48rpx' },
                { type: 'element', width: '100rpx', height: '32rpx' }
              ]
            },
            { type: 'element', width: '100rpx', height: '32rpx' },
            { type: 'element', width: '100rpx', height: '32rpx' },
            { type: 'element', width: '100rpx', height: '32rpx' }
          ]
        },
        
        // 数据行3
        {
          type: 'row',
          style: { 
            padding: '24rpx 0',
            justifyContent: 'space-between',
            alignItems: 'center'
          },
          children: [
            {
              type: 'row',
              gap: '16rpx',
              style: { alignItems: 'center' },
              children: [
                { type: 'circle', size: '48rpx' },
                { type: 'element', width: '100rpx', height: '32rpx' }
              ]
            },
            { type: 'element', width: '100rpx', height: '32rpx' },
            { type: 'element', width: '100rpx', height: '32rpx' },
            { type: 'element', width: '100rpx', height: '32rpx' }
          ]
        }
      ]
    },
    
    // 投资回报率区域
    {
      type: 'container',
      style: { 
        padding: '32rpx',
        backgroundColor: '#fff',
        marginTop: '16rpx'
      },
      children: [
        // 标题
        { type: 'element', width: '160rpx', height: '40rpx', style: { marginBottom: '24rpx' } },
        
        // ROI 卡片网格
        {
          type: 'grid',
          columns: 'repeat(2, 1fr)',
          gap: '24rpx',
          children: [
            {
              type: 'column',
              style: { 
                padding: '32rpx',
                backgroundColor: '#f6f7f8',
                borderRadius: '16rpx',
                alignItems: 'center',
                gap: '16rpx'
              },
              children: [
                { type: 'element', width: '120rpx', height: '60rpx' },
                { type: 'element', width: '100rpx', height: '32rpx' }
              ]
            },
            {
              type: 'column',
              style: { 
                padding: '32rpx',
                backgroundColor: '#f6f7f8',
                borderRadius: '16rpx',
                alignItems: 'center',
                gap: '16rpx'
              },
              children: [
                { type: 'element', width: '120rpx', height: '60rpx' },
                { type: 'element', width: '100rpx', height: '32rpx' }
              ]
            },
            {
              type: 'column',
              style: { 
                padding: '32rpx',
                backgroundColor: '#f6f7f8',
                borderRadius: '16rpx',
                alignItems: 'center',
                gap: '16rpx'
              },
              children: [
                { type: 'element', width: '120rpx', height: '60rpx' },
                { type: 'element', width: '100rpx', height: '32rpx' }
              ]
            },
            {
              type: 'column',
              style: { 
                padding: '32rpx',
                backgroundColor: '#f6f7f8',
                borderRadius: '16rpx',
                alignItems: 'center',
                gap: '16rpx'
              },
              children: [
                { type: 'element', width: '120rpx', height: '60rpx' },
                { type: 'element', width: '100rpx', height: '32rpx' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

