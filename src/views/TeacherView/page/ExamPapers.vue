<template>
  <div>
    <div class="header">
      <h2>我的试卷</h2>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索试卷"
          clearable
          @clear="handleSearchClear"
          class="search-input"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="showAddExamPaperDialog">
          <el-icon><Plus /></el-icon> 添加试卷
        </el-button>
      </div>
    </div>

    <el-row v-if="filteredExamPapers.length > 0" :gutter="20">
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="4"
        v-for="exam in filteredExamPapers"
        :key="exam.examPaperId"
      >
        <el-card
          class="exam-paper-card"
          shadow="hover"
          @click="goToExamDetail(exam.examPaperId)"
        >
          <div class="card-content">
            <div class="exam-icon">
              <el-icon :size="40" color="#409EFF"><Document /></el-icon>
            </div>
            <div class="exam-info">
              <el-tooltip
                :content="exam.examPaperName"
                placement="top"
                :show-after="1000"
              >
                <h3 class="exam-name">{{ exam.examPaperName }}</h3>
              </el-tooltip>
              <p class="exam-date" v-if="exam.examPaperUpdatedDate">
                <el-icon><Calendar /></el-icon>
                更新时间: {{ formatDate(exam.examPaperUpdatedDate) }}
              </p>
            </div>
          </div>
          <div class="exam-actions">
            <el-button link @click.stop="editExamPaper(exam.examPaperId)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button link @click.stop="confirmDeleteExam(exam.examPaperId)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加试卷的弹窗 -->
    <el-dialog title="添加试卷" v-model="isAddExamPaperDialogVisible">
      <el-input v-model="newExamPaperName" placeholder="输入试卷名称" />
      <template #footer>
        <el-button @click="isAddExamPaperDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addExamPaper">添加</el-button>
      </template>
    </el-dialog>

    <!-- 编辑试卷的弹窗 -->
    <el-dialog title="重命名试卷" v-model="isEditExamPaperDialogVisible">
      <el-input v-model="editingExamPaperName" placeholder="输入新的试卷名称" />
      <template #footer>
        <el-button @click="isEditExamPaperDialogVisible = false"
          >取消</el-button
        >
        <el-button type="primary" @click="confirmEditExamPaper">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { deleteExamPaperById, updateExamPaperById } from '@/api/examPaperApi'
import {
  insertExamPaperByUserId,
  selectExamPapersByUserId
} from '@/api/userApi'
import { useUserStore } from '@/stores/userStore'
import { ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { Plus, Document, Calendar, Edit, Delete, Search } from '@element-plus/icons-vue'

const examPapers = ref<any[]>([])
const isAddExamPaperDialogVisible = ref(false)
const isEditExamPaperDialogVisible = ref(false)
const newExamPaperName = ref('')
const editingExamPaperName = ref('')
const editingExamPaperId = ref<number | null>(null)
const router = useRouter()
const userStore = useUserStore()
const searchKeyword = ref('')

const filteredExamPapers = computed(() => {
  if (!searchKeyword.value) {
    return examPapers.value
  }
  return examPapers.value.filter(exam => 
    exam.examPaperName.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const HandelSelectExamPapersByUserId = async () => {
  try {
    
    const res = await selectExamPapersByUserId(userStore.id)
    examPapers.value = res.data || []
  } catch (error) {
    console.error('获取试卷失败:', error)
    ElMessage.error('获取试卷失败')
  } finally {
    
  }
}

const addExamPaper = async () => {
  if (!newExamPaperName.value) return
  try {
    
    await insertExamPaperByUserId(userStore.id, {
      examPaperName: newExamPaperName.value
    })
    newExamPaperName.value = ''
    isAddExamPaperDialogVisible.value = false
    await HandelSelectExamPapersByUserId()
    ElMessage.success('添加试卷成功')
  } catch (error) {
    console.error('添加试卷失败:', error)
    ElMessage.error('添加试卷失败')
  } finally {
    
  }
}

const goToExamDetail = (examPaperId: number) => {
  router.push({ path: `/teacher/exam-papers/${examPaperId}` })
}

const confirmDeleteExam = (examPaperId: number) => {
  ElMessageBox.confirm('你确定要删除这张试卷吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        
        await deleteExamPaperById(examPaperId)
        ElMessage.success('删除成功')
        await HandelSelectExamPapersByUserId()
      } catch (error) {
        console.error('删除试卷失败:', error)
        ElMessage.error('删除失败')
      } finally {
       
      }
    })
    .catch(() => {
      ElMessage.info('取消删除')
    })
}

const editExamPaper = (examPaperId: number) => {
  const examPaper = examPapers.value.find((e) => e.examPaperId === examPaperId)
  if (examPaper) {
    editingExamPaperId.value = examPaperId
    editingExamPaperName.value = examPaper.examPaperName
    isEditExamPaperDialogVisible.value = true
  }
}

const confirmEditExamPaper = async () => {
  if (!editingExamPaperName.value || editingExamPaperId.value === null) return
  try {
  
    await updateExamPaperById(editingExamPaperId.value, {
      examPaperName: editingExamPaperName.value
    })
    isEditExamPaperDialogVisible.value = false
    await HandelSelectExamPapersByUserId()
    ElMessage.success('更新试卷成功')
  } catch (error) {
    console.error('更新试卷失败:', error)
    ElMessage.error('更新试卷失败')
  } finally {
   
  }
}

const showAddExamPaperDialog = () => {
  isAddExamPaperDialogVisible.value = true
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const handleSearchClear = () => {
  searchKeyword.value = ''
}

onMounted(() => {
  HandelSelectExamPapersByUserId()
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 250px;
}

.exam-paper-card {
  height: 160px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  border-radius: 10px;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.exam-paper-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.exam-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.exam-info {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.exam-name {
  font-size: 16px;
  margin-bottom: 4px;
  color: #303133;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 10px;
}

.exam-date {
  font-size: 13px;
  color: #909399;
  display: flex;
  align-items: center;
}

.exam-date .el-icon {
  margin-right: 4px;
}

.exam-actions {
  display: flex;
  justify-content: space-between;
  padding: 16px 8px;
  margin-top: auto;
  background-color: #fff;
}

.exam-actions .el-button {
  padding: 0 12px;
}

.no-exam-papers {
  text-align: center;
  margin-top: 50px;
}

.el-row {
  margin: 0 -10px;
}

.el-col {
  padding: 10px;
}

@media screen and (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .header-right .el-button {
    width: 100%;
  }
}
</style>
