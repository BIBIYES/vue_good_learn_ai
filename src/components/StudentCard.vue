<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

// 计算头像URL
const avatarUrl = computed(() => {
  if (props.user.avatar) {
    return '/api' + props.user.avatar
  }
  return `https://q2.qlogo.cn/headimg_dl?dst_uin=${props.user.userEmail}&spec=640`
})
</script>

<template>
  <div class="student-card">
    <div class="avatar">
      <el-avatar :size="60" :src="avatarUrl" />
    </div>
    <div class="info">
      <div class="name">{{ user.username }}</div>
      <el-tooltip :content="user.userEmail" placement="top" :show-after="500">
        <div class="email text-ellipsis">{{ user.userEmail }}</div>
      </el-tooltip>
      <div class="id">
        <template v-if="user.cqipcId">
          学号：{{ user.cqipcId }}
        </template>
        <template v-else>
          <span class="no-data">暂无学号</span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.avatar {
  margin-right: 16px;
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.email {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
}

.id {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.no-data {
  color: #909399;
  font-style: italic;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
