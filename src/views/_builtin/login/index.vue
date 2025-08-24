<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NInput,
  NScrollbar,
  NSpace
} from 'naive-ui';
import { Icon } from '@iconify/vue';

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  phone: '',
  smsCode: ''
});

// 登录方式：password（密码登录）、sms（短信验证登录）
const loginType = ref<'password' | 'sms'>('password');

// 系统角色定义
interface SystemRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  icon: string;
}

// 通知公告数据
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

// 政策分类
const policyCategories = reactive(['全部', '制度改革', '评价标准', '管理办法', '申报指南']);
const selectedPolicyCategory = ref('全部');

// 筛选后的政策文件
const filteredPolicyFiles = computed(() => {
  if (selectedPolicyCategory.value === '全部') {
    return policyFiles;
  }
  return policyFiles.filter(policy => policy.category === selectedPolicyCategory.value);
});

// 系统角色数据
const systemRoles: SystemRole[] = reactive([
  {
    id: 'applicant',
    name: '申报个人',
    description: '个人用户，可进行职称申报、查看申报进度、上传申报材料',
    permissions: ['apply', 'view_progress', 'upload_materials'],
    icon: 'user'
  },
  {
    id: 'expert',
    name: '评审专家',
    description: '参与职称评审的专家，负责评审申报材料和打分',
    permissions: ['review_materials', 'score', 'comment'],
    icon: 'expert'
  },
  {
    id: 'institution',
    name: '评审机构',
    description: '负责组织职称评审工作的机构',
    permissions: ['organize_review', 'manage_experts', 'publish_results'],
    icon: 'institution'
  },
  {
    id: 'admin',
    name: '管理员',
    description: '系统管理员，负责系统角色授权和基础配置',
    permissions: ['role_management', 'system_config', 'user_management'],
    icon: 'admin'
  },
  {
    id: 'auditor',
    name: '审核员',
    description: '负责申报资料的初步核验工作',
    permissions: ['verify_materials', 'preliminary_review', 'feedback'],
    icon: 'auditor'
  },
  {
    id: 'operator',
    name: '操作员',
    description: '负责业务全流程操作管理',
    permissions: ['process_management', 'workflow_control', 'data_entry'],
    icon: 'operator'
  },
  {
    id: 'super_admin',
    name: '超级管理员',
    description: '负责评审委员会及评审过程的全面管理',
    permissions: ['committee_management', 'process_oversight', 'system_admin'],
    icon: 'super_admin'
  },
  {
    id: 'supervisor',
    name: '人社部门监管员',
    description: '人社部门监管人员，负责监督评审过程',
    permissions: ['supervision', 'audit_trail', 'compliance_check'],
    icon: 'supervisor'
  }
]);

// 查询功能相关
const searchKeyword = ref('');
const searchType = ref('all'); // all, announcement, policy, role

// 登录处理函数
const handleLogin = () => {
  console.log('登录信息:', loginForm);
  // 这里添加实际的登录逻辑
};

// 切换登录方式
const switchLoginType = (type: 'password' | 'sms') => {
  loginType.value = type;
  // 清空表单
  Object.assign(loginForm, {
    username: '',
    password: ''
  });
};

// 搜索功能
const searchQuery = ref('');
const searchResults = ref<Array<{ title: string; type: string; date: string }>>([]);
const searchSuggestions = ref([
  '职称评审流程',
  '申报材料清单',
  '评审标准',
  '政策文件下载',
  '专家库查询',
  '评审结果公示'
]);

const handleSearch = () => {
  const keyword = searchKeyword.value || searchQuery.value;
  if (!keyword.trim()) {
    window.$message?.warning('请输入搜索关键词');
    return;
  }
  console.log('搜索:', { keyword, type: searchType.value });

  // 模拟搜索结果
  const mockResults = [
    { title: `关于"${keyword}"的搜索结果1`, type: '通知公告', date: '2024-01-15' },
    { title: `关于"${keyword}"的搜索结果2`, type: '政策文件', date: '2024-01-10' },
    { title: `关于"${keyword}"的搜索结果3`, type: '办事指南', date: '2024-01-05' }
  ];

  searchResults.value = mockResults;

  // 显示搜索结果弹窗
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

// 快速搜索建议
const handleQuickSearch = (suggestion: string) => {
  searchKeyword.value = suggestion;
  handleSearch();
};

// 查看通知详情
const viewAnnouncementDetail = (announcement: any) => {
  console.log('查看通知详情:', announcement.title);
  // 增加查看次数
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
  console.log('查看更多通知公告');
  window.$message?.info('正在跳转到通知公告列表页面...');
  // 这里可以添加路由跳转逻辑
};

// 查看更多政策文件
const viewMorePolicies = () => {
  console.log('查看更多政策文件');
  window.$message?.info('正在跳转到政策文件列表页面...');
  // 这里可以添加路由跳转逻辑
};

// 按分类筛选政策文件
const filterPoliciesByCategory = (category: string) => {
  selectedPolicyCategory.value = category;
  console.log('筛选政策分类:', category);
};

// 下载政策文件
const downloadPolicy = (policy: any) => {
  console.log('下载政策文件:', policy.title);
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
      // 这里可以添加实际的文件下载逻辑
    }
  });
};

// 选择系统角色
const selectRole = (role: SystemRole) => {
  console.log('选择角色:', role.name);
  // 显示角色详情弹窗
  showRoleDetail(role);
};

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
            '点击"确定"进入角色登录，或"取消"返回首页'
          )
        ])
      ]);
    },
    positiveText: '进入登录',
    negativeText: '取消',
    onPositiveClick: () => {
      // 这里可以跳转到对应角色的登录页面或直接登录
      window.$message?.success(`正在为您准备${role.name}登录界面...`);
      // 实际项目中可以根据角色类型跳转到不同的登录流程
    }
  });
};

// 处理忘记密码
const handleForgotPassword = () => {
  console.log('忘记密码');
};

// 处理注册
const handleRegister = () => {
  console.log('用户注册');
};
</script>

<template>
  <div class="title-evaluation-portal">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-container">
        <div class="nav-left">
          <div class="gov-emblem">
            <Icon icon="mdi:shield-star" style="font-size: 24px; color: #d32f2f" />
          </div>
          <div class="site-title">
            <h1>职称标准化评审系统</h1>
            <p>Professional Title Standardized Evaluation System</p>
          </div>
        </div>
        <div class="nav-right">
          <div class="search-box">
            <NInput v-model:value="searchKeyword" placeholder="搜索通知公告、政策文件、系统角色..." size="small">
              <template #suffix>
                <NButton text size="small" @click="handleSearch">
                  <Icon icon="mdi:magnify" />
                </NButton>
              </template>
            </NInput>
          </div>
          <div class="nav-buttons">
            <NButton size="small" class="nav-btn">帮助中心</NButton>
            <NButton size="small" class="nav-btn">联系我们</NButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 主导航菜单 -->
    <div class="main-nav">
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
    </div>

    <!-- 横幅Banner -->
    <div class="hero-banner">
      <div class="banner-container">
        <div class="banner-content">
          <div class="banner-text">
            <h2>专业、高效、公正的职称评审服务平台</h2>
            <p>为专业技术人员提供标准化、数字化的职称评审全流程服务</p>
            <div class="banner-stats">
              <div class="stat-item">
                <span class="stat-number">10,000+</span>
                <span class="stat-label">注册用户</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">5,000+</span>
                <span class="stat-label">成功评审</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">98%</span>
                <span class="stat-label">满意度</span>
              </div>
            </div>
          </div>
          <div class="banner-image">
            <Icon icon="mdi:certificate" style="font-size: 120px; color: rgba(255, 255, 255, 0.3)" />
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-container">
        <!-- 主要功能区域：通知公告、登录区域、政策文件 -->
        <div class="primary-row">
          <!-- 通知公告模块 -->
          <div class="content-section announcement-section">
            <div class="section-header">
              <h3>
                <Icon icon="mdi:bullhorn" class="section-icon" />
                通知公告
              </h3>
              <NButton text size="small" class="more-btn">更多 ></NButton>
            </div>
            <NScrollbar style="max-height: 320px" trigger="hover">
              <div class="news-list">
                <div
                  v-for="announcement in announcements"
                  :key="announcement.id"
                  class="news-item"
                  @click="viewAnnouncementDetail(announcement)"
                >
                  <div class="news-header">
                    <span v-if="announcement.isTop" class="top-badge">置顶</span>
                    <span class="type-badge" :class="`type-${announcement.type}`">
                      {{
                        announcement.type === 'important' ? '重要' : announcement.type === 'notice' ? '通知' : '一般'
                      }}
                    </span>
                    <span class="view-count">{{ announcement.viewCount || 0 }} 次查看</span>
                  </div>
                  <span class="news-title">{{ announcement.title }}</span>
                  <div class="news-meta">
                    <span class="news-date">[{{ announcement.date }}]</span>
                    <span class="news-department">{{ announcement.department || '系统管理员' }}</span>
                  </div>
                </div>
              </div>
            </NScrollbar>

            <!-- 查看更多按钮 -->
            <div class="more-actions" style="margin-top: 16px; text-align: center">
              <NButton text type="primary" style="font-size: 14px" @click="viewMoreAnnouncements">
                查看更多通知公告 →
              </NButton>
            </div>
          </div>

          <!-- 政策文件模块 -->
          <div class="content-section policy-section">
            <div class="section-header">
              <h3>
                <Icon icon="mdi:file-document" class="section-icon" />
                政策文件
              </h3>
              <NButton text size="small" class="more-btn" @click="viewMorePolicies">更多 ></NButton>
            </div>

            <!-- 政策分类筛选 -->
            <div class="policy-filters" style="margin-bottom: 16px">
              <NSpace>
                <NButton
                  v-for="category in policyCategories"
                  :key="category"
                  :type="selectedPolicyCategory === category ? 'primary' : 'default'"
                  size="small"
                  @click="filterPoliciesByCategory(category)"
                >
                  {{ category }}
                </NButton>
              </NSpace>
            </div>

            <NScrollbar style="max-height: 320px" trigger="hover">
              <div class="news-list">
                <div v-for="policy in filteredPolicyFiles" :key="policy.id" class="news-item policy-item">
                  <div class="policy-header">
                    <span class="news-title">{{ policy.title }}</span>
                    <div class="policy-actions">
                      <span class="file-size">{{ policy.fileSize }}</span>
                      <NButton
                        size="tiny"
                        type="primary"
                        ghost
                        style="margin-left: 8px"
                        @click="downloadPolicy(policy)"
                      >
                        <Icon icon="mdi:download" />
                        下载
                      </NButton>
                    </div>
                  </div>
                  <div class="policy-meta">
                    <span class="policy-department">{{ policy.department }}</span>
                    <span class="policy-number">{{ policy.fileNumber }}</span>
                    <span class="policy-category">{{ policy.category }}</span>
                    <span class="news-date">[{{ policy.date }}]</span>
                  </div>
                </div>
              </div>
            </NScrollbar>

            <!-- 查看更多按钮 -->
            <div class="more-actions" style="margin-top: 16px; text-align: center">
              <NButton text type="primary" style="font-size: 14px" @click="viewMorePolicies">
                查看更多政策文件 →
              </NButton>
            </div>
          </div>

          <!-- 核心登录区域 -->
          <div class="content-section login-section primary-login">
            <!-- 快速查询模块 -->
            <div class="quick-query-section">
              <div class="section-header">
                <h3>
                  <Icon icon="mdi:magnify" class="section-icon" />
                  快速查询
                </h3>
              </div>
              <div class="search-content">
                <div class="search-options">
                  <NButton :type="searchType === 'all' ? 'primary' : 'default'" size="tiny" @click="searchType = 'all'">
                    全部
                  </NButton>
                  <NButton
                    :type="searchType === 'announcement' ? 'primary' : 'default'"
                    size="tiny"
                    @click="searchType = 'announcement'"
                  >
                    公告
                  </NButton>
                  <NButton
                    :type="searchType === 'policy' ? 'primary' : 'default'"
                    size="tiny"
                    @click="searchType = 'policy'"
                  >
                    政策
                  </NButton>
                  <NButton
                    :type="searchType === 'role' ? 'primary' : 'default'"
                    size="tiny"
                    @click="searchType = 'role'"
                  >
                    角色
                  </NButton>
                </div>
                <NInput
                  v-model:value="searchKeyword"
                  placeholder="请输入关键词"
                  size="small"
                  style="margin-top: 8px"
                  @keyup.enter="handleSearch"
                >
                  <template #suffix>
                    <Icon icon="mdi:magnify" style="cursor: pointer" @click="handleSearch" />
                  </template>
                </NInput>

                <!-- 搜索建议 -->
                <div class="search-suggestions" style="margin-top: 12px">
                  <div style="font-size: 12px; color: #718096; margin-bottom: 8px">热门搜索：</div>
                  <div class="suggestion-tags">
                    <span
                      v-for="suggestion in searchSuggestions.slice(0, 4)"
                      :key="suggestion"
                      class="suggestion-tag"
                      @click="handleQuickSearch(suggestion)"
                    >
                      {{ suggestion }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 登录区域 -->
            <NCard class="login-card">
              <template #header>
                <div class="login-header">
                  <Icon icon="mdi:account-circle" style="color: #1976d2" />
                  <span>用户登录</span>
                  <div class="login-type-switch">
                    <NButton
                      :type="loginType === 'password' ? 'primary' : 'default'"
                      size="tiny"
                      @click="switchLoginType('password')"
                    >
                      密码登录
                    </NButton>
                    <NButton
                      :type="loginType === 'sms' ? 'primary' : 'default'"
                      size="tiny"
                      @click="switchLoginType('sms')"
                    >
                      短信登录
                    </NButton>
                  </div>
                </div>
              </template>

              <NForm :model="loginForm" size="medium">
                <!-- 密码登录表单 -->
                <template v-if="loginType === 'password'">
                  <NFormItem>
                    <NInput v-model:value="loginForm.username" placeholder="用户名/手机号" size="small">
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
                      size="small"
                      show-password-on="mousedown"
                    >
                      <template #prefix>
                        <Icon icon="mdi:lock" />
                      </template>
                    </NInput>
                  </NFormItem>
                </template>

                <!-- 短信验证登录表单 -->
                <template v-else>
                  <NFormItem>
                    <NInput v-model:value="loginForm.phone" placeholder="手机号" size="small">
                      <template #prefix>
                        <Icon icon="mdi:phone" />
                      </template>
                    </NInput>
                  </NFormItem>
                  <NFormItem>
                    <div class="sms-input-group">
                      <NInput v-model:value="loginForm.smsCode" placeholder="验证码" size="small" style="flex: 1">
                        <template #prefix>
                          <Icon icon="mdi:message-text" />
                        </template>
                      </NInput>
                      <NButton size="small" style="margin-left: 8px">发送验证码</NButton>
                    </div>
                  </NFormItem>
                </template>

                <NFormItem>
                  <NButton type="primary" block size="small" @click="handleLogin">登录</NButton>
                </NFormItem>
              </NForm>

              <div class="login-links">
                <NSpace justify="space-between">
                  <NButton text size="tiny" @click="handleForgotPassword">忘记密码</NButton>
                  <NButton text size="tiny" @click="handleRegister">注册</NButton>
                </NSpace>
              </div>
            </NCard>
          </div>
        </div>

        <!-- 次要功能区域：系统角色、快速链接、统计、日程 -->
        <div class="secondary-row">
          <!-- 系统角色模块 -->
          <div class="content-section secondary-section">
            <div class="section-header">
              <h3>
                <Icon icon="mdi:account-group" class="section-icon" />
                系统角色
              </h3>
            </div>
            <NScrollbar style="max-height: 320px" trigger="hover">
              <NGrid :cols="2" :x-gap="16" :y-gap="16" class="role-grid">
                <NGi v-for="role in systemRoles" :key="role.id">
                  <NCard class="role-card" hoverable @click="selectRole(role)">
                    <div class="role-content">
                      <div class="role-header">
                        <Icon
                          :icon="
                            role.icon === 'user'
                              ? 'mdi:account'
                              : role.icon === 'expert'
                                ? 'mdi:account-star'
                                : role.icon === 'institution'
                                  ? 'mdi:office-building'
                                  : role.icon === 'admin'
                                    ? 'mdi:account-cog'
                                    : role.icon === 'auditor'
                                      ? 'mdi:account-check'
                                      : role.icon === 'operator'
                                        ? 'mdi:account-wrench'
                                        : role.icon === 'super_admin'
                                          ? 'mdi:account-supervisor'
                                          : 'mdi:account-eye'
                          "
                          class="role-icon"
                        />
                        <h4 class="role-name">{{ role.name }}</h4>
                      </div>
                      <p class="role-description">{{ role.description }}</p>
                      <div class="role-permissions">
                        <span
                          v-for="permission in role.permissions.slice(0, 3)"
                          :key="permission"
                          class="permission-tag"
                        >
                          {{ permission }}
                        </span>
                        <span v-if="role.permissions.length > 3" class="more-permissions">
                          +{{ role.permissions.length - 3 }}
                        </span>
                      </div>
                    </div>
                  </NCard>
                </NGi>
              </NGrid>
            </NScrollbar>
          </div>

          <!-- 快速链接模块 -->
          <div class="content-section secondary-section">
            <div class="section-header">
              <h3>
                <Icon icon="mdi:link-variant" class="section-icon" />
                快速链接
              </h3>
            </div>
            <NScrollbar style="max-height: 320px" trigger="hover">
              <div class="quick-links">
                <a href="#" class="quick-link">
                  <Icon icon="mdi:file-plus" />
                  职称申报
                </a>
                <a href="#" class="quick-link">
                  <Icon icon="mdi:progress-check" />
                  申报进度
                </a>
                <a href="#" class="quick-link">
                  <Icon icon="mdi:account-check" />
                  专家评审
                </a>
                <a href="#" class="quick-link">
                  <Icon icon="mdi:chart-line" />
                  评审结果
                </a>
                <a href="#" class="quick-link">
                  <Icon icon="mdi:file-document-outline" />
                  政策法规
                </a>
                <a href="#" class="quick-link">
                  <Icon icon="mdi:help-circle" />
                  帮助中心
                </a>
              </div>
            </NScrollbar>
          </div>

          <!-- 数据统计模块 -->
          <div class="content-section secondary-section">
            <div class="section-header">
              <h3>
                <Icon icon="mdi:chart-box" class="section-icon" />
                数据统计
              </h3>
            </div>
            <NScrollbar style="max-height: 320px" trigger="hover">
              <div class="stats-content">
                <div class="stat-item">
                  <div class="stat-number">1,234</div>
                  <div class="stat-label">今日申报</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">5,678</div>
                  <div class="stat-label">待审核</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">9,012</div>
                  <div class="stat-label">已完成</div>
                </div>
              </div>
            </NScrollbar>
          </div>

          <!-- 重要日程模块 -->
          <div class="content-section secondary-section">
            <div class="section-header">
              <h3>
                <Icon icon="mdi:calendar-clock" class="section-icon" />
                重要日程
              </h3>
            </div>
            <NScrollbar style="max-height: 320px" trigger="hover">
              <div class="schedule-content">
                <div class="schedule-item">
                  <div class="schedule-date">12月15日</div>
                  <div class="schedule-title">职称评审截止</div>
                </div>
                <div class="schedule-item">
                  <div class="schedule-date">12月20日</div>
                  <div class="schedule-title">专家评审开始</div>
                </div>
                <div class="schedule-item">
                  <div class="schedule-date">12月25日</div>
                  <div class="schedule-title">结果公示</div>
                </div>
              </div>
            </NScrollbar>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="site-footer">
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

<style scoped>
/* 职称标准化评审系统样式 */
.title-evaluation-portal {
  min-height: 100vh;
  background: #f5f7fa;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

/* 顶部导航栏 */
.top-nav {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  padding: 12px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.gov-emblem {
  display: flex;
  align-items: center;
}

.site-title h1 {
  font-size: 26px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  background: linear-gradient(45deg, #fff, #e3f2fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.site-title p {
  font-size: 13px;
  margin: 4px 0 0 0;
  opacity: 0.85;
  font-style: italic;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  width: 240px;
}

.nav-buttons {
  display: flex;
  gap: 8px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* 主导航菜单 */
.main-nav {
  background: white;
  border-bottom: 1px solid #e1e5e9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.nav-menu {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.nav-item {
  padding: 16px 24px;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
  position: relative;
}

.nav-item:hover,
.nav-item.active {
  color: #1e40af;
  border-bottom-color: #1e40af;
  background: linear-gradient(to bottom, rgba(30, 64, 175, 0.05), transparent);
}

/* Banner样式 */
.hero-banner {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  color: white;
  padding: 40px 0;
  position: relative;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>')
    repeat;
  opacity: 0.3;
}

.banner-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.banner-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  align-items: center;
}

.banner-text h2 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.banner-text p {
  font-size: 18px;
  margin: 0 0 32px 0;
  opacity: 0.9;
  line-height: 1.5;
}

.banner-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

.banner-image {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 主要内容区域 */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 主要功能区域：通知公告、登录区域、政策文件 */
.primary-row {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr;
  gap: 24px;
  margin-bottom: 24px;
}

/* 次要功能区域：系统角色、快速链接、统计、日程 */
.secondary-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* 基础内容区域样式 */
.content-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 主要区域样式 */
.primary-row .content-section {
  height: 420px;
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.08);
}

.primary-row .content-section:hover {
  box-shadow: 0 4px 16px rgba(30, 64, 175, 0.12);
  border-color: #cbd5e0;
}

/* 次要区域样式 */
.secondary-section {
  height: 360px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.secondary-section:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e0;
}

/* 内容区域自动填充剩余空间 */
.content-section .news-list {
  flex: 1;
  overflow-y: auto;
}

/* 核心登录区域 - 突出显示 */
.primary-login {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 2px solid #1e40af;
  box-shadow: 0 4px 20px rgba(30, 64, 175, 0.15) !important;
}

.primary-login:hover {
  box-shadow: 0 6px 28px rgba(30, 64, 175, 0.2) !important;
  border-color: #1d4ed8;
}

.login-section {
  gap: 16px;
}

.quick-query-section {
  flex: 1;
  min-height: 0;
}

.login-card {
  flex-shrink: 0;
  border: none;
  box-shadow: none;
  background: transparent;
}

/* 快速链接样式优化 */
.quick-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  flex: 1;
  align-content: start;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #374151;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.quick-link:hover {
  background: #f1f5f9;
  border-color: #cbd5e0;
  color: #1e40af;
  text-decoration: none;
}

/* 搜索内容样式 */
.search-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.search-options {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.suggestion-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.suggestion-tag {
  padding: 4px 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-tag:hover {
  background: #e2e8f0;
  color: #1e40af;
  border-color: #cbd5e0;
}

/* 统计内容样式优化 */
.stats-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-content .stat-item {
  text-align: center;
  padding: 16px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.stats-content .stat-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e0;
}

.stats-content .stat-number {
  font-size: 22px;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 4px;
  display: block;
}

.stats-content .stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* 日程内容样式优化 */
.schedule-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-item {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #1e40af;
  transition: all 0.2s ease;
  cursor: pointer;
}

.schedule-item:hover {
  background: #f1f5f9;
  border-left-width: 4px;
  padding-left: 15px;
}

.schedule-date {
  font-size: 12px;
  color: #1e40af;
  font-weight: 600;
  margin-bottom: 4px;
  display: block;
}

.schedule-title {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  line-height: 1.4;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 图标统一样式 */
.section-icon {
  color: #1e40af;
  font-size: 20px;
}

/* 更多按钮样式 */
.more-btn {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.more-btn:hover {
  color: #1e40af;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.news-item {
  padding: 12px;
  border-radius: 4px;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid #f1f5f9;
}

.news-item:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-color: #cbd5e0;
  transform: translateX(4px);
}

.news-header {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.top-badge {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.type-important {
  background: linear-gradient(45deg, #ff9ff3, #f368e0);
  color: white;
}

.type-notice {
  background: linear-gradient(45deg, #74b9ff, #0984e3);
  color: white;
}

.type-normal {
  background: linear-gradient(45deg, #a29bfe, #6c5ce7);
  color: white;
}

.news-title {
  color: #2d3748;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  margin: 8px 0;
  transition: color 0.2s;
}

.news-item:hover .news-title {
  color: #1e40af;
}

.news-date {
  color: #718096;
  font-size: 12px;
  font-weight: 400;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.news-department {
  color: #1e40af;
  font-size: 12px;
  font-weight: 500;
}

.view-count {
  color: #a0aec0;
  font-size: 11px;
  margin-left: auto;
}

.more-actions {
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
}

/* 政策文件特殊样式 */
.policy-item {
  border-left: 4px solid #1e40af;
}

.policy-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.policy-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #718096;
  margin-top: 8px;
}

.policy-department {
  color: #1e40af;
  font-weight: 500;
}

.policy-number {
  background: #edf2f7;
  padding: 2px 6px;
  border-radius: 4px;
}

.policy-category {
  background: linear-gradient(45deg, #1e40af, #3b82f6);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.policy-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-size {
  color: #718096;
  font-size: 11px;
  background: #f7fafc;
  padding: 2px 6px;
  border-radius: 4px;
}

.policy-filters {
  padding: 12px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 4px;
  border: 1px solid #e1e5e9;
}

/* 系统角色网格 */
.role-grid {
  margin-top: 16px;
}

.role-card {
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.role-card:hover {
  border-color: #1e40af;
  box-shadow: 0 8px 25px rgba(30, 64, 175, 0.15);
  transform: translateY(-4px);
}

.role-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.role-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.role-icon {
  font-size: 24px;
  color: #1e40af;
}

.role-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.role-description {
  color: #4a5568;
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 12px 0;
  flex: 1;
}

.role-permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-tag {
  background: linear-gradient(45deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.more-permissions {
  background: #f5f5f5;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
}

/* 右侧边栏 */
.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-section {
  background: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e5e9;
}

.login-card {
  border: none;
  box-shadow: none;
}

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.login-type-switch {
  display: flex;
  gap: 4px;
}

.sms-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.login-links {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
}

.sidebar-section {
  background: white;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e5e9;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #2d3748;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid #f7fafc;
}

.search-options {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4a5568;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.2s;
  border: 1px solid #e1e5e9;
}

.quick-link:hover {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: white;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
}

/* 搜索建议样式 */
.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.suggestion-tag {
  background: linear-gradient(45deg, #f8fafc, #e2e8f0);
  color: #4a5568;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e1e5e9;
}

.suggestion-tag:hover {
  background: linear-gradient(45deg, #1e40af, #3b82f6);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.3);
}

/* 搜索结果样式 */
.search-results-content {
  max-height: 400px;
  overflow-y: auto;
}

.result-item:hover {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-color: #1e40af;
  transform: translateX(4px);
}

/* 优化的响应式设计 */
@media (max-width: 1200px) {
  .primary-row {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  
  .primary-row .content-section:last-child {
    grid-column: 1 / -1;
  }
  
  .secondary-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .primary-row,
  .secondary-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .primary-row .content-section,
  .secondary-section {
    height: auto;
    min-height: 300px;
  }
  
  .main-content {
    padding: 12px;
  }
  
  .content-section {
    padding: 16px;
  }
}

/* 细节优化 */
.news-item {
  padding: 14px;
  border: 1px solid #f1f5f9;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fefefe;
}

.news-item:hover {
  border-color: #e2e8f0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.news-item:last-child {
  margin-bottom: 0;
}

.role-card {
  border: 1px solid #f1f5f9;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.role-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 2px 12px rgba(30, 64, 175, 0.10);
  transform: translateY(-1px);
}

/* 登录表单优化 */
.login-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.login-type-switch {
  display: flex;
  gap: 6px;
}

/* 按钮统一样式 */
:deep(.n-button) {
  border-radius: 6px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}

/* 输入框统一样式 */
:deep(.n-input) {
  border-radius: 6px !important;
}

/* 卡片统一样式 */
:deep(.n-card) {
  border-radius: 8px !important;
}

/* 自定义滚动条 */
.content-section :deep(.n-scrollbar-rail) {
  right: 4px;
  width: 6px;
  background: transparent;
}

.content-section :deep(.n-scrollbar-rail__scrollbar) {
  width: 6px;
  background: #cbd5e0;
  border-radius: 3px;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.content-section:hover :deep(.n-scrollbar-rail__scrollbar) {
  opacity: 1;
  background: #94a3b8;
}

/* 额外的样式优化 */
.sms-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.login-links {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.more-actions {
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  margin-top: auto;
}

.policy-filters {
  margin-bottom: 16px;
}

.policy-item .policy-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.policy-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.file-size {
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 通知徽章样式 */
.top-badge {
  background: #dc2626;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.type-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.type-badge.type-important {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.type-badge.type-notice {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
}

.type-badge.type-normal {
  background: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.view-count {
  font-size: 11px;
  color: #9ca3af;
}

/* 页脚样式 */
.site-footer {
  background: #2d3748;
  color: white;
  margin-top: 40px;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  padding: 40px 0;
}

.footer-section h4 {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin-bottom: 8px;
  font-size: 14px;
  color: #a0aec0;
}

.footer-section a {
  color: #a0aec0;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-section a:hover {
  color: #e2e8f0;
}

.footer-bottom {
  border-top: 1px solid #4a5568;
  padding: 20px 0;
  text-align: center;
}

.copyright p {
  margin: 4px 0;
  font-size: 12px;
  color: #a0aec0;
}

/* 动画效果 */
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

.content-section {
  animation: fadeInUp 0.6s ease-out;
}

.content-section:nth-child(2) {
  animation-delay: 0.1s;
}

.content-section:nth-child(3) {
  animation-delay: 0.2s;
}

.sidebar-section {
  animation: fadeInUp 0.6s ease-out;
}

.sidebar-section:nth-child(2) {
  animation-delay: 0.1s;
}

.sidebar-section:nth-child(3) {
  animation-delay: 0.2s;
}
</style>
