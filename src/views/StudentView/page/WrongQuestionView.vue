<script setup>
import { getWrongQuestion } from '@/api/WrongQuestionApi'
import { useUserStore } from '@/stores/userStore'
// 获取用户信息
const userStore = useUserStore()

const userId = userStore.id

// 错题
const wrongQuestions = ref([])

// 获取错题
const handleGetWrongQuestions = async () => {
  const params = {
    examPaperName: "",
    questionTitle: ""
  }
  const res = await getWrongQuestion(userId, params)
  console.log(res);
  
  wrongQuestions.value = res.data
}

onMounted(() => {
  handleGetWrongQuestions()
})
</script>
<template>
  
</template>
