import request from '@/utils/request'

// 添加新题目
export function createQuestion(
  courseId: number,
  data: {
    questionTitle: string
    questionContent: string
    courseId: number
    userId: number
  }
) {
  return request.post(`/courses/${courseId}/question`, data)
}

// 更新题目
export const updateQuestion = (data: {
  questionId: number
  questionTitle: string
  questionContent: string
  courseId: number
  userId: number
}) => {
  return request.put(`/questions/${data.questionId}`, data)
}

// 删除题目
export function deleteQuestionById(questionId: number) {
  return request.delete(`/questions/${questionId}`)
}

// 批量添加题目
export function batchAddQuestions(
  courseId: number,
  data: {
    questionTitle: string
    questionContent: string
    userId: number
}[]
) {
  return request.post(`/courses/${courseId}/questions`, data)
}

// 获取单个题目
export function getQuestionById(questionId: number) {
  return request.get(`/questions/${questionId}`)
}

