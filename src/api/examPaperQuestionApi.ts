import request from '@/utils/request'

// 获取试卷关联的题目列表
export function selectExamPaperQuestionsByExamPaperId(ExamPaperId: number) {
  return request.get(`/examPaperQuestions/${ExamPaperId}/questions`)
}

// 更新试卷的题目关联
export function updateExamPaperQuestions(
  paperId: number,
  questionIds: number[]
) {
  return request.put(`/examPaperQuestions/${paperId}`, questionIds)
}

// 删除试卷中某个题目的关联
export function removeQuestionFromPaper(paperId: number, questionId: number) {
  return request.delete(`/examPaperQuestions/${paperId}/question/${questionId}`)
}
