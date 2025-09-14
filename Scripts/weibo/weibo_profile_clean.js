/**
 * @author AI Assistant
 * @function 微博个人主页广告营销内容清理
 * @date 2025-01-27 12:00:00
 * @description 基于抓包分析，移除个人主页中的钱包、超话、广告中心等营销内容
 */

let url = $request.url;
let body = $response.body;
let resp_data = JSON.parse(body);

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
  '100505_-_profilevisitor', // 访客记录
  '100505_-_top8'           // 顶部8个功能模块（包含钱包等）
];

// 营销关键词列表
const marketingKeywords = [
  '钱包', '超话', '广告中心', '订单中心', '产品中心', 
  '支付', '充值', '会员', 'VIP', '绿洲', '节气'
];

// 递归过滤函数
function filterMarketingContent(items) {
  if (!Array.isArray(items)) return items;
  
  return items.filter(item => {
    // 检查itemId
    if (item.itemId && removeItemIds.includes(item.itemId)) {
      console.log(`移除营销内容: ${item.itemId}`);
      return false;
    }
    
    // 检查内容中的营销关键词
    if (item.content && typeof item.content === 'object') {
      const content = item.content.content || '';
      if (marketingKeywords.some(keyword => content.includes(keyword))) {
        console.log(`移除包含营销关键词的内容: ${content}`);
        return false;
      }
    }
    
    // 检查标题中的营销关键词
    if (item.title && typeof item.title === 'object') {
      const title = item.title.content || '';
      if (marketingKeywords.some(keyword => title.includes(keyword))) {
        console.log(`移除包含营销关键词的标题: ${title}`);
        return false;
      }
    }
    
    // 递归处理嵌套的items数组
    if (item.items && Array.isArray(item.items)) {
      item.items = filterMarketingContent(item.items);
    }
    
    // 递归处理其他可能的嵌套数组
    if (item.subItems && Array.isArray(item.subItems)) {
      item.subItems = filterMarketingContent(item.subItems);
    }
    
    return true;
  });
}

try {
  console.log('开始处理微博个人主页广告营销内容...');
  console.log('请求URL:', url);
  
  // 处理个人主页数据
  if (url.includes('/profile/me') || url.includes('/profile/container_timeline')) {
    console.log('检测到个人主页API请求');
    
    // 处理主items数组
    if (resp_data.items && Array.isArray(resp_data.items)) {
      console.log('处理主items数组，原始长度:', resp_data.items.length);
      resp_data.items = filterMarketingContent(resp_data.items);
      console.log('过滤后长度:', resp_data.items.length);
    }
    
    // 处理其他可能的数组字段
    if (resp_data.data && Array.isArray(resp_data.data)) {
      console.log('处理data数组，原始长度:', resp_data.data.length);
      resp_data.data = filterMarketingContent(resp_data.data);
      console.log('过滤后长度:', resp_data.data.length);
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
    
    // 移除其他VIP相关字段
    if (resp_data.vipInfo) {
      delete resp_data.vipInfo;
      console.log('移除VIP信息');
    }
    
    console.log('个人主页广告营销内容处理完成');
  }
  
} catch (e) {
  console.log('处理个人主页广告营销内容时出现错误: ' + e.message);
  console.log('错误堆栈:', e.stack);
}

$done({body: JSON.stringify(resp_data)});
