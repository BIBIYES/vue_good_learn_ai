<template>
  <div class="home-container">
    <div class="header">
      <div class="welcome-section">
        <h2>欢迎回来，{{ userStore.name }}</h2>
        <el-button @click="showCareerReport">推荐职业匹配</el-button>
        <el-dropdown>
          <el-button type="primary">
            我的课程<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- 点击之后打开一个侧边栏 -->
              <el-dropdown-item @click="drawer = true">数据库系统概论</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-drawer v-model="drawer" title="数据库系统概论" :size="1000" :direction="direction" >
          <div class="esc">
            <iframe src="http://127.0.0.1:5500/public/data.html" frameborder="0"
              style="width:100% ;height: 100%;"></iframe>
          </div>
        </el-drawer>
        
        <div class="time-info">
          <p><el-icon>
              <Calendar />
            </el-icon> {{ currentDate }}</p>
          <p><el-icon>
              <Timer />
            </el-icon> {{ currentTime }}</p>
        </div>
      </div>
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-card">
              <el-icon>
                <Document />
              </el-icon>
              <div class="stat-info">
                <span class="stat-label">已完成试卷</span>
                <span class="stat-value">{{ completedPapers }}</span>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <el-icon>
                <Document />
              </el-icon>
              <div class="stat-info">
                <span class="stat-label">未完成试卷</span>
                <span class="stat-value">{{ pendingPapers }}</span>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <el-icon>
                <User />
              </el-icon>
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
            <!-- <div ref="usageChartRef" class="chart"></div> -->
            <GithubContributions startDate="2023-01-01" endDate="2023-12-31"
              :colorScheme="['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']" title="代码贡献热力图" />
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12">
          <div class="chart-card">
            <AllExamPaperStatus />
          </div>
        </el-col>
      </el-row>
    </div>
    <!-- 职业生涯报告抽屉 -->
    <el-drawer v-model="careerDrawerVisible" title="职业生涯报告" size="50%">
      <transition name="fade" mode="out-in">
        <div class="career-loading" v-if="isLoading">
          <div class="loading-spinner">
            <div class="loading-spinner">
              <span class="emoji-animation">⭐</span>
            </div>
          </div>
          <div class="loading-text-wrapper">
            <span class="loading-text">{{ loadingText }}</span>
          </div>
        </div>
        <div v-else class="career-report">
          <div class="career-section">
            <h3>职业匹配分析</h3>
            <div class="suitable-jobs">
              <h4>适合从事的职业</h4>
              <div class="job-item" v-for="(job, index) in jobRecommendations" :key="index">
                <div class="job-header">
                  <div>
                    <div class="job-title">职位名称: {{ job.title }}</div>
                    <div class="job-link">
                      招聘链接: <el-link type="primary" @click="viewJobDetails(job)">查看详情</el-link>
                    </div>
                  </div>
                </div>
                <div class="matching-bar">
                  <div class="progress-bar" :style="{ width: animatedPercentages[index] + '%' }"></div>
                  <span class="percentage">匹配度: {{ Math.round(animatedPercentages[index]) }}%</span>
                </div>
              </div>
            </div>
          </div>
          <div class="career-note">
            <p>匹配的结果仅供参考，你的人生由你自己主导！</p>
          </div>
        </div>
      </transition>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getStudentJoinExamPaper, getStudentWrongQuestion } from '@/api/userApi'
import {
  User,
  Document,
  Timer,
  Calendar,
  Loading,
  ArrowDown // 添加 ArrowDown 组件
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
const drawer = ref(false)
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
// 职业报告相关
const careerDrawerVisible = ref(false)
const isLoading = ref(false)
const loadingText = ref('')
const jobRecommendations = ref([
  {
    title: '高级java全栈工程师',
    matchPercentage: 75.0,
    link: 'https://www.zhipin.com/job_detail/d478a10b641976e31Xx42N20GFBT.html?lid=9FmtJsvOIgf.search.1&securityId=pSjkySxvivEDF-B1c56rC_p2b4IqmC5K6Xfv8Wg6tji_yinaubDqo3We_0_RDS0Vo-3jMvG60PWfBGHadXJgRbXJY1oPN91hwbim4FlDGeKdzqc341o~&sessionId='
  },
  {
    title: '前端开发工程师',
    matchPercentage: 72.5,
    link: 'https://www.zhipin.com/job_detail/2546b008b323edf91Hx43tW4FlRR.html?lid=9FnwkhFS6uY.search.1&securityId=y8xJKytv5V2ls-M12F-aKyLKuQ3GORBUDATh_npYl3qAIDwpju8S2G-hHdzoggZbtDrFGfpKTzDInLVFzlPFEf5YWTJv6Cfkhu-QL67GvS7MrkO9UafJ4GfJNhsdfkElM89b7YqVZbegLYyNWCBOF5bW&sessionId='
  },
  {
    title: '高级前端研发工程师',
    matchPercentage: 70.0,
    link: 'https://www.zhipin.com/job_detail/4d957f0913a7a0f71H172tm9F1pW.html?lid=9FnUIB6Vkdi.search.1&securityId=CYNAEIwZsKFZX-M19723Vsl7PbEloLrN50cxe5WeETLTa3WBCoqZgJ-k04sL1mgqsk73iqtKwvOBKPt4x95C63YXNDc4dQMFebEL_wFAxSlwSVwyaxhO&sessionId='
  }
])

const animatedPercentages = ref(jobRecommendations.value.map(() => 0))

const viewJobDetails = (job) => {
  window.open(job.link, '_blank')
}

const startProgressAnimation = () => {
  jobRecommendations.value.forEach((job, index) => {
    setTimeout(() => {
      const targetPercentage = job.matchPercentage
      const duration = 1000 // 1秒动画
      const startTime = Date.now()

      const animate = () => {
        const currentTime = Date.now()
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        animatedPercentages.value[index] = progress * targetPercentage

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }, index * 200) // 每个进度条错开200ms开始动画
  })
}

const showCareerReport = () => {
  careerDrawerVisible.value = true
  isLoading.value = true

  // 模拟加载过程
  setTimeout(() => {
    loadingText.value = '正在读取学生学习数据...'
    setTimeout(() => {
      loadingText.value = '正在总结...'
      setTimeout(() => {
        loadingText.value = '正在生成职业推荐报告...'
        setTimeout(() => {
          isLoading.value = false
          // 开始进度条动画
          nextTick(() => {
            startProgressAnimation()
          })
        }, 2000)
      }, 3000)
    }, 3000)
  }, 0)
}

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
        { name: '数据库系统概论', max: 1 },
        { name: '计算机网络技术', max: 1 },
        { name: 'JavaEE企业级应用开发', max: 1 },
        { name: 'Linux', max: 1 },
        { name: 'Vue.js', max: 1 }, // 新增课程
        { name: '网页设计', max: 1 } // 新增课程
      ],
      radius: '65%',
      center: ['50%', '55%']
    },
    series: [{
      type: 'radar',
      data: [{
        value: [0.55, 0.22, 0.92, 0.65, 0.75, 0.80], // 新增课程的掌握度
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
      text: '我的错题统计',
      textStyle: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const wrongData = data[params.dataIndex]
        return `${wrongData.examPaperName}<br/>
                错题数量: ${wrongData.wrongQuestionsCount}<br/>
                错题详情: ${wrongData.wrongQuestionTitles.split(';')[0]}...`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [{
      type: 'pie',
      radius: '60%',
      data: data.map(item => ({
        // 只显示前4个字符，后面加...
        name: item.examPaperName.substring(0, 20) + '...',
        value: item.wrongQuestionsCount
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        formatter: '{b}: {c}题'
      }
    }]
  }
  chart.setOption(option)

  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const initUsageChart = () => {
  if (!usageChartRef.value) return // 检查 DOM 引用是否存在

  const chart = echarts.init(usageChartRef.value)

  // Generate last 30 days dates
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return `${date.getMonth() + 1}/${date.getDate()}`
  })

  // Generate random usage data between 0.6 and 0.95
  const data = Array.from({ length: 30 }, () =>
    Number((Math.random() * (0.95 - 0.6) + 0.6).toFixed(2))
  )

  const option = {
    title: {
      text: '好助学使用评率',
      subtext: '最近30天',
      textStyle: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'normal'
      },
      subtextStyle: {
        color: '#909399',
        fontSize: 12
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#409EFF',
      borderWidth: 1,
      textStyle: {
        color: '#606266'
      },
      formatter: (params) => {
        const value = params[0].value
        return `${params[0].name}<br/>
                <span style="display:inline-block;margin-right:4px;border-radius:50%;width:10px;height:10px;background-color:#409EFF"></span>
                使用率: ${(value * 100).toFixed(1)}%`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        interval: 'auto',
        rotate: 45,
        color: '#909399',
        fontSize: 11
      },
      axisLine: {
        lineStyle: {
          color: '#DCDFE6'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 0.5,
      max: 1,
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#E4E7ED'
        }
      },
      axisLabel: {
        formatter: (value) => `${(value * 100).toFixed(0)}%`,
        color: '#909399'
      }
    },
    series: [{
      name: '使用频率',
      type: 'line',
      data: data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      showSymbol: false,
      emphasis: {
        scale: true,
        focus: 'series',
        itemStyle: {
          color: '#409EFF'
        }
      },
      lineStyle: {
        color: '#409EFF',
        width: 3,
        shadowColor: 'rgba(64, 158, 255, 0.3)',
        shadowBlur: 10
      },
      itemStyle: {
        color: '#409EFF',
        borderWidth: 2,
        borderColor: '#fff'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
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
  const src = "../../../../public/database_course_graph_final.html"
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


.esc {
  width: 100%;
  height: 100%;
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

.career-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  position: relative;
}

.loading-spinner {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
}

.emoji-animation {
  font-size: 48px;
  animation: spin 2s infinite linear;
  display: inline-block;
  transform-origin: center center;
  line-height: 1;
}

.loading-text-wrapper {
  text-align: center;
}

.loading-text {
  font-size: 20px;
  font-weight: 500;
  background-image: linear-gradient(to right,
      #666 20%,
      #409EFF 40%,
      #409EFF 60%,
      #666 80%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-fill-color: transparent;
  display: inline-block;
  animation: shine 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(0.8);
  }
}

@keyframes shine {
  to {
    background-position: -200% center;
  }
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
}

.loading-icon {
  font-size: 48px;
  animation: rotate 2s linear infinite;
}

.loading-text {
  margin-top: 20px;
  font-size: 16px;
  color: #666;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.career-section {
  padding: 20px;
}

.career-section h3 {
  margin-bottom: 20px;
  font-size: 1.5em;
  color: #333;
}

.suitable-jobs h4 {
  margin-bottom: 15px;
  color: #666;
}

.job-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.job-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.matching-bar {
  position: relative;
  height: 20px;
  background: #e4e7ed;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 10px;
  transition: width 0.05s linear;
}

.percentage {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #606266;
  font-size: 12px;
}

.career-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.loading-spinner {
  margin-bottom: 20px;
}

.emoji-animation {
  font-size: 48px;
  animation: spin 2s infinite linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.career-report {
  opacity: 1;
  transition: opacity 0.5s ease;
}

.career-note {
  text-align: center;
  margin-top: 20px;
  padding: 15px;
  color: #666;
  font-style: italic;
  border-top: 1px solid #eee;
}
</style>