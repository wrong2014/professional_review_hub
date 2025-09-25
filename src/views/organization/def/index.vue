<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NButton, NCard, NSpace } from 'naive-ui';
import { localStg } from '@/utils/storage';

const userInfo = ref({
  type: '机构用户',
  token: '',
  loginTime: ''
});

const handleLogout = () => {
  // 清除所有存储的认证信息
  localStg.remove('token');
  localStg.remove('refreshToken');
  localStg.remove('userType');
  localStg.remove('tokenType');
  localStg.remove('expiresIn');
  localStg.remove('tokenTimestamp');

  // 跳转到登录页
  window.location.href = '/login';
};

onMounted(() => {
  const token = localStg.get('token');
  userInfo.value.token = token ? `${token.substring(0, 20)}...` : '无';
  userInfo.value.loginTime = new Date().toLocaleString();
});
</script>

<template>
  <div class="organization-page">
    <NSpace vertical :size="20">
      <NCard title="评审机构管理中心bcd" bordered>
        <template #header-extra>
          <NButton type="primary" ghost @click="handleLogout">退出登录</NButton>
        </template>

        <NSpace vertical :size="12">
          <p>
            <strong>用户类型：</strong>
            {{ userInfo.type }}
          </p>
          <p>
            <strong>Token：</strong>
            {{ userInfo.token }}
          </p>
          <p>
            <strong>登录时间：</strong>
            {{ userInfo.loginTime }}
          </p>
        </NSpace>
      </NCard>

      <NCard title="机构功能区" bordered>
        <NSpace :size="12">
          <NButton type="info">评审任务管理</NButton>
          <NButton type="success">专家安排</NButton>
          <NButton type="warning">申报材料审核</NButton>
          <NButton>评审结果管理</NButton>
          <NButton type="error">机构设置</NButton>
        </NSpace>
      </NCard>

      <NCard title="权限说明" bordered>
        <p>机构用户可以组织职称评审工作、安排专家、管理评审流程等。</p>
        <p>拥有评审管理的最高权限，负责整个评审流程的组织协调。</p>
      </NCard>
    </NSpace>
  </div>
</template>

<style scoped>
.organization-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
