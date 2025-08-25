<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { FastGPT } from "@/utils/fastGPT";
import { batchAddQuestions } from "@/api/questionApi.ts";
import { ElMessage } from "element-plus";
import mammoth from "mammoth";
import {
  UploadFilled,
  Document,
  Delete,
  MagicStick,
  Plus,
  CircleClose,
  Check,
  EditPen,
} from "@element-plus/icons-vue";
// 编辑相关状态
import { reactive } from "vue";
const editDialogVisible = ref(false);
const editForm = reactive({ questionTitle: "", questionContent: "" });
let editIndex = -1;

function openEditDialog(index, row) {
  editIndex = index;
  editForm.questionTitle = row.questionTitle;
  editForm.questionContent = row.questionContent;
  editDialogVisible.value = true;
}
function saveEdit() {
  if (editIndex !== -1) {
    questions.value[editIndex].questionTitle = editForm.questionTitle;
    questions.value[editIndex].questionContent = editForm.questionContent;
    ElMessage.success("题目已更新");
  }
  editDialogVisible.value = false;
}

const mode = ref("input"); // "input" or "upload"
const prompt = ref("");
const questions = ref([]);
const loading = ref(false);
const aiStreamingContent = ref("");
const uploadRef = ref(null);
const fileList = ref([]); // 新增：文件列表状态
const route = useRoute();
const courseId = Number(route.params.courseId);
const userStore = useUserStore();

function handleModeChange(val) {
  if (val === "input") {
    prompt.value = "";
    // 切换到手写输入时清空文件列表
    fileList.value = [];
    if (uploadRef.value) {
      uploadRef.value.clearFiles();
    }
  } else if (val === "upload") {
    prompt.value = "";
  }
}

// 修复后的Word文件上传处理函数
async function handleWordUpload(file) {
  console.log("开始处理Word文件：", file.name);

  // 检查文件类型
  if (!file.name.endsWith(".docx")) {
    ElMessage.error("请选择.docx格式的Word文件");
    return false;
  }

  try {
    loading.value = true;
    ElMessage.info("正在解析Word文件，请稍候...");

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    console.log("文件读取成功，大小：", arrayBuffer.byteLength);

    // 使用mammoth解析Word文档
    const result = await mammoth.extractRawText({ arrayBuffer });
    console.log("mammoth解析结果：", result);

    if (result.value && result.value.trim()) {
      const extractedText = result.value.trim();

      // 如果已有内容，询问是否追加
      if (prompt.value.trim()) {
        prompt.value += "\n\n" + extractedText;
      } else {
        prompt.value = extractedText;
      }

      // 更新文件列表状态
      const fileInfo = {
        uid: Date.now(),
        name: file.name,
        status: "success",
        size: file.size,
        extractedLength: extractedText.length,
      };

      fileList.value.push(fileInfo);

      ElMessage.success(
        `Word文件解析成功！提取了 ${extractedText.length} 个字符`
      );
    } else {
      ElMessage.warning(
        "Word文件解析成功，但未找到文本内容，请检查文档是否包含文字"
      );

      // 添加失败状态的文件到列表
      const fileInfo = {
        uid: Date.now(),
        name: file.name,
        status: "error",
        size: file.size,
        error: "未找到文本内容",
      };
      fileList.value.push(fileInfo);
    }
  } catch (error) {
    console.error("Word文件处理失败:", error);
    ElMessage.error(`Word文件处理失败：${error.message || "未知错误"}`);

    // 添加失败状态的文件到列表
    const fileInfo = {
      uid: Date.now(),
      name: file.name,
      status: "error",
      size: file.size,
      error: error.message || "未知错误",
    };
    fileList.value.push(fileInfo);
  } finally {
    loading.value = false;
  }

  // 阻止Element Plus的默认上传行为
  return false;
}

// 文件选择变化时的处理
function handleFileChange(file, uploadFileList) {
  console.log("文件选择变化：", file, uploadFileList);
  if (file && file.raw) {
    handleWordUpload(file.raw);
  }
}

// 文件上传前的处理（用于拦截自动上传）
function beforeUpload(file) {
  console.log("before-upload钩子：", file);
  handleWordUpload(file);
  return false; // 阻止自动上传
}

// 新增：删除文件的处理函数
function handleRemoveFile(fileUid) {
  const fileIndex = fileList.value.findIndex((file) => file.uid === fileUid);
  if (fileIndex > -1) {
    const removedFile = fileList.value[fileIndex];
    fileList.value.splice(fileIndex, 1);

    // 如果删除的是成功解析的文件，需要从prompt中移除对应内容
    if (removedFile.status === "success") {
      // 这里可以根据需要实现更复杂的文本移除逻辑
      // 简单处理：如果只有一个文件，直接清空
      if (fileList.value.filter((f) => f.status === "success").length === 0) {
        prompt.value = "";
      }
    }

    ElMessage.info(`已删除文件：${removedFile.name}`);
  }
}

// 新增：清空所有文件
function clearAllFiles() {
  fileList.value = [];
  prompt.value = "";
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
  ElMessage.info("已清空所有文件");
}

// 新增：格式化文件大小
function formatFileSize(size) {
  if (size < 1024) {
    return size + " B";
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + " KB";
  } else {
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  }
}

const deleteQuestion = (index) => {
  questions.value.splice(index, 1);
};

const generateQuestions = async () => {
  if (!prompt.value.trim()) {
    ElMessage.warning("请先输入内容或上传Word文档");
    return;
  }

  const fastGPT = new FastGPT(
    "fastgpt-sR8pKOWHLwXVuEAHxCkeU1w6mTbc9T1ht9wpWEaOyy0fj9BoOx4bWC6A3kaQUOqz"
  );

  loading.value = true;
  let tempResponse = "";
  aiStreamingContent.value = "";

  // 根据模式选择不同的提示词
  let promptText =
    mode.value === "input"
      ? `请根据以下要求生成题目：${prompt.value}`
      : `请根据以下教案，识别知识点，生成符合知识点的题目，每个知识点一道题：${prompt.value}`;

  const params = {
    chatId: "1",
    variables: {},
    messages: [
      {
        role: "user",
        content: promptText,
      },
    ],
    onData: (response) => {
      try {
        if (response && response.choices && response.choices[0]) {
          if (response.choices[0].finish_reason === null) {
            const content = response.choices[0].delta.content || "";
            tempResponse += content;
            aiStreamingContent.value = content
              ? content[content.length - 1]
              : "";
          } else {
            try {
              let cleanResponse = tempResponse
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
              const parsedQuestions = JSON.parse(cleanResponse);
              if (!Array.isArray(parsedQuestions)) {
                throw new Error("解析结果不是数组");
              }
              questions.value = parsedQuestions;
              loading.value = false;
              aiStreamingContent.value = "";
              ElMessage.success(`成功生成 ${parsedQuestions.length} 道题目`);
            } catch (error) {
              console.error("解析AI返回的JSON失败:", error);
              loading.value = false;
              aiStreamingContent.value =
                "[AI返回内容解析失败，请检查输入要求或稍后重试]";
              ElMessage.error("AI返回内容解析失败");
            }
          }
        }
      } catch (error) {
        console.error("处理AI响应时出错:", error);
        loading.value = false;
        aiStreamingContent.value = "[AI响应处理异常]";
        ElMessage.error("AI响应处理异常");
      }
    },
  };

  try {
    tempResponse = "";
    await fastGPT.sendQuestion(params);
  } catch (error) {
    console.error("请求AI失败:", error);
    loading.value = false;
    aiStreamingContent.value = "[AI请求失败，请检查网络或稍后重试]";
    ElMessage.error("AI请求失败，请检查网络连接");
  }
};

const addToCourse = async () => {
  if (!questions.value.length) {
    ElMessage.warning("没有题目可添加");
    return;
  }

  const questionsToAdd = questions.value.map((question) => ({
    ...question,
    courseId: courseId,
    userId: userStore.id,
  }));

  try {
    loading.value = true;
    await batchAddQuestions(courseId, questionsToAdd);
    questions.value = [];
    ElMessage.success("题目已成功添加到课程中");
  } catch (error) {
    console.error("添加题目失败:", error);
    ElMessage.error("添加题目失败，请重试");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container w-full max-h-[80vh] overflow-auto">
    <div class="bg-base-100">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-gray-700 mb-2">
          <el-icon class="mr-1"><MagicStick /></el-icon>
          题目生成器
          <span class="text-xs text-gray-400">(需要内网环境下使用)</span>
        </h2>

        <el-radio-group v-model="mode" class="mb-4" @change="handleModeChange">
          <el-radio-button value="input">手写输入</el-radio-button>
          <el-radio-button value="upload">上传Word</el-radio-button>
        </el-radio-group>

        <div v-if="mode === 'input'">
          <el-input
            v-model="prompt"
            type="textarea"
            :rows="6"
            placeholder="请输入你的出题要求，例如：我需要一些考察学生有关于MySQL数据库查询语句的题目"
            :disabled="loading"
          />
        </div>

        <div v-else>
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            :show-file-list="false"
            :auto-upload="false"
            :before-upload="beforeUpload"
            :on-change="handleFileChange"
            accept=".docx"
            :disabled="loading"
            drag
          >
            <div class="el-upload__text">
              <el-icon class="el-upload__icon"><UploadFilled /></el-icon>
              <div>将Word文件拖拽到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip">仅支持 .docx 格式文件</div>
            </div>
          </el-upload>

          <!-- 新增：文件列表显示 -->
          <div v-if="fileList.length > 0" class="file-list mt-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-gray-700">
                已上传文件 ({{ fileList.length }})
              </h3>
              <el-button
                size="small"
                type="danger"
                text
                @click="clearAllFiles"
                :disabled="loading"
              >
                <el-icon class="mr-1"><CircleClose /></el-icon>
                清空所有
              </el-button>
            </div>

            <div class="space-y-2">
              <div
                v-for="file in fileList"
                :key="file.uid"
                class="file-item flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                :class="{
                  'border-green-200 bg-green-50': file.status === 'success',
                  'border-red-200 bg-red-50': file.status === 'error',
                }"
              >
                <div class="flex items-center flex-1 min-w-0">
                  <el-icon
                    class="mr-2 flex-shrink-0"
                    :color="file.status === 'success' ? '#67C23A' : '#F56C6C'"
                  >
                    <Document />
                  </el-icon>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-gray-900 truncate">
                        {{ file.name }}
                      </span>
                      <span class="text-xs text-gray-500">
                        {{ formatFileSize(file.size) }}
                      </span>
                    </div>

                    <div class="text-xs mt-1">
                      <span
                        v-if="file.status === 'success'"
                        class="text-green-600"
                      >
                        解析成功 · 提取 {{ file.extractedLength }} 字符
                      </span>
                      <span v-else class="text-red-600">
                        解析失败 · {{ file.error }}
                      </span>
                    </div>
                  </div>
                </div>

                <el-button
                  size="small"
                  type="danger"
                  text
                  :icon="Delete"
                  @click="handleRemoveFile(file.uid)"
                  :disabled="loading"
                  class="ml-2 flex-shrink-0"
                >
                  <el-icon class="mr-1"><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>

          <!-- 显示合并后的文本内容预览 -->
          <!-- <div v-if="prompt.trim() && fileList.length > 0" class="mt-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">
              提取内容预览 ({{ prompt.length }} 字符)
            </h3>
            <el-input
              v-model="prompt"
              type="textarea"
              :rows="4"
              readonly
              class="text-content-preview"
            />
          </div> -->
        </div>

        <div class="card-actions justify-end mt-4">
          <el-button
            type="success"
            @click="generateQuestions"
            :loading="loading"
            :disabled="!prompt.trim()"
          >
            <el-icon class="mr-1"><MagicStick /></el-icon>
            {{ loading ? "生成中..." : "生成题目" }}
          </el-button>
        </div>

        <!-- AI流式内容实时打印 -->
        <div v-if="aiStreamingContent" class="mt-6">
          <div class="text-sm text-gray-500 mb-2">AI正在生成中...</div>
          <div
            class="font-mono text-base font-semibold streaming-blue-gradient"
          >
            {{ aiStreamingContent
            }}<span v-if="loading" class="animate-pulse">▋</span>
          </div>
          <!-- 新增：蓝色渐变进度条 -->
          <div v-if="loading" class="progress-bar-gradient mt-2">
            <div class="progress-bar-gradient-inner"></div>
          </div>
        </div>

        <!-- 结果区域 -->
        <div
          class="animate__animated animate__fadeIn mt-6"
          v-if="questions.length > 0"
        >
          <div class="divider text-gray-400">
            生成结果 (共 {{ questions.length }} 道题目)
          </div>

          <el-table
            :data="questions"
            style="width: 100%"
            border
            stripe
            :loading="loading"
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column
              prop="questionTitle"
              label="题目标题"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              prop="questionContent"
              label="题目内容"
              min-width="220"
              show-overflow-tooltip
            />
            <el-table-column label="操作" width="160">
              <template #default="scope">
                <el-button
                  size="small"
                  type="primary"
                  @click="openEditDialog(scope.$index, scope.row)"
                  :disabled="loading"
                  class="mr-1"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="deleteQuestion(scope.$index)"
                  :disabled="loading"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="flex justify-end mt-4 gap-2">
            <el-button @click="questions = []" :disabled="loading">
              <el-icon class="mr-1"><CircleClose /></el-icon>
              清空所有
            </el-button>
            <el-button
              type="primary"
              @click="addToCourse"
              :disabled="!questions.length || loading"
              :loading="loading"
            >
              <el-icon class="mr-1"><Plus /></el-icon>
              添加到当前课程中
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 编辑题目模态框 -->
  <el-dialog
    v-model="editDialogVisible"
    title="编辑题目"
    width="500px"
    align-center
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form :model="editForm" label-width="80px">
      <el-form-item label="题目标题">
        <el-input v-model="editForm.questionTitle" />
      </el-form-item>
      <el-form-item label="题目内容">
        <el-input
          v-model="editForm.questionContent"
          type="textarea"
          :rows="4"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveEdit">保存</el-button>
    </template>
  </el-dialog>
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

.streaming-gradient {
  background: linear-gradient(
    90deg,
    #ff6a00,
    #ffb347,
    #43e97b,
    #38f9d7,
    #008cff,
    #6a82fb,
    #fc5c7d,
    #ff6a00
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-move 2s linear infinite;
}

@keyframes gradient-move {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.el-upload__text {
  text-align: center;
}

.el-upload__tip {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}

.upload-demo {
  margin-bottom: 16px;
}

/* 拖拽区域样式 */
.el-upload--drag {
  width: 100%;
  height: 120px;
  border: 2px dashed #d3d3d3;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.el-upload--drag:hover {
  border-color: #409eff;
}

.el-upload--drag.is-dragover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

/* 新增：文件列表样式 */
.file-list {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  background-color: #fafafa;
}

.file-item {
  transition: all 0.2s ease;
}

.file-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.text-content-preview .el-textarea__inner {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  color: #6c757d;
}

.streaming-blue-gradient {
  background: linear-gradient(90deg, #00c6ff, #0072ff, #00c6ff 80%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: blue-gradient-move 2s linear infinite;
}

@keyframes blue-gradient-move {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.progress-bar-gradient {
  width: 100%;
  height: 6px;
  background: #e3f0ff;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}
.progress-bar-gradient-inner {
  height: 100%;
  width: 60%;
  background: linear-gradient(90deg, #00c6ff, #0072ff, #00c6ff 80%);
  border-radius: 3px;
  animation: progress-bar-move 1.2s linear infinite;
}
@keyframes progress-bar-move {
  0% {
    margin-left: -60%;
  }
  100% {
    margin-left: 100%;
  }
}
</style>
