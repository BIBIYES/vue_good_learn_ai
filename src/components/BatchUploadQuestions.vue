<template>
    <div class="upload-container">
        <br>
        <div class="btn">
            <download-excel class="el-button" :data="questions" type="xlsx" name="filename.xlsx">
                <i class="el-icon">
                    <img src="../assets/img/Excel.svg" style="height: 20px; margin-right: 10px;">
                </i>
                导出模板
            </download-excel>
            <el-button @click="uploadFile" :icon="Upload">上传excel文件来批量添加</el-button>
        </div>

        <!-- 隐藏的文件输入框 -->
        <input type="file" ref="upload" @change="readExcel" accept=".xls, .xlsx" v-show="false" />

        <!-- 数据表格，只有在有数据时才显示 -->
        <el-table v-if="tableData.length" :data="tableData" style="width: 100%; margin-top: 20px;">
            <el-table-column prop="questionTitle" label="Title" />
            <el-table-column prop="questionContent" label="Content" />
            <el-table-column prop="answer" label="Content" />
        </el-table>
        <br>
        <!-- 使用 tableData.length 控制按钮的显示 -->
        <el-button type="success" :icon="Check" v-show="tableData.length"
            @click="handelBatchAddQuestions">批量添加</el-button>
    </div>
</template>

<script setup>
import { Upload, Check } from '@element-plus/icons-vue';
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { batchAddQuestions } from '@/api/questionApi'
import { messageTools } from '@/utils/messageTools';

const props = defineProps(['userId', 'courseId'])
console.log(props.userId)
console.log(props.courseId);

// 模板
const questions = [
    {
        questionTitle:"这是题目的名字",
        questionContent:"这是题干",
        answer:"参考答案"
    }
]

const upload = ref(null) // 文件输入框的 ref
const tableData = ref([]) // 表格数据

// 点击按钮时，手动触发文件选择框
const uploadFile = () => {
    upload.value.click() // 触发点击文件输入框
}

// 读取 Excel 文件并渲染到表格中
const readExcel = (e) => {
    const files = e.target.files
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(files[0])
    fileReader.onload = (ev) => {
        try {
            const data = new Uint8Array(ev.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const wsname = workbook.SheetNames[0] // 读取第一个工作表
            const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]) // 转换为 JSON 数据

            // 映射表格数据
            tableData.value = ws.map(item => ({
                questionId: item['questionId'],
                questionTitle: item['questionTitle'],
                questionContent: item['questionContent'],
                answer:item['answer'],
                questionCreatedDate: item['questionCreatedDate'],
                questionUpdatedDate: item['questionUpdatedDate'],
                courseId: item['courseId'],
                userId: item['userId']
            }))
        } catch (e) {
            console.error('Error reading file:', e)
            return false
        }
    }
}
// 
const handelBatchAddQuestions = async () => {

    try {
        tableData.value.forEach(item => {
            item.userId = props.userId
        })
        const res = await batchAddQuestions(props.courseId, tableData.value)
        if (res.code == 200) {
            messageTools.successMessage(res.msg)
            tableData.value = []
            setTimeout(function () { location.reload() }, 1000);  //5秒后将会调用执行remind()函数
        } else {
            messageTools.warningMessage(res.msg)
        }
    } catch (error) {
        console.error('Error adding questions:', error)
    }
}
</script>

<style scoped>
.upload-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* 使内容居中 */
    justify-content: center;

}
</style>
