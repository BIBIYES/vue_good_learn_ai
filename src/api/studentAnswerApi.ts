import request from '@/utils/request'

export const submitAnswer = (
  userId: number,
  examPaperId: number,
  answerList: any[]
) => {
  return request.post(
    `/user/${userId}/exam-paper/${examPaperId}/student-answer`,
    answerList
  )
}
