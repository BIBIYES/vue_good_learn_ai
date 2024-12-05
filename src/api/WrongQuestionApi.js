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

// 将错误标记完成
export const markWrongQuestionAsDone = (wrongQuestionsId, userId) => {
  return request.put(`/wrong-question/delete/${wrongQuestionsId}/${userId}`)
}

// 获取试卷的错题记录
export const getExamPaperWrongQuestions = (userId, examPaperId) => {
  return request.get(`/wrong-question/user/${userId}/exam-paper/${examPaperId}`)
} 
