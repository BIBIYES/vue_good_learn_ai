<template>
  <div>
    <!-- 课程信息 -->
    <div class="course-info">
      <h2>
        
        编辑课程题目
      </h2>
      <div class="course-details">
        <div class="detail-item">
          <el-icon class="info-icon"><Memo /></el-icon>
          <strong>课程ID：</strong>
          <span>{{ courseId }}</span>
        </div>
        <div class="detail-item">
          <el-icon class="info-icon"><Document /></el-icon>
          <strong>课程名称：</strong>
          <span>{{ courseInfo.courseName }}</span>
        </div>
        <div class="detail-item">
          <el-icon class="info-icon"><Calendar /></el-icon>
          <strong>创建时间：</strong>
          <span>{{ courseInfo.courseCreatedDate }}</span>
        </div>
        <div class="detail-item">
          <el-icon class="info-icon"><Refresh /></el-icon>
          <strong>更新时间：</strong>
          <span>{{ courseInfo.courseUpdatedDate }}</span>
        </div>
      </div>
    </div>

    <!-- 表格头部，右上角放置添加按钮 -->
    <div class="table-header">
      <download-excel class="el-button" :data="questions.list" type="xlsx" name="filename.xlsx">
        <i class="el-icon">
          <img src="../../../assets/img/Excel.svg" style="height: 20px; margin-right: 10px;">
        </i>
        导出数据
      </download-excel>
      <el-button type="primary" :icon="Plus" @click="showAddDialog">添加新题目</el-button>
    </div>

    <!-- 表格显示题目列表 -->
    <el-table stripe :data="questions.list" style="width: 100%">
      <el-table-column prop="questionId" label="题目ID" width="120" />
      <el-table-column prop="questionTitle" label="题目标题" width="180" />
      <el-table-column prop="questionContent" label="题目内容" />
      <el-table-column prop="answer" label="参考答案" />
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button size="small" @click="editDialog(scope.row)">测试题目</el-button>
          <el-button size="small" @click="editDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="confirmDelete(scope.row.questionId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      background
      layout="total, prev, pager, next, sizes"
      :total="questions.total"
      :page-size="pageSize"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30, 50]"
      @size-change="handleSizeChange"
      @current-change="handlePageChange">
    </el-pagination>

    <!-- 添加题目的弹窗 -->
    <el-dialog title="添加题目" v-model="addDialogVisible">
      <el-form :model="newQuestion">
        <el-form-item label="题目标题">
          <el-input v-model="newQuestion.questionTitle" />
        </el-form-item>
        <el-form-item label="题目内容">
          <VMarkdownEditor v-model="newQuestion.questionContent" locale="zh" content="在这里输入题干，可以选用markdown语法" mode="dark" style="min-height: 500px;" />
        </el-form-item>
        <el-form-item label="参考答案">
          <el-input type="textarea" autosize placeholder="请输入内容" v-model="newQuestion.answer" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addQuestion">添加</el-button>
      </template>
      <BatchUploadQuestions :courseId="courseId" :userId ="userStore.id"></BatchUploadQuestions>
    </el-dialog>

    <!-- 编辑题目的弹窗 -->
    <el-dialog title="编辑题目" v-model="editDialogVisible">
      <el-form :model="editingQuestion">
        <el-form-item label="题目标题">
          <el-input v-model="editingQuestion.questionTitle" />
        </el-form-item>
        <el-form-item label="题目内容">
          <VMarkdownEditor v-model="editingQuestion.questionContent" locale="zh" content="在这里输入题干，可以选用markdown语法" mode="dark" style="min-height: 500px;" />
        </el-form-item>
        <el-form-item label="参考答案">
          <el-input type="textarea" autosize placeholder="请输入内容" v-model="editingQuestion.answer" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateQuestion">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>



<script setup lang="ts">
import { Plus,Memo,Document,Calendar,Refresh } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { createQuestion, deleteQuestionById, updateQuestion } from '@/api/questionApi'
import { selectQuestionsByCourseId, selectCourseById } from '@/api/courseApi'
import { useUserStore } from '@/stores/userStore'
import type { Course } from '@/models/CourseModel'
import { VMarkdownEditor } from 'vue3-markdown'
import 'vue3-markdown/dist/style.css'

// 获取路由参数中的课程ID
const route = useRoute()
const courseId = Number(route.params.courseId)

// 存储题目列表、总条数、当前页、每页条数
const questions = ref({
  list: [],
  total: 0
})
const currentPage = ref(1)  // 当前页
const pageSize = ref(10)    // 每页条数

// 获取用户状态
const userStore = useUserStore()

// 获取题目列表
const HandelSelectQuestionsByCourseId = async () => {
  try {
    const res = await selectQuestionsByCourseId(courseId, currentPage.value, pageSize.value)
    questions.value = {
      list: res.data.list || [],
      total: res.data.total || 0
    }
  } catch (error) {
    console.error('获取题目列表失败:', error)
  }
}

// 修改每页条数时的处理
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1  // 切换每页条数时，重置为第一页
  HandelSelectQuestionsByCourseId()
}

// 修改当前页时的处理
const handlePageChange = (newPage: number) => {
  currentPage.value = newPage
  HandelSelectQuestionsByCourseId()
}

// 课程信息
const courseInfo = ref<Course>({
  courseCreatedDate: '',
  courseId: 0,
  courseName: '',
  courseUpdatedDate: '',
  userId: 0
})

// 获取课程信息
const HandelselectCourseById = async () => {
  try {
    const res = await selectCourseById(courseId)
    courseInfo.value = res.data
  } catch (error) {
    console.error('获取课程信息失败:', error)
  }
}

// 页面加载时获取课程和题目列表
onMounted(() => {
  HandelselectCourseById()
  HandelSelectQuestionsByCourseId()
})

// 添加题目
const addDialogVisible = ref(false)
const newQuestion = ref({
  questionTitle: '',
  questionContent: '',
  courseId,
  userId: userStore.id,
  answer: ''
})
const showAddDialog = () => {
  newQuestion.value = { questionTitle: '', questionContent: '', courseId, userId: userStore.id, answer: '' }
  addDialogVisible.value = true
}
const addQuestion = async () => {
  if (!newQuestion.value.questionTitle || !newQuestion.value.questionContent) {
    ElMessage({ type: 'warning', message: '请填写完整的题目信息' })
    return
  }

  try {
    await createQuestion(courseId, newQuestion.value)
    ElMessage({ type: 'success', message: '题目添加成功' })
    await HandelSelectQuestionsByCourseId()
    addDialogVisible.value = false
  } catch (error) {
    ElMessage({ type: 'error', message: '题目添加失败' })
  }
}

// 编辑题目
const editDialogVisible = ref(false)
const editingQuestion = ref<any>({
  questionId: null,
  questionTitle: '',
  questionContent: '',
  answer: ''
})
const editDialog = (question: any) => {
  editingQuestion.value = { ...question }
  editDialogVisible.value = true
}
const handleUpdateQuestion = async () => {
  try {
    await updateQuestion(editingQuestion.value)
    ElMessage({ type: 'success', message: '题目更新成功' })
    await HandelSelectQuestionsByCourseId()
    editDialogVisible.value = false
  } catch (error) {
    ElMessage({ type: 'error', message: '题目更新失败' })
  }
}

// 删除题目
const confirmDelete = (questionId: number) => {
  ElMessageBox.confirm('你确定要删除这道题目吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteQuestionById(questionId)
        ElMessage({ type: 'success', message: '题目删除成功' })
        await HandelSelectQuestionsByCourseId()
      } catch (error) {
        ElMessage({ type: 'error', message: '题目删除失败' })
      }
    })
    .catch(() => {})
}
</script>

<style scoped>
.course-info {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #eee;
}

.course-info h2 {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.course-details {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.detail-item strong {
  font-weight: bold;
  color: #333;
}

.detail-item span {
  color: #000;
}

.info-icon {
  color: #3370ff;
  font-size: 18px;
}

/* 表格及按钮区域样式 */
.table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.el-table th,
.el-table td {
  text-align: center;
}
.el-table{
  border-radius: 10px;
}
.el-button {
  margin: 5px 5px;
}

.el-pagination {
  margin-top: 20px;
  text-align: center;
}

.el-dialog {
  min-width: 600px;
}

/* 添加阴影和边距，使卡片风格更加美观 */
.course-info,
.el-table,
.el-dialog__header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
