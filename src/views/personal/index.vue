<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NButton, NCard, NSpace } from 'naive-ui';
import { localStg } from '@/utils/storage';

const userInfo = ref({
  type: '个人用户',
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
  <div class="personal-page">
    <NSpace vertical :size="20">
      <NCard title="个人用户管理中心" bordered>
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

      <NCard title="个人功能区" bordered>
        <NSpace :size="12">
          <NButton type="info">职称申报</NButton>
          <NButton type="success">申报进度查询</NButton>
          <NButton type="warning">材料上传</NButton>
          <NButton>个人信息维护</NButton>
        </NSpace>
      </NCard>

      <NCard title="权限说明" bordered>
        <p>个人用户可以进行职称申报、查看进度、上传材料等操作。</p>
        <p>如需访问其他用户类型页面，请重新登录选择对应的用户类型。</p>
      </NCard>
    </NSpace>
  </div>
</template>

<style scoped>
.personal-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
