/**
 * 商户服务模块
 * 
 * @description
 * 提供商户相关的功能，包括：
 * - API Key 管理（创建、查询、更新、删除）
 * - 商户订单创建和支付
 * 
 * @example
 * ```typescript
 * import { MerchantService } from '@/lib/services';
 * 
 * // 创建 API Key
 * const apiKey = await MerchantService.createAPIKey({
 *   app_name: '我的应用',
 *   app_homepage_url: 'https://example.com',
 *   redirect_uri: 'https://example.com/callback'
 * });
 * 
 * // 获取 API Key 列表
 * const apiKeys = await MerchantService.listAPIKeys();
 * 
 * // 创建订单
 * const order = await MerchantService.createMerchantOrder(
 *   {
 *     order_name: '商品购买',
 *     amount: 99.99
 *   },
 *   clientId,
 *   clientSecret
 * );
 * ```
 */

export { MerchantService } from './merchant.service';
export type {
  MerchantAPIKey,
  CreateAPIKeyRequest,
  UpdateAPIKeyRequest,
  CreateMerchantOrderRequest,
  CreateMerchantOrderResponse,
  PayMerchantOrderRequest,
} from './types';

