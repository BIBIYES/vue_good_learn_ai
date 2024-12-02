<template>
  <el-container class="layout-container">
    <!-- 添加一个汉堡菜单按钮，在移动端显示 -->
    <div class="mobile-header" v-show="isMobile">
      <el-button @click="toggleMenu" text>
        <el-icon size="24"><Menu /></el-icon>
      </el-button>
      <div class="logo-container">
        <el-icon class="logo-icon"><School /></el-icon>
        <h1 class="logo-text">好助学</h1>
      </div>
    </div>

    <!-- 侧边栏，添加条件类控制显示 -->
    <el-aside :class="['layout-aside', { 'mobile-aside': isMobile, 'aside-visible': isMenuVisible }]">
      <!-- Logo区域在非移动端显示 -->
      <div class="logo-container" v-show="!isMobile">
        <el-icon class="logo-icon"><School /></el-icon>
        <h1 class="logo-text">好助学</h1>
      </div>

      <!-- 菜单部分保持不变 -->
      <el-menu :default-active="activeIndex" class="menu-container" :router="true">
        <el-menu-item index="/teacher/course">
          <div class="menu-item-container">
            <el-icon class="menu-icon"><DataAnalysis /></el-icon>
            <div class="menu-text">我的课程</div>
          </div>
        </el-menu-item>

        <el-menu-item index="/teacher/exam-papers">
          <div class="menu-item-container">
            <el-icon class="menu-icon"><Notebook /></el-icon>
            <div class="menu-text">我的试卷</div>
          </div>
        </el-menu-item>
      </el-menu>

      <UserProfileFooter />
    </el-aside>

    <!-- 主内容区 -->
    <el-main class="layout-main">
      <RouterView></RouterView>
    </el-main>

    <!-- 添加遮罩层 -->
    <div 
      v-show="isMobile && isMenuVisible" 
      class="menu-overlay"
      @click="closeMenu"
    ></div>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { DataAnalysis, Notebook, School, Menu } from '@element-plus/icons-vue'
import UserProfileFooter from '@/components/UserProfileFooter.vue'

const route = useRoute()
const isMenuVisible = ref(false)
const isMobile = ref(false)

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

// 切换菜单显示状态
const toggleMenu = () => {
  isMenuVisible.value = !isMenuVisible.value
}

// 关闭菜单
const closeMenu = () => {
  isMenuVisible.value = false
}

// 检查窗口大小并更新isMobile状态
const checkWindowSize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    isMenuVisible.value = true
  } else {
    isMenuVisible.value = false
  }
}

// 监听窗口大小变化
onMounted(() => {
  checkWindowSize()
  window.addEventListener('resize', checkWindowSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkWindowSize)
})
</script>

<style scoped>
/* 布局相关样式 */
.layout-container {
  height: 100vh;
  border: 1px solid #dcdfe6;
  position: relative;
}

.layout-aside {
  background-color: white;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  width: 250px;
  transition: all 0.3s;
  position: relative;
  height: 100%;
}

.layout-main {
  padding: 30px;
  background-color: #f4f4f7;
}

/* 菜单相关样式 */
.menu-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: none;
  width: 100%;
  overflow-y: auto;
}

.menu-item-container {
  width: 100% !important;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 7px 16px;
  transition: all 0.3s ease;
  gap: 12px;
}

.menu-icon {
  font-size: 20px;
  color: #667085;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 24px;
}

.menu-text {
  flex: 1;
  text-align: left;
  font-size: 14px;
  line-height: 20px !important;
}

/* Logo 相关样式 */
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
  background: linear-gradient(45deg, #409EFF, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
}

/* 菜单项样式 */
:deep(.el-menu-item) {
  width: 80%;
  min-height: 48px !important;
  line-height: 48px !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 !important;
  margin: 4px 0;
  border-radius: 10px;
}

.el-menu-item.is-active  {
  background-color: #ecf5ff !important;
  color: #409eff !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.el-menu-item  {
  color: #667085 !important;
}

.el-menu-item:hover  {
  background-color: #f5f7fa !important;
  color: #409eff !important;
}

.el-menu-item.is-active .menu-icon,
.el-menu-item:hover .menu-icon {
  color: #409eff;
}

.el-menu-item.is-active .menu-text,
.el-menu-item:hover .menu-text {
  color: #409eff;
}

/* 移动端样式 */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mobile-aside {
  position: fixed;
  left: -250px;
  top: 0;
  bottom: 0;
  z-index: 1001;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  background-color: white;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.aside-visible {
  left: 0;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .layout-main {
    padding-top: 90px;
  }

  .mobile-header .logo-container {
    margin: 0 auto;
    margin-bottom: 0;
  }

  .mobile-header .el-button {
    padding: 0;
  }

  /* 移动端菜单样式调整 */
  .menu-container {
    margin-top: 20px;
    padding-bottom: 80px;
  }

  :deep(.el-menu-item) {
    width: 90%;
  }

  /* 确保UserProfileFooter在移动端也固定在底部 */
  :deep(.user-profile-footer) {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    padding: 15px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
