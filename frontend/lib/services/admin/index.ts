/**
 * 管理员服务模块
 * 
 * 提供系统配置和用户支付配置管理功能
 * 所有接口都需要管理员权限
 */

export { AdminService } from './admin.service';
export type {
  SystemConfig,
  CreateSystemConfigRequest,
  UpdateSystemConfigRequest,
  UserPayConfig,
  CreateUserPayConfigRequest,
  UpdateUserPayConfigRequest,
} from './types';
export { PayLevel } from './types';

