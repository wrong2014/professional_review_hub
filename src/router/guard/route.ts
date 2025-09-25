import type {
  LocationQueryRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router
} from 'vue-router';
import type { RouteKey, RoutePath } from '@elegant-router/types';
import { useAuthStore } from '@/store/modules/auth';
import { useRouteStore } from '@/store/modules/route';
import { localStg } from '@/utils/storage';
import { getRouteName } from '@/router/elegant/transform';

/**
 * create route guard
 *
 * @param router router instance
 */
// Helper functions to reduce complexity
function handleRootRoute(options: { to: any; next: any; isLogin: boolean; userType: string; loginRoute: RouteKey }) {
  const { to, next, isLogin, userType, loginRoute } = options;
  console.log(`=== 根路由重定向调试信息 ===`);
  console.log(`当前用户类型: ${userType}`);
  console.log(`目标路由: ${to.name}`);
  console.log(`是否已登录: ${isLogin}`);

  if (isLogin && userType) {
    const routeStore = useRouteStore();
    const dynamicHome = routeStore.getDynamicRouteHome();
    console.log(`动态获取的默认页面: ${dynamicHome}`);
    next({ name: dynamicHome as RouteKey });
  } else {
    console.log('未登录或用户类型无效，跳转到登录页');
    next({ name: loginRoute });
  }
}

function handleOrganizationRedirect(next: any) {
  console.log(`=== 自动重定向到子路由 ===`);
  console.log(`从 organization 重定向到 organization_def`);
  next({ name: 'organization_def' });
}

function handleLoginRouteRedirect(userType: string, next: any, loginRoute: RouteKey) {
  const personalRoute: RouteKey = 'personal';
  const organizationRoute: RouteKey = 'organization';
  const expertRoute: RouteKey = 'expert';

  if (userType === 'personal') {
    next({ name: personalRoute });
  } else if (userType === 'organization') {
    next({ name: organizationRoute });
  } else if (userType === 'expert') {
    next({ name: expertRoute });
  } else {
    localStg.remove('token');
    localStg.remove('userType');
    next({ name: loginRoute });
  }
}

function handleUserTypePermission(options: {
  userType: string;
  currentRouteName: string;
  next: any;
  rootRoute: RouteKey;
}) {
  const { userType, currentRouteName, next, rootRoute } = options;
  const allowedRoutes = getUserTypeAllowedRoutes(userType);

  if (!allowedRoutes.includes(currentRouteName) && currentRouteName !== rootRoute) {
    const personalRoute: RouteKey = 'personal';
    const organizationRoute: RouteKey = 'organization';
    const expertRoute: RouteKey = 'expert';

    if (userType === 'personal') {
      next({ name: personalRoute });
    } else if (userType === 'organization') {
      next({ name: organizationRoute });
    } else if (userType === 'expert') {
      next({ name: expertRoute });
    }
    return true;
  }
  return false;
}

function handleAuthenticatedUserRoutes(options: {
  to: any;
  next: any;
  userType: string;
  rootRoute: RouteKey;
  hasAuth: boolean;
  noAuthorizationRoute: RouteKey;
}) {
  const { to, next, userType, rootRoute, hasAuth, noAuthorizationRoute } = options;

  // 用户类型验证
  if (!userType || !['personal', 'organization', 'expert'].includes(userType)) {
    localStg.remove('token');
    localStg.remove('userType');
    next({ name: 'login' });
    return true;
  }

  // 用户权限检查
  if (handleUserTypePermission({ userType, currentRouteName: to.name as string, next, rootRoute })) {
    return true;
  }

  // 角色权限检查
  if (!hasAuth) {
    next({ name: noAuthorizationRoute });
    return true;
  }

  return false;
}

export function createRouteGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const location = await initRoute(to);
    if (location) {
      next(location);
      return;
    }

    const authStore = useAuthStore();
    const rootRoute: RouteKey = 'root';
    const loginRoute: RouteKey = 'login';
    const noAuthorizationRoute: RouteKey = '403';

    // 完整的登录状态判断
    const token = localStg.get('token');
    const refreshToken = localStg.get('refreshToken');
    const userType = localStg.get('userType');
    const isLogin = Boolean(token && refreshToken && userType);
    const needLogin = !to.meta.constant;
    const routeRoles = to.meta.roles || [];

    const hasRole = authStore.userInfo.roles.some(role => routeRoles.includes(role));
    const hasAuth = authStore.isStaticSuper || !routeRoles.length || hasRole;

    // 根路由重定向
    if (to.name === rootRoute) {
      handleRootRoute({ to, next, isLogin, userType: userType || '', loginRoute });
      return;
    }

    // Organization路由重定向
    if (isLogin && userType && to.name === 'organization') {
      handleOrganizationRedirect(next);
      return;
    }

    // 登录路由处理
    if (to.name === loginRoute && isLogin) {
      handleLoginRouteRedirect(userType || '', next, loginRoute);
      return;
    }

    // 无需登录的路由
    if (!needLogin) {
      handleRouteSwitch(to, from, next);
      return;
    }

    // 未登录处理
    if (!isLogin) {
      next({ name: loginRoute, query: { redirect: to.fullPath } });
      return;
    }

    // 已登录用户的权限检查
    if (
      handleAuthenticatedUserRoutes({ to, next, userType: userType || '', rootRoute, hasAuth, noAuthorizationRoute })
    ) {
      return;
    }

    handleRouteSwitch(to, from, next);
  });
}

/**
 * initialize route
 *
 * @param to to route
 */
async function initRoute(to: RouteLocationNormalized): Promise<RouteLocationRaw | null> {
  const routeStore = useRouteStore();

  const notFoundRoute: RouteKey = 'not-found';
  const isNotFoundRoute = to.name === notFoundRoute;

  // if the constant route is not initialized, then initialize the constant route
  if (!routeStore.isInitConstantRoute) {
    await routeStore.initConstantRoute();

    // the route is captured by the "not-found" route because the constant route is not initialized
    // after the constant route is initialized, redirect to the original route
    const path = to.fullPath;
    const location: RouteLocationRaw = {
      path,
      replace: true,
      query: to.query,
      hash: to.hash
    };

    return location;
  }

  const isLogin = Boolean(localStg.get('token'));

  if (!isLogin) {
    // if the user is not logged in and the route is a constant route but not the "not-found" route, then it is allowed to access.
    if (to.meta.constant && !isNotFoundRoute) {
      routeStore.onRouteSwitchWhenNotLoggedIn();

      return null;
    }

    // if the user is not logged in, then switch to the login page
    const loginRoute: RouteKey = 'login';
    const query = getRouteQueryOfLoginRoute(to, routeStore.routeHome);

    const location: RouteLocationRaw = {
      name: loginRoute,
      query
    };

    return location;
  }

  if (!routeStore.isInitAuthRoute) {
    // initialize the auth route
    await routeStore.initAuthRoute();

    // the route is captured by the "not-found" route because the auth route is not initialized
    // after the auth route is initialized, redirect to the original route
    if (isNotFoundRoute) {
      const rootRoute: RouteKey = 'root';
      const path = to.redirectedFrom?.name === rootRoute ? '/' : to.fullPath;

      const location: RouteLocationRaw = {
        path,
        replace: true,
        query: to.query,
        hash: to.hash
      };

      return location;
    }
  }

  routeStore.onRouteSwitchWhenLoggedIn();

  // the auth route is initialized
  // it is not the "not-found" route, then it is allowed to access
  if (!isNotFoundRoute) {
    return null;
  }

  // it is captured by the "not-found" route, then check whether the route exists
  const exist = await routeStore.getIsAuthRouteExist(to.path as RoutePath);
  const noPermissionRoute: RouteKey = '403';

  if (exist) {
    const location: RouteLocationRaw = {
      name: noPermissionRoute
    };

    return location;
  }

  return null;
}

function handleRouteSwitch(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  // route with href
  if (to.meta.href) {
    window.open(to.meta.href, '_blank');

    next({ path: from.fullPath, replace: true, query: from.query, hash: to.hash });

    return;
  }

  next();
}

function getRouteQueryOfLoginRoute(to: RouteLocationNormalized, routeHome: RouteKey) {
  const loginRoute: RouteKey = 'login';
  const redirect = to.fullPath;
  const [redirectPath, redirectQuery] = redirect.split('?');
  const redirectName = getRouteName(redirectPath as RoutePath);

  const isRedirectHome = routeHome === redirectName;

  const query: LocationQueryRaw = to.name !== loginRoute && !isRedirectHome ? { redirect } : {};

  if (isRedirectHome && redirectQuery) {
    query.redirect = `/?${redirectQuery}`;
  }

  return query;
}

/**
 * 根据用户类型获取允许访问的路由列表
 * @param userType 用户类型
 */
function getUserTypeAllowedRoutes(userType: string): string[] {
  const commonRoutes = ['403', '404', '500', 'login', 'home']; // 所有用户都能访问的公共路由

  switch (userType) {
    case 'personal':
      return ['personal', ...commonRoutes];
    case 'organization':
      return [
        'organization', // 父路由
        'organization_def', // 当前的子路由
        ...commonRoutes
      ];
    case 'expert':
      return ['expert', ...commonRoutes];
    default:
      return commonRoutes;
  }
}
