/**
 * @author AI Assistant
 * @function 微博个人主页广告营销内容清理
 * @date 2025-01-27 12:00:00
 * @description 基于抓包分析，移除个人主页中的钱包、超话、广告中心等营销内容
 */

let url = $request.url;
let body = $response.body;
let resp_data = JSON.parse(body);

try {
  console.log('开始处理微博个人主页广告营销内容...');
  
  // 处理个人主页数据
  if (url.includes('/profile/me') || url.includes('/profile/container_timeline')) {
    if (resp_data.items && Array.isArray(resp_data.items)) {
      // 过滤掉广告营销相关的itemId
      resp_data.items = resp_data.items.filter(item => {
        if (!item.itemId) return true;
        
        // 需要移除的营销内容itemId列表
        const removeItemIds = [
          '100505_-_pay',           // 我的钱包
          '100505_-_chaohua',       // 超话社区
          '100505_-_promote',       // 广告中心
          '100505_-_ordercenter',   // 订单中心
          '100505_-_productcenter', // 产品中心
          '100505_-_mypay_new',     // 我的支付
          '100505_-_newlvzhou2',    // 绿洲相关
          '100505_-_jieqi2025',     // 节气相关营销
          '100505_-_profilevisitor' // 访客记录（可能包含营销内容）
        ];
        
        // 检查是否需要移除
        if (removeItemIds.includes(item.itemId)) {
          console.log(`移除营销内容: ${item.itemId}`);
          return false;
        }
        
        // 检查内容中是否包含营销关键词
        if (item.content && typeof item.content === 'object') {
          const content = item.content.content || '';
          const marketingKeywords = ['钱包', '超话', '广告中心', '订单中心', '产品中心', '支付', '充值', '会员', 'VIP'];
          
          if (marketingKeywords.some(keyword => content.includes(keyword))) {
            console.log(`移除包含营销关键词的内容: ${content}`);
            return false;
          }
        }
        
        // 检查标题中是否包含营销关键词
        if (item.title && typeof item.title === 'object') {
          const title = item.title.content || '';
          const marketingKeywords = ['钱包', '超话', '广告中心', '订单中心', '产品中心', '支付', '充值', '会员', 'VIP'];
          
          if (marketingKeywords.some(keyword => title.includes(keyword))) {
            console.log(`移除包含营销关键词的标题: ${title}`);
            return false;
          }
        }
        
        return true;
      });
      
      // 处理嵌套的items数组
      resp_data.items.forEach(item => {
        if (item.items && Array.isArray(item.items)) {
          item.items = item.items.filter(subItem => {
            if (!subItem.itemId) return true;
            
            const removeItemIds = [
              '100505_-_pay',
              '100505_-_chaohua', 
              '100505_-_promote',
              '100505_-_ordercenter',
              '100505_-_productcenter',
              '100505_-_mypay_new',
              '100505_-_newlvzhou2',
              '100505_-_jieqi2025',
              '100505_-_profilevisitor'
            ];
            
            if (removeItemIds.includes(subItem.itemId)) {
              console.log(`移除嵌套营销内容: ${subItem.itemId}`);
              return false;
            }
            
            return true;
          });
        }
      });
    }
    
    // 移除VIP相关的背景图片和内容
    if (resp_data.vipHeaderBgImage) {
      delete resp_data.vipHeaderBgImage;
      console.log('移除VIP背景图片');
    }
    
    // 移除VIP视图
    if (resp_data.header && resp_data.header.vipView) {
      resp_data.header.vipView = null;
      console.log('移除VIP视图');
    }
    
    console.log('个人主页广告营销内容处理完成');
  }
  
} catch (e) {
  console.log('处理个人主页广告营销内容时出现错误: ' + e.message);
}

$done({body: JSON.stringify(resp_data)});
