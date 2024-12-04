import request from '@/utils/request'

// 添加错题
export const addWrongQuestion = (wrongQuestionData) => {
  return request({
    url: '/wrong-question/add',
    method: 'POST',
    data: wrongQuestionData
  })
}

// 获取错题
export const getWrongQuestion = (userId, params) => {
  return request.get(`/wrong-question/user/${userId}`, { params })
}