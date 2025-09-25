<script setup lang="ts">
import { h, onMounted, onUnmounted, reactive, ref } from 'vue';
import { NButton, NForm, NFormItem, NInput } from 'naive-ui';
import { Icon } from '@iconify/vue';
import { fetchOAuthToken, getValidationCodeUrl } from '@/service/api/auth';
import { localStg } from '@/utils/storage';

// 设备ID - 统一使用
const deviceId = 'A910DEFA-E4F9-4435-B66A-0CB2F61C1FE0';

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  validCode: '',
  deviceId,
  grant_type: 'password_code'
});

// 登录类型：personal（个人）、organization（机构）、expert（专家）
const loginType = ref<'personal' | 'organization' | 'expert'>('organization');

// 系统角色定义
interface SystemRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  icon: string;
}

// 通知公告数据 - 增加更多数据以便滚动
const announcements = reactive([
  {
    id: 1,
    title: '关于开展2024年度高级工程师职称评审工作的通知',
    content: '根据人社部相关文件精神，现将2024年度职称评审工作安排通知如下...',
    date: '2024-01-15',
    isTop: true,
    type: 'important',
    viewCount: 125,
    department: '人力资源社会保障部'
  },
  {
    id: 2,
    title: '职称评审系统升级维护公告',
    content: '为提升系统服务质量，定于本周末进行系统升级维护...',
    date: '2024-01-12',
    isTop: false,
    type: 'notice',
    viewCount: 89,
    department: '系统管理部'
  },
  {
    id: 3,
    title: '职称评审材料提交截止时间提醒',
    content: '请各申报人员注意，本年度职称评审材料提交截止时间为2024年3月31日...',
    date: '2024-01-10',
    isTop: false,
    type: 'normal',
    viewCount: 156,
    department: '评审办公室'
  },
  {
    id: 4,
    title: '职称评审专家库补充选聘工作启动',
    content: '为进一步完善职称评审专家库，现启动专家补充选聘工作...',
    date: '2024-01-08',
    isTop: false,
    type: 'normal',
    viewCount: 78,
    department: '人事司'
  },
  {
    id: 5,
    title: '关于规范职称评审材料格式的通知',
    content: '为提高评审效率，规范评审材料，现就材料格式要求通知如下...',
    date: '2024-01-05',
    isTop: false,
    type: 'normal',
    viewCount: 234,
    department: '评审办公室'
  },
  {
    id: 6,
    title: '职称评审结果公示期延长公告',
    content: '根据相关规定，本次职称评审结果公示期延长至15个工作日...',
    date: '2024-01-03',
    isTop: false,
    type: 'notice',
    viewCount: 167,
    department: '监督处'
  }
]);

// 政策文件数据
const policyFiles = reactive([
  {
    id: 1,
    title: '关于深化职称制度改革的意见',
    department: '人力资源社会保障部',
    date: '2023-12-20',
    fileNumber: '人社部发〔2023〕45号',
    downloadUrl: '#',
    category: '制度改革',
    fileSize: '2.5MB'
  },
  {
    id: 2,
    title: '工程技术人员职称评价基本标准条件',
    department: '人力资源社会保障部',
    date: '2023-11-15',
    fileNumber: '人社部发〔2023〕38号',
    downloadUrl: '#',
    category: '评价标准',
    fileSize: '1.8MB'
  },
  {
    id: 3,
    title: '职称评审委员会组建与管理办法',
    department: '人力资源社会保障部',
    date: '2023-10-25',
    fileNumber: '人社部发〔2023〕32号',
    downloadUrl: '#',
    category: '管理办法',
    fileSize: '3.2MB'
  }
]);

// 系统角色数据 - 简化为一行两个
const systemRoles: SystemRole[] = reactive([
  {
    id: 'applicant',
    name: '申报个人',
    description: '个人用户申报职称',
    permissions: ['apply', 'view_progress'],
    icon: 'user'
  },
  {
    id: 'expert',
    name: '评审专家',
    description: '参与职称评审打分',
    permissions: ['review_materials', 'score'],
    icon: 'expert'
  },
  {
    id: 'institution',
    name: '评审机构',
    description: '组织职称评审工作',
    permissions: ['organize_review', 'manage_experts'],
    icon: 'institution'
  },
  {
    id: 'admin',
    name: '系统管理员',
    description: '系统配置管理',
    permissions: ['system_config', 'user_management'],
    icon: 'admin'
  }
]);

// 查询功能相关
const searchKeyword = ref('');

// 验证码图片地址
const captchaUrl = ref('');

// 刷新验证码
const refreshCaptcha = () => {
  captchaUrl.value = getValidationCodeUrl(deviceId);
};

// Helper functions for login
const getUserTypeText = (type: 'personal' | 'organization' | 'expert'): string => {
  if (type === 'personal') return '个人';
  if (type === 'organization') return '机构';
  return '专家';
};

const logLoginDebugInfo = (params: any) => {
  console.log('=== 机构登录调试信息 ===');
  console.log('1. 请求参数:', params);
  console.log('2. 环境信息:', {
    isDev: import.meta.env.DEV,
    isHttpProxy: import.meta.env.VITE_HTTP_PROXY,
    baseURL: import.meta.env.VITE_SERVICE_BASE_URL
  });
  console.log('3. 即将发送请求到 /oauth/token');
};

const handleLoginSuccess = (tokenData: any) => {
  console.log('6. 存储token数据:', tokenData);

  localStg.set('token', tokenData.access_token);
  localStg.set('refreshToken', tokenData.refresh_token);
  localStg.set('tokenType', tokenData.token_type);
  localStg.set('expiresIn', tokenData.expires_in.toString());
  localStg.set('tokenTimestamp', Date.now().toString());
  localStg.set('userType', loginType.value);

  const userTypeText = getUserTypeText(loginType.value);
  window.$message?.success(`${userTypeText}登录成功，正在跳转...`);

  console.log('7. 准备跳转到对应的用户类型页面');
  setTimeout(() => {
    window.location.href = '/';
  }, 1000);
};

const handleLoginError = (result: any, oauthData: any) => {
  console.log('6. 登录失败:', result);

  if (result.error) {
    console.log('7. flatRequest错误:', result.error);
    window.$message?.error(result.error.message || '登录请求失败');
  } else if (oauthData && typeof oauthData.resp_code === 'number') {
    const errorMessage = oauthData.resp_msg || '登录失败';
    console.log('7. OAuth业务错误:', errorMessage);
    window.$message?.error(errorMessage);
  } else {
    console.log('7. 未知响应格式:', result);
    window.$message?.error('登录响应格式异常');
  }
};

const handleLoginException = (error: any) => {
  console.log('4. 机构登录失败:', error);
  console.log('5. 错误详情:', {
    message: error?.message,
    status: error?.status,
    response: error?.response,
    config: error?.config
  });

  const userTypeText = getUserTypeText(loginType.value);
  let errorMessage = `${userTypeText}登录失败`;

  if (error?.response?.data?.resp_msg) {
    errorMessage = error.response.data.resp_msg;
  } else if (error?.response?.data?.msg) {
    errorMessage = error.response.data.msg;
  } else if (error?.message) {
    errorMessage = `${userTypeText}登录失败: ${error.message}`;
  }

  window.$message?.error(errorMessage);
};

const performOrganizationLogin = async () => {
  const params = {
    username: loginForm.username,
    password: loginForm.password,
    validCode: loginForm.validCode,
    deviceId: loginForm.deviceId,
    grant_type: loginForm.grant_type
  };

  logLoginDebugInfo(params);

  try {
    const result = await fetchOAuthToken(params);
    console.log('4. 机构登录响应:', result);

    const oauthData = result.data;
    console.log('5. OAuth数据:', oauthData);

    if (oauthData && oauthData.resp_code === 0 && oauthData.datas) {
      handleLoginSuccess(oauthData.datas);
    } else {
      handleLoginError(result, oauthData);
    }
  } catch (error: any) {
    handleLoginException(error);
  }
};

// 登录处理函数
const handleLogin = async () => {
  if (loginType.value === 'organization') {
    await performOrganizationLogin();
  } else {
    const typeText = loginType.value === 'personal' ? '个人' : '专家';
    window.$message?.info(`${typeText}登录功能待开发`);
  }
};

// 切换登录类型
const switchLoginType = (type: 'personal' | 'organization' | 'expert') => {
  loginType.value = type;
  Object.assign(loginForm, {
    username: '',
    password: '',
    validCode: '',
    deviceId,
    grant_type: 'password_code'
  });
};

// 搜索功能
const searchQuery = ref('');
const searchResults = ref<Array<{ title: string; type: string; date: string }>>([]);

const handleSearch = () => {
  const keyword = searchKeyword.value || searchQuery.value;
  if (!keyword.trim()) {
    window.$message?.warning('请输入搜索关键词');
    return;
  }
  // 搜索逻辑

  const mockResults = [
    { title: `关于"${keyword}"的搜索结果1`, type: '通知公告', date: '2024-01-15' },
    { title: `关于"${keyword}"的搜索结果2`, type: '政策文件', date: '2024-01-10' },
    { title: `关于"${keyword}"的搜索结果3`, type: '办事指南', date: '2024-01-05' }
  ];

  searchResults.value = mockResults;

  window.$dialog?.info({
    title: `搜索结果 - "${keyword}"`,
    content: () => {
      return h('div', { class: 'search-results-content' }, [
        h('p', { style: 'margin-bottom: 16px; color: #666;' }, `找到 ${mockResults.length} 条相关结果`),
        h(
          'div',
          { class: 'results-list' },
          mockResults.map(result =>
            h(
              'div',
              {
                class: 'result-item',
                style:
                  'padding: 12px; border: 1px solid #e1e5e9; border-radius: 4px; margin-bottom: 8px; cursor: pointer;',
                onClick: () => window.$message?.info(`正在打开：${result.title}`)
              },
              [
                h('h4', { style: 'margin: 0 0 8px 0; color: #2d3748;' }, result.title),
                h('div', { style: 'display: flex; gap: 12px; font-size: 12px; color: #718096;' }, [
                  h('span', `类型：${result.type}`),
                  h('span', `时间：${result.date}`)
                ])
              ]
            )
          )
        )
      ]);
    },
    style: { width: '700px' },
    positiveText: '关闭'
  });
};

// 查看通知详情
const viewAnnouncementDetail = (announcement: any) => {
  // 查看通知详情
  announcement.viewCount = (announcement.viewCount || 0) + 1;

  window.$dialog?.info({
    title: announcement.title,
    content: () => {
      return h('div', { class: 'notice-detail-content' }, [
        h('div', { class: 'notice-meta' }, [
          h('span', { class: 'notice-date' }, `发布时间：${announcement.date}`),
          h('span', { class: 'notice-type' }, `类型：${announcement.type}`),
          h('span', { class: 'notice-department' }, `发布部门：${announcement.department || '系统管理员'}`),
          h('span', { class: 'notice-views' }, `查看次数：${announcement.viewCount}`)
        ]),
        h('div', { class: 'notice-content' }, [
          h(
            'p',
            announcement.content ||
              '这是一条重要的通知公告内容，请相关人员及时关注并按要求执行。具体详情请查看附件或联系相关部门。'
          ),
          announcement.isTop &&
            h('p', { style: 'color: #ff6b6b; font-weight: 500; margin-top: 12px;' }, '📌 此通知为置顶重要通知')
        ])
      ]);
    },
    style: { width: '600px' },
    positiveText: '知道了'
  });
};

// 查看更多通知公告
const viewMoreAnnouncements = () => {
  // 查看更多通知公告
  window.$message?.info('正在跳转到通知公告列表页面...');
};

// 通知自动滚动功能
const autoScroll = ref(true);
const scrollSpeed = ref(1);

const startAutoScroll = () => {
  if (!autoScroll.value) return;

  const scrollContainer = document.querySelector('.announcement-list');
  if (scrollContainer) {
    scrollContainer.scrollTop += scrollSpeed.value;

    // 如果滚动到底部，回到顶部
    if (scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
      scrollContainer.scrollTop = 0;
    }
  }

  setTimeout(startAutoScroll, 50);
};

// 鼠标悬停停止滚动
const pauseScroll = () => {
  autoScroll.value = false;
};

const resumeScroll = () => {
  autoScroll.value = true;
  startAutoScroll();
};

// 查看更多政策文件
const viewMorePolicies = () => {
  // 查看更多政策文件
  window.$message?.info('正在跳转到政策文件列表页面...');
};

// 下载政策文件
const downloadPolicy = (policy: any) => {
  // 下载政策文件
  window.$dialog?.info({
    title: '政策文件详情',
    content: () => {
      return h('div', { class: 'policy-detail-content' }, [
        h('h3', policy.title),
        h('div', { class: 'policy-meta' }, [
          h('p', `发布部门：${policy.department}`),
          h('p', `文件编号：${policy.fileNumber}`),
          h('p', `发布时间：${policy.date}`)
        ]),
        h('div', { class: 'policy-summary' }, [
          h('h4', '文件摘要：'),
          h(
            'p',
            policy.summary ||
              '本政策文件主要规定了职称评审的相关标准和流程，包括申报条件、评审程序、材料要求等重要内容。'
          )
        ])
      ]);
    },
    style: { width: '600px' },
    positiveText: '下载文件',
    negativeText: '关闭',
    onPositiveClick: () => {
      window.$message?.success('正在准备下载，请稍候...');
    }
  });
};

// 选择系统角色
// 显示角色详情
const showRoleDetail = (role: SystemRole) => {
  window.$dialog?.info({
    title: `${role.name} - 角色详情`,
    content: () => {
      return h('div', { class: 'role-detail-content' }, [
        h('p', { class: 'role-desc' }, role.description),
        h('div', { class: 'permissions-section' }, [
          h('h4', '主要权限：'),
          h(
            'div',
            { class: 'permissions-list' },
            role.permissions.map(permission => h('span', { class: 'permission-item' }, permission))
          )
        ]),
        h('div', { class: 'role-actions' }, [
          h(
            'p',
            { style: 'margin-top: 16px; color: #666; font-size: 14px;' },
            '点击“确定”进入角色登录，或“取消”返回首页'
          )
        ])
      ]);
    },
    positiveText: '进入登录',
    negativeText: '取消',
    onPositiveClick: () => {
      window.$message?.success(`正在为您准备${role.name}登录界面...`);
    }
  });
};

const selectRole = (role: SystemRole) => {
  // 显示角色详情弹窗
  showRoleDetail(role);
};

// 处理忘记密码
const handleForgotPassword = () => {
  // 忘记密码逻辑
};

// 处理注册
const handleRegister = () => {
  // 用户注册逻辑
};

// 生命周期钩子
onMounted(() => {
  // 初始化验证码
  refreshCaptcha();
  // 启动通知自动滚动
  setTimeout(() => {
    startAutoScroll();
  }, 2000); // 延迟2秒开始滚动
});

onUnmounted(() => {
  autoScroll.value = false;
});
</script>

<template>
  <div class="gov-portal">
    <!-- 顶部导航栏 - 政务蓝主色调 -->
    <header class="gov-header">
      <div class="header-container">
        <div class="header-left">
          <div class="gov-logo">
            <Icon icon="mdi:shield-star" class="logo-icon" />
          </div>
          <div class="site-info">
            <h1>职称标准化评审系统</h1>
            <p>Professional Title Standardized Evaluation System</p>
          </div>
        </div>
        <div class="header-right">
          <div class="search-container">
            <NInput
              v-model:value="searchKeyword"
              placeholder="搜索通知公告、政策文件..."
              class="header-search"
              size="small"
            >
              <template #suffix>
                <NButton text size="small" class="search-btn" @click="handleSearch">
                  <Icon icon="mdi:magnify" />
                </NButton>
              </template>
            </NInput>
          </div>
          <div class="header-nav">
            <NButton text size="small" class="nav-link">帮助中心</NButton>
            <NButton text size="small" class="nav-link">联系我们</NButton>
          </div>
        </div>
      </div>
    </header>

    <!-- 主导航菜单 - 扁平化设计 -->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-menu">
          <div class="nav-item active">首页</div>
          <div class="nav-item">职称申报</div>
          <div class="nav-item">评审管理</div>
          <div class="nav-item">专家管理</div>
          <div class="nav-item">政策法规</div>
          <div class="nav-item">系统管理</div>
          <div class="nav-item">帮助中心</div>
        </div>
      </div>
    </nav>

    <!-- Banner区域 - 政务风格 -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-text">
            <h2>专业、高效、公正的职称评审服务平台</h2>
            <p>为专业技术人员提供标准化、数字化的职称评审全流程服务</p>
            <div class="stats-row">
              <div class="stat-card">
                <div class="stat-number">10,000+</div>
                <div class="stat-label">注册用户</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">5,000+</div>
                <div class="stat-label">成功评审</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">98%</div>
                <div class="stat-label">满意度</div>
              </div>
            </div>
          </div>
          <div class="hero-visual">
            <Icon icon="mdi:certificate" class="hero-icon" />
          </div>
        </div>
      </div>
    </section>

    <!-- 主要内容区域 -->
    <main class="main-container">
      <!-- 第一行：通知公告(2) + 政策文件(2) + 登录区域(1) -->
      <section class="primary-section">
        <!-- 通知公告 -->
        <div class="announcements-card content-card">
          <div class="card-header">
            <h3>
              <Icon icon="mdi:bullhorn" class="header-icon" />
              通知公告
            </h3>
            <NButton text size="small" class="more-link" @click="viewMoreAnnouncements">更多</NButton>
          </div>
          <div class="card-content">
            <div class="announcement-list">
              <div
                v-for="item in announcements"
                :key="item.id"
                class="announcement-item"
                @click="viewAnnouncementDetail(item)"
                @mouseenter="pauseScroll"
                @mouseleave="resumeScroll"
              >
                <div class="item-content">
                  <span v-if="item.isTop" class="top-badge">置顶</span>
                  <span class="item-title">{{ item.title }}</span>
                </div>
                <span class="item-date">{{ item.date }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 政策文件 -->
        <div class="content-card policies-card">
          <div class="card-header">
            <h3>
              <Icon icon="mdi:file-document" class="header-icon" />
              政策文件
            </h3>
            <NButton text size="small" class="more-link" @click="viewMorePolicies">更多</NButton>
          </div>
          <div class="card-content">
            <div class="policy-list">
              <div v-for="item in policyFiles" :key="item.id" class="policy-item" @click="downloadPolicy(item)">
                <div class="item-content">
                  <span class="item-title">{{ item.title }}</span>
                  <span class="item-meta">{{ item.department }} · {{ item.date }}</span>
                </div>
                <NButton size="tiny" type="primary" ghost>
                  <Icon icon="mdi:download" />
                </NButton>
              </div>
            </div>
          </div>
        </div>

        <!-- 登录区域 -->
        <div class="content-card login-card">
          <div class="card-header">
            <h3>
              <Icon icon="mdi:account-circle" class="header-icon" />
              用户登录
            </h3>
            <div class="login-type-switches">
              <NButton
                size="small"
                :type="loginType === 'personal' ? 'primary' : 'default'"
                @click="switchLoginType('personal')"
              >
                个人
              </NButton>
              <NButton
                size="small"
                :type="loginType === 'organization' ? 'primary' : 'default'"
                @click="switchLoginType('organization')"
              >
                机构
              </NButton>
              <NButton
                size="small"
                :type="loginType === 'expert' ? 'primary' : 'default'"
                @click="switchLoginType('expert')"
              >
                专家
              </NButton>
            </div>
          </div>
          <div class="card-content">
            <!-- 登录表单 -->
            <div class="login-form">
              <NForm :model="loginForm">
                <NFormItem>
                  <NInput v-model:value="loginForm.username" placeholder="用户名" class="login-input">
                    <template #prefix>
                      <Icon icon="mdi:account" />
                    </template>
                  </NInput>
                </NFormItem>
                <NFormItem>
                  <NInput
                    v-model:value="loginForm.password"
                    type="password"
                    placeholder="密码"
                    show-password-on="mousedown"
                    class="login-input"
                  >
                    <template #prefix>
                      <Icon icon="mdi:lock" />
                    </template>
                  </NInput>
                </NFormItem>
                <NFormItem>
                  <div class="captcha-input-group">
                    <NInput v-model:value="loginForm.validCode" placeholder="验证码" class="login-input captcha-input">
                      <template #prefix>
                        <Icon icon="mdi:shield-check" />
                      </template>
                    </NInput>
                    <img
                      :src="captchaUrl"
                      alt="验证码"
                      class="captcha-image"
                      title="点击刷新验证码"
                      @click="refreshCaptcha"
                    />
                  </div>
                </NFormItem>
                <NFormItem>
                  <NButton type="primary" block class="login-btn" @click="handleLogin">
                    {{ loginType === 'personal' ? '个人' : loginType === 'organization' ? '机构' : '专家' }}登录
                  </NButton>
                </NFormItem>
              </NForm>
              <div class="login-actions">
                <NButton text size="small" @click="handleForgotPassword">忘记密码</NButton>
                <NButton text size="small" @click="handleRegister">快速注册</NButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 第二行：系统角色(4) + 快速链接(1) -->
      <section class="secondary-section">
        <!-- 系统角色 -->
        <div class="content-card roles-card">
          <div class="card-header">
            <h3>
              <Icon icon="mdi:account-group" class="header-icon" />
              系统角色
            </h3>
          </div>
          <div class="card-content">
            <div class="roles-grid">
              <div v-for="role in systemRoles" :key="role.id" class="role-item" @click="selectRole(role)">
                <div class="role-icon-wrapper">
                  <Icon
                    :icon="
                      role.icon === 'user'
                        ? 'mdi:account'
                        : role.icon === 'expert'
                          ? 'mdi:account-star'
                          : role.icon === 'institution'
                            ? 'mdi:office-building'
                            : 'mdi:account-cog'
                    "
                    class="role-icon"
                  />
                </div>
                <div class="role-info">
                  <div class="role-name">{{ role.name }}</div>
                  <div class="role-desc">{{ role.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速链接 -->
        <div class="content-card links-card">
          <div class="card-header">
            <h3>
              <Icon icon="mdi:link-variant" class="header-icon" />
              快速链接
            </h3>
          </div>
          <div class="card-content">
            <div class="quick-links">
              <a href="#" class="link-item">
                <Icon icon="mdi:file-plus" />
                <span>职称申报</span>
              </a>
              <a href="#" class="link-item">
                <Icon icon="mdi:progress-check" />
                <span>申报进度</span>
              </a>
              <a href="#" class="link-item">
                <Icon icon="mdi:account-check" />
                <span>专家评审</span>
              </a>
              <a href="#" class="link-item">
                <Icon icon="mdi:chart-line" />
                <span>评审结果</span>
              </a>
              <a href="#" class="link-item">
                <Icon icon="mdi:file-document-outline" />
                <span>政策法规</span>
              </a>
              <a href="#" class="link-item">
                <Icon icon="mdi:help-circle" />
                <span>帮助中心</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="gov-footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>关于我们</h4>
            <ul>
              <li><a href="#">平台介绍</a></li>
              <li><a href="#">服务条款</a></li>
              <li><a href="#">隐私政策</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>服务支持</h4>
            <ul>
              <li><a href="#">使用指南</a></li>
              <li><a href="#">常见问题</a></li>
              <li><a href="#">技术支持</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>联系我们</h4>
            <ul>
              <li>服务热线：400-123-4567</li>
              <li>邮箱：service@title-eval.gov.cn</li>
              <li>工作时间：周一至周五 9:00-17:30</li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>友情链接</h4>
            <ul>
              <li><a href="#">人力资源社会保障部</a></li>
              <li><a href="#">中国人事考试网</a></li>
              <li><a href="#">专业技术人员管理司</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="copyright">
            <p>&copy; 2024 职称标准化评审系统. 版权所有 | 备案号：京ICP备12345678号</p>
            <p>主办单位：人力资源和社会保障部 | 技术支持：国家信息中心</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* ===== 政务蓝主题色彩系统 ===== */
:root {
  --gov-primary: #1e40af; /* 政务蓝主色 */
  --gov-primary-light: #3b82f6; /* 政务蓝浅色 */
  --gov-primary-dark: #1d4ed8; /* 政务蓝深色 */
  --gov-secondary: #64748b; /* 次要色 */
  --gov-success: #059669; /* 成功色 */
  --gov-warning: #d97706; /* 警告色 */
  --gov-error: #dc2626; /* 错误色 */
  --gov-text-primary: #1f2937; /* 主要文本色 */
  --gov-text-secondary: #6b7280; /* 次要文本色 */
  --gov-text-muted: #9ca3af; /* 弱化文本色 */
  --gov-bg-primary: #ffffff; /* 主背景色 */
  --gov-bg-secondary: #f8fafc; /* 次背景色 */
  --gov-bg-tertiary: #f1f5f9; /* 第三背景色 */
  --gov-border: #e5e7eb; /* 边框色 */
  --gov-border-light: #f3f4f6; /* 浅边框色 */
  --gov-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --gov-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --gov-shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.06);
  --gov-radius: 6px; /* 圆角大小 */
  --gov-spacing-xs: 4px; /* 极小间距 */
  --gov-spacing-sm: 8px; /* 小间距 */
  --gov-spacing-md: 16px; /* 中等间距 */
  --gov-spacing-lg: 24px; /* 大间距 */
  --gov-spacing-xl: 32px; /* 超大间距 */
}

/* ===== 基础布局 ===== */
.gov-portal {
  min-height: 100vh;
  background: var(--gov-bg-secondary);
  font-family:
    'PingFang SC',
    'Microsoft YaHei',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  line-height: 1.6;
  color: var(--gov-text-primary);
}

/* 确保所有子元素都继承正确的样式 */
.gov-portal * {
  box-sizing: border-box;
}

/* ===== 顶部导航 ===== */
.gov-header {
  background: linear-gradient(135deg, var(--gov-primary) 0%, var(--gov-primary-light) 100%);
  color: white;
  padding: var(--gov-spacing-md) 0;
  box-shadow: var(--gov-shadow-md);
  position: relative;
  z-index: 100;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--gov-spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--gov-spacing-md);
}

.gov-logo .logo-icon {
  font-size: 32px;
  color: #fbbf24;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.site-info h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.site-info p {
  font-size: 14px;
  margin: var(--gov-spacing-xs) 0 0 0;
  opacity: 0.9;
  font-style: italic;
  font-weight: 300;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--gov-spacing-lg);
}

.search-container {
  width: 280px;
}

.header-search :deep(.n-input) {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: var(--gov-radius);
}

.header-search :deep(.n-input__input) {
  color: white;
}

.header-search :deep(.n-input__placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

.search-btn {
  color: rgba(255, 255, 255, 0.9);
}

.search-btn:hover {
  color: white;
}

.header-nav {
  display: flex;
  gap: var(--gov-spacing-sm);
}

.nav-link {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: var(--gov-radius);
  padding: var(--gov-spacing-xs) var(--gov-spacing-md);
  transition: all 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* ===== 主导航菜单 ===== */
.main-nav {
  background: white;
  border-bottom: 1px solid var(--gov-border);
  box-shadow: var(--gov-shadow-sm);
  position: sticky;
  top: 0;
  z-index: 90;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--gov-spacing-lg);
}

.nav-menu {
  display: flex;
}

.nav-item {
  padding: var(--gov-spacing-md) var(--gov-spacing-lg);
  color: var(--gov-text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
  position: relative;
  font-size: 15px;
}

.nav-item:hover,
.nav-item.active {
  color: var(--gov-primary);
  border-bottom-color: var(--gov-primary);
  background: linear-gradient(to bottom, rgba(30, 64, 175, 0.05), transparent);
}

/* ===== Hero Section - 震撼升级 ===== */
.hero-section {
  background: linear-gradient(
    135deg,
    var(--gov-primary) 0%,
    var(--gov-primary-light) 20%,
    #2563eb 40%,
    var(--gov-primary-dark) 100%
  );
  color: white;
  padding: 64px 0;
  position: relative;
  overflow: hidden;
  min-height: 400px;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size:
    30px 30px,
    60px 60px;
  opacity: 0.6;
  animation: heroPattern 20s linear infinite;
}

.hero-section::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: heroGlow 15s ease-in-out infinite;
}

@keyframes heroPattern {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(-30px, -30px) rotate(360deg);
  }
}

@keyframes heroGlow {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.1;
  }
  50% {
    transform: translate(-10%, -10%) scale(1.1);
    opacity: 0.2;
  }
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--gov-spacing-lg);
  position: relative;
  z-index: 1;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 48px;
}

.hero-text {
  flex: 2;
}

.hero-text h2 {
  font-size: 42px;
  font-weight: 900;
  margin: 0 0 var(--gov-spacing-md) 0;
  line-height: 1.2;
  letter-spacing: -0.8px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  animation: heroTextGlow 3s ease-in-out infinite;
}

.hero-text p {
  font-size: 20px;
  margin: 0 0 var(--gov-spacing-xl) 0;
  opacity: 0.95;
  line-height: 1.6;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@keyframes heroTextGlow {
  0%,
  100% {
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  50% {
    text-shadow:
      0 4px 12px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(255, 255, 255, 0.1);
  }
}

.stats-row {
  display: flex;
  gap: var(--gov-spacing-xl);
}

.stat-card {
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  padding: var(--gov-spacing-lg);
  border-radius: 12px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  animation: statFloat 4s ease-in-out infinite;
}

.stat-card:nth-child(2) {
  animation-delay: 1s;
}

.stat-card:nth-child(3) {
  animation-delay: 2s;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

@keyframes statFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.stat-number {
  display: block;
  font-size: 38px;
  font-weight: 900;
  margin-bottom: var(--gov-spacing-xs);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 15px;
  opacity: 0.95;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.hero-visual {
  flex: 1;
  text-align: center;
  position: relative;
}

.hero-icon {
  font-size: 200px;
  color: rgba(255, 255, 255, 0.3);
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
  animation: iconPulse 6s ease-in-out infinite;
}

@keyframes iconPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

/* ===== 主要内容区域 ===== */
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--gov-spacing-xl) var(--gov-spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--gov-spacing-lg);
}

/* ===== 第一行布局：2.5:2.5:1.5 ===== */
.primary-section {
  display: flex;
  gap: var(--gov-spacing-lg);
}

.announcements-card {
  flex: 1.5;
}

.policies-card {
  flex: 1.5;
}

.login-card {
  flex: 1.5;
}

/* ===== 第二行布局：3:1.5 ===== */
.secondary-section {
  display: flex;
  gap: var(--gov-spacing-lg);
}

.roles-card {
  flex: 3.3;
}

.links-card {
  flex: 1.5;
}

/* ===== 卡片通用样式 - 扁平化设计 ===== */
.content-card {
  background: white;
  border-radius: var(--gov-radius);
  border: 1px solid var(--gov-border);
  box-shadow: var(--gov-shadow-sm);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  height: 420px;
}

.content-card:hover {
  box-shadow: var(--gov-shadow-md);
  border-color: #d1d5db;
}

.card-header {
  padding: var(--gov-spacing-md) var(--gov-spacing-lg);
  border-bottom: 1px solid var(--gov-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gov-bg-tertiary);
  flex-shrink: 0;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--gov-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--gov-spacing-sm);
}

.header-icon {
  color: var(--gov-primary);
  font-size: 22px;
}

.more-link {
  color: var(--gov-text-muted);
  font-size: 14px;
  font-weight: 500;
}

.more-link:hover {
  color: var(--gov-primary);
}

.card-content {
  padding: var(--gov-spacing-lg);
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ===== 通知公告样式 ===== */
.announcement-list {
  display: flex;
  flex-direction: column;
  gap: var(--gov-spacing-sm);
  flex: 1;
  overflow-y: auto;
}

.announcement-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--gov-spacing-md);
  border: 1px solid var(--gov-border-light);
  border-radius: var(--gov-radius);
  cursor: pointer;
  transition: all 0.2s;
  background: var(--gov-bg-primary);
}

.announcement-item:hover {
  background: var(--gov-bg-secondary);
  border-color: var(--gov-primary);
  transform: translateX(2px);
}

.item-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--gov-spacing-sm);
  min-width: 0;
}

.top-badge {
  background: var(--gov-error);
  color: white;
  padding: 2px var(--gov-spacing-sm);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.item-title {
  font-weight: 500;
  color: var(--gov-text-primary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-date {
  font-size: 12px;
  color: var(--gov-text-muted);
  flex-shrink: 0;
  margin-left: var(--gov-spacing-sm);
}

/* ===== 政策文件样式 ===== */
.policy-list {
  display: flex;
  flex-direction: column;
  gap: var(--gov-spacing-sm);
  flex: 1;
  overflow-y: auto;
}

.policy-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--gov-spacing-md);
  border: 1px solid var(--gov-border-light);
  border-left: 4px solid var(--gov-primary);
  border-radius: var(--gov-radius);
  cursor: pointer;
  transition: all 0.2s;
  background: var(--gov-bg-primary);
}

.policy-item:hover {
  background: var(--gov-bg-secondary);
  border-left-color: var(--gov-primary-dark);
  transform: translateX(2px);
}

.policy-item .item-content {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--gov-spacing-xs);
}

.item-meta {
  font-size: 12px;
  color: var(--gov-text-muted);
}

/* ===== 登录类型切换按钮样式 ===== */
.login-type-switches {
  display: flex;
  gap: var(--gov-spacing-xs);
}

.login-type-switches .n-button {
  font-size: 12px;
}

/* ===== 登录表单样式 ===== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--gov-spacing-md);
}

.captcha-input-group {
  display: flex;
  gap: var(--gov-spacing-sm);
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 80px;
  height: 32px;
  border: 1px solid var(--gov-border);
  border-radius: var(--gov-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.captcha-image:hover {
  border-color: var(--gov-primary);
  box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.1);
}

.login-input :deep(.n-input) {
  border-radius: var(--gov-radius);
  border: 1px solid var(--gov-border);
}

.login-input :deep(.n-input:focus-within) {
  border-color: var(--gov-primary);
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.login-btn :deep(.n-button) {
  background: var(--gov-primary);
  border: none;
  height: 40px;
  font-weight: 600;
  border-radius: var(--gov-radius);
}

.login-btn :deep(.n-button:hover) {
  background: var(--gov-primary-dark);
  transform: translateY(-1px);
}

.login-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--gov-spacing-md);
  padding-top: var(--gov-spacing-md);
  border-top: 1px solid var(--gov-border-light);
}

.login-actions .n-button {
  color: var(--gov-text-secondary);
}

.login-actions .n-button:hover {
  color: var(--gov-primary);
}

/* ===== 系统角色样式 ===== */
.roles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gov-spacing-md);
  flex: 1;
  overflow-y: auto;
}

.role-item {
  display: flex;
  align-items: center;
  gap: var(--gov-spacing-md);
  padding: var(--gov-spacing-md);
  border: 1px solid var(--gov-border-light);
  border-radius: var(--gov-radius);
  cursor: pointer;
  transition: all 0.2s;
  background: var(--gov-bg-primary);
}

.role-item:hover {
  background: var(--gov-bg-secondary);
  border-color: var(--gov-primary);
  transform: translateY(-2px);
  box-shadow: var(--gov-shadow-md);
}

.role-icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--gov-primary), var(--gov-primary-light));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-icon {
  font-size: 24px;
  color: white;
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  font-weight: 600;
  color: var(--gov-text-primary);
  margin-bottom: var(--gov-spacing-xs);
}

.role-desc {
  font-size: 13px;
  color: var(--gov-text-secondary);
  line-height: 1.4;
}

/* ===== 快速链接样式 ===== */
.quick-links {
  display: flex;
  flex-direction: column;
  gap: var(--gov-spacing-sm);
  flex: 1;
  overflow-y: auto;
}

.link-item {
  display: flex;
  align-items: center;
  gap: var(--gov-spacing-md);
  padding: var(--gov-spacing-md);
  border: 1px solid var(--gov-border-light);
  border-radius: var(--gov-radius);
  text-decoration: none;
  color: var(--gov-text-primary);
  transition: all 0.2s;
  background: var(--gov-bg-primary);
}

.link-item:hover {
  background: linear-gradient(135deg, var(--gov-primary), var(--gov-primary-light));
  color: white;
  transform: translateX(4px);
  box-shadow: var(--gov-shadow-md);
  text-decoration: none;
}

.link-item svg {
  font-size: 20px;
  color: var(--gov-primary);
  transition: color 0.2s;
}

.link-item:hover svg {
  color: white;
}

.link-item span {
  font-weight: 500;
  font-size: 14px;
}

/* ===== 页脚样式 ===== */
.gov-footer {
  background: var(--gov-text-primary);
  color: #d1d5db;
  margin-top: var(--gov-spacing-xl);
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--gov-spacing-lg);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gov-spacing-xl);
  padding: var(--gov-spacing-xl) 0;
}

.footer-section h4 {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 var(--gov-spacing-md) 0;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin-bottom: var(--gov-spacing-sm);
  font-size: 14px;
}

.footer-section a {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-section a:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding: var(--gov-spacing-lg) 0;
  text-align: center;
}

.copyright p {
  margin: var(--gov-spacing-xs) 0;
  font-size: 12px;
  color: #9ca3af;
}

/* ===== 响应式设计 ===== */
@media (max-width: 1200px) {
  .primary-section {
    flex-direction: column;
    gap: var(--gov-spacing-md);
  }

  .announcements-card,
  .policies-card,
  .login-card {
    flex: 1;
  }

  .secondary-section {
    flex-direction: column;
    gap: var(--gov-spacing-md);
  }

  .roles-card,
  .links-card {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
    gap: var(--gov-spacing-lg);
  }

  .stats-row {
    gap: var(--gov-spacing-md);
  }

  .roles-grid {
    grid-template-columns: 1fr;
  }

  .header-container {
    flex-direction: column;
    gap: var(--gov-spacing-md);
  }

  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-item {
    padding: var(--gov-spacing-sm) var(--gov-spacing-md);
  }

  .content-card {
    height: auto;
    min-height: 300px;
  }
}

/* ===== 滚动条美化 ===== */
.announcement-list::-webkit-scrollbar,
.policy-list::-webkit-scrollbar,
.roles-grid::-webkit-scrollbar,
.quick-links::-webkit-scrollbar {
  width: 6px;
}

.announcement-list::-webkit-scrollbar-track,
.policy-list::-webkit-scrollbar-track,
.roles-grid::-webkit-scrollbar-track,
.quick-links::-webkit-scrollbar-track {
  background: var(--gov-bg-tertiary);
  border-radius: 3px;
}

.announcement-list::-webkit-scrollbar-thumb,
.policy-list::-webkit-scrollbar-thumb,
.roles-grid::-webkit-scrollbar-thumb,
.quick-links::-webkit-scrollbar-thumb {
  background: var(--gov-border);
  border-radius: 3px;
}

.announcement-list::-webkit-scrollbar-thumb:hover,
.policy-list::-webkit-scrollbar-thumb:hover,
.roles-grid::-webkit-scrollbar-thumb:hover,
.quick-links::-webkit-scrollbar-thumb:hover {
  background: var(--gov-text-muted);
}

/* ===== 动画效果 ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-card {
  animation: fadeInUp 0.6s ease-out;
}

.content-card:nth-child(2) {
  animation-delay: 0.1s;
}

.content-card:nth-child(3) {
  animation-delay: 0.2s;
}

/* ===== 深色组件样式覆盖 ===== */
:deep(.n-button--primary-type) {
  background: var(--gov-primary) !important;
  border-color: var(--gov-primary) !important;
}

:deep(.n-button--primary-type:hover) {
  background: var(--gov-primary-dark) !important;
  border-color: var(--gov-primary-dark) !important;
}

:deep(.n-input:focus-within) {
  border-color: var(--gov-primary) !important;
  box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.2) !important;
}

:deep(.n-button) {
  border-radius: var(--gov-radius) !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}

:deep(.n-input) {
  border-radius: var(--gov-radius) !important;
}

:deep(.n-card) {
  border-radius: var(--gov-radius) !important;
}

/* ===== 特殊元素样式 ===== */
.search-results-content {
  max-height: 400px;
  overflow-y: auto;
}

.result-item:hover {
  background: var(--gov-bg-secondary);
  border-color: var(--gov-primary);
  transform: translateX(4px);
}

.notice-detail-content,
.policy-detail-content,
.role-detail-content {
  line-height: 1.6;
}

.notice-meta,
.policy-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gov-spacing-md);
  margin-bottom: var(--gov-spacing-md);
  padding-bottom: var(--gov-spacing-md);
  border-bottom: 1px solid var(--gov-border-light);
}

.permissions-section {
  margin-top: var(--gov-spacing-md);
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gov-spacing-sm);
  margin-top: var(--gov-spacing-sm);
}

.permission-item {
  background: var(--gov-bg-tertiary);
  color: var(--gov-primary);
  padding: var(--gov-spacing-xs) var(--gov-spacing-sm);
  border-radius: var(--gov-radius);
  font-size: 12px;
  font-weight: 500;
}

/* ===== 优化细节 ===== */
.card-content:has(.announcement-list),
.card-content:has(.policy-list),
.card-content:has(.roles-grid),
.card-content:has(.quick-links) {
  overflow: hidden;
}

.login-card .card-content {
  justify-content: center;
}

/* 确保按钮在hover时有合适的视觉反馈 */
.n-button:not(:disabled):hover {
  transform: translateY(-1px);
}

/* 确保卡片在不同高度下保持一致性 */
.content-card {
  min-height: 420px;
  max-height: 420px;
}
</style>
