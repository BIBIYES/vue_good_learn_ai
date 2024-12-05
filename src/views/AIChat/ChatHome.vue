<script setup>
import { useSessionStore } from '@/stores/sessionStore'
import { useUserStore } from '@/stores/userStore'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Typed from 'typed.js'
import { createSession } from '@/api/AIChatApi'
import { ElMessage } from 'element-plus'

const textareaRef = ref(null)
const typewriterElement = ref(null)
let typed = null
const question = ref(null)
const router = useRouter()
const userStore = useUserStore()

const sessionStore = useSessionStore()
let placeholderText = ref('问"好助学AI"点什么(shift+enter换行)')


// 发送消息的函数
const sendMessage = async () => {
  // 添加到sessionStore
  sessionStore.updateSessionMessages(question.value)
  if (question.value) {
    try {
      // 创建会话
      const response = await createSession({
        title: question.value,
        userId: userStore.id  
      })
      console.log(response);
      

      if (response.data && response.data.sessionId) {
     
        router.push({
          name: 'chatSession',
          params: {
            sessionId: response.data.sessionId
          },
          query: {
            question: question.value
          }
        })
      }
    } catch (error) {
      console.error('创建会话失败:', error)
      ElMessage.error('创建会话失败')
    }
  }
}

// 处理键盘事件
const handleKeyUp = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    if (question.value.trim() !== '') {
      // 仅在输入框不为空时发送消息
      sendMessage()
    }
  }
}
const fontAnimation = () => {
  typed = new Typed(typewriterElement.value, {
    strings: [
      'Hi，我是好助学AI',
      '一个基于知识库问答的多元化AI应用',
      '今天有什么可以帮到您？'
    ],
    // 打字速度
    typeSpeed: 100,
    // 退格速度
    backSpeed: 20,
    // 是否循环
    loop: false,
    showCursor: false
  })
}
onMounted(() => {
  fontAnimation()
})

// 输入框自适应
const adjustHeight = () => {
  const textarea = textareaRef.value
  textarea.style.height = 'auto' // Reset height to auto to calculate new height
  textarea.style.height = textarea.scrollHeight + 'px' // Set new height based on scrollHeight
}
</script>

<template>
  <div class="chat-container">
    <div class="chat-messages-box">
      <div class="chat-messages-box-content">
        <div class="logo-box flowing-text">
          <h3>AI好助学</h3>
        </div>
        <div class="content" ref="typewriterElement">
          <!-- 这里需要typed-->
          你好我是好助学AI
        </div>
        <div class="item-box">
          <div class="item">
            <div class="icon">
              <img src="../assets/img/bulb-on-svgrepo-com.png" alt="" />
            </div>
            <div class="text">给您提供一个灵感</div>
          </div>
          <div class="item">
            <div class="icon">
              <img src="../assets/img/code-svgrepo-com.png" alt="" />
            </div>
            <div class="text">帮您检查代码</div>
          </div>
          <div class="item">
            <div class="icon">
              <img src="../assets/img/calendar-lines-pen-svgrepo-com.png" alt="" />
            </div>
            <div class="text">帮您制定健身计划</div>
          </div>
          <div class="item">
            <div class="icon">
              <img src="../assets/img/search.png" alt="" />
            </div>
            <div class="text">AIGC帮你生成背景图场景图</div>
          </div>
        </div>
      </div>
    </div>
    <div class="input-container">
      <div class="input-section">
        <div class="input-controls">
          <textarea ref="textareaRef" id="inputTextarea" rows="1" :placeholder="placeholderText" @input="adjustHeight"
            @keyup="handleKeyUp" v-model="question"></textarea>
          <div class="icon icon-send" @click="sendMessage">
            <img src="@/assets/img/send-alt-svgrepo-com.svg" alt="Send Icon" />
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
  box-sizing: border-box;
  padding-left: 5px;
  padding-right: 20px;
  background-color: #fff;
  color: #333;
  transition: background-color 0.3s ease, color 0.3s ease;

  @media (prefers-color-scheme: dark) {
    background-color: #121212;
    color: #f5f5f5;
  }

  .chat-messages-box {
    flex: 1;
    overflow-y: auto;
    background-color: #fafafa;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 10px;
    transition: background-color 0.3s ease;

    @media (prefers-color-scheme: dark) {
      background-color: #1e1e1e;
    }

    .chat-messages-box-content {
      width: 100%;
      height: 600px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .flowing-text {
        font-size: 16px;
        font-weight: 800;
        background-image: linear-gradient(45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
        background-size: 400%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        position: relative;
        display: inline-block;
        cursor: pointer;
        transition: background-position 0.5s ease;

        // &:hover {
        //   background-position: 100% 0;
        // }
      }

      .logo-box {
        display: flex;
        position: relative;
        justify-content: center;
        align-items: center;
        width: max-content;
        height: 100px;
        font-size: 33px;
        color: #333;
        z-index: 0;
        overflow: hidden;
        transition: color 0.3s ease;
        /* Add transition for color change */

        @media (prefers-color-scheme: dark) {
          color: #f5f5f5;
        }
      }

      .logo-box::before {
        content: '';
        width: 100px;
        height: 10px;
        position: absolute;
        background: linear-gradient(to right, #ee7752, #e73c7e);
        border-radius: 15px;
        bottom: 0;
        left: 0;
      }

      .content {
        display: flex;
        justify-content: center;
        align-items: center;
        // border: 1px solid #ddd;
        width: 350px;
        height: 60px;
        color: #484848;
        font-size: 20px;
        font-family: Arial, Helvetica, sans-serif;
        transition: color 0.3s ease;
        /* Add transition for color change */

        @media (prefers-color-scheme: dark) {
          color: #ccc;
        }
      }

      .item-box {
        display: flex;
        width: 1000px;
        justify-content: space-around;
        align-items: center;

        .item {
          width: 200px;
          height: 100px;
          padding: 10px;
          border-radius: 10px;
          text-align: left;
          background-color: #fff;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.3s ease, background-color 0.3s ease, color 0.3s ease;

          @media (prefers-color-scheme: dark) {
            background-color: #2c2c2c;
            color: #ddd;
          }

          &:hover {
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          }

          .icon {
            width: 25px;
            height: 25px;
            margin-bottom: 5px;

            img {
              width: 100%;
              
            }
          }
        }
      }
    }
  }

  .input-container {
    width: 100%;
    padding: 10px;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s ease;

    @media (prefers-color-scheme: dark) {
      background-color: #1e1e1e;
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

        img {
          width: 100%;
        }

        padding-left: 10px;
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
          /* Add transition for color change */

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
            filter: invert(20%);
            transition: filter 0.3s ease;
            /* Add transition for smooth change */

            @media (prefers-color-scheme: dark) {
              filter: invert(80%);
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
</style>
