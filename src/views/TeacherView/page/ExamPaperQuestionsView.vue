<script setup>
import { Edit } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import { selectExamPaperById, getExamPaperUserStatus } from '@/api/examPaperApi'
import { selectCoursesByUserId } from '@/api/userApi'
import { selectCourseByIdSearch } from '@/api/courseApi'
import {
  selectExamPaperQuestionsByExamPaperId,
  updateExamPaperQuestions
} from '@/api/examPaperQuestionApi'
import { onMounted, ref, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { messageTools } from '@/utils/messageTools'
import { Notebook, Calendar, Document, View } from '@element-plus/icons-vue'


const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
// 用户id
const userId = userStore.id
// 试卷id
const examPaperId = parseInt(route.params.examPaperId)

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
const HandelDialogTableVisible = async () => {
  dialogTableVisible.value = !dialogTableVisible.value
  if (dialogTableVisible.value) {
    document.body.style.overflow = 'hidden'
    // 加载课程列表
    await handelSelectCoursesByUserId()
    // 如果有课程，自动加载第一个课程的题目
    if (coursesList.value.length > 0) {
      await handelSelectQuestionsByCourseId(coursesList.value[0].courseId)
    }
  } else {
    document.body.style.overflow = 'auto'
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
  if (!currentCourseId.value) {
    messageTools.warningMessage('请先选择一个课程')
    return
  }

  try {
    const res = await selectCourseByIdSearch(currentCourseId.value, keyWord.value)
    questionsList.value = res.data
    if (res.code === 200) {
      messageTools.successMessage(res.msg)
    } else {
      messageTools.warningMessage(res.msg)
    }
    await nextTick()
    setSelectedRows()
  } catch (error) {
    console.error('Error searching questions:', error)
    messageTools.errorMessage('搜索失败，请重试')
  }
}

const handelSelectQuestionsByCourseId = async (id) => {
  courseId.value = id
  try {
    currentCourseId.value = id
    const res = await selectCourseByIdSearch(id, keyWord.value)
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
  if (!Array.isArray(selection)) {
    console.error('Invalid selection:', selection)
    return
  }

  // 更新当前课程的选中状态
  const selectedWithCourse = selection.map((question) => ({
    questionId: question.questionId,
    questionTitle: question.questionTitle,
    courseId: currentCourseId.value
  }))

  // 更新缓存：保留其他课程的选中状态，更新当前课程的选中状态
  questionCache.value = [
    ...questionCache.value.filter(q => q.courseId !== currentCourseId.value),
    ...selectedWithCourse
  ]

  console.log('Updated question cache:', questionCache.value)
}

// 提交选中的题目到后端
const submitQuestions = async () => {
  try {
    // 去重处理
    const uniqueQuestionIds = [...new Set(questionCache.value.map(q => q.questionId))]
    
    // 显示确认对话框
    ElMessageBox.confirm(
      uniqueQuestionIds.length === 0 
        ? '确定要清空试卷中的所有题目吗？' 
        : `确定要更新试卷题目吗？当前选中 ${uniqueQuestionIds.length} 道题目。`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: uniqueQuestionIds.length === 0 ? 'warning' : 'info'
      }
    ).then(async () => {
      const res = await updateExamPaperQuestions(examPaperId, uniqueQuestionIds)
      if (res.code === 200) {
        messageTools.successMessage(
          uniqueQuestionIds.length === 0 
            ? '已清空试卷所有题目' 
            : '试卷题目关联更新成功'
        )
        dialogTableVisible.value = false // 关闭对话框
        await handelSelectExamPaperQuestionsByExamPaperId() // 重新加载试卷题目
      } else {
        messageTools.errorMessage('操作失败：' + res.msg)
      }
    }).catch(() => {
      messageTools.infoMessage('已取消操作')
    })
  } catch (error) {
    console.error('Error submitting questions:', error)
    messageTools.errorMessage('交失败，请稍后重试')
  }
}

// 确保在切换课程后，重新选中已经缓存的题目
const setSelectedRows = () => {
  if (!multipleTableRef.value) return

  // 清除当前表格的所有选中状态
  multipleTableRef.value.clearSelection()

  // 获取当前课程在缓存中的题目
  const currentCourseQuestions = questionCache.value.filter(
    q => q.courseId === currentCourseId.value
  )

  // 遍历当前表格中的每一行，检查是否应该被选中
  questionsList.value.forEach(question => {
    if (currentCourseQuestions.some(q => q.questionId === question.questionId)) {
      multipleTableRef.value.toggleRowSelection(question, true)
    }
  })
}
// 存放当前试卷用户提交状态
const examPaperUserStatus = ref([])
// 获取当前试卷用户的状态
const handelGetExamPaperUserStatus = () => {
  getExamPaperUserStatus(examPaperId).then((res) => {
    examPaperUserStatus.value = res.data
  })
}

// 计算试卷完成属性
const completionStatus = computed(() => {
  if (examPaperUserStatus.value.length === 0) {
    return 0
  }
  const sum = examPaperUserStatus.value.length
  const completed = examPaperUserStatus.value.filter(item => item.status === "已完成").length
  return parseFloat(((completed / sum) * 100).toFixed(2))
})

// 过滤器
const filteredExamPaperUserStatus = computed(() => {
  // 如果没有��滤器生效，则返回所有数据
  if (!selectedStatusFilter.value) {
    return examPaperUserStatus.value
  }
  // 则返回匹配的状态数据
  return examPaperUserStatus.value.filter(
    (user) => user.status === selectedStatusFilter.value
  )
})

// 当前过滤器的状态
const selectedStatusFilter = ref(null)

// 过滤状态方法
const filterStatus = (value, row) => {
  if (value) {
    selectedStatusFilter.value = value
  } else {
    selectedStatusFilter.value = null
  }
  return row.status === value
}
// 侧边栏显示控制
const drawer = ref(false)
const multipleTableRef = ref()
const navigateToDetails = (userId, examPaperId) => {
  console.log(userId, examPaperId)
  router.push(`/check-page/${userId}/${examPaperId}`)

}

// 修改分页相关的数据
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性：当前页的数据
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return examPaperQuestions.value.slice(start, end)
})

// 计算总页数
const total = computed(() => examPaperQuestions.value.length)

// 处理页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 处理每页显示数量改变
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
}

onMounted(async () => {
  await handelSelectExamPaperById()
  await handelSelectExamPaperQuestionsByExamPaperId()
  await handelGetExamPaperUserStatus()
})
</script>

<template>
  <div class="app" v-if="examPaper.examPaperId">
    <!-- 试卷信息展示 -->
    <div class="exam-paper-container">
      <h2>
        试卷信息
      </h2>
      <div class="demo-progress">
        <el-progress :percentage="completionStatus" :indeterminate="true" color="#3370ff"><span>{{ completionStatus }}
            完成率</span></el-progress>
      </div>
      <div class="exam-paper-details">
        <div class="detail-item">
          <el-icon :size="18">
            <Notebook />
          </el-icon>
          <span><strong>试卷ID: </strong>{{ examPaper.examPaperId }}</span>
        </div>
        <div class="detail-item">
          <el-icon :size="18">
            <Document />
          </el-icon>
          <span><strong>试卷名称：</strong>{{ examPaper.examPaperName }}</span>
        </div>
        <div class="detail-item">
          <el-icon :size="18">
            <Calendar />
          </el-icon>
          <span><strong>创建时间：</strong>{{ examPaper.examPaperCreatedDate }}</span>
        </div>
        <div class="detail-item">
          <el-icon :size="18">
            <Calendar />
          </el-icon>
          <span><strong>更新时间：</strong>{{ examPaper.examPaperUpdatedDate }}</span>
        </div>
      </div>
    </div>

    <!-- 编辑按钮 -->
    <div class="controller-box">
      <!-- 侧边栏 -->
      <el-drawer v-model="drawer" title="完成情况详情" size="30%">
        <el-table :data="filteredExamPaperUserStatus" stripe style="width: 100%" height="100%">
          <el-table-column label="姓名" width="180">
            <template v-slot="scope">
              <el-button @click="navigateToDetails(scope.row.userId, examPaperId)">
                {{ scope.row.username }}
              </el-button>
            </template>
          </el-table-column>

          <el-table-column prop="joinDate" label="加入时间" width="180" />

          <el-table-column prop="status" label="状态" :filters="[
            { text: '已完成', value: '已完成' },
            { text: '未完成', value: '未完成' }
          ]" :filter-method="filterStatus">
            <template v-slot="scope">
              <el-tag :type="scope.row.status === '已完成' ? 'success' : 'danger'">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

      </el-drawer>

      <el-button style="margin-left: 16px" @click="drawer = true" :icon="View">
        查看完成情况
      </el-button>
      <el-button type="primary" :icon="Edit" @click="HandelDialogTableVisible()">
        编辑试卷
      </el-button>

    </div>

    <!-- 已关联题目列表 -->
    <div class="exam-paper-questions" v-if="examPaperQuestions.length > 0">
      <h3>试卷题目列表</h3>
      <el-table 
        :data="paginatedQuestions" 
        style="width: 100%"
        :cell-style="{ padding: '5px 0' }"
        :row-style="{ height: '50px' }"
      >
        <el-table-column label="题目ID" prop="questionId" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column label="题目标题" prop="questionTitle" show-overflow-tooltip></el-table-column>
        <el-table-column label="题干" prop="questionContent" show-overflow-tooltip></el-table-column>
        <el-table-column label="答案" prop="answer" show-overflow-tooltip></el-table-column>
        <el-table-column label="创建日期" prop="questionCreatedDate" width="180"></el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>

    <!-- 题目选择对话框 -->
    <el-dialog v-model="dialogTableVisible" title="选择课程来为试卷添加题目" width="1500px">
      <div class="content">
        <div class="course-box">
          <!-- 课程列表 -->
          <div class="course-item" v-for="(course, index) in coursesList" :key="index"
            :class="{ 'active': currentCourseId === course.courseId }"
            @click="handelSelectQuestionsByCourseId(course.courseId)">
            {{ course.courseName }}
          </div>
        </div>
        <div class="questions-box">
          <el-table 
            ref="multipleTableRef" 
            :data="questionsList" 
            style="width: 100%" 
            @select="handleSelectionChange"
            @select-all="handleSelectionChange"
            :cell-style="{ padding: '5px 0' }"
            :row-style="{ height: '30px' }"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column label="题目ID" width="120">
              <template #default="scope">{{ scope.row.questionId }}</template>
            </el-table-column>
            <el-table-column label="题目标题" width="120" property="questionTitle" show-overflow-tooltip />
            <el-table-column label="题干" property="questionContent" show-overflow-tooltip />
            <el-table-column label="题目创建日期" property="questionCreatedDate" width="180" />
            <el-table-column align="right">
              <template #header>
                <el-input v-model="keyWord" @keyup.enter="handelSelectQuestionsByCourseIdSearch"
                  placeholder="输入标题按下回车来搜索" />
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
.app{
  width: 100%;
  height: 100%;
}
/* 试卷信息的样式 */
.demo-progress {
  width: 400px;
}

.exam-paper-container {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
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
  /* 顶部间距调整 */
  /* 底部间距调整，确保与表格之间的间距 */
}

/* 试卷题目列表的样式 */

.exam-paper-questions h3 {
margin: 0;
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

      &.active {
        background-color: #409EFF;
        color: white;
      }
    }
  }

  .questions-box {
    width: 65%;
    height: 600px;
    overflow-y: auto;
  }
}

/* 添加表格相关样式 */
:deep(.el-table) {
  // 设置表格行高
  .el-table__row {
    height: 30px;
    line-height: 30px;
  }
  
  // 设置单元格内容省略
  .cell {
    line-height: 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // 调整表头高度
  .el-table__header th {
    height: 40px;
    line-height: 40px;
    padding: 0;
  }
}

/* 添加分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
  padding: 10px 0;
}

/* 分页组件样式优化 */
:deep(.el-pagination) {
  .el-pagination__total {
    margin-right: 16px;
  }

  .el-pagination__sizes {
    margin-right: 16px;
  }

  .btn-prev,
  .btn-next {
    background-color: #f4f4f5;
    
    &:hover {
      color: #409EFF;
    }
  }

  .el-pager li {
    background-color: #f4f4f5;
    
    &:hover {
      color: #409EFF;
    }
    
    &.active {
      background-color: #409EFF;
      color: white;
    }
  }
}

/* 表格内容溢出处理 */
:deep(.el-table) {
  .cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* 对话框样式覆盖 */
:deep(.el-dialog) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0 !important;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

:deep(.el-dialog__body) {
  flex: 1;
  overflow: hidden;
}

/* 当对话框打开时禁用背景滚动 */
:deep(.el-overlay) {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
}

/* 内容区域的滚动条样式 */
.content {
  .questions-box {
    height: 500px;
    overflow-y: auto;
    
    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: #dcdfe6;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-track {
      background-color: #f5f7fa;
    }
  }
}
</style>
