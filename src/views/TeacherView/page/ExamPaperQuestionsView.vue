<script setup>
import { Edit } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import { selectExamPaperById } from '@/api/examPaperApi'
import { selectCoursesByUserId } from '@/api/userApi'
import { selectCourseByIdSearch } from '@/api/courseApi'
import {
  selectExamPaperQuestionsByExamPaperId,
  updateExamPaperQuestions
} from '@/api/examPaperQuestionApi'
import { onMounted, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { messageTools } from '@/utils/messageTools'
import {Notebook ,Calendar,Document} from '@element-plus/icons-vue'

const router = useRoute()
const userStore = useUserStore()
// 用户id
const userId = userStore.id
// 试卷id
const examPaperId = router.params.examPaperId

// 试卷信息
const examPaper = ref({
  examPaperId: null,
  examPaperName: '',
  examPaperCreatedDate: '',
  examPaperUpdatedDate: ''
})

const handelSelectExamPaperById = async () => {
  try {
    const res = await selectExamPaperById(examPaperId)
    if (res && res.data) {
      examPaper.value = res.data
    } else {
      console.error('Failed to load exam paper data:', res)
      ElMessage.error('Failed to load exam paper data')
    }
  } catch (error) {
    console.error('Error loading exam paper:', error)
    ElMessage.error('Error loading exam paper')
  }
}

// 试卷中已关联的题目
const examPaperQuestions = ref([])
// 用于缓存所有选中的题目，包括用户在不同课程中选择的题目
const questionCache = ref([])

// 获取试卷中已经关联的题目
const handelSelectExamPaperQuestionsByExamPaperId = async () => {
  try {
    const res = await selectExamPaperQuestionsByExamPaperId(examPaperId)
    examPaperQuestions.value = res.data
    // 将已经关联的题目加入缓存
    questionCache.value = res.data.map((question) => ({
      questionId: question.questionId,
      questionTitle: question.questionTitle,
      courseId: question.courseId
    }))
  } catch (error) {
    console.error('Error loading exam paper questions:', error)
    ElMessage.error('Failed to load exam paper questions')
  }
}

// 题目编辑区对话框
const dialogTableVisible = ref(false)
const HandelDialogTableVisible = () => {
  dialogTableVisible.value = !dialogTableVisible.value
  if (dialogTableVisible.value) {
    handelSelectCoursesByUserId() // 加载所有课程
  }
}

// 获取用户所有的课程
const coursesList = ref([])
const handelSelectCoursesByUserId = async () => {
  try {
    const res = await selectCoursesByUserId(userId)
    coursesList.value = res.data
  } catch (error) {
    console.error('Error loading courses:', error)
    ElMessage.error('Failed to load courses')
  }
}

const keyWord = ref('')
const courseId = ref(null)
// 当前查看的课程ID
const currentCourseId = ref(null)

// 获取课程中的题目
const questionsList = ref([])
// 搜索触发
const handelSelectQuestionsByCourseIdSearch = async () => {

  
    currentCourseId.value = courseId
    const res = await selectCourseByIdSearch(courseId.value, keyWord.value)
    questionsList.value = res.data
    if(res.code === 200){
      messageTools.successMessage(res.msg)
    }
    else{
      messageTools.warningMessage(res.msg)
    }
    await nextTick()
    setSelectedRows()

 
}

const handelSelectQuestionsByCourseId = async (id) => {
  courseId.value = id
  try {
    currentCourseId.value = courseId
    const res = await selectCourseByIdSearch(courseId.value, keyWord.value)
    questionsList.value = res.data
    await nextTick()
    setSelectedRows()
  } catch (error) {
    console.error('Error loading questions:', error)
    ElMessage.error('Failed to load questions')
  }
}

// 处理表格中的题目选中变化
const handleSelectionChange = (selection) => {
  console.log('Selection changed:', selection)

  if (!Array.isArray(selection)) {
    console.error('Invalid selection:', selection)
    return
  }

  // 移除当前课程未选中的题目
  questionCache.value = questionCache.value.filter(
    (question) => question.courseId !== currentCourseId.value
  )

  // 添加当前课程选中的题目
  const selectedWithCourse = selection.map((question) => ({
    questionId: question.questionId,
    questionTitle: question.questionTitle,
    courseId: currentCourseId.value
  }))
  questionCache.value = [...questionCache.value, ...selectedWithCourse]
}

// 提交选中的题目到后端
const submitQuestions = async () => {
  try {
    const selectedQuestionIds = questionCache.value.map(
      (question) => question.questionId
    )
    const res = await updateExamPaperQuestions(examPaperId, selectedQuestionIds)
    if (res.code === 200) {
      ElMessage.success('试卷题目关联更新成功')
      dialogTableVisible.value = false // 关闭对话框
      await handelSelectExamPaperQuestionsByExamPaperId() // 重新加载试卷题目
    } else {
      ElMessage.error('试卷题目关联更新失败')
    }
  } catch (error) {
    console.error('Error submitting questions:', error)
    ElMessage.error('提交失败，请稍后重试')
  }
}

// 确保在切换课程后，重新选中已经缓存的题目
const setSelectedRows = () => {
  if (multipleTableRef.value) {
    questionCache.value.forEach((cachedQuestion) => {
      const row = questionsList.value.find(
        (q) => q.questionId === cachedQuestion.questionId
      )
      if (row) {
        multipleTableRef.value.toggleRowSelection(row, true)
      }
    })
  } else {
    console.error('multipleTableRef is not available')
  }
}

const multipleTableRef = ref()

onMounted(async () => {
  await handelSelectExamPaperById()
  await handelSelectExamPaperQuestionsByExamPaperId()
})
</script>

<template>
  <div class="app" v-if="examPaper.examPaperId">
    <!-- 试卷信息展示 -->
    <div class="exam-paper-container">
      <h2>
      试卷信息
      </h2>
      <div class="exam-paper-details">
        <div class="detail-item">
          <el-icon :size="18"><Notebook /></el-icon>
          <span><strong>试卷ID: </strong>{{ examPaper.examPaperId }}</span>
        </div>
        <div class="detail-item">
          <el-icon :size="18"><Document /></el-icon>
          <span><strong>试卷名称：</strong>{{ examPaper.examPaperName }}</span>
        </div>
        <div class="detail-item">
          <el-icon :size="18"><Calendar /></el-icon>
          <span><strong>创建时间：</strong>{{ examPaper.examPaperCreatedDate }}</span>
        </div>
        <div class="detail-item">
          <el-icon :size="18"><Calendar /></el-icon>
          <span><strong>更新时间：</strong>{{ examPaper.examPaperUpdatedDate }}</span>
        </div>
      </div>
    </div>

    <!-- 编辑按钮 -->
    <div class="controller-box">
      <el-button type="primary" :icon="Edit" @click="HandelDialogTableVisible()">
        编辑试卷
      </el-button>
    </div>

    <!-- 已关联题目列表 -->
    <div class="exam-paper-questions" v-if="examPaperQuestions.length > 0">
      <h3>试卷题目列表</h3>
      <!-- 使用 el-table 来渲染题目 -->
      <el-table :data="examPaperQuestions" style="width: 100%">
        <el-table-column label="题目ID" prop="questionId" width="120"></el-table-column>
        <el-table-column label="题目标题" prop="questionTitle"></el-table-column>
        <el-table-column label="题干" prop="questionContent"></el-table-column>
        <el-table-column label="答案" prop="answer"></el-table-column>
        <el-table-column label="创建日期" prop="questionCreatedDate"></el-table-column>
      </el-table>
    </div>

    <!-- 题目选择对话框 -->
    <el-dialog v-model="dialogTableVisible" title="选择课程来为试卷添加题目" width="1500px">
      <div class="content">
        <div class="course-box">
          <!-- 课程列表 -->
          <div class="course-item" v-for="(course, index) in coursesList" :key="index"
            @click="handelSelectQuestionsByCourseId(course.courseId)">
            {{ course.courseName }}
          </div>
        </div>
        <div class="questions-box">
          <!-- 题目列表多选表格 -->
          <el-table ref="multipleTableRef" :data="questionsList" style="width: 100%" @select="handleSelectionChange"
            @select-all="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column label="题目ID" width="120">
              <template #default="scope">{{ scope.row.questionId }}</template>
            </el-table-column>
            <el-table-column label="题目标题" width="120" property="questionTitle" />
            <el-table-column label="题干" property="questionContent" />
            <el-table-column label="题目创建日期" property="questionCreatedDate" />
            <el-table-column align="right">
              <template #header>
                <el-input v-model="keyWord" @keyup.enter="handelSelectQuestionsByCourseIdSearch"  placeholder="输入标题按下回车来搜索" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!-- 提交按钮 -->
      <template #footer>
        <el-button type="primary" @click="submitQuestions"> 提交 </el-button>
      </template>
    </el-dialog>
  </div>
  <div v-else>
    <p>Loading exam paper information...</p>
  </div>
</template>


<style lang="less" scoped>
/* 试卷信息的样式 */
.exam-paper-container {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.exam-paper-details {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

.detail-item el-icon {
  color: #409eff;
}

.exam-paper-details span {
  font-size: 16px;
}

.exam-paper-details strong {
  font-weight: bold;
  color: #333;
}

/* 控制编辑按钮的上下间距 */
.controller-box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 20px;
  margin-top: 20px; /* 顶部间距调整 */
  margin-bottom: 20px; /* 底部间距调整，确保与表格之间的间距 */
}

/* 试卷题目列表的样式 */
.exam-paper-questions {
  margin-top: 30px;
}

.exam-paper-questions h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.el-icon {
  color: #3370ff;
  font-size: 18px;
}

.el-button--primary {
  background-color: rgba(51, 112, 255);
}

.el-button {
  border-radius: 8px;
}

.content {
  width: 100%;
  display: flex;
  justify-content: space-between;

  .course-box {
    width: 30%;
    height: 500px;
    display: flex;
    flex-direction: column;

    .course-item {
      width: 100%;
      height: 50px;
      line-height: 50px;
      text-align: center;
      background-color: #f9f9f9;
      border-radius: 10px;
      margin-bottom: 10px;
      transition: all 0.3s ease;

      &:hover {
        background-color: rgb(181, 181, 181);
      }
    }
  }

  .questions-box {
    width: 65%;
    height: 600px;
    overflow-y: auto;
  }
}
</style>
