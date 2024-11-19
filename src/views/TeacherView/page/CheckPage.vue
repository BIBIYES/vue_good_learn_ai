<script setup>
import { getExamPaperStudentAnswer } from '@/api/studentAnswerApi'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import '@/assets/css/github-markdown.css'


const route = useRoute()
const router = useRouter()
const userId = route.params.userId
const examPaperId = route.params.examPaperId

const examPaperStudentAnswerList = ref([])
const index = ref(1)

// 获取试卷答案
const handelGetExamPaperAnswer = async () => {
    console.log(userId, examPaperId)
    const res = await getExamPaperStudentAnswer(userId, examPaperId)
    console.log(res)
    examPaperStudentAnswerList.value = res.data
}

const handlePageChange = (page) => {
    index.value = page
}

// 将题干内容转换为 Markdown
const renderMarkdown = (content) => {
    return marked(content)
}


onMounted(() => {
    handelGetExamPaperAnswer()
})
</script>

<template>
    <div class="container">
        <el-card class="main-card" v-if="examPaperStudentAnswerList.length" style="min-height: 800px; position: relative;">
            <template #header>
                <el-button @click="router.go(-1)">返回</el-button>
                <h2 class="card-title">{{ examPaperStudentAnswerList[index - 1].examPaperName }}-{{ examPaperStudentAnswerList[index-1].username }}</h2>
            </template>
            
            <div class="content-section">
                <h3>题目标题</h3>
                <p>{{ examPaperStudentAnswerList[index - 1].questionTitle }}</p>
            </div>

            <div class="content-section">
                <h3>题干</h3>
                <div class="article-content markdown-body" v-html="renderMarkdown(examPaperStudentAnswerList[index - 1].questionContent)"></div>
            </div>

            <div class="content-section">
                <h3>学生回答</h3>
                <p>{{ examPaperStudentAnswerList[index - 1].answerContent }}</p>
            </div>

            <div class="content-section" v-if="examPaperStudentAnswerList[index - 1].aiAnswer">
                <h3>AI响应</h3>
                <p>{{ examPaperStudentAnswerList[index - 1].aiAnswer }}</p>
            </div>
            
            <div class="footer-pagination" style="position: absolute; bottom: 0px; left: 25%;">
                <el-pagination 
                    :default-page-size="1" 
                    :current-page="index" 
                    @current-change="handlePageChange" 
                    background 
                    layout="prev, pager, next, jumper" 
                    :total="examPaperStudentAnswerList.length" 
                />
            </div>
        </el-card>
    </div>
</template>

<style>
@import 'github-markdown-css/github-markdown.css';
.container {
    display: flex;
    justify-content: center;
    padding: 20px;
}

.main-card {
    max-width: 80%;
    width: 100%;
    margin: 0 auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

.card-title {
    font-size: 1.5em;
    font-weight: bold;
    text-align: center;
    color: #333;
}

.content-section {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
}

.content-section h3 {
    font-size: 1.2em;
    color: #555;
    margin-bottom: 8px;
}

.content-section p {
    font-size: 1em;
    color: #666;
    margin: 0;
    line-height: 1.6;
}

.footer-pagination {
    display: flex;
    justify-content: center;
    padding: 16px;
}

</style>
