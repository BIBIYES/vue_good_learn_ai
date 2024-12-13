<template>
  <div class="home-container">
    <div class="header">
      <div class="welcome-section">
        <h2>欢迎回来，{{ userStore.name }}</h2>
        <div class="time-info">
          <p><el-icon><Calendar /></el-icon> {{ currentDate }}</p>
          <p><el-icon><Timer /></el-icon> {{ currentTime }}</p>
        </div>
      </div>
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-card">
              <el-icon><Document /></el-icon>
              <div class="stat-info">
                <span class="stat-label">已完成试卷</span>
                <span class="stat-value">{{ completedPapers }}</span>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <el-icon><Document /></el-icon>
              <div class="stat-info">
                <span class="stat-label">未完成试卷</span>
                <span class="stat-value">{{ pendingPapers }}</span>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <el-icon><User /></el-icon>
              <div class="stat-info">
                <span class="stat-label">总试卷数</span>
                <span class="stat-value">{{ completedPapers + pendingPapers }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-card">
            <div ref="chartRef" class="chart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-card">
            <div ref="wrongQuestionChart" class="chart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-card">
            <div ref="usageChartRef" class="chart"></div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12">
          <div class="chart-card">
            <AllExamPaperStatus/>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup >
import { ref, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getStudentJoinExamPaper, getStudentWrongQuestion } from '@/api/userApi'
import {
  User,
  Document,
  Timer,
  Calendar
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const userStore = useUserStore()
const completedPapers = ref(0)
const pendingPapers = ref(0)
const chartRef = ref(null)
const wrongQuestionChart = ref(null)
const usageChartRef = ref(null)
const currentTime = ref('')
const currentDate = ref('')
const wrongQuestionCount = ref()

const fetchPapersStats = async () => {
  try {
    const res = await getStudentJoinExamPaper(userStore.id)
    if (res.data) {
      completedPapers.value = res.data.filter(paper => paper.status === '已完成').length
      pendingPapers.value = res.data.filter(paper => paper.status === '未完成').length
    }
  } catch (error) {
    console.error('获取试卷统计失败:', error)
  }
}


// 获取学生错题的计数
const handelGetStudentWrongQuestion = async () => {
  try {
    const res = await getStudentWrongQuestion(userStore.id)
    if (res.data) {
      wrongQuestionCount.value = res.data
      nextTick(() => {
        initWrongQuestionChart(res.data)
      })
    }
  } catch (error) {
    console.error('获取错题统计失败:', error)
  }
}

const initChart = () => {
  const chart = echarts.init(chartRef.value)
  const option = {
    title: {
      text: '课程掌握程度',
      textStyle: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center',
      top: 10
    },
    tooltip: {},
    radar: {
      indicator: [
        { name: 'MySQL', max: 1 },
        { name: '计算机网络技术', max: 1 },
        { name: 'JavaEE企业级应用开发', max: 1 },
        { name: 'Linux', max: 1 }
      ],
      radius: '65%',
      center: ['50%', '55%']
    },
    series: [{
      type: 'radar',
      data: [{
        value: [0.55, 0.22, 0.48, 0.65],
        name: '掌握度',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(128, 255, 165, 0.7)' },
            { offset: 1, color: 'rgba(1, 191, 236, 0.7)' }
          ])
        },
        lineStyle: {
          width: 2,
          color: '#01bfec'
        },
        itemStyle: {
          color: '#01bfec'
        }
      }]
    }]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const initWrongQuestionChart = (data) => {
  const chart = echarts.init(wrongQuestionChart.value)
  const option = {
    title: {
      text: '试卷错题统计',
      textStyle: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const data = params[0]
        const wrongData = wrongQuestionCount.value[data.dataIndex]
        return `${wrongData.examPaperName}<br/>
                错题数量: ${wrongData.wrongQuestionsCount}<br/>
                错题详情: ${wrongData.wrongQuestionTitles.split(';')[0]}...`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.examPaperName),
      axisLabel: {
        interval: 0,
        rotate: 0,
        width: 80,
        overflow: 'truncate',
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '错题数量',
      minInterval: 1,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [{
      type: 'bar',
      data: data.map(item => item.wrongQuestionsCount),
      barWidth: '40%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
          { offset: 0, color: '#ff9a9e' },
          { offset: 1, color: '#fad0c4' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            { offset: 0, color: '#ff8a8e' },
            { offset: 1, color: '#fac0b4' }
          ])
        }
      }
    }]
  }
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const initUsageChart = () => {
  const chart = echarts.init(usageChartRef.value)
  const option = {
    title: {
      text: '好助学使用评率',
      textStyle: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['张闯博', '陈婉雯', '李明阳', '金典', '王诗琪'],
      axisLabel: {
        interval: 0,
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '使用频率',
      type: 'line',
      data: [0.85, 0.92, 0.78, 0.95, 0.88],
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        color: '#409EFF',
        width: 3
      },
      itemStyle: {
        color: '#409EFF',
        borderWidth: 2,
        borderColor: '#fff'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
        ])
      }
    }]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { 
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('zh-CN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

onMounted(() => {
  fetchPapersStats()
  nextTick(() => {
    initChart()
    initUsageChart()
  })
  handelGetStudentWrongQuestion()
  updateTime()
  setInterval(updateTime, 1000)
})
</script>

<style scoped>
.home-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: #F4F4F7;  
}

.header {
  margin-bottom: 10px;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.welcome-section h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.time-info {
  display: flex;
  gap: 20px;
}

.time-info p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.stat-card .el-icon {
  font-size: 24px;
  color: #409EFF;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.stat-value {
  color: #303133;
  font-size: 24px;
  font-weight: bold;
  margin-top: 5px;
}

.charts-section {
  flex: 1;
  overflow: hidden;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  height: calc((100vh - 250px) / 2);
}

.chart {
  width: 100%;
  height: 100%;
}
</style>