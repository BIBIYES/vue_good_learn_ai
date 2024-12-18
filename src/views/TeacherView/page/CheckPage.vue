<script setup>
import { getExamPaperStudentAnswer } from '@/api/studentAnswerApi'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownContext from '@/components/common/MarkdownContext.vue'

const route = useRoute()
const router = useRouter()
const userId = route.params.userId
const examPaperId = route.params.examPaperId

const examPaperStudentAnswerList = ref([])
const index = ref(1)

// 获取试卷答案
const handelGetExamPaperAnswer = async () => {
    const res = await getExamPaperStudentAnswer(userId, examPaperId)
    examPaperStudentAnswerList.value = res.data
}

const handlePageChange = (page) => {
    index.value = page
}

onMounted(() => {
    handelGetExamPaperAnswer()
})
</script>

<template>
    <div class="container">
        <el-card class="main-card" v-if="examPaperStudentAnswerList.length">
            <template #header>
                <div class="card-header">
                    <el-button @click="router.go(-1)">返回</el-button>
                    <h2 class="card-title">{{ examPaperStudentAnswerList[index - 1].examPaperName }}-{{ examPaperStudentAnswerList[index-1].username }}</h2>
                </div>
            </template>
            
            <div class="card-body">
                <el-scrollbar height="650px" class="custom-scrollbar">
                    <div class="card-content">
                        <div class="content-section">
                            <h3>题目标题</h3>
                            <div class="section-content">
                                {{ examPaperStudentAnswerList[index - 1].questionTitle }}
                            </div>
                        </div>

                        <div class="content-section">
                            <h3>题干</h3>
                            <div class="section-content">
                                <MarkdownContext :content="examPaperStudentAnswerList[index - 1].questionContent" />
                            </div>
                        </div>

                        <div class="content-section">
                            <h3>学生回答</h3>
                            <div class="section-content">
                                <MarkdownContext :content="examPaperStudentAnswerList[index - 1].answerContent" />
                            </div>
                        </div>

                        <div class="content-section" v-if="examPaperStudentAnswerList[index - 1].aiAnswer">
                            <div class="ai-header">
                                <img src="@/assets/img/bot.svg" alt="AI" class="ai-avatar">
                                <span>好助学 AI</span>
                            </div>
                            <div class="ai-content">
                                <MarkdownContext :content="examPaperStudentAnswerList[index - 1].aiAnswer" />
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
                
                <div class="footer-pagination">
                    <el-pagination 
                        :default-page-size="1" 
                        :current-page="index" 
                        @current-change="handlePageChange" 
                        background 
                        layout="prev, pager, next, jumper" 
                        :total="examPaperStudentAnswerList.length" 
                    />
                </div>
            </div>
        </el-card>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    height: 100% !important;
}

.main-card {
    max-width: 90%;
    width: 100%;
    margin: 0 auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card-body {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.card-content {
    padding-bottom: 70px; /* 为分页器留出空间 */
}

.custom-scrollbar {
    margin-right: 4px;
    height: calc(100vh - 200px) !important;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 20px;
}

.card-title {
    font-size: 1.5em;
    font-weight: bold;
    color: #333;
    margin: 0;
    flex-grow: 1;
    text-align: center;
}

.content-section {
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
}

.content-section h3 {
    font-size: 1.2em;
    color: #303133;
    margin-bottom: 16px;
}

.section-content {
    color: #606266;
    line-height: 1.6;
    font-size: 14px;
}

.ai-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
}

.ai-avatar {
    width: 24px;
    height: 24px;
}

.ai-content {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
}

.footer-pagination {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 16px 20px;
    background-color: #fff;
    border-top: 1px solid #ebeef5;
}

:deep(.el-scrollbar__bar.is-horizontal) {
    display: none;
}

:deep(.el-scrollbar__bar.is-vertical) {
    width: 6px;
}

:deep(.el-scrollbar__thumb) {
    background-color: #909399;
    opacity: 0.3;
}
</style>
