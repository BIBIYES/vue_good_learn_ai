<template>
  <el-container style="height: 100vh; border: 1px solid #dcdfe6;">
    <!-- 侧边栏，包括头像和菜单 -->
    <el-aside width="80px" style="
        background-color: white;
        padding-top: 20px;
        padding-bottom: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 150px;
      ">
      <!-- 用户头像下拉菜单 -->
      <el-dropdown @command="handleCommand" trigger="click">
        <div style="margin-bottom: 30px; cursor: pointer">
          <el-avatar src="https://s21.ax1x.com/2024/10/05/pA8a5C9.jpg" size="large"></el-avatar>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="editInfo">编辑信息</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 菜单 -->
      <el-menu :default-active="activeIndex" class="menu-container" :router="true"  style=" width: 100%;">
        <!-- 我的课程菜单项 -->
        <el-menu-item index="/teacher/course">
          <div class="menu-item-container">
            <el-icon class="menu-icon">
              <DataAnalysis />
            </el-icon>
            <div class="menu-text">我的课程</div>
          </div>
        </el-menu-item>

        <!-- 我的试卷菜单项 -->
        <el-menu-item index="/teacher/exam-papers">
          <div class="menu-item-container">
            <el-icon class="menu-icon">
              <Notebook />
            </el-icon>
            <div class="menu-text">我的试卷</div>
          </div>
        </el-menu-item>
      </el-menu>
      <div class="icon">
        <div class="item">
          <el-tooltip class="box-item" effect="light" content="反馈问题给作者" placement="right">
            <img src="@/assets/img/tencent-qq.svg" alt="QQ" @click="navigateToLink('https://qm.qq.com/q/Uezs3opRMQ')">
          </el-tooltip>
        </div>
        <div class="item">
          <el-tooltip class="box-item" effect="light" content="前往作者首页" placement="right">
            <img src="@/assets/img/github-mark.svg" alt="github" @click="navigateToLink('https://github.com/BIBIYES')">
          </el-tooltip>
        </div>
      </div>


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


const navigateToLink = (url: String) => {
  window.location.href = `${url}`
}

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

.el-menu-item  {
  width: 48px;
  height: 58px;
  border-radius: 10px;
  flex-direction: column;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  padding: 0!important;
}

.icon {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
  height: 100px;


}

.item {
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center
}

img {
  height: 100%;
}

.menu-item-container {
  width: 100% !important;
  height: 58px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px;
  transition: all 0.3s ease;
}

.el-icon {
  margin: 0;
}

.menu-icon {
  font-size: 24px;
  color: #667085;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-text {
  width: 100%;
  height: 20px;
  font-size: 14px;
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

/* 调整菜单项的样式 */
:deep(.el-menu-item) {
  width:80%;
  /* 增加菜单项的宽度 */
  
  /* 最小高度设置为60px，确保足够的点击区域 */
  min-height: 60px !important;
  /* 设置行高等于高度，确保垂直居中 */
  line-height: 60px !important;
  /* 使用flex布局来对齐图标和文字 */
  display: flex !important;
  align-items: center !important;
}

/* 调整菜单项中图标和文字的布局 */
:deep(.el-menu-item .el-icon) {
  font-size: 24px;
  vertical-align: middle;
}

/* 调整菜单项文字样式 */
:deep(.el-menu-item span) {
  font-size: 14px;
  vertical-align: middle;
  white-space: nowrap;
}

/* 当菜单项被选中时的样式 */
:deep(.el-menu-item.is-active) {
  /* 设置选中时的背景色 */
  background-color: #ecf5ff !important;
  /* 设置选中时的文字颜色 */
  color: #409eff !important;
}
</style>
