<template>
  <div>
    <div class="header">
      <h2>我的课程</h2>
      <el-button type="primary" @click="showAddCourseDialog">
        <el-icon><Plus /></el-icon> 添加课程
      </el-button>
    </div>

    <el-row v-if="courses.length > 0" :gutter="20">
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        v-for="course in courses"
        :key="course.courseId"
      >
        <el-card
          class="course-card"
          shadow="hover"
          @click="goToCourseDetail(course.courseId)"
        >
          <div class="course-icon">
            <el-icon :size="40" color="#409EFF"><Reading /></el-icon>
          </div>
          <div class="course-info">
            <h3 class="course-name">{{ course.courseName }}</h3>
            <p class="course-date">
              <el-icon><Calendar /></el-icon>
              更新时间: {{ formatDate(course.courseUpdatedDate) }}
            </p>
          </div>
          <div class="course-actions">
            <el-button link @click.stop="editCourse(course.courseId)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button link @click.stop="deleteCourse(course.courseId)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 如果没有课程，显示提示信息 -->
    <div v-else class="no-courses">
      <el-empty description="暂无课程" />
    </div>

    <!-- 添加课程的弹窗 -->
    <el-dialog title="添加课程" v-model="isAddCourseDialogVisible">
      <el-input v-model="newCourseName" placeholder="输入课程名称" />
      <template #footer>
        <el-button @click="isAddCourseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addCourse">添加</el-button>
      </template>
    </el-dialog>

    <!-- 编辑课程的弹窗 -->
    <el-dialog title="编辑课程" v-model="isEditCourseDialogVisible">
      <el-input v-model="editingCourseName" placeholder="输入新的课程名称" />
      <template #footer>
        <el-button @click="isEditCourseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEditCourse">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { deleteCourseById, updateCourse } from '@/api/courseApi'
import { selectCoursesByUserId, insertCourse } from '@/api/userApi'
import { useUserStore } from '@/stores/userStore'
import { ElLoading, ElMessageBox, ElMessage } from 'element-plus'
import { Plus, Reading, Calendar, Edit, Delete } from '@element-plus/icons-vue'

const courses = ref<any[]>([])
const isAddCourseDialogVisible = ref(false)
const isEditCourseDialogVisible = ref(false)
const newCourseName = ref('')
const editingCourseName = ref('')
const editingCourseId = ref<number | null>(null)
const router = useRouter()
const userStore = useUserStore()
let loadingInstance: any = null

const fetchCourses = async () => {
  try {
    loadingInstance = ElLoading.service({
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    const res = await selectCoursesByUserId(userStore.id)
    courses.value = res.data || []
  } catch (error) {
    console.error('获取课程失败:', error)
  } finally {
    if (loadingInstance) loadingInstance.close()
  }
}

const addCourse = async () => {
  if (!newCourseName.value) return
  try {
    loadingInstance = ElLoading.service({
      text: '正在添加...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    await insertCourse(userStore.id, {
      courseName: newCourseName.value
    })
    newCourseName.value = ''
    isAddCourseDialogVisible.value = false
    await fetchCourses()
    ElMessage({
      type: 'success',
      message: '添加课程成功'
    })
  } catch (error) {
    console.error('添加课程失败:', error)
    ElMessage({
      type: 'error',
      message: '添加课程失败'
    })
  } finally {
    if (loadingInstance) loadingInstance.close()
  }
}

const goToCourseDetail = (courseId: number) => {
  router.push(`/teacher/course/${courseId}`)
}

const deleteCourse = async (courseId: number) => {
  ElMessageBox.confirm('你确定要删除这个课程吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        loadingInstance = ElLoading.service({
          text: '正在删除...',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        await deleteCourseById(courseId)
        ElMessage({
          type: 'success',
          message: '删除成功'
        })
        await fetchCourses()
      } catch (error) {
        ElMessage({
          type: 'error',
          message: '删除失败'
        })
        console.error('删除课程失败:', error)
      } finally {
        if (loadingInstance) loadingInstance.close()
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除'
      })
    })
}

const editCourse = (courseId: number) => {
  const course = courses.value.find((c) => c.courseId === courseId)
  if (course) {
    editingCourseId.value = courseId
    editingCourseName.value = course.courseName
    isEditCourseDialogVisible.value = true
  }
}

const confirmEditCourse = async () => {
  if (!editingCourseName.value || editingCourseId.value === null) return
  try {
    loadingInstance = ElLoading.service({
      text: '正在更新...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    await updateCourse(editingCourseId.value, {
      courseName: editingCourseName.value
    })
    isEditCourseDialogVisible.value = false
    await fetchCourses()
    ElMessage({
      type: 'success',
      message: '更新课程成功'
    })
  } catch (error) {
    console.error('更新课程失败:', error)
    ElMessage({
      type: 'error',
      message: '更新课程失败'
    })
  } finally {
    if (loadingInstance) loadingInstance.close()
  }
}

const showAddCourseDialog = () => {
  isAddCourseDialogVisible.value = true
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.course-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  border-radius: 10px;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.course-info {
  flex-grow: 1;
}

.course-name {
  font-size: 18px;
  margin-bottom: 8px;
  color: #303133;
}

.course-date {
  font-size: 14px;
  color: #909399;
  display: flex;
  align-items: center;
}

.course-date .el-icon {
  margin-right: 4px;
}

.course-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.course-actions .el-button {
  padding: 0;
}

.no-courses {
  text-align: center;
  margin-top: 50px;
}

.el-row {
  margin-bottom: 20px;
}
</style>
