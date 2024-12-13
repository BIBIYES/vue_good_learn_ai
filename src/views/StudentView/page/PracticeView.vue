<template>
  <div v-if="!questions.length" class="loading-container">
    <div class="generating-content">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span class="generating-text">正在生成相关题目...</span>
    </div>
  </div>
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
          <span class="ai-title">好助学AI回应</span>
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
          <el-button type="success" :icon="Check" v-else @click="handleMarkAsDone">
            完成练习
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
import { ArrowLeft, ArrowRight, Check, Loading } from '@element-plus/icons-vue'
import { selectExamPaperQuestionsByExamPaperId } from '@/api/examPaperQuestionApi'
import { submitAnswer } from '@/api/studentAnswerApi'
import { useUserStore } from '@/stores/userStore'
import { messageTools } from '@/utils/messageTools'
import { FastGPT } from '@/utils/FastGpt'
import { addWrongQuestion } from '@/api/WrongQuestionApi'
import 'github-markdown-css/github-markdown.css'
import {getQuestionById} from '@/api/questionApi'
import { markWrongQuestionAsDone } from '@/api/WrongQuestionApi'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const questionId = route.query.wrongQuestionId
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

// 在 setup 中初始化
const fastGPT = new FastGPT("fastgpt-ygf1hf0C7jdXTucxaArlqnG3VozOdyhU5qdppASyLR9ID5tPtGV4sHZZRhz")

/**
 * 发送问题
 */
const handleSendQuestion = async () => {
  if (!answers.value[currentQuestionIndex.value]) {
    messageTools.warningMessage('请输入答案后再检验')
    return
  }

  if (fastGPT.isLoading.value) return
  isFetching.value = true
  showShineEffect.value = true

  rawAiAnswer.value = ''
  aiAnswers.value[currentQuestionIndex.value] = ''

  const prompt = questions.value[currentQuestionIndex.value].questionContent + '\n' +
    '我的答案是' + '\n' +
    answers.value[currentQuestionIndex.value] + '\n' +
    '参考答案��' + '\n' +
    questions.value[currentQuestionIndex.value].answer

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
            
            if (/#invalid#/i.test(rawAiAnswer.value)) {
              const wrongQuestionData = {
                userId: userId,
                examPaperId: Number(examPaperId),
                questionId: questions.value[currentQuestionIndex.value].questionId,
                wrongAnswer: answers.value[currentQuestionIndex.value],
                aiAnswer: rawAiAnswer.value
              }
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
    await fastGPT.sendQuestion(params)
  } catch (error) {
    console.error('发送问题时出错:', error)
    messageTools.errorMessage('请求AI助手失败，请稍后重试')
    isFetching.value = false
    showShineEffect.value = false
  }
}

// 监听 fastGPT 的 loading 状态
watch(() => fastGPT.isLoading.value, (newValue) => {
  isFetching.value = newValue
})




const preventShortcuts = (event) => {
  // 只防止 Ctrl+V 粘贴
  if (event.ctrlKey && event.key === 'v') {
    event.preventDefault()
    messageTools.warningMessage('为了学习效果，请勿使用快捷键粘贴')
  }
}


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

// 添加标记完成的处理函数
const handleMarkAsDone = async () => {
  try {
    await markWrongQuestionAsDone(questionId, userId)
    messageTools.successMessage('练习完成！')
    router.push('/student/wrong-question')  // 返回错题本页面
  } catch (error) {
    console.error('标记完成失败:', error)
    messageTools.errorMessage('标记完成失败，请重试')
  }
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


// 修改 onUnmounted
onUnmounted(() => {
  // 只需要移除键盘事件监听
  document.removeEventListener('keydown', preventShortcuts)
})
// 修改 onMounted
onMounted(() => {
  handleGetQuestionById()
// 只保留输入框的粘贴防护
document.addEventListener('keydown', preventShortcuts)
})
/**
 * 以上是答题的业务逻辑
 * 以下是ai生成同类型题目的逻辑
 */

 // 错误的题目
const wrongQuestion = ref(null)
// ai生成的题目
const aiQuestions = ref([])
// 获取错误题目
const handleGetQuestionById = async () => {
  console.log(questionId);
  
  const res = await getQuestionById(questionId)
  // 只要题干部分
  wrongQuestion.value = res.data.questionContent
  console.log(res);
  handleGetAiQuestion()
}

// 实例化第二个fastgpt
const fastGPT2 = new FastGPT("fastgpt-xfXO0Ti0ybbUYy4TsgYFiEh9bxYbsXTdOIyFAcMYu047t2H202NzrW")

// 获取ai生成的同类型题目
const handleGetAiQuestion = async () => {
  if (fastGPT2.isLoading.value) return
  
  const prompt = wrongQuestion.value + '\n' +
    '请生成一道与上述题目类型相同科目相同的题目。3道题。请直接返回JSON数组，不要包含任何其他格式：[{"questionTitle":"题目标题","questionContent":"题目内容"},...]'
  
  let tempResponse = ''  // 用于累积完整的响应

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
    onData: (response) => {
      try {
        if (response && response.choices && response.choices[0]) {
          if (response.choices[0].finish_reason === null) {
            const content = response.choices[0].delta.content || ''
            tempResponse += content
          } else {
            // 流式响应结束，清理并解析JSON
            try {
              // 清理可能存在的markdown标记
              let cleanResponse = tempResponse
                .replace(/```json\n?/g, '')  // 移除开始的 ```json
                .replace(/```\n?/g, '')      // ���除结束的 ```
                .trim()                      // 移除首尾空白

              // 尝试解析JSON
              const parsedQuestions = JSON.parse(cleanResponse)
              
              // 验证解析结果是否为数组
              if (!Array.isArray(parsedQuestions)) {
                throw new Error('解析结果不是数组')
              }

              // 将解析后的题目添加到 questions 数组
              questions.value = parsedQuestions.map((q, index) => ({
                ...q,
                questionId: `ai_${index}`,
                answer: ''
              }))
              
              // 初始化对应的答案数组
              answers.value = new Array(questions.value.length).fill('')
              // 初始化AI答案数组
              aiAnswers.value = new Array(questions.value.length).fill('')
              
              messageTools.successMessage('题目生成完成')
            } catch (error) {
              console.error('解析AI返回的JSON失败:', error)
              console.log('原始响应:', tempResponse) // 用于调试
              messageTools.errorMessage('解析题目失败，请重试')
            }
          }
        }
      } catch (error) {
        console.error('处理AI响应时出错:', error)
        messageTools.errorMessage('生成题目失败')
      }
    }
  }

  try {
    tempResponse = ''  // 重置临时响应
    await fastGPT2.sendQuestion(params)
  } catch (error) {
    console.error('请求AI失败:', error)
    messageTools.errorMessage('请求AI助手失败，请稍后重试')
  }
}
</script>

<style scoped>
.app {
  padding-top: 10px;
  width: 100%;
  height: 100%;
  background-position: -500px;
  background-size: cover;
  overflow-x: hidden;
  position: relative;
}

.exam-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
  width: calc(100% - 40px);
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-wrap: break-word;
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
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  box-sizing: border-box;
}

.input-container {
  position: relative;
  width: 100%;
  margin-bottom: 20px;
  box-sizing: border-box;
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
  box-sizing: border-box;
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
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
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
  min-height: 400px;  /* 设置最小高度 */
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 20px auto;
  max-width: 800px;
}

.generating-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.generating-content .el-icon {
  font-size: 40px;
  color: var(--el-color-primary);
}

.generating-text {
  font-size: 16px;
  color: var(--el-text-color-primary);
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

/* 添加动画相关样 */
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
</style>

