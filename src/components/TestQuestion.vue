<script setup>
import { ref, computed } from 'vue';
import { ElCard, ElButton, ElInput, ElAlert } from 'element-plus';
import { marked } from 'marked';
import { FastGPT } from '@/utils/FastGpt';
import { messageTools } from '@/utils/messageTools';
import 'github-markdown-css/github-markdown.css';

const props = defineProps({
  questionsData: {
    type: Object,
    required: true,
    default: () => ({
      questionTitle: '',
      questionContent: '',
      answer: ''
    })
  }
});

// 答题框中的答案
const prompt = ref('');

// 加载状态
const isFetching = ref(false);
// 存储原始回答，包含验证标记
const rawAiAnswer = ref('');

const fastGPT = new FastGPT("你的API密钥");

// 添加一个状态来控制动画
const showShineEffect = ref(true)

// 修改计算属性：用于显示的过滤后的内容
const filteredAiAnswer = computed(() => {
  if (!rawAiAnswer.value) return '';
  // 移除包含 #valid# 或 #invalid# 的最后一行
  return rawAiAnswer.value.replace(/\n.*#(valid|invalid)#.*$/g, '');
});

// 计算属性：检查答案是否正确
const answerValidity = computed(() => {
  if (!rawAiAnswer.value) return null;
  
  if (/#invalid#/i.test(rawAiAnswer.value)) {
    return false;
  }
  if (/#valid#/i.test(rawAiAnswer.value)) {
    return true;
  }
  return null;
});

// 获取AI回答
const getAIAnswer = async () => {
  if (!prompt.value) {
    messageTools.warningMessage('请输入答案后再检验');
    return;
  }

  if (isFetching.value) return;
  isFetching.value = true;
  showShineEffect.value = true // 开始动画
  
  rawAiAnswer.value = ''; // 清除原始回答

  const promptText = 
    props.questionsData.questionContent +
    '我的答案是' +
    prompt.value +
    '参考答案是' +
    props.questionsData.answer +
    '请问正确吗？请先给出详细解释，之后在回答最后一行用#valid#表示正确，用#invalid#表示错误';

  const params = {
    chatId: 'test-question',
    variables: {
      uid: 'test-question',
      name: '测试'
    },
    messages: [
      {
        role: 'user',
        content: promptText
      }
    ],
    onData: (response) => {
      try {
        if (response && response.choices && response.choices[0]) {
          if (response.choices[0].finish_reason === null) {
            const content = response.choices[0].delta.content || '';
            rawAiAnswer.value += content; // 存储完整回答
          } else {
            isFetching.value = false;
            // AI回答完成后，等待一小段时间再关闭动画
            setTimeout(() => {
              showShineEffect.value = false
            }, 500)
          }
        }
      } catch (error) {
        console.error('处理AI响应时出错:', error);
        isFetching.value = false;
        showShineEffect.value = false;
      }
    }
  };

  try {
    fastGPT.sendQuestion(params);
  } catch (error) {
    console.error('发送问题时出错:', error);
    messageTools.errorMessage('请求AI助手失败，请稍后重试');
    isFetching.value = false;
    showShineEffect.value = false;
  }
};
</script>

<template>
  <div class="question-wrapper">
    <el-card class="question-card" shadow="hover" :class="{ 'shine-active': showShineEffect }">
      <template #header>
        <div class="card-header">
          <h2>{{ questionsData.questionTitle }}</h2>
        </div>
      </template>
      
      <div class="card-content">
        <!-- 题目内容 -->
        <div class="content-section">
          <strong class="section-title">题目内容：</strong>
          <div class="section-body">
            <div v-if="questionsData.questionContent" v-html="marked(questionsData.questionContent)"></div>
          </div>
        </div>

        <!-- 参考答案 -->
        <div v-if="questionsData.answer" class="content-section">
          <strong class="section-title">参考答案：</strong>
          <div class="section-body">
            <div v-html="marked(questionsData.answer)"></div>
          </div>
        </div>

        <!-- 答题区域 -->
        <div class="answer-section">
          <el-input 
            v-model="prompt" 
            type="textarea" 
            placeholder="请输入你的答案" 
            :autosize="{ minRows: 4, maxRows: 10 }"
          />

          <div class="button-container">
            <el-button 
              type="primary" 
              @click="getAIAnswer()"
              :loading="isFetching"
              :disabled="isFetching"
              class="check-button"
            >
              {{ isFetching ? '正在检查...' : '检查答案' }}
            </el-button>
          </div>
        </div>

        <!-- AI回答区域 -->
        <div v-if="filteredAiAnswer" class="ai-answer-section" :class="{ 'shine-active': showShineEffect }">
          <div class="ai-header">
            <img src="../assets/bot.svg" alt="AI Logo" class="ai-logo">
            <span class="ai-title">
              重工AI好助学响应
            </span>
          </div>
          <div class="ai-content markdown-body">
            <div v-html="marked(filteredAiAnswer)"></div>
            
            <el-alert
              v-if="answerValidity !== null"
              :title="answerValidity ? '回答正确！' : '回答错误，请查看反馈并修改。'"
              :type="answerValidity ? 'success' : 'error'"
              :description="answerValidity ? '你的答案符合要求，可以继续下一题。' : '请根据上方的反馈修改你的答案。'"
              show-icon
              :closable="false"
              class="result-alert"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.question-wrapper {
  padding: 30px 20px;
}

.question-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  background-color: rgba(255, 255, 255, 0.95);
  position: relative;
  overflow: hidden;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  padding: 0;
  margin-bottom: 8px;
}

.card-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.card-content {
  padding: 0 10px;
}

.content-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.content-section:hover {
  background-color: #f0f2f5;
}

.section-title {
  display: block;
  margin-bottom: 12px;
  color: #1a1a1a;
  font-size: 1.1rem;
}

.section-body {
  line-height: 1.6;
}

.answer-section {
  margin: 24px 0;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.check-button {
  min-width: 120px;
}

.ai-answer-section {
  margin-top: 24px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  position: relative;
}

.ai-answer-section.shine-active::after {
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

.ai-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  position: relative;
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
  padding: 20px;
  background-color: #fff;
}

.result-alert {
  margin-top: 16px;
}

:deep(.el-textarea__inner) {
  resize: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.el-alert) {
  border-radius: 6px;
}

:deep(.el-alert__title) {
  font-size: 15px;
  font-weight: 600;
}

:deep(.el-alert__description) {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.5;
}
</style>
