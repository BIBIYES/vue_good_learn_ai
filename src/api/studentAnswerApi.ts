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

// 获取学生试卷答案

export const getExamPaperStudentAnswer = (userId: number, examPaperId: number) => {
  console.log(userId);
  console.log(examPaperId);

  return request.get("/student-answer/exam-paper-student-answer", {
    params: {
      
      userId,
      examPaperId

    }
  }
)
}