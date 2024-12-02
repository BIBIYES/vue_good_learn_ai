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
    .slice(-10) // 取最后10个（最多的10个）

  initChart(sortedData)
}

const initChart = (data) => {
  const chartDom = document.getElementById('examPaperChart')
  const myChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '学生试卷完成情况统计(Top 10)',
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
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.username),
      axisLabel: {
        interval: 0,
        rotate: 30,
        color: '#666'
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
        barWidth: '40%',
        data: data.map(item => ({
          value: item.count,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        })),
        label: {
          show: true,
          position: 'top',
          fontSize: 12,
          color: '#666'
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
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
  <div id="examPaperChart" style="width: 100%; height: 400px; background: #fff; padding: 20px; border-radius: 4px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);"></div>
</template>

<style scoped>
</style>
