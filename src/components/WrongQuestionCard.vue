<script setup>
import { WarningFilled } from '@element-plus/icons-vue'

defineProps({
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
</script>

<template>
  <el-row class="wrong-question-card">
    <el-col :span="24">
      <div class="card-content">
        <div class="icon-wrapper">
          <el-icon class="question-icon"><WarningFilled /></el-icon>
        </div>
        <div class="question-info">
          <div class="paper-name">{{ wrongQuestion.examPaperName }}</div>
          <div class="question-title">{{ wrongQuestion.questionTitle }}</div>
          <div class="question-content">{{ wrongQuestion.questionContent }}</div>
          <div class="wrong-answer">
            <span class="wrong-answer-label">错误答案：</span>
            <span class="wrong-answer-content">{{ wrongQuestion.wrongAnswer }}</span>
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
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  margin-bottom: 16px;
}

.wrong-question-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.icon-wrapper {
  flex-shrink: 0;
}

.question-icon {
  font-size: 24px;
  color: #f56c6c;
}

.question-info {
  flex: 1;
}

.paper-name {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.question-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.question-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
}

.wrong-answer {
  font-size: 14px;
  line-height: 1.5;
}

.wrong-answer-label {
  color: #e6a23c;
  font-weight: 500;
}

.wrong-answer-content {
  color: #f56c6c;
}

@media screen and (max-width: 768px) {
  .card-content {
    flex-direction: column;
    align-items: center;
  }
  
  .icon-wrapper {
    margin-bottom: 12px;
  }
  
  .question-info {
    width: 100%;
    text-align: center;
  }
}
</style>