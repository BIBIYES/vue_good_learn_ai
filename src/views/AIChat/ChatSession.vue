<script setup>

import { useRoute, useRouter } from 'vue-router'

import { useSessionStore } from '@/stores/sessionStore'

// 消息格式化
import { convertToHtml } from '@/utils/ContenFormat'
import 'github-markdown-css/github-markdown.css'
import { fastgpt } from '@/utils/FastGptChat';
import { getSessionHistory, addSessionHistory } from '@/api/AIChatApi'

const { isLoading, error, results, sendQuestion } = fastgpt();
// 实例化
const route = useRoute()
const router = useRouter()
// 输入框用户的问题
const question = ref(null)
// 图片的Base64信息
const imgBase64 = ref('')
// 聊天记录
const messages = ref([])



//当前页面会话id
const sessionId = ref(route.params.sessionId)

// 发送动画控制器
const isSendLoading = ref(false)
// 聊天盒子获取
const chatBox = ref(null)
// 输入框
const textareaRef = ref(null)
const placeholderText = ref('问"好助学点什么"(shift+enter换行)')
// 获取历史消息
const getHistoricalMessages = async () => {
  try {
    const response = await getSessionHistory(sessionId.value)
    console.log(response.data);
    
    if (response.data) {
      messages.value = response.data
    } else {
      console.error(`未找到会话ID为${sessionId.value}的历史消息`)
    }
  } catch (error) {
    console.error('获取历史消息失败:', error)
  }
}


const handleSendQuestion = () => {
  
  const params = {
    chatId: route.params.id,
    variables: {
      uid: route.params.id,
      name: '张三'
    },
    messages: [
      {
        role: 'user',
        content: question.value
      }
    ],
    onData: (json) => {
      toggleStatusLamp(false)
      // console.log(json);
      // ai消息拼接
      // 判断消息状态
      if (json.choices[0].finish_reason == null) {
        messages.value[messages.value.length - 1].content += json.choices[0].delta.content
        // console.log(json.choices[0].delta.content);
        scrollToBottom()
      } else {
        isSendLoading.value = false
        // 切换状态灯
        addSessionHistory({
          sessionId: sessionId.value,
          role: "assistant",
          content: messages.value[messages.value.length - 1].content
        })
      }
    }
   

  };
  sendQuestion(params);
  toggleStatusLamp(true)
  resetInputData()
};
const showStatusLamp = ref(false);  // 初始值为显示状态灯
// 切换状态灯的方法
const toggleStatusLamp = (status) => {
  showStatusLamp.value = status
};
// 发送消息方法
const sendMessage = () => {
    if (question.value && question.value != ' ') {
      // 开启发送动画
      isSendLoading.value = true
      // 将消息添加到用户队列中
      messages.value.push({
        sessionId: sessionId.value,
        role: "user",
        content: question.value
       
      })
      addSessionHistory({
        sessionId: sessionId.value,
        role: "user",
        content: question.value
      })
      // 添加一个空ai消息
      messages.value.push({
        sessionId: sessionId.value,
        role: "assistant",
        content: "",
      })
      // 调用请求接口
      handleSendQuestion()
    } else {
      console.warn('你没有提问或选择图片。')
    }
}

// 发送消息动画控制器
const handelIsSendLoading = () => {
  if (isSendLoading.value == false) {
    isSendLoading.value = true
  } else {
    isSendLoading.value = false // 修复错别字
  }
}


// 重置输入框
const resetInputData = () => {
  question.value = null
  imgBase64.value = null
}


// 输入框自适应
const adjustHeight = () => {
  const textarea = textareaRef.value
  textarea.style.height = 'auto' // Reset height to auto to calculate new height
  textarea.style.height = textarea.scrollHeight + 'px' // Set new height based on scrollHeight
}
watch(question, (newValue, oldValue) => {
  adjustHeight()
})
// 处理键盘事件
const handleKeyUp = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的换行行为
    if (question.value.trim() !== '') {
      // 仅在输入框不为空时发送消息
      sendMessage()
      resetInputData()
      nextTick(() => {
        adjustHeight()
      })
    }
  }
}
// 终止会话
const terminateSession = () => {
  if (ws.value) {
    ws.value.close()
    ws.value = null
    // 关闭发送动画
    handelIsSendLoading()
  }
}
// 解析url
const parseUrl = () => {
  if (route.query.question) {
    if (route.query.imgBase64) {
      imgBase64.value = route.query.imgBase64
      question.value = route.query.question
      sendMessage()
      nextTick(() => {
        router.replace({ query: null })
      })
      return
    }
    question.value = route.query.question
    sendMessage()
    nextTick(() => {
      router.replace({ query: null })
    })
  }
}
// 生命周期钩子
onMounted(async () => {
  // 获取历史聊天记录
  parseUrl()
  getHistoricalMessages()
  parseUrl()
  nextTick(() => {
    scrollToBottom()
  })
})

// 监听路由变化
watch(route, (newRoute) => {
  sessionId.value = newRoute.params.sessionId
  getHistoricalMessages()
})

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBox.value) {
      chatBox.value.scrollTop = chatBox.value.scrollHeight
    }
  })
}
</script>

<template>
  <div class="chat-container">
    <div class="chat-messages markdown-body" ref="chatBox">
      <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
       
        <template v-if="msg.role === 'assistant'">
          <div v-html="convertToHtml(msg.content)"></div>
          <div class="text-with-status" v-if="index === messages.length - 1 && showStatusLamp">
            <span class="status-lamp"></span>
            <span>知识库搜索中....</span>
          </div>
        </template>
        <template v-else-if="msg.role === 'user'">
          <p style="margin-bottom: 0">{{ msg.content }}</p>
        </template>
      </div>
    </div>
    <div class="input-container">
      <div class="input-section">
        <div class="image-preview" v-show="imgBase64">
          <el-image style="width: 100px; height: 100%" :src="`data:image/png;base64,${imgBase64}`" />
        </div>
        <div class="input-controls">
          <textarea ref="textareaRef" id="inputTextarea" rows="1" :placeholder="placeholderText" @input="adjustHeight"
            @keyup="handleKeyUp" v-model="question"></textarea>
          <div class="icon icon-send">
            <TextLoading v-if="isSendLoading" @click="terminateSession()"></TextLoading>
            <img src="@/assets/img/send-alt-svgrepo-com.svg" alt="Send Icon" @click="sendMessage" v-else />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 100%;
  margin: auto;
  padding-left: 5px;
  padding-right: 20px;
  box-sizing: border-box;
  background-color: #fff;
  color: #333;
  transition: background-color 0.3s ease, color 0.3s ease;
  /* 添加过渡动画 */

  @media (prefers-color-scheme: dark) {
    background-color: #121212;
    color: #f5f5f5;
  }

  .chat-messages {
    flex: 1;
    padding: 20px 40px;
    overflow-y: auto;
    background-color: #fafafa;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    padding-right: 300px;
    padding-left: 300px;
    transition: background-color 0.3s ease;
    /* 添加过渡动画 */

    @media (prefers-color-scheme: dark) {
      background-color: #1e1e1e;
    }

    .message {
      width: auto;
      max-width: 70%;
      height: max-content;
      padding: 10px;
      margin: 5px 0;
      border-radius: 10px;
      background-color: #ffffff;
      word-wrap: break-word;
      position: relative;
      display: inline-block;
      transition: background-color 0.3s ease;
      /* 添加过渡动画 */

      @media (prefers-color-scheme: dark) {
        background-color: #2c2c2c;
      }

      p {
        margin-bottom: 0;
      }

      &.user {
        align-self: flex-end;
        background-color: rgb(237, 237, 237);
        border-radius: 1.5rem;
        transition: background-color 0.3s ease;
        /* 添加过渡动画 */

        @media (prefers-color-scheme: dark) {
          background-color: #3a3a3a;
        }
      }

      &.assistant {
        align-self: flex-start;
        background: none;
        border-radius: 1.5rem;
      }

      .message-image {
        width: 200px;
        border-radius: 10px;
      }
    }
  }

  //输入框
  .input-container {
    width: 100%;
    padding: 10px;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s ease;
    /* 添加过渡动画 */

    @media (prefers-color-scheme: dark) {
      background-color: #121212;
    }

    .input-section {
      display: flex;
      flex-direction: column;
      justify-content: start;
      width: 50%;

      .image-preview {
        overflow: hidden;
        border-radius: 5px;
        margin-bottom: 5px;
        padding-left: 10px;

        img {
          width: 100%;
        }
      }

      .input-controls {
        width: 100%;
        display: flex;
        align-items: flex-end;
        border-radius: 50px;
        padding: 10px 20px;
        background-color: #f5f5f5;
        position: relative;
        transition: background-color 0.3s ease;
        /* 添加过渡动画 */

        @media (prefers-color-scheme: dark) {
          background-color: #333;
        }

        textarea {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 16px;
          width: 100%;
          max-height: 150px;
          height: auto;
          border: none;
          outline: none;
          background: none;
          resize: none;
          padding: 0;
          box-sizing: border-box;
          overflow-y: auto;
          flex-grow: 1;
          max-height: 300px;
          min-height: 23px;
          line-height: 20px;
          color: #333;
          transition: color 0.3s ease;
          /* 添加过渡动画 */

          @media (prefers-color-scheme: dark) {
            color: #f5f5f5;
          }
        }

        .icon {
          width: 30px;
          height: 30px;
          border-radius: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: invert(0%);
            transition: filter 0.3s ease;
            /* 添加过渡动画 */

            @media (prefers-color-scheme: dark) {
              filter: invert(100%);
            }
          }

          &.icon-upload,
          &.icon-record {
            margin-right: 10px;
          }

          &.icon-send {
            margin-left: 10px;
          }
        }
      }
    }
  }
}

@keyframes breathing {
  0% {
    opacity: 1;
    box-shadow: 0 0 5px 2px rgba(0, 128, 0, 0.9); // 更深的绿色阴影
  }

  50% {
    opacity: 0.5;
    box-shadow: 0 0 10px 5px rgba(0, 128, 0, 0.6); // 更高的透明度
  }

  100% {
    opacity: 1;
    box-shadow: 0 0 5px 2px rgba(0, 128, 0, 0.9); // 返回到初始状态
  }
}

.status-lamp {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #008000; // 更深的绿色
  margin-right: 10px;
  animation: breathing 2s infinite;
  display: inline-block;
}

.text-with-status {
  display: flex;
  align-items: center;
  font-family: 'Roboto', Arial, sans-serif;
  /* 设置更现代的字体 */
  color: #333;
  /* 深灰色字体，显得更加简洁优雅 */
  font-size: 16px;
  /* 调整字体大小 */
}
</style>
