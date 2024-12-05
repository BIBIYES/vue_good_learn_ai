<script setup>
import { getWrongQuestion } from '@/api/WrongQuestionApi'
import { useUserStore } from '@/stores/userStore'
import { ref } from 'vue'

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
    <el-scrollbar height="100%">
      <WrongQuestionCard v-for="item in wrongQuestions" :key="item.wrongQuestionsId" :wrongQuestion="item" />
  </el-scrollbar>
  </div>
</template>
<style lang="less" scoped>
.wrong-question-view {
  width: 100%;
  height: 100%;
}
.el-scrollbar{
  padding: 16px;
}
</style>
