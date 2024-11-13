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

      <div class="input-container" :class="{ 'rainbow-border': isRainbow }">
        <el-input v-model="answers[currentQuestionIndex]" type="textarea" placeholder="请输入你的答案"
          :autosize="{ minRows: 4, maxRows: 10 }"></el-input>
        <button class="circle-button" @click="fetchAiAnswer()" :disabled="isFetching"></button>
      </div>
      <div class="ai-container markdown-body" v-if="aiAnswers[currentQuestionIndex]">
        <div v-html="marked(aiAnswers[currentQuestionIndex])"></div>
      </div>

      <div class="button-group">
        <el-button type="primary" :icon="ArrowLeft" v-if="currentQuestionIndex > 0" @click="previousQuestion">
          上一题
        </el-button>
        <el-button type="primary" :icon="ArrowRight" v-if="currentQuestionIndex < questions.length - 1"
          @click="nextQuestion">
          下一题
        </el-button>
        <el-button type="success" :icon="Check" v-else @click="HandelSubmitAnswer()">
          提交试卷
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import { ArrowLeft, ArrowRight, Check } from '@element-plus/icons-vue'
import { selectExamPaperQuestionsByExamPaperId } from '@/api/examPaperQuestionApi'
import { submitAnswer } from '@/api/studentAnswerApi'
import { useUserStore } from '@/stores/userStore'
import { messageTools } from '@/utils/messageTools'
import 'github-markdown-css/github-markdown.css'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const examPaperId = route.params.examPaperId
const userId = userStore.id
const questions = ref([])
const currentQuestionIndex = ref(0)
const answers = ref([])
const isRainbow = ref(false)
const isFetching = ref(false)
// 存储每道题ai的回答
const aiAnswers = ref([])

const fetchAiAnswer = async () => {
  // 如果用户输入的答案为空则不请求ai
  if (!answers.value[currentQuestionIndex.value]) {
    messageTools.warningMessage('请输入答案后再请求AI')
    return
  }
  if (isFetching.value) return
  isFetching.value = true
  isRainbow.value = true

  const prompt =
    questions.value[currentQuestionIndex.value].questionContent +
    '我的答案是' +
    answers.value[currentQuestionIndex.value] +
    '请问正确吗？'

  // 初始化aiAnswer为空串
  aiAnswers.value[currentQuestionIndex.value] = ''

  const eventSource = new EventSource(
    `${import.meta.env.VITE_API_BASE_URL}/chat/sse?prompt=${encodeURIComponent(prompt)}`
  )


  eventSource.onmessage = (event) => {
    // 将接收到的数据追加到当前的 aiAnswer
    aiAnswers.value[currentQuestionIndex.value] += event.data
  }

  eventSource.onerror = (error) => {
    console.error('发生错误:', error)
    eventSource.close()
    isFetching.value = false
    isRainbow.value = false
  }

  eventSource.onopen = () => {
    console.log('连接已打开')
  }

  eventSource.addEventListener('end', () => {
    eventSource.close()
    isFetching.value = false
    isRainbow.value = false
  })

  // 如果服务器没有发送'end'事件，可以设置超时自动关闭
  setTimeout(() => {
    if (isFetching.value) {
      eventSource.close()
      isFetching.value = false
      isRainbow.value = false
      console.log('连接超时，已关闭')
    }
  }, 30000)
}

const fetchQuestions = async () => {
  try {
    const response = await selectExamPaperQuestionsByExamPaperId(examPaperId)
    if (response.code === 200) {
      questions.value = response.data
      answers.value = Array(response.data.length).fill('')
      aiAnswers.value = Array(response.data.length).fill('') // 初始化 aiAnswers
    } else {
      ElMessage.error('获取题目失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('发生错误：' + error.message)
  }
}

onMounted(fetchQuestions)

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
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
    // 构建答案对象
    const item = {
      examPaperQuestionId: questions.value[index].questionId,
      answerContent: answer
    }
    // 如果存在对应的 aiAnswer，且不为空，添加到对象中
    const aiAnswer = aiAnswers.value[index]
    if (aiAnswer && aiAnswer.trim() !== '') {
      item.aiAnswer = aiAnswer
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
  transition: border 0.3s ease;
}

.ai-container {
  width: 100%;
  background-color: #fff7e6;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 5px;
}

.circle-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 30px;
  height: 30px;
  background-color: #007bff;
  background: url(../../../assets/bot.svg) center center;
  background-size: cover;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0);
}

.circle-button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.rainbow-border {
  border: 3px solid transparent;
  border-radius: 7px;
  animation: rainbow 2s infinite;
}

@keyframes rainbow {
  0% {
    border-color: red;
  }

  16% {
    border-color: orange;
  }

  33% {
    border-color: yellow;
  }

  50% {
    border-color: green;
  }

  66% {
    border-color: blue;
  }

  83% {
    border-color: indigo;
  }

  100% {
    border-color: violet;
  }
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
</style>
