<template>
  <el-container style="height: 100vh; border: 1px solid #dcdfe6">
    <!-- 侧边栏，包括头像和菜单 -->
    <el-aside
      width="80px"
      style="
        background-color: white;
        padding-top: 20px;
        padding-bottom: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
      "
    >
      <!-- 用户头像下拉菜单 -->
      <el-dropdown @command="handleCommand" trigger="click">
        <div style="margin-bottom: 30px; cursor: pointer">
          <el-avatar
            src="https://s21.ax1x.com/2024/10/05/pA8a5C9.jpg"
            size="large"
          ></el-avatar>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="editInfo">编辑信息</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 菜单 -->
      <el-menu
        :default-active="activeIndex"
        class="menu-container"
        :router="true"
      >
        <!-- 我的课程菜单项 -->
        <el-menu-item index="/teacher/course">
          <div class="menu-item-container">
            <el-icon class="menu-icon"><DataAnalysis /></el-icon>
            <div class="menu-text">我的课程</div>
          </div>
        </el-menu-item>

        <!-- 我的试卷菜单项 -->
        <el-menu-item index="/teacher/exam-papers">
          <div class="menu-item-container">
            <el-icon class="menu-icon"><Notebook /></el-icon>
            <div class="menu-text">我的试卷</div>
          </div>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-main style="padding: 30px; background-color: #f4f4f7">
      <RouterView></RouterView>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { DataAnalysis, Notebook } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 计算当前激活的菜单项
const activeIndex = computed(() => {
  const path = route.path
  if (path.startsWith('/teacher/course')) {
    return '/teacher/course'
  } else if (path.startsWith('/teacher/exam-papers')) {
    return '/teacher/exam-papers'
  }
  // 如果没有匹配，返回当前路由的路径
  return path
})

// 处理用户下拉菜单的命令
const handleCommand = (command: string) => {
  if (command === 'editInfo') {
    // 处理编辑信息的逻辑
    console.log('编辑信息')
    // 这里可以添加跳转到编辑信息页面的逻辑
    // 例如：router.push('/edit-profile')
  } else if (command === 'logout') {
    logout()
  }
}

// 退出登录
const logout = () => {
  userStore.clearUser()
  ElMessage.success('退出登录成功')
  router.push('/login')
}
</script>

<style scoped>
.el-aside {
  position: relative;
  background-color: white !important;
}

.menu-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: none;
  width: 100%;
}

.el-menu-item {
  width: 48px;
  height: 58px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.menu-item-container {
  width: 48px !important;
  height: 58px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 7px;
  transition: all 0.3s ease;
}

.el-icon {
  margin: 0;
}

.menu-icon {
  font-size: 20px;
  color: #667085;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-text {
  width: 48px;
  height: 20px;
  font-size: 10px;
  line-height: 20px !important;
  text-align: center;
}

.el-icon.menu-icon {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

.el-menu-item.is-active .menu-item-container {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: #409eff;
  background-color: #ecf5ff;
}

.el-menu-item .menu-item-container {
  color: #667085;
}

.el-menu-item:hover .menu-item-container {
  color: #409eff;
  background-color: #f5f7fa;
}

.el-menu-item.is-active .menu-icon,
.el-menu-item:hover .menu-icon {
  color: #409eff;
}

.el-menu-item.is-active .menu-text,
.el-menu-item:hover .menu-text {
  color: #409eff;
}
</style>
