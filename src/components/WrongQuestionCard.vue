<script setup>
import { WarningFilled, TrophyBase } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  wrongQuestion: {
    type: Object,
    required: true,
    default: () => ({
      wrongQuestionsId: 0,
      examPaperName: '',
      questionTitle: '',
      questionContent: '',
      wrongAnswer: ''
    })
  }
})

// 跳转到智能练习页面
const handlePractice = () => {
  router.push({
    path: '/student/practice',
    query: {
      wrongQuestionId: props.wrongQuestion.questionId
    }
  })
}
</script>

<template>
  <el-row class="wrong-question-card">
    <el-col :span="24">
      <div class="card-content">
        <div class="card-header">
          <div class="left-section">
            <el-tag size="small" type="warning" effect="plain">
              <el-icon class="question-icon"><WarningFilled /></el-icon>
              错题记录
            </el-tag>
            <span class="paper-name">{{ wrongQuestion.examPaperName }}</span>
          </div>
          <div class="right-section">
            <el-button 
              type="primary"
              @click="handlePractice"
            >
              <el-icon><TrophyBase /></el-icon>
              智能练习
            </el-button>
          </div>
        </div>
        <div class="question-info">
          <div class="question-title">
            <span class="title-label">题目：</span>
            {{ wrongQuestion.questionTitle }}
          </div>
          <div class="question-content">
            <MarkdownContext :content="wrongQuestion.questionContent" />
          </div>
          <div class="wrong-answer">
            <el-alert
              type="error"
              :closable="false"
              show-icon
            >
              <template #title>
                <span class="wrong-answer-label">错误答案：</span>
                <span class="wrong-answer-content">{{ wrongQuestion.wrongAnswer }}</span>
              </template>
            </el-alert>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped>
.wrong-question-card {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
}

.wrong-question-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-icon {
  margin-right: 4px;
}

.paper-name {
  font-size: 14px;
  color: #606266;
}

.question-info {
  padding: 0 10px;
}

.question-title {
  font-size: 15px;
  color: #303133;
  margin-bottom: 16px;
  line-height: 1.6;
}

.title-label {
  color: #909399;
  font-weight: 500;
}

.question-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.wrong-answer {
  margin-top: 16px;
}

.wrong-answer-label {
  font-weight: 500;
  margin-right: 8px;
}

.wrong-answer-content {
  color: #f56c6c;
}

@media screen and (max-width: 768px) {
  .wrong-question-card {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .right-section {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .question-content {
    padding: 12px;
  }
}

.el-icon {
  margin-right: 4px;
}
</style>