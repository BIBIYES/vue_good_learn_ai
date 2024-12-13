<script setup>
import { ref, onMounted } from 'vue'
import { getAllCompletedExamPapers } from '@/api/examPaperApi'
import * as echarts from 'echarts'

const AllExamPaperStatus = ref([])

// 获取所有已经完成的试卷
const handelGetAllCompletedExamPapers = async () => {
  const res = await getAllCompletedExamPapers()
  AllExamPaperStatus.value = res.data
  
  // 数据处理：按username分组并计数
  const userExamCount = {}
  res.data.forEach(item => {
    if (userExamCount[item.username]) {
      userExamCount[item.username].count++
      if (new Date(item.joinDate) < new Date(userExamCount[item.username].firstJoinDate)) {
        userExamCount[item.username].firstJoinDate = item.joinDate
      }
    } else {
      userExamCount[item.username] = {
        count: 1,
        firstJoinDate: item.joinDate,
        username: item.username
      }
    }
  })

  // 转换为数组并排序（升序）
  const sortedData = Object.values(userExamCount)
    .sort((a, b) => {
      if (a.count !== b.count) {
        return a.count - b.count
      }
      return new Date(a.firstJoinDate) - new Date(b.firstJoinDate)
    })
    .slice(-5) // 只取最后5个（最多的5个）

  initChart(sortedData)
}

const initChart = (data) => {
  const chartDom = document.getElementById('examPaperChart')
  const myChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '学生试卷完成情况统计(Top 5)',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      },
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.username),
      axisLabel: {
        interval: 0,
        rotate: 0,
        color: '#666',
        overflow: 'truncate',
        width: 80
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '完成试卷数',
      minInterval: 1,
      nameTextStyle: {
        color: '#666'
      },
      axisLine: {
        show: true
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '完成试卷数',
        type: 'bar',
        data: data.map(item => item.count),
        barWidth: '30%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            { offset: 0, color: '#36cfc9' },
            { offset: 1, color: '#409EFF' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
              { offset: 0, color: '#40e0d0' },
              { offset: 1, color: '#60a9ff' }
            ])
          }
        }
      }
    ]
  }

  myChart.setOption(option)
  
  // 响应式处理
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

onMounted(() => {
  handelGetAllCompletedExamPapers()
})
</script>

<template>
  <div id="examPaperChart" style="width: 100%; height: 320px; "></div>
</template>

<style scoped>
</style>
