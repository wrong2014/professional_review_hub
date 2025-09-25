import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { BACKEND_ERROR_CODE, createFlatRequest, createRequest } from '@sa/axios';
import { useAuthStore } from '@/store/modules/auth';
import { localStg } from '@/utils/storage';
import { getServiceBaseURL } from '@/utils/service';
import { $t } from '@/locales';
import { getAuthorization, handleExpiredRequest, showErrorMsg } from './shared';
import type { CustomAxiosConfig, RequestInstanceState, Response } from './type';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL, otherBaseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

export const request = createFlatRequest<App.Service.Response, RequestInstanceState>(
  {
    baseURL,
    headers: {
      apifoxToken: 'XL299LiMEDZ0H5h3A29PxwQXdMJqWyY2'
    }
  },
  {
    async onRequest(config: InternalAxiosRequestConfig & CustomAxiosConfig) {
      // 如果请求已经有 Authorization 头部，不要覆盖它
      // 或者如果有 skipAuthInterceptor 标记，也不要添加Authorization
      if (!config.headers.Authorization && !config.skipAuthInterceptor) {
        const Authorization = getAuthorization();
        Object.assign(config.headers, { Authorization });
      }

      return config;
    },
    isBackendSuccess(response: AxiosResponse<Response>) {
      // 支持OAuth响应格式 (resp_code: 0) 和标准响应格式 (code: "0000")
      const data = response.data;

      // OAuth格式：resp_code === 0
      if (typeof data.resp_code === 'number') {
        const oauthSuccessCode = Number(import.meta.env.VITE_OAUTH_SUCCESS_CODE || 0);
        return data.resp_code === oauthSuccessCode;
      }

      // 标准格式：code === "0000"
      return String(data.code) === import.meta.env.VITE_SERVICE_SUCCESS_CODE;
    },
    async onBackendFail(response: AxiosResponse<Response>, instance) {
      const authStore = useAuthStore();
      // 支持OAuth响应格式和标准响应格式
      const data = response.data;
      const responseCode = String(data.code || data.resp_code);

      function handleLogout() {
        authStore.resetStore();
      }

      function logoutAndCleanup() {
        handleLogout();
        window.removeEventListener('beforeunload', handleLogout);

        request.state.errMsgStack = request.state.errMsgStack.filter(
          msg => msg !== (response.data.msg || response.data.resp_msg)
        );
      }

      // when the backend response code is in `logoutCodes`, it means the user will be logged out and redirected to login page
      const logoutCodes = import.meta.env.VITE_SERVICE_LOGOUT_CODES?.split(',') || [];
      if (logoutCodes.includes(responseCode)) {
        handleLogout();
        return null;
      }

      // when the backend response code is in `modalLogoutCodes`, it means the user will be logged out by displaying a modal
      const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];
      const errorMessage = response.data.msg || response.data.resp_msg || 'Unknown error';
      if (modalLogoutCodes.includes(responseCode) && !request.state.errMsgStack?.includes(errorMessage)) {
        request.state.errMsgStack = [...(request.state.errMsgStack || []), errorMessage];

        // prevent the user from refreshing the page
        window.addEventListener('beforeunload', handleLogout);

        window.$dialog?.error({
          title: $t('common.error'),
          content: errorMessage,
          positiveText: $t('common.confirm'),
          maskClosable: false,
          closeOnEsc: false,
          onPositiveClick() {
            logoutAndCleanup();
          },
          onClose() {
            logoutAndCleanup();
          }
        });

        return null;
      }

      // when the backend response code is in `expiredTokenCodes`, it means the token is expired, and refresh token
      // the api `refreshToken` can not return error code in `expiredTokenCodes`, otherwise it will be a dead loop, should return `logoutCodes` or `modalLogoutCodes`
      const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
      if (expiredTokenCodes.includes(responseCode)) {
        const success = await handleExpiredRequest(request.state);
        if (success) {
          const Authorization = getAuthorization();
          Object.assign(response.config.headers, { Authorization });

          return instance.request(response.config) as Promise<AxiosResponse>;
        }
      }

      // For OAuth responses (resp_code format), let them pass through as successful responses
      // This prevents BACKEND_ERROR from being created for business logic failures
      if (typeof data.resp_code === 'number') {
        return Promise.resolve(response);
      }

      return null;
    },
    transformBackendResponse(response: AxiosResponse<Response>) {
      // OAuth响应格式：{ datas: {...}, resp_code: 0, resp_msg: "" }
      // 标准响应格式：{ data: {...}, code: "0000", msg: "" }
      const responseData = response.data;

      if (typeof responseData.resp_code === 'number') {
        // OAuth格式，返回整个response.data，因为登录逻辑需要完整的响应结构
        return responseData;
      }

      // 标准格式，返回 data 字段
      return responseData.data;
    },
    onError(error) {
      // when the request is fail, you can show error message

      let message = error.message;
      let backendErrorCode = '';

      // get backend error message and code
      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.msg || message;
        backendErrorCode = String(error.response?.data?.code || '');
      }

      // the error message is displayed in the modal
      const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];
      if (modalLogoutCodes.includes(backendErrorCode)) {
        return;
      }

      // when the token is expired, refresh token and retry request, so no need to show error message
      const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
      if (expiredTokenCodes.includes(backendErrorCode)) {
        return;
      }

      showErrorMsg(request.state, message);
    }
  }
);

export const demoRequest = createRequest<App.Service.DemoResponse>(
  {
    baseURL: otherBaseURL.demo
  },
  {
    async onRequest(config) {
      const { headers } = config;

      // set token
      const token = localStg.get('token');
      const Authorization = token ? `Bearer ${token}` : null;
      Object.assign(headers, { Authorization });

      return config;
    },
    isBackendSuccess(response) {
      // when the backend response code is "200", it means the request is success
      // you can change this logic by yourself
      return response.data.status === '200';
    },
    async onBackendFail(_response) {
      // when the backend response code is not "200", it means the request is fail
      // for example: the token is expired, refresh token and retry request
    },
    transformBackendResponse(response) {
      return response.data.result;
    },
    onError(error) {
      // when the request is fail, you can show error message

      let message = error.message;

      // show backend error message
      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.message || message;
      }

      window.$message?.error(message);
    }
  }
);
