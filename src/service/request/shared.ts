import { useAuthStore } from '@/store/modules/auth';
import { localStg } from '@/utils/storage';
import { fetchRefreshToken } from '../api';
import type { RequestInstanceState } from './type';

export function getAuthorization() {
  const token = localStg.get('token');
  const Authorization = token ? `Bearer ${token}` : null;

  return Authorization;
}

/** refresh token */
async function handleRefreshToken() {
  const { resetStore } = useAuthStore();

  const rToken = localStg.get('refreshToken') || '';
  const { error, data } = await fetchRefreshToken(rToken);
  if (!error) {
    // 根据OAuth响应格式更新token存储
    if (typeof data.resp_code === 'number' && data.resp_code === 0 && data.datas) {
      localStg.set('token', data.datas.access_token);
      localStg.set('refreshToken', data.datas.refresh_token);
      localStg.set('tokenType', data.datas.token_type);
      localStg.set('expiresIn', data.datas.expires_in.toString());
      localStg.set('tokenTimestamp', Date.now().toString());
      return true;
    }
    // 如果是旧格式，保持兼容
    localStg.set('token', data.token || data.access_token || '');
    localStg.set('refreshToken', data.refreshToken || data.refresh_token || '');
    return true;
  }

  resetStore();

  return false;
}

export async function handleExpiredRequest(state: RequestInstanceState) {
  if (!state.refreshTokenFn) {
    state.refreshTokenFn = handleRefreshToken();
  }

  const success = await state.refreshTokenFn;

  setTimeout(() => {
    state.refreshTokenFn = null;
  }, 1000);

  return success;
}

export function showErrorMsg(state: RequestInstanceState, message: string) {
  if (!state.errMsgStack?.length) {
    state.errMsgStack = [];
  }

  const isExist = state.errMsgStack.includes(message);

  if (!isExist) {
    state.errMsgStack.push(message);

    window.$message?.error(message, {
      onLeave: () => {
        state.errMsgStack = state.errMsgStack.filter(msg => msg !== message);

        setTimeout(() => {
          state.errMsgStack = [];
        }, 5000);
      }
    });
  }
}
