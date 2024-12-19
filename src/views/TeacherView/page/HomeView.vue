<template>
  <div class="home-container">
    <div class="header">
      <div class="welcome-section">
        <h2>欢迎回来，{{ userStore.name }}</h2>
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
          <el-col :span="12">
            <div class="stat-card">
              <el-icon>
                <DataAnalysis />
              </el-icon>
              <div class="stat-info">
                <span class="stat-label">我的课程</span>
                <span class="stat-value">{{ coursesCount }}</span>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-card">
              <el-icon>
                <DataAnalysis />
              </el-icon>
              <div class="stat-info">
                <span class="stat-label">我的试卷</span>
                <span class="stat-value">{{ examPapersCount }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-card" v-loading="loading">
            <div ref="courseDifficultyChart" class="chart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-card" v-loading="loading">
            <div ref="wrongQuestionsChart" class="chart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-card" v-loading="loading">
            <div ref="usageChartRef" class="chart">
              <div ref="learningTrendChart" class="chart"></div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12">
          <div class="chart-card" v-loading="loading">
            <div ref="examErrorRateChart" class="chart"></div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { selectCoursesByUserId, selectExamPapersByUserId } from '@/api/userApi'
import * as echarts from 'echarts'
import {

  Timer,
  Calendar,
  DataAnalysis
} from '@element-plus/icons-vue'

// 获取老师图表数据的接口
import { getWrongQuestionsOverview, getCourseDifficultyAnalysis, getExamPaperPerformance, getStudentLearningProgress } from '@/api/teacherDataApi'


const userStore = useUserStore()
const coursesCount = ref(0)
const examPapersCount = ref(0)
const currentTime = ref('')
const currentDate = ref('')
// 加载动画控制器
const loading = ref(true)

const wrongQuestionsOverviewRes = ref(null)
const courseDifficultyAnalysisRes = ref(null)
const examPaperPerformanceRes = ref(null)
const studentLearningProgressRes = ref(null)

const courseDifficultyChart = ref(null)
const wrongQuestionsChart = ref(null)
const learningTrendChart = ref(null)
const examErrorRateChart = ref(null)


const zoomStart = ref(0)
const zoomEnd = ref(100)

const pieColors = [
  ['#FF9A9E', '#FAD0C4'],
  ['#A1C4FD', '#C2E9FB'],
  ['#FFECD2', '#FCB69F'],
  ['#FF9A9E', '#FAD0C4'],
  ['#A1C4FD', '#C2E9FB'],
  ['#96E6A1', '#D4FC79'],
  ['#84FAB0', '#8FD3F4'],
  ['#FDA085', '#F6D365'],
  ['#BFB6E4', '#8BC6EC'],
  ['#E0C3FC', '#8EC5FC'],
  ['#F5576C', '#F093FB'],
  ['#4FACFE', '#00F2FE'],
  ['#43E97B', '#38F9D7'],
  ['#FA709A', '#FEE140'],
  ['#30CFD0', '#330867'],
  ['#B721FF', '#21D4FD'],
  ['#8EC5FC', '#E0C3FC'],
  ['#85FFBD', '#FFFB7D'],
  ['#FF9A9E', '#FAD0C4'],
  ['#A1C4FD', '#C2E9FB']
]

const fetchStats = async () => {

  // 获取课程数量
  const coursesRes = await selectCoursesByUserId(userStore.id)
  if (coursesRes && coursesRes.data) {
    coursesCount.value = coursesRes.data.length
  }

  // 获取试卷数量
  const examPapersRes = await selectExamPapersByUserId(userStore.id)
  if (examPapersRes && examPapersRes.data) {
    examPapersCount.value = examPapersRes.data.length
  }
}

// 获取图表数据
const fetchChartData = async () => {
  try {
    // 查询学生错题总览
    wrongQuestionsOverviewRes.value = await getWrongQuestionsOverview()
    console.log(wrongQuestionsOverviewRes.value);

    // 查询课程难度分析
    courseDifficultyAnalysisRes.value = await getCourseDifficultyAnalysis()
    console.log(courseDifficultyAnalysisRes.value);

    // 查询考试试卷错题率分析
    examPaperPerformanceRes.value = await getExamPaperPerformance()
    console.log(examPaperPerformanceRes.value);

    // 查询学生学习趋势与进步分析
    studentLearningProgressRes.value = await getStudentLearningProgress()
    loading.value = false
    console.log(studentLearningProgressRes.value);
  } catch (error) {
    console.error('获取图表数据失败:', error)
  }
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

const initCharts = () => {
  // 课程难度分析图表
  const courseDifficultyInstance = echarts.init(courseDifficultyChart.value)
  const courseDifficultyOption = {
    title: {
      text: '课程难度分析',
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
      axisPointer: { type: 'shadow' }
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
      data: courseDifficultyAnalysisRes.value.map(item => item.courseName),
      axisLabel: {
        interval: 0,
        rotate: 30,
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '平均错题数',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [{
      type: 'bar',
      data: courseDifficultyAnalysisRes.value.map(item => item.avgWrongQuestionsPerStudent || 0),
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
  courseDifficultyInstance.setOption(courseDifficultyOption)

  // 错题总览饼图
  const wrongQuestionsInstance = echarts.init(wrongQuestionsChart.value)
  const top20Students = wrongQuestionsOverviewRes.value
    .sort((a, b) => b.totalWrongQuestions - a.totalWrongQuestions)
    .slice(0, 20)
  const wrongQuestionsOption = {
    title: {
      text: '错题总览 (Top 20)',
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
      formatter: '{b}: {c}题 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      type: 'scroll',
      pageTextStyle: { color: '#333' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      data: top20Students.map((item, index) => ({
        name: item.username,
        value: item.totalWrongQuestions,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: pieColors[index][0] },
            { offset: 1, color: pieColors[index][1] }
          ])
        }
      }))
    }]
  }
  wrongQuestionsInstance.setOption(wrongQuestionsOption)

  // 学习趋势图
  const learningTrendInstance = echarts.init(learningTrendChart.value)
  const learningTrendOption = {
    title: {
      text: '学习趋势分析',
      textStyle: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'normal',
      },
      left: 'center',
      top: 10,
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let result = params[0].name + '<br/>';
        params.forEach((param) => {
          let value = param.seriesName === '平均错题数' ? param.value?.toFixed(2) : param.value;
          result += param.marker + param.seriesName + ': ' + value + '<br/>';
        });
        return result;
      },
    },
    legend: {
      top: '40',
      data: ['总考试次数', '平均错题数'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '25%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: studentLearningProgressRes.value.map((item) => item.username),
      axisLabel: {
        interval: function (index, value) {
          const total = studentLearningProgressRes.value.length;
          const interval = Math.ceil(total / 50);
          return index % interval === 0;
        },
        rotate: 30,
        color: '#666',
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '数量',
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
    ],
    dataZoom: [
      {
        type: 'slider', // 滑动条
        show: true, // 显示滚动条
        start: 0, // 初始视图范围的起点（0%）
        end: 10, // 初始视图范围的终点（100%）
        height: 30, // 滚动条高度
        bottom: 0, // 滚动条位置
        borderColor: 'transparent', // 滑动条边框颜色
        backgroundColor: '#f5f5f5', // 滑动条背景颜色
        fillerColor: 'rgba(64, 158, 255, 0.2)', // 选中区域颜色
        handleStyle: {
          color: '#409EFF', // 滑块颜色
        },
      },
      {
        type: 'inside', // 支持鼠标滚轮和拖动
        start: 0,
        end: 100,
      },
    ],
    series: [
      {
        name: '总考试次数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: studentLearningProgressRes.value.map((item) => item.totalExamsAttempted),
        connectNulls: true, // 忽略 null 值，保持线连续
        lineStyle: {
          color: '#409EFF',
          width: 3,
        },
        itemStyle: {
          color: '#409EFF',
          borderWidth: 2,
          borderColor: '#fff',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' },
          ]),
        },
      },
      {
        name: '平均错题数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: studentLearningProgressRes.value.map((item) => item.avgWrongQuestionsPerExam),
        connectNulls: true, // 忽略 null 值，保持线连续
        lineStyle: {
          color: '#67C23A',
          width: 3,
        },
        itemStyle: {
          color: '#67C23A',
          borderWidth: 2,
          borderColor: '#fff',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.1)' },
          ]),
        },
      },
    ],
  };
  learningTrendInstance.setOption(learningTrendOption)

  // 计算最大值，为Y轴动态设置最大值
  const maxWrongQuestionRate = Math.max(...examPaperPerformanceRes.value.map(item => item.wrongQuestionRate));

  // 数据处理，保持原始数据
  const sanitizedData = examPaperPerformanceRes.value.map(item => ({
    value: Number(item.wrongQuestionRate.toFixed(2)),
    itemStyle: {
      color: item.wrongQuestionRate > 100 ? '#F56C6C' : '#67C23A' // 超过100%的数据点标红
    }
  }));
  const examErrorRateInstance = echarts.init(examErrorRateChart.value)
  const examErrorRateOption = {
    title: {
      text: '章节难度',
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
      formatter: '{b}<br/>难度比: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        start: start.value,
        end: end.value,
        height: 20,
        bottom: 0
      },
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    xAxis: {
      type: 'category',
      data: examPaperPerformanceRes.value.map(item => item.examPaperName),
      axisLabel: {
        interval: 0,
        rotate: 0, // 不旋转文本
        color: '#666',
        formatter: function (value) {
          const maxLength = 8; // 每行最多显示8个字符
          let result = '';
          for (let i = 0; i < value.length; i += maxLength) {
            result += value.substring(i, i + maxLength) + '\n'; // 每8个字符换一行
          }
          return result;
        }
      },
      boundaryGap: true
    },

    yAxis: {
      type: 'value',
      name: '难度比',
      axisLabel: {
        formatter: '{value}%'
      },
      min: 0,
      max: Math.ceil(maxWrongQuestionRate / 20) * 20, // 动态计算Y轴最大值，向上取整到最近的20倍
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '难度比',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: sanitizedData,
      lineStyle: {
        color: '#67C23A',
        width: 3
      },
      itemStyle: {
        borderWidth: 2,
        borderColor: '#fff'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
          { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
        ])
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        color: '#67C23A'
      }
    }]
  };

  examErrorRateInstance.setOption(examErrorRateOption);

  // 监听缩放事件
  learningTrendInstance.on('dataZoom', function (params) {
    zoomStart.value = params.start
    zoomEnd.value = params.end
  })

  examErrorRateInstance.on('dataZoom', function (params) {
    zoomStart.value = params.start
    zoomEnd.value = params.end
  })

  // 监听窗口大小变化，重绘图表
  window.addEventListener('resize', () => {
    courseDifficultyInstance.resize()
    wrongQuestionsInstance.resize()
    learningTrendInstance.resize()
    examErrorRateInstance.resize()
  })
}

const start = ref(0);
const end = ref(15);
let scrollInterval = null;

// 自动滚动函数
const autoScroll = (chartInstance) => {
  scrollInterval = setInterval(() => {
    // 增加滚动条范围
    start.value += 2;
    end.value += 2;

    // 如果滚动到末尾，重置滚动条
    if (end.value >= 100) {
      start.value = 0;
      end.value = 15;
    }

    // 动态更新 dataZoom
    chartInstance.dispatchAction({
      type: 'dataZoom',
      start: start.value,
      end: end.value,
    });
  }, 1000); // 每秒更新一次
};


onMounted(() => {
  fetchStats();
  fetchChartData().then(() => {
    nextTick(() => {

      initCharts(); // 初始化图表
      const examErrorRateInstance = echarts.init(examErrorRateChart.value);
      autoScroll(examErrorRateInstance); // 自动滚动
    });
  });

  updateTime();
  setInterval(updateTime, 1000);
});

// 清理定时器，防止内存泄漏
onUnmounted(() => {
  if (scrollInterval) {
    clearInterval(scrollInterval);
  }
});
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