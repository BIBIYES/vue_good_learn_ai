<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { FastGPT } from "@/utils/fastGPT";
import { batchAddQuestions } from "@/api/questionApi.ts";
import { ElMessage } from "element-plus";
import "animate.css";
const prompt = ref(""); // 存储用户输入的提示文本
const questions = ref([]); // 存储生成的题目列表
const loading = ref(false); // 控制加载状态
const route = useRoute();
const courseId = Number(route.params.courseId); // 获取当前课程ID
const userStore = useUserStore(); // 获取用户状态管理
// 删除指定索引的题目
const deleteQuestion = (index) => {
  questions.value.splice(index, 1);
};

// 生成题目的主要函数
const generateQuestions = async () => {
  if (!prompt.value.trim()) return;
  console.log("当前课程" + courseId);

  // 初始化FastGPT实例
  const fastGPT = new FastGPT(
    "fastgpt-sR8pKOWHLwXVuEAHxCkeU1w6mTbc9T1ht9wpWEaOyy0fj9BoOx4bWC6A3kaQUOqz"
  );

  loading.value = true;
  let tempResponse = ""; // 用于累积完整的响应
  // 设置请求参数
  const params = {
    chatId: "1",
    variables: {},
    messages: [
      {
        role: "user",
        content: `请根据以下要求生成题目：${prompt.value}`,
      },
    ],
    // 处理流式响应数据
    onData: (response) => {
      try {
        if (response && response.choices && response.choices[0]) {
          if (response.choices[0].finish_reason === null) {
            // 累积响应内容
            const content = response.choices[0].delta.content || "";
            tempResponse += content;
          } else {
            // 流式响应结束，处理完整响应
            try {
              // 清理markdown标记
              let cleanResponse = tempResponse
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();

              // 解析JSON数据
              const parsedQuestions = JSON.parse(cleanResponse);

              // 验证解析结果
              if (!Array.isArray(parsedQuestions)) {
                throw new Error("解析结果不是数组");
              }

              // 更新题目数组
              questions.value = parsedQuestions;
              loading.value = false;
            } catch (error) {
              console.error("解析AI返回的JSON失败:", error);
              console.log("原始响应:", tempResponse);
              loading.value = false;
            }
          }
        }
      } catch (error) {
        console.error("处理AI响应时出错:", error);
        loading.value = false;
      }
    },
  };

  try {
    tempResponse = ""; // 重置临时响应
    await fastGPT.sendQuestion(params);
  } catch (error) {
    console.error("请求AI失败:", error);
    loading.value = false;
  }
};

// 批量添加题目到当前课程
const addToCourse = async () => {
  if (!questions.value.length) return;

  // 准备要提交的题目数据，为每个题目添加courseId和userId
  const questionsToAdd = questions.value.map((question) => ({
    ...question,
    courseId: courseId,
    userId: userStore.id,
  }));

  try {
    // 调用批量添加题目的API
    await batchAddQuestions(courseId, questionsToAdd);
    // 清空本地题目列表
    questions.value = [];
    // 显示成功提示
    ElMessage.success("题目已成功添加到课程中");
  } catch (error) {
    console.error("添加题目失败:", error);
    ElMessage.error("添加题目失败，请重试");
  }
};
</script>

<template>
  <div class="container mx-auto p-4 max-w-3xl">
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-gray-700">题目生成器<span class="text-red-300">（需内网环境）</span></h2>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text text-lg text-gray-600">出题要求</span>
          </label>
          <textarea
            v-model="prompt"
            class="textarea textarea-bordered h-32 w-full"
            :class="{ 'skeleton bg-gray-50': loading }"
            placeholder="请输入你的出题要求，例如：给我出3道简答题，考察学生数据库查询的SQL语句"
          ></textarea>
        </div>

        <div class="card-actions justify-end mt-4">
          <button class="btn" @click="generateQuestions()">
            <span v-if="loading" class="loading loading-spinner"></span>
            生成题目
          </button>
        </div>

        <!-- Results section -->
        <div
          class="animate__animated animate__fadeIn mt-6"
          v-if="questions.length > 0"
        >
          <div class="divider text-gray-400">生成结果</div>
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="w-16 text-gray-600">序号</th>
                  <th class="w-1/3 text-gray-600">题目标题</th>
                  <th class="text-gray-600">题目内容</th>
                  <th class="w-24 text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(question, index) in questions"
                  :key="index"
                  class="hover:bg-gray-50 border-b"
                >
                  <td class="text-center text-gray-600">{{ index + 1 }}</td>
                  <td class="text-gray-700">{{ question.questionTitle }}</td>
                  <td class="text-gray-700">{{ question.questionContent }}</td>
                  <td>
                    <button
                      @click="deleteQuestion(index)"
                      class="btn btn-ghost btn-sm text-gray-500 hover:text-red-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end mt-4 gap-2">
            <button
              @click="addToCourse"
              class="btn bg-gray-100 hover:bg-gray-200 text-gray-600"
              :disabled="!questions.length"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 30V24"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M6 30H24H42V42H6V30Z"
                  fill="none"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="6"
                  y1="12.5"
                  x2="6"
                  y2="11.5"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="6"
                  y1="18"
                  x2="6"
                  y2="17"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="6"
                  y1="7"
                  x2="6"
                  y2="6"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="42"
                  y1="12.5"
                  x2="42"
                  y2="11.5"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="42"
                  y1="18"
                  x2="42"
                  y2="17"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="42"
                  y1="7"
                  x2="42"
                  y2="6"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="42"
                  y1="18"
                  x2="41"
                  y2="18"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="7"
                  y1="18"
                  x2="6"
                  y2="18"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="7"
                  y1="6"
                  x2="6"
                  y2="6"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="14"
                  y1="6"
                  x2="13"
                  y2="6"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="21"
                  y1="6"
                  x2="20"
                  y2="6"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="21"
                  y1="18"
                  x2="20"
                  y2="18"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="28"
                  y1="6"
                  x2="27"
                  y2="6"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="14"
                  y1="18"
                  x2="13"
                  y2="18"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="28"
                  y1="18"
                  x2="27"
                  y2="18"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="35"
                  y1="6"
                  x2="34"
                  y2="6"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="35"
                  y1="18"
                  x2="34"
                  y2="18"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="42"
                  y1="6"
                  x2="41"
                  y2="6"
                  stroke="#333"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              添加到当前课程中
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out;
  background-color: #fff;
}

.card:hover {
  transform: translateY(-2px);
}

.textarea:focus {
  border-color: #4b5563;
  box-shadow: 0 0 0 2px rgba(75, 85, 99, 0.2);
}

.divider {
  margin: 1.5rem 0;
}

.table {
  background-color: #fff;
  border-collapse: collapse;
}

.table th {
  font-weight: 600;
  padding: 0.75rem;
}

.table td {
  padding: 0.75rem;
}

.btn {
  transition: all 0.2s ease-in-out;
}
</style>
