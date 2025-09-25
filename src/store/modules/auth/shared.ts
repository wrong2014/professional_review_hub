import { localStg } from '@/utils/storage';

/** Get token */
export function getToken() {
  return localStg.get('token') || '';
}

/** Clear auth storage */
export function clearAuthStorage() {
  localStg.remove('token');
  localStg.remove('refreshToken');
  localStg.remove('userType'); // 清除用户类型
  localStg.remove('tokenType');
  localStg.remove('expiresIn');
  localStg.remove('tokenTimestamp');
}
