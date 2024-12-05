import { defineStore } from 'pinia'
import { getSessionList } from '@/api/AIChatApi'
import dayjs from 'dayjs'

export const useSessionStore = defineStore('session', {
  state: () => ({
    sessionList: [],
    sessionMessages: {}
  }),
  
  getters: {
    groupedSessions: (state) => {
      // 首先按lastUpdateTime降序排序
      const sortedSessions = [...state.sessionList].sort((a, b) => {
        return new Date(b.lastUpdateTime) - new Date(a.lastUpdateTime)
      })
      
      const groups = {
        today: [],
        yesterday: [],
        recent: [],
        older: []
      }
      
      const now = dayjs()
      const today = now.startOf('day')
      const yesterday = today.subtract(1, 'day')
      
      sortedSessions.forEach(session => {
        const updateTime = dayjs(session.lastUpdateTime)
        if (updateTime.isSame(today, 'day')) {
          groups.today.push(session)
        } else if (updateTime.isSame(yesterday, 'day')) {
          groups.yesterday.push(session)
        } else if (updateTime.isAfter(today.subtract(7, 'day'))) {
          groups.recent.push(session)
        } else {
          groups.older.push(session)
        }
      })
      
      return groups
    },
    getSessionById: (state) => (id) => {
      return {
        messages: state.sessionMessages[id] || [],
        session: state.sessionList.find(session => session.id === id)
      }
    }
  },
  
  actions: {
    async loadSessionList(userId) {
      try {
        const response = await getSessionList(userId)
        if (response.code === 200 && response.data) {
          this.sessionList = response.data.map(session => ({
            id: session.sessionId,
            title: session.title,
            creationTime: session.creationTime,
            lastUpdateTime: session.lastUpdateTime
          }))
        }
      } catch (error) {
        console.error('获取会话列表失败:', error)
        throw error
      }
    },
   
    // 添加或更新会话消息
    updateSessionMessages(sessionId, messages) {
      this.sessionMessages[sessionId] = messages
    }
  }
}) 