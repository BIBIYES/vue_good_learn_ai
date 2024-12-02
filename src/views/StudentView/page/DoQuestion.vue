<template>
  <div class="app">
    <div v-if="questions.length" class="exam-container">
      <div class="question-info">
        <el-button class="back-button" :icon="ArrowLeft" @click="router.go(-1)">
          返回
        </el-button>
        <span>题目 {{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
      </div>

      <transition name="fade" mode="out-in">
        <div :key="currentQuestionIndex" class="question-content markdown-body">
          <h2>{{ questions[currentQuestionIndex].questionTitle }}</h2>
          <div v-html="marked(questions[currentQuestionIndex].questionContent)"></div>
        </div>
      </transition>

      <div class="input-container">
        <el-input v-model="answers[currentQuestionIndex]" type="textarea" placeholder="请输入你的答案"
          :autosize="{ minRows: 4, maxRows: 10 }" @paste="preventPasteInput" @drop.prevent="preventDrop"
          @dragover.prevent onpaste="return false"></el-input>
      </div>
      <div class="ai-container markdown-body" v-if="aiAnswers[currentQuestionIndex]" :class="{ 'shine-active': showShineEffect }">
        <div class="ai-header">
          <img src="../../../assets/bot.svg" alt="AI Logo" class="ai-logo">
          <span class="ai-title">龙梦GPT回应</span>
        </div>
        <div class="ai-content">
          <div v-html="marked(filteredAiAnswer)"></div>
          
          <el-alert
            v-if="currentAnswerValidity !== null"
            :title="currentAnswerValidity ? '回答正确！' : '回答错误，请查看反馈并修改。'"
            :type="currentAnswerValidity ? 'success' : 'error'"
            :description="currentAnswerValidity ? '你的答案符合要求，可以继续下一题。' : '请根据上方的反馈修改你的答案。'"
            show-icon
            :closable="false"
            style="margin-top: 15px;"
          />
        </div>
      </div>

      <div class="button-group">
        <el-button type="primary" :icon="ArrowLeft" v-if="currentQuestionIndex > 0" @click="previousQuestion">
          上一题
        </el-button>
        
        <el-button 
          type="warning" 
          @click="handleSendQuestion()" 
          :loading="isFetching"
          :disabled="isFetching">
          {{ isFetching ? '正在检验' : '检验答案' }}
        </el-button>
        
        <template v-if="currentAnswerValidity">
          <el-button type="primary" :icon="ArrowRight" v-if="currentQuestionIndex < questions.length - 1"
            @click="nextQuestion">
            下一题
          </el-button>
          <el-button type="success" :icon="Check" v-else @click="HandelSubmitAnswer()">
            提交试卷
          </el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import { ArrowLeft, ArrowRight, Check } from '@element-plus/icons-vue'
import { selectExamPaperQuestionsByExamPaperId } from '@/api/examPaperQuestionApi'
import { submitAnswer } from '@/api/studentAnswerApi'
import { useUserStore } from '@/stores/userStore'
import { messageTools } from '@/utils/messageTools'
import { fastgpt } from '@/utils/FastGpt';
import { addWrongQuestion } from '@/api/WrongQuestionApi'
const { isLoading, error, results, sendQuestion } = fastgpt();
import 'github-markdown-css/github-markdown.css'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const examPaperId = route.params.examPaperId
const userId = userStore.id
const questions = ref([])
const currentQuestionIndex = ref(0)
const answers = ref([])
const isFetching = ref(false)
// 存储每道题的ai回答
const aiAnswers = ref([]) // 用于存储所有题目的AI回答
const rawAiAnswer = ref('') // 用于存储当前题目的原始回答

// 添加动画控制状态
const showShineEffect = ref(true)

// 修改计算属性
const filteredAiAnswer = computed(() => {
  if (!rawAiAnswer.value) return '';
  // 移除包含 #valid# 或 #invalid# 的最后一行
  return rawAiAnswer.value.replace(/\n.*#(valid|invalid)#.*$/g, '');
});

// 修改答案验证的计算属性
const currentAnswerValidity = computed(() => {
  if (!rawAiAnswer.value) return null;
  
  if (/#invalid#/i.test(rawAiAnswer.value)) {
    return false;
  }
  if (/#valid#/i.test(rawAiAnswer.value)) {
    return true;
  }
  return null;
});

/**
 * 发送问题
 */
const handleSendQuestion = () => {
  if (!answers.value[currentQuestionIndex.value]) {
    messageTools.warningMessage('请输入答案后再检验')
    return
  }

  if (isFetching.value) return
  isFetching.value = true
  showShineEffect.value = true // 开始动画

  // 清除当前题目的AI回答
  rawAiAnswer.value = ''
  aiAnswers.value[currentQuestionIndex.value] = ''

  const prompt =
    questions.value[currentQuestionIndex.value].questionContent +
    '我的答案是' +
    answers.value[currentQuestionIndex.value] +
    '参考答案是'+
    questions.value[currentQuestionIndex.value].answer
    
console.log(prompt);

  const params = {
    chatId: userStore.id,
    variables: {
      uid: route.params.id,
      name: userStore.name
    },
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    onData: async (response) => {
      try {
        if (response && response.choices && response.choices[0]) {
          if (response.choices[0].finish_reason === null) {
            const content = response.choices[0].delta.content || ''
            rawAiAnswer.value += content
            aiAnswers.value[currentQuestionIndex.value] = rawAiAnswer.value
          } else {
            isFetching.value = false
            setTimeout(() => {
              showShineEffect.value = false
            }, 500)
            
            // 检查答案是否错误，如果错误则添加到错题本
            if (/#invalid#/i.test(rawAiAnswer.value)) {
              // 构造错题数据
              const wrongQuestionData = {
                userId: userId,
                examPaperId: Number(examPaperId),
                questionId: questions.value[currentQuestionIndex.value].questionId,
                wrongAnswer: answers.value[currentQuestionIndex.value],
                aiAnswer: rawAiAnswer.value
              }
              
              // 调用添加错题接口
              await handleAddWrongQuestion(wrongQuestionData)
            } else if (/#valid#/i.test(rawAiAnswer.value)) {
              messageTools.successMessage('回答正确！可以进入下一题')
            }
          }
        }
      } catch (error) {
        console.error('处理AI响应时出错:', error)
        isFetching.value = false
        showShineEffect.value = false
      }
    }
  }

  try {
    sendQuestion(params)
  } catch (error) {
    console.error('发送问题时出错:', error)
    messageTools.errorMessage('请求AI助手失败，请稍后重试')
    isFetching.value = false
  }
}


const fetchQuestions = async () => {
  try {
    const response = await selectExamPaperQuestionsByExamPaperId(examPaperId)
    if (response.code === 200) {
      questions.value = response.data
      answers.value = Array(response.data.length).fill('')
      aiAnswers.value = Array(response.data.length).fill('') // 初始化所有题目的AI回答
    } else {
      ElMessage.error('获取题目失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('发生错误：' + error.message)
  }
}

// 添加键盘快捷键防护
const preventShortcuts = (event) => {
  // 只防止 Ctrl+V 粘贴
  if (event.ctrlKey && event.key === 'v') {
    event.preventDefault()
    messageTools.warningMessage('为了学习效果，请勿使用快捷键粘贴')
  }
}

// 修改 onMounted
onMounted(() => {
  fetchQuestions()
  
  // 只保留输入框的粘贴防护
  document.addEventListener('keydown', preventShortcuts)
})

// 修改 onUnmounted
onUnmounted(() => {
  // 只需要移除键盘事件监听
  document.removeEventListener('keydown', preventShortcuts)
})

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1 && currentAnswerValidity.value) {
    currentQuestionIndex.value++
    // 清除新题目的AI回答
    rawAiAnswer.value = ''
  } else if (!currentAnswerValidity.value) {
    messageTools.warningMessage('请先完成当前题目并确保答案正确')
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    // 恢复上一题的AI回答
    rawAiAnswer.value = aiAnswers.value[currentQuestionIndex.value] || ''
  }
}

// 提交答案
const HandelSubmitAnswer = async () => {
  // 收集未填写的题目的索引（从 0 开始）
  const emptyAnswerIndices = answers.value
    .map((answer, index) => (answer.trim() === '' ? index : -1))
    .filter((index) => index !== -1)

  if (emptyAnswerIndices.length > 0) {
    // 将索引转换为题号（从 1 开始）
    const questionNumbers = emptyAnswerIndices.map((index) => index + 1)
    // 生成提示信息
    const message = `第 ${questionNumbers.join(
      '、'
    )} 题未填写，请填写后再提交。`
    // 弹出提示
    messageTools.warningMessage(message)
    return // 终止函数，防止提交
  }

  // 所有答案均已填写，构建答案列表
  const answerList = answers.value.map((answer, index) => {
    const item = {
      examPaperQuestionId: questions.value[index].questionId,
      answerContent: answer,
      aiAnswer: aiAnswers.value[index] // 使用对应题目的AI回答
    }
    return item
  })

  // 提交答案列表
  const res = await submitAnswer(userId, examPaperId, answerList)
  if (res.code == 200) {
    messageTools.successMessage(res.msg)
    router.push('/student/exam-paper')
  } else {
    messageTools.errorMessage(res.msg)
  }
}

// 在 script setup 中以下函数
const preventCopyPaste = (event) => {
  event.preventDefault()
  messageTools.warningMessage('为了学习效果，请勿复制粘贴')
}

const preventContextMenu = (event) => {
  event.preventDefault()
}

// 添加新的防粘贴函数
const preventPasteInput = (event) => {
  event.preventDefault()
  messageTools.warningMessage('为了学习效果，请勿粘贴答案')
}

// 在 script setup 中添加新的防拖拽函数
const preventDrop = (event) => {
  event.preventDefault()
  messageTools.warningMessage('为了学习效果，请勿拖拽输入答案')
}

// 添加错题记录
const handleAddWrongQuestion = async (questionData) => {    
  try {
    await addWrongQuestion(questionData)
    console.log('错题添加成功')
  } catch (error) {
    console.error('添加错题记录失败:', error)
    messageTools.errorMessage('添加错题记录失败')
  }
}

</script>

<style scoped>
.app {
  padding-top: 10px;
  width: 100vw;
  height: 100vh;
  background: url(../../../assets/img/loginBackground.png);
  background-position: -500px;
  background-size: cover;
}

.exam-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
}

.question-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  font-size: 14px;
  padding: 8px 15px;
}

.question-content {
  width: 100%;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 10px;
  background-color: #fff;
}

.input-container {
  position: relative;
  width: 100%;
  margin-bottom: 20px;
}

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
}

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

.ai-content {
  padding: 16px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
}

.button-group>* {
  flex: 1;
}

.button-group>*:first-child {
  margin-right: 10px;
}

.button-group>*:last-child {
  margin-left: 10px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.input-container :deep(.el-textarea__inner) {
  resize: none; /* 禁止手动调整文本框大小 */
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
</style>

