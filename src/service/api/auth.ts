import { request } from '../request';

/**
 * Login
 *
 * @param userName User name
 * @param password Password
 */
export function fetchLogin(userName: string, password: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/login',
    method: 'post',
    data: {
      userName,
      password
    }
  });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: '/auth/getUserInfo' });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

/**
 * Get validation code image URL
 *
 * @param deviceId Device ID
 */
export function getValidationCodeUrl(deviceId: string) {
  const timestamp = new Date().getTime();
  const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';

  if (isHttpProxy) {
    return `/proxy-default/validata/code/${deviceId}?t=${timestamp}`;
  }
  return `${import.meta.env.VITE_SERVICE_BASE_URL}/validata/code/${deviceId}?t=${timestamp}`;
}

/**
 * OAuth token login
 *
 * @param params Login parameters
 */
export function fetchOAuthToken(params: {
  username: string;
  password: string;
  validCode: string;
  deviceId: string;
  grant_type: string;
}) {
  console.log('=== fetchOAuthToken 调试信息 ===');

  // OAuth Basic 认证，需要 clientId 和 clientSecret
  const clientId = 'webApp'; // 修改为 webApp
  const clientSecret = 'webApp'; // 修改为 webApp
  const basicAuth = btoa(`${clientId}:${clientSecret}`);

  console.log('A. 认证信息:', {
    clientId,
    clientSecret,
    basicAuth,
    decodedAuth: atob(basicAuth)
  });

  // 将参数转换为 URLSearchParams 格式（form-data）
  const formData = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });

  console.log('B. 请求数据:', {
    原始参数: params,
    FormData字符串: formData.toString(),
    FormData条目: Array.from(formData.entries())
  });

  const requestConfig = {
    url: '/oauth/token',
    method: 'post' as const,
    data: formData,
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    // 关键配置，参考 eg.txt 中的 withCredentials: true
    withCredentials: true,
    // 额外配置，确保请求正确发送
    timeout: 10000,
    // 强制不要覆盖我们的 Authorization 头部
    skipAuthInterceptor: true
  };

  console.log('C. 请求配置:', requestConfig);
  console.log('D. 即将发送请求...');

  return request<any>(requestConfig);
}

/**
 * Test token by getting user profile or info
 * This API can be used to verify if the token is working correctly
 */
export function testTokenAPI() {
  return request<any>({
    url: '/auth/me',
    method: 'get'
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/auth/error', params: { code, msg } });
}
