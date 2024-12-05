import request from '@/utils/request'

// 获取会话列表
export const getSessionList = (userId) => {
  return request.get('/chat-session/get-user-chat-session', { params: { userId } })
}

// 创建会话
export const createSession = (data) => {
  return request.post('/chat-session', data)
}

// 获取会话历史纪录
export const getSessionHistory = (sessionId) => {
  return request.get(`/chat-message/getMessageHistory/${sessionId}`)
}

// 添加会话历史记录
export const addSessionHistory = (data) => {
  return request.post('/chat-message/addMessage', data)
}

