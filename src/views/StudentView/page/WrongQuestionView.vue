<script setup>
import { getWrongQuestion } from '@/api/WrongQuestionApi'
import { useUserStore } from '@/stores/userStore'
import { ref } from 'vue'
import { Document, Search } from '@element-plus/icons-vue'

// 获取用户信息
const userStore = useUserStore()
const userId = userStore.id

// 错题
const wrongQuestions = ref([])

// 搜索参数
const searchForm = ref({
  examPaperName: '',
  questionTitle: ''
})

// 获取错题
const handleGetWrongQuestions = async () => {
  const res = await getWrongQuestion(userId, searchForm.value)
  wrongQuestions.value = res.data
 
}



// 搜索
const handleSearch = () => {
  handleGetWrongQuestions()
}

onMounted(() => {
  handleGetWrongQuestions()
})
</script>

<template>
  <div class="wrong-question-view">
    <div class="content-wrapper">
      <div class="header">
        <h2>我的错题本</h2>
        <div class="search-wrapper">
          <el-input 
            v-model="searchForm.examPaperName" 
            placeholder="搜索试卷名称"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
          <el-input 
            v-model="searchForm.questionTitle" 
            placeholder="搜索题目"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
        </div>
      </div>
      <el-scrollbar height="100%">
        <WrongQuestionCard 
          v-for="item in wrongQuestions" 
          :key="item.wrongQuestionsId" 
          :wrongQuestion="item" 
        />
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="less" scoped>
.wrong-question-view {
  width: 100%;
  min-height: 100%;
  position: relative; 
  overflow: hidden;
}

.content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
}


.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
 

  h2 {
    margin: 0;
    font-size: 22px;
    color: #303133;
  }

  .search-wrapper {
    display: flex;
    gap: 10px;
    align-items: center;

    .search-input {
      width: 200px;
    }
  }
}


.el-scrollbar {
  height: calc(100% - 70px);
  padding-right: 15px;
}
</style>
