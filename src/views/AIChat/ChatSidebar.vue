<script setup>
import { ref, onMounted, watch } from 'vue'
import { Plus, ChatDotRound } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { useSessionStore } from '@/stores/sessionStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const sessionStore = useSessionStore()
const loading = ref(true)

// 当前选中的会话ID
const currentSessionId = ref(route.params.sessionId || null)

// 监听路由参数变化，更新当前会话ID
watch(
  () => route.params.sessionId,
  (newSessionId) => {
    currentSessionId.value = newSessionId
  }
)

// 获取会话列表
const loadSessionList = async () => {
  loading.value = true
  try {
    await sessionStore.loadSessionList(userStore.id)
  } catch (error) {
    console.error('获取会话列表失败:', error)
    ElMessage.error('获取会话列表失败')
  } finally {
    loading.value = false
  }
}

// 创建新会话
const createNewChat = async () => {
  router.push('/student/ai-chat')
}

// 点击会话项
const handleSessionClick = (sessionId) => {
  router.push(`/student/ai-chat/${sessionId}`)
}

onMounted(() => {
  loadSessionList()
})

watch(
  () => sessionStore.sessionList,
  () => {
    console.log('会话列表已更新')
  },
  { deep: true }
)
</script>

<template>
  <div class="chat-sidebar">
    <div class="chat-sidebar-header">
      <el-button class="create-btn" type="primary" @click="createNewChat">
        <el-icon><Plus /></el-icon>
        <span>新建会话</span>
      </el-button>
    </div>

    <div class="chat-history">
      <!-- 骨架屏 -->
      <template v-if="loading">
        <el-skeleton :rows="10" animated style="padding: 16px">
          <template #template>
            <!-- 今天 -->
            <div style="margin-bottom: 16px">
              <el-skeleton-item variant="text" style="width: 50px; margin-bottom: 8px" />
              <div v-for="i in 3" :key="i" style="margin-bottom: 8px">
                <el-skeleton-item variant="p" style="width: 90%" />
              </div>
            </div>
            <!-- 昨天 -->
            <div style="margin-bottom: 16px">
              <el-skeleton-item variant="text" style="width: 50px; margin-bottom: 8px" />
              <div v-for="i in 3" :key="i" style="margin-bottom: 8px">
                <el-skeleton-item variant="p" style="width: 85%" />
              </div>
            </div>
            <!-- 最近7天 -->
            <div>
              <el-skeleton-item variant="text" style="width: 70px; margin-bottom: 8px" />
              <div v-for="i in 4" :key="i" style="margin-bottom: 8px">
                <el-skeleton-item variant="p" style="width: 80%" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </template>

      <!-- 实际内容 -->
      <template v-else>
        <!-- 今天 -->
        <template v-if="sessionStore.groupedSessions.today.length > 0">
          <div class="time-divider">今天</div>
          <div
            v-for="chat in sessionStore.groupedSessions.today"
            :key="chat.id"
            class="session-item"
            :class="{ selected: chat.id == currentSessionId }"
            @click="handleSessionClick(chat.id)"
          >
            <el-icon class="chat-icon"><ChatDotRound /></el-icon>
            <span class="chat-title">{{ chat.title }}</span>
          </div>
        </template>

        <!-- 昨天 -->
        <template v-if="sessionStore.groupedSessions.yesterday.length > 0">
          <div class="time-divider">昨天</div>
          <div
            v-for="chat in sessionStore.groupedSessions.yesterday"
            :key="chat.id"
            class="session-item"
            :class="{ selected: chat.id == currentSessionId }"
            @click="handleSessionClick(chat.id)"
          >
            <el-icon class="chat-icon"><ChatDotRound /></el-icon>
            <span class="chat-title">{{ chat.title }}</span>
          </div>
        </template>

        <!-- 最近7天 -->
        <template v-if="sessionStore.groupedSessions.recent.length > 0">
          <div class="time-divider">最近7天</div>
          <div
            v-for="chat in sessionStore.groupedSessions.recent"
            :key="chat.id"
            class="session-item"
            :class="{ selected: chat.id == currentSessionId }"
            @click="handleSessionClick(chat.id)"
          >
            <el-icon class="chat-icon"><ChatDotRound /></el-icon>
            <span class="chat-title">{{ chat.title }}</span>
          </div>
        </template>

        <!-- 更早 -->
        <template v-if="sessionStore.groupedSessions.older.length > 0">
          <div class="time-divider">更早</div>
          <div
            v-for="chat in sessionStore.groupedSessions.older"
            :key="chat.id"
            class="session-item"
            :class="{ selected: chat.id == currentSessionId }"
            @click="handleSessionClick(chat.id)"
          >
            <el-icon class="chat-icon"><ChatDotRound /></el-icon>
            <span class="chat-title">{{ chat.title }}</span>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
.chat-sidebar {
  width: 260px;
  height: 100%;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;

  .chat-sidebar-header {
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h2 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }
    }

    .create-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

.chat-history {
  padding: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  margin: 4px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  .chat-icon {
    font-size: 18px;
    color: #409EFF;
  }

  .chat-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    color: #333;
  }
}

.selected {
  background-color: #e6f7ff;
}

:deep(.el-button.is-circle) {
  padding: 6px;
}

.time-divider {
  padding: 8px 16px;
  font-size: 12px;
  color: #999;

  margin: 4px 0;
}

// 添加骨架屏样式
:deep(.el-skeleton__item) {
  background: rgba(190, 190, 190, 0.2);
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  :deep(.el-skeleton__item) {
    background: rgba(255, 255, 255, 0.08);
  }
}
</style>
