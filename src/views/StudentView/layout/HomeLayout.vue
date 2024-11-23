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
        <!-- 我的试卷菜单项 -->
        <el-menu-item index="/student/exam-paper">
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Notebook, School } from '@element-plus/icons-vue'
import UserProfileFooter from '@/components/UserProfileFooter.vue'

const router = useRouter()
const route = useRoute()

// 计算当前激活的菜单项
const activeIndex = computed(() => route.path)
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

.el-menu-item {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  flex-direction: column;
  transition: all 0.3s ease;
  margin-bottom: 10px;
  padding: 0!important;
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
  width: 80%;
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
  background-color: #ecf5ff !important;
  color: #409eff !important;
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
</style>
