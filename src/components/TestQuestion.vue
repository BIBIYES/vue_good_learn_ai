<script setup>
import { ref } from 'vue';
import { ElCard, ElButton, ElInput } from 'element-plus';
const props = defineProps({
  questionsData: Object
});

// 答题框中的答案
const prompt = ref('');


const getAIAnswer = () => {

  const url = `http://locathost:8080/chat/sse?prompt=${encodeURIComponent(prompt.value)}`;

  // 使用 EventSource 连接到 SSE 接口
  const eventSource = new EventSource(url);

  // 处理服务器推送的消息
  eventSource.onmessage = (event) => {
    console.log("接收到服务器推送的消息:", event.data);
  };

  // 处理连接打开事件
  eventSource.onopen = () => {
    console.log("SSE 连接已建立");
  };

  // 处理错误事件
  eventSource.onerror = (error) => {
    console.error("SSE 连接出错:", error);
    eventSource.close(); // 可选择在出错时关闭连接
  };
};


</script>

<template>
  <div style="display: flex; justify-content: center; padding: 20px;">
    <el-card class="question-card" shadow="hover"
      style="width: 100; padding: 20px; border-radius: 12px; background-color: #f9f9f9;">
      <template #header>
        <h2>{{ questionsData.questionTitle }}</h2>
      </template>
      <p><strong>题目内容：</strong><br>
        <MarkdownContext :content="questionsData.questionContent"></MarkdownContext>
      </p>


      <!-- 答题框 -->
      <el-input v-model="prompt" type="textarea" placeholder="请输入你的答案" style="margin-top: 20px; width: 100%;" />

      <!-- 检查按钮 -->
      <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
        <el-button type="primary" @click="getAIAnswer()">检查答案</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.question-card {
  border: 1px solid #ebebeb;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.question-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}
</style>
