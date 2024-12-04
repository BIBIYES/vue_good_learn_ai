<script setup>
import { ref, onMounted } from 'vue'
import { getAllStudents } from '@/api/userApi'
import StudentCard from '@/components/StudentCard.vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const users = ref([])
const name = ref('')
const loading = ref(false)

// 获取学生
const handelGetStudents = async () => {
  loading.value = true
  try {
    const res = await getAllStudents(name.value)
    users.value = res.data
  } catch (error) {
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索学生
const handleSearch = () => {
  handelGetStudents()
}

// 清空搜索
const handleSearchClear = () => {
  name.value = ''
  handelGetStudents()
}

onMounted(() => {
  handelGetStudents()
})
</script>

<template>
  <div class="page-container">
    <div class="header">
      <h2>学生终端</h2>
      <div class="header-right">
        <el-input
          v-model="name"
          placeholder="搜索学生"
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
        <el-button type="primary" @click="handleSearch">
          <el-icon>
            <Search />
          </el-icon>
          搜索学生
        </el-button>
      </div>
    </div>

    <el-scrollbar height="calc(100vh - 110px)" class="scrollbar-wrapper">
      <div class="content-wrapper">
        <!-- 学生列表 -->
        <el-row v-if="users.length > 0" :gutter="20">
          <el-col
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            v-for="user in users"
            :key="user.id"
            class="mb-4"
          >
            <div v-loading="loading" class="loading-wrapper">
              <StudentCard :user="user" />
            </div>
          </el-col>
        </el-row>

        <!-- 无数据展示 -->
        <el-empty
          v-if="!loading && users.length === 0"
          description="暂无学生数据"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.page-container {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

.content-wrapper {
  padding: 0 20px 20px 20px;
}

.scrollbar-wrapper {
  margin: 0;
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden !important;
}

:deep(.el-scrollbar__bar.is-horizontal) {
  display: none !important;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
  
  
}


.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 250px;
}

.mb-4 {
  margin-bottom: 16px;
}

.loading-wrapper {
  width: 100%;
  height: 100%;
}

:deep(.el-loading-mask) {
  border-radius: 8px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
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
