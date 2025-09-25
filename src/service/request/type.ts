export interface RequestInstanceState {
  /** whether the request is refreshing token */
  refreshTokenFn: Promise<boolean> | null;
  /** the request error message stack */
  errMsgStack: string[];
}

/** Custom axios config interface */
export interface CustomAxiosConfig {
  /** Skip auth interceptor flag */
  skipAuthInterceptor?: boolean;
}

/** Extended response interface for OAuth */
export interface Response<T = any> {
  data: T;
  resp_code?: number;
  resp_msg?: string;
  code?: string;
  msg?: string;
}
