<template>
  <el-container style="height: 100vh; border: 1px solid #dcdfe6;">
    <el-aside style="
        background-color: white;
        padding: 20px 0;
        display: flex;
        flex-direction: column;
        width: 250px;
      ">
      <!-- 添加顶部 Logo -->
      <div class="logo-container">
        <el-icon class="logo-icon"><School /></el-icon>
        <h1 class="logo-text">好助学</h1>
      </div>

      <!-- 菜单 -->
      <el-menu :default-active="activeIndex" class="menu-container" :router="true" style="width: 100%;">
        <el-menu-item index="/teacher/home">
          <div class="menu-item-container">
            <el-icon class="menu-icon">
              <DataAnalysis />
            </el-icon>
            <div class="menu-text">首页</div>
          </div>
        </el-menu-item>
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

      <!-- 使用新组件替换原来的底部区域 -->
      <UserProfileFooter />
    </el-aside>

    <!-- 主内容区 -->
    <el-main style="padding: 30px; background-color: #f4f4f7">
      <RouterView></RouterView>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { DataAnalysis, Notebook, School, User } from '@element-plus/icons-vue'
import UserProfileFooter from '@/components/UserProfileFooter.vue'

const route = useRoute()

// 计算当前激活的菜单项
const activeIndex = computed(() => {
  const path = route.path
  if (path.startsWith('/teacher/course')) {
    return '/teacher/course'
  } else if (path.startsWith('/teacher/exam-papers')) {
    return '/teacher/exam-papers'
  }
  return path
})
</script>

<style scoped>
.el-aside {
  position: relative;
  background-color: white !important;
}

.menu-container {
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: none;
  width: 100%;
}

/* 新增底部容器样式 */
.bottom-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
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

.el-menu-item  {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  flex-direction: column;
  transition: all 0.3s ease;
  margin-bottom: 10px;
  padding: 0!important;
}

img {
  height: 100%;
  /* 不透明度 */
  opacity: 0.5
}

.menu-item-container {
  width: 100% !important;
  height: 48px;
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
  min-height: 48px !important;
  line-height: 48px !important;
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

/* 添加 Logo 相关样式 */
.logo-container {
  padding: 0 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  height: 50px;
}

.logo-icon {
  font-size: 28px;
  color: #409EFF;
}

.logo-text {
  color: #409EFF;
  font-size: 25px;
  font-weight: bold;
  margin: 0;
  /* 添加文字渐变效果 */
  background: linear-gradient(45deg, #409EFF, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
}
</style>
