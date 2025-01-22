<template>
  <el-container class="layout-container">
    <!-- 移动端顶部栏 -->
    <div class="mobile-header" v-show="isMobile">
      <el-button @click="toggleMenu" text>
        <el-icon size="24"><Menu /></el-icon>
      </el-button>
      <div class="logo-container">
        <el-icon class="logo-icon"><School /></el-icon>
        <h1 class="logo-text">智汇学途</h1>
      </div>
    </div>

    <!-- 侧边栏 -->
    <el-aside :class="['layout-aside', { 'mobile-aside': isMobile, 'aside-visible': isMenuVisible }]">
      <!-- Logo区域在非移动端显示 -->
      <div class="logo-container" v-show="!isMobile">
        <el-icon class="logo-icon"><School /></el-icon>
        <h1 class="logo-text">AI好助学</h1>
      </div>

      <!-- 菜单 -->
      <el-menu :default-active="activeIndex" class="menu-container" :router="true">
        <el-menu-item index="/student/home">
          <div class="menu-item-container">
            <el-icon class="menu-icon"><House /></el-icon>
            <div class="menu-text">首页</div>
          </div>
        </el-menu-item>
        <el-menu-item index="/student/ai-chat">
          <div class="menu-item-container">
            <el-icon class="menu-icon"><ChatDotRound /></el-icon>
            <div class="menu-text">智识顾问</div>
          </div>
        </el-menu-item>
        <el-menu-item index="/student/exam-paper">
          <div class="menu-item-container">
            <el-icon class="menu-icon"><Document /></el-icon>
            <div class="menu-text">我的试卷</div>
          </div>
        </el-menu-item>
        <el-menu-item index="/student/wrong-question">
          <div class="menu-item-container">
            <el-icon class="menu-icon"><CircleCloseFilled /></el-icon>
            <div class="menu-text">错题本</div>
          </div>
        </el-menu-item>
      </el-menu>

      <UserProfileFooter />
    </el-aside>

    <!-- 主内容区 -->
    <el-main :class="['layout-main', { 'no-padding': isAiChatRoute }]">
      <RouterView></RouterView>
    </el-main>

    <!-- 遮罩层 -->
    <div 
      v-show="isMobile && isMenuVisible" 
      class="menu-overlay"
      @click="closeMenu"
    ></div>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  House, 
  Document, 
  School, 
  Menu, 
  CircleCloseFilled,
  ChatDotRound 
} from '@element-plus/icons-vue'
import UserProfileFooter from '@/components/UserProfileFooter.vue'

const route = useRoute()
const isMenuVisible = ref(false)
const isMobile = ref(false)

// 计算当前激活的菜单项
const activeIndex = computed(() => {
  // 如果是AI聊天的子路由，返回父路由路径
  if (route.path.startsWith('/student/ai-chat/')) {
    return '/student/ai-chat'
  }
  return route.path
})

// 添加一个计算属性来检查是否是 AI 聊天路由
const isAiChatRoute = computed(() => {
  return route.path.startsWith('/student/ai-chat')
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

.layout-main.no-padding {
  padding: 0;
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

.el-menu-item.is-active {
  background-color: #ecf5ff !important;
  color: #409eff !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.el-menu-item {
  color: #667085 !important;
}

.el-menu-item:hover {
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

  .menu-container {
    margin-top: 20px;
    padding-bottom: 80px;
  }

  :deep(.el-menu-item) {
    width: 90%;
  }

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
