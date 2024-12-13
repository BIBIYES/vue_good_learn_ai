<script setup>
import { onMounted, ref } from 'vue'
import { Plus, Document, User, Calendar, ChatDotRound, Loading } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import { messageTools } from '@/utils/messageTools'
import {
  getStudentJoinExamPaper,
  insertStudentJoinExamPaper
} from '@/api/userApi'
import { useRouter } from 'vue-router'
import { FastGPT } from '@/utils/FastGpt'
import { marked } from 'marked'
import { getExamPaperWrongQuestions } from '@/api/WrongQuestionApi'
import 'github-markdown-css/github-markdown.css'

const router = useRouter()
const userStore = useUserStore()
const examPaperId = ref('')
const userId = ref(userStore.id)

const drawerVisible = ref(false)
const currentPaperId = ref(null)

const summaryContent = ref('')
const isSummarizing = ref(false)

const fastGPT = new FastGPT("fastgpt-sw5swebtIUyUCmolJNRSoRctihOs2seMGBXOyyxlTEyFnYQXKYSqjqA2")

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

const handleSummary = async (paperId) => {
  currentPaperId.value = paperId
  drawerVisible.value = true
  await getSummary()
}

// 获取试卷总结
const getSummary = async () => {
  try {
    isSummarizing.value = true
    summaryContent.value = ''
    
    // 获取试卷的错题记录
    const res = await getExamPaperWrongQuestions(userId.value, currentPaperId.value)
    const wrongQuestions = res.data
    console.log(res.data);
    

    // 构建提示信息
    const prompt = `这是一份试卷的错题记录，请对学生的错题情况进行分析和总结：\n\n` +
      wrongQuestions.map(q => 
        `题目：${q.questionContent}\n` +
        `学生答案：${q.wrongAnswer}\n` +
        `正确答案：${q.answer}\n` +
        `AI反馈：${q.aiAnswer}\n`
      ).join('\n---\n')

    // 发送到 AI 进行总结
    const params = {
      chatId: userStore.id,
      variables: {
        uid: userId.value,
        name: userStore.name
      },
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      onData: (response) => {
        try {
          if (response && response.choices && response.choices[0]) {
            if (response.choices[0].finish_reason === null) {
              const content = response.choices[0].delta.content || ''
              summaryContent.value += content
            } else {
              isSummarizing.value = false
            }
          }
        } catch (error) {
          console.error('处理AI响应时出错:', error)
          messageTools.errorMessage('生成总结失败')
          isSummarizing.value = false
        }
      }
    }

    await fastGPT.sendQuestion(params)
  } catch (error) {
    console.error('获取试卷总结失败:', error)
    messageTools.errorMessage('获取试卷总结失败')
    isSummarizing.value = false
  }
}
</script>

<template>
  <div class="app">
    <div class="header">
      <h2>我的试卷</h2>
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
            <div class="paper-actions">
              <el-tooltip
                v-if="paper.status === '已完成'"
                content="总结试卷"
                placement="top"
                :hide-after="0"
              >
                <el-button
                  class="summary-button"
                  :icon="ChatDotRound"
                  circle
                  size="small"
                  type="primary"
                  @click.stop="handleSummary(paper.examPaperId)"
                />
              </el-tooltip>
              <el-tag :style="getStatusStyle(paper.status)" effect="dark">
                {{ paper.status }}
              </el-tag>
            </div>
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

    <el-drawer
      v-model="drawerVisible"
      title="好助学AI试卷总结"
      direction="rtl"
      size="50%"
    >
      <div class="drawer-content">
        <div class="ai-container markdown-body" :class="{ 'shine-active': isSummarizing }">
          <div class="ai-header">
            <img src="../../../assets/bot.svg" alt="AI Logo" class="ai-logo">
            <span class="ai-title">好助学AI总结</span>
          </div>
          <div class="ai-content">
            <div v-if="summaryContent" v-html="marked(summaryContent)"></div>
            <div v-else class="summary-empty">
              <p>正在阅读试卷...</p>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="less" scoped>
.app {
  background-color: #f4f4f7;
  min-height: 100%;
  
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 22px;
    color: #303133;
  }

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

    .paper-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .summary-button {
      padding: 6px;
      font-size: 14px;
      
      &:hover {
        transform: scale(1.1);
        transition: transform 0.2s ease;
      }
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

  .header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;

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

.drawer-content {
  padding: 20px;
  height: 100%;
  
  .ai-container {
    width: 100%;
    background-color: #fff;
    padding: 0;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
  }

  .ai-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background-color: #f5f7fa;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border-bottom: 1px solid #e4e7ed;

    .ai-logo {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }

    .ai-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .ai-content {
    padding: 16px;
    min-height: 200px;
  }

  .summary-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }
}

/* 添加动画相关样式 */
.ai-container.shine-active::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.8) 50%,
    transparent
  );
  animation: shine 0.8s ease-in-out infinite;
  z-index: 1;
}

@keyframes shine {
  0% {
    left: -50%;
    opacity: 0.5;
  }
  100% {
    left: 100%;
    opacity: 0.8;
  }
}

/* 确保markdown内容会溢出 */
:deep(.markdown-body) {
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.summary-button {
  padding: 6px;
  font-size: 14px;
  
  &:hover {
    transform: scale(1.1);
    transition: transform 0.2s ease;
  }
}
</style>
