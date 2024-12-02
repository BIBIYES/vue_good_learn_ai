<script setup>
import { onMounted, ref } from 'vue'
import { Plus, Document, User, Calendar } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import { messageTools } from '@/utils/messageTools'
import {
  getStudentJoinExamPaper,
  insertStudentJoinExamPaper
} from '@/api/userApi'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const examPaperId = ref('')
const userId = ref(userStore.id)

const handleAddPaper = () => {
  if (examPaperId.value === '') {
    ElMessage({
      showClose: true,
      message: '你没有填写任何试卷id',
      type: 'warning'
    })
    return
  }
  insertStudentJoinExamPaper(userId.value, examPaperId.value).then((res) => {
    console.log(res)

    if (res.code === 200) {
      ElMessage({
        message: res.msg,
        type: 'success'
      })
    }
    if (res.code === 500) {
      ElMessage.error(res.msg)
    }
    handelGetMyPapers()
  })
}

// 跳转到试卷
const handleGoToPaper = (paperId) => {
  // 判断试卷状态
  const foundExamPaper = myPapers.value.find(
    (paper) => paper.examPaperId === paperId
  )
  if (foundExamPaper.status === '已完成') {
    messageTools.warningMessage('这个试卷你已经做过了')
    return
  }
  router.push(`/student/do-question/${paperId}`)
}

const myPapers = ref([])
const handelGetMyPapers = () => {
  getStudentJoinExamPaper(userId.value).then((res) => {
    console.log(res)
    myPapers.value = res.data
  })
}

onMounted(() => {
  handelGetMyPapers()
})

const getStatusStyle = (status) => {
  switch (status) {
    case '未完成':
      return { color: '#fff', backgroundColor: '#F56C6C' }
    case '已完成':
      return { color: '#fff', backgroundColor: '#409EFF' }
    default:
      return { color: '#fff', backgroundColor: '#909399' }
  }
}
</script>

<template>
  <div class="app">
    <div class="controller-box">
      <div class="controller-addpapers">
        <el-input v-model="examPaperId" placeholder="输入试卷id来添加试卷">
          <template #prefix>
            <el-icon><Document /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" :icon="Plus" @click="handleAddPaper">
          添加试卷
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col 
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="4"
        v-for="paper in myPapers"
        :key="paper.examPaperId"
      >
        <el-card
          class="paper-card"
          shadow="hover"
          @click="() => handleGoToPaper(paper.examPaperId)"
        >
          <div class="paper-header">
            <h3>{{ paper.examPaperName }}</h3>
            <el-tag :style="getStatusStyle(paper.status)" effect="dark">
              {{ paper.status }}
            </el-tag>
          </div>
          <div class="paper-content">
            <div class="paper-info">
              <el-icon><Document /></el-icon>
              <span>试卷ID: {{ paper.examPaperId }}</span>
            </div>
            <div class="paper-info">
              <el-icon><User /></el-icon>
              <span>作者: {{ paper.username }}</span>
            </div>
            <div class="paper-info">
              <el-icon><Calendar /></el-icon>
              <span>创建时间: {{ new Date(paper.joinDate).toLocaleString() }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="less">
.app {
  background-color: #f4f4f7;
  min-height: 100%;
  padding: 20px;
}

.controller-box {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;

  .controller-addpapers {
    display: flex;
    gap: 10px;

    .el-input {
      width: 240px;
    }
  }
}

.paper-card {
  height: 160px;
  transition: all 0.3s ease;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 20px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .paper-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    h3 {
      margin: 0;
      font-size: 16px;
      color: var(--el-color-primary);
      width: calc(100% - 80px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .el-tag {
      padding: 0 10px;
      height: 24px;
      line-height: 24px;
      font-size: 12px;
      border-radius: 10px;
      border: none;
      flex-shrink: 0;
    }
  }

  .paper-content {
    .paper-info {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      color: var(--el-text-color-secondary);
      font-size: 13px;

      .el-icon {
        margin-right: 8px;
        flex-shrink: 0;
      }

      span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .app {
    padding: 15px;
  }

  .controller-box {
    .controller-addpapers {
      width: 100%;
      flex-direction: column;

      .el-input {
        width: 100%;
      }

      .el-button {
        width: 100%;
      }
    }
  }

  .paper-card {
    margin-bottom: 15px;
  }
}
</style>
