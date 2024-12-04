<script setup >
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getStudentJoinExamPaper } from '@/api/userApi'
import {
  User,
  Document,
  Timer
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const completedPapers = ref(0)
const pendingPapers = ref(0)

const fetchPapersStats = async () => {
  try {
    const res = await getStudentJoinExamPaper(userStore.id)
    if (res.data) {
      completedPapers.value = res.data.filter(paper => paper.status === '已完成').length
      pendingPapers.value = res.data.filter(paper => paper.status === '未完成').length
    }
  } catch (error) {
    console.error('获取试卷统计失败:', error)
  }
}

onMounted(() => {
  fetchPapersStats()
})
</script>

<template>
  <div class="home-container">
    <div class="welcome-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24">
          <div class="welcome-card">
            <div class="welcome-header">
              <el-icon class="welcome-icon"><User /></el-icon>
              <h2>欢迎回来，{{ userStore.name }}</h2>
            </div>
            <p class="welcome-text">今天是个学习的好日子！</p>
            <div class="quick-stats">
              <div class="stat-item">
                <el-icon><Document /></el-icon>
                <div class="stat-info">
                  <span class="stat-value">{{ completedPapers }}</span>
                  <span class="stat-label">已完成试卷</span>
                </div>
              </div>
              <div class="stat-item">
                <el-icon><Timer /></el-icon>
                <div class="stat-info">
                  <span class="stat-value">{{ pendingPapers }}</span>
                  <span class="stat-label">待完成试卷</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24">
            <AllExamPaperStatus/>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="less">


.welcome-section {
  margin-bottom: 30px;
}

.welcome-card {
  background: linear-gradient(135deg, #409EFF 0%, #36cfc9 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

  .welcome-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;

    .welcome-icon {
      font-size: 32px;
    }

    h2 {
      margin: 0;
      font-size: 24px;
    }
  }

  .welcome-text {
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 25px;
  }
}

.quick-stats {
  display: flex;
  gap: 30px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 10px;

    .el-icon {
      font-size: 24px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: 24px;
        font-weight: bold;
      }

      .stat-label {
        font-size: 14px;
        opacity: 0.9;
      }
    }
  }
}

.tips-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 20px 0;
    color: #303133;
  }

  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      color: #606266;

      .el-icon {
        color: #409EFF;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .quick-stats {
    flex-direction: column;
    gap: 15px;
  }

  .welcome-card {
    padding: 20px;
  }

  .tips-card {
    padding: 20px;
  }
}
</style>