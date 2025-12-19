import { useState, useEffect, useRef } from 'react';
import { request } from '../utils/request';
import { Interface } from '../utils/constants';

/**
 * 榜单类型映射
 * SELF_SELECT("selfselect", "自选榜")
 * PRICE_CHANGE("pricechange", "涨幅榜")
 * PRICE_CHANGE_ASC("pricechangeasc", "跌幅榜")
 * PRICE_WAVE("pricewave", "波幅榜")
 * TRADE("trade", "成交额榜")
 * NEW_SYMBOL("newsymbol", "新币榜")
 * TRADE_MOVERS("trademovers", "飙升榜")
 * EXCHANGE("exchange", "交易所排行榜")
 */

export const useShareCount = (rankType) => {
  console.log('[useShareCount] Hook 初始化，rankType:', rankType);
  const [shareCount, setShareCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const isIncrementing = useRef(false); // 防止重复调用

  // 获取分享次数
  const fetchShareCount = async () => {
    if (!rankType) {
      console.log('[useShareCount] rankType 为空，跳过获取分享次数');
      return;
    }
    
    console.log('[useShareCount] 获取分享次数，rankType:', rankType);
    
    try {
      const res = await request({
        url: Interface.GET_SHARE_COUNT,
        data: { type: rankType }
      });
      
      console.log('[useShareCount] 获取分享次数成功:', res);
      
      if (res?.data !== undefined && res?.data !== null) {
        setShareCount(res.data);
      }
    } catch (error) {
      console.error('[useShareCount] 获取分享次数失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 增加分享次数
  const incrementShareCount = async () => {
    const timestamp = Date.now();
    
    if (!rankType) {
      console.log(`[useShareCount] [${timestamp}] rankType 为空，跳过增加分享次数`);
      return;
    }
    
    // 防止重复调用
    if (isIncrementing.current) {
      console.log(`[useShareCount] [${timestamp}] 正在增加分享次数，跳过重复调用，rankType:`, rankType);
      return;
    }
    
    isIncrementing.current = true;
    console.log(`[useShareCount] [${timestamp}] 开始增加分享次数，rankType:`, rankType);
    
    try {
      const res = await request({
        url: Interface.GET_SHARE_COUNT,
        data: { type: rankType, count: 1 }
      });
      
      console.log(`[useShareCount] [${timestamp}] 增加分享次数成功:`, res);
      
      if (res?.data !== undefined && res?.data !== null) {
        setShareCount(res.data);
      }
    } catch (error) {
      console.error(`[useShareCount] [${timestamp}] 增加分享次数失败:`, error);
    } finally {
      // 2秒后重置标志，允许下次分享
      setTimeout(() => {
        isIncrementing.current = false;
        console.log(`[useShareCount] [${timestamp}] 重置防抖标志`);
      }, 2000);
    }
  };

  useEffect(() => {
    console.log('[useShareCount] useEffect 触发，rankType:', rankType);
    if (rankType) {
      fetchShareCount();
    }
  }, [rankType]);

  return {
    shareCount,
    loading,
    incrementShareCount,
    refreshShareCount: fetchShareCount
  };
};
