<template>
  <div class="bottom-container" @click="goToProfile">
    <div class="bottom-content">
      <div class="user-info">
        <el-avatar 
          :src=avatarUrl 
          :size="40"
        ></el-avatar>
        <div class="user-details">
          <span class="user-name">{{ userStore.name }}</span>
          <span class="user-email">{{ userStore.email }}</span>
        </div>
      </div>
      <el-button @click.stop="handleLogout">退出登录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()

const goToProfile = () => {
  if(userStore.role !== 'teacher'){
    router.push('/student/profile')
    
  }else{
    router.push('/teacher/profile')
  }

}

const handleLogout = () => {
  userStore.clearUser()
  ElMessage.success('退出登录成功')
  router.push('/login')
}

// 头像计算属性
const avatarUrl = computed(() => {
  // 如果上传了头像

  if (userStore.avatar) {
    return '/api/' + userStore.avatar
  }
  return `https://q2.qlogo.cn/headimg_dl?dst_uin=${userStore.email}&spec=640`
})

</script>

<style scoped>
.bottom-container {
  cursor: pointer;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  
}

.bottom-content {
  padding: 15px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.user-info {
  width: 80%;
  display: flex;
  gap: 12px;
  display: flex;
  justify-content: center;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  font-size: 12px;
  color: #999;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-content .el-button {
  width: 80%;
  height: 36px;
  border-radius: 4px;
  font-size: 14px;
}


</style>
